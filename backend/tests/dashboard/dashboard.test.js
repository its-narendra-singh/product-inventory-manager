import 'dotenv/config';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../app.js';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_TEST_URI);
});

afterAll(async () => {
  await mongoose.disconnect();
});

afterEach(async () => {
  if (mongoose.connection.readyState !== 1) return;
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((col) => col.deleteMany({})));
});

// ─── Fixtures ────────────────────────────────────────────────────────────────

const userA = { name: 'User A', email: 'usera@example.com', password: 'password123' };
const userB = { name: 'User B', email: 'userb@example.com', password: 'password123' };

const baseProduct = {
  name: 'Widget Pro',
  description: 'A quality widget',
  price: 10.0,
  category: 'Electronics',
  stock: 10,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const registerAndLogin = async (user) => {
  await request(app).post('/api/auth/register').send(user);
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: user.email, password: user.password });
  return res.body.data.accessToken;
};

const createProduct = (token, overrides = {}) =>
  request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${token}`)
    .send({ ...baseProduct, ...overrides });

const getStats = (token) =>
  request(app).get('/api/dashboard/stats').set('Authorization', `Bearer ${token}`);

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe('Dashboard API', () => {
  describe('GET /api/dashboard/stats', () => {
    // ─── Happy Path ───────────────────────────────────────────────────────────

    describe('Happy Path', () => {
      it('returns 200 with correct totalProducts, totalValue, and lowStockCount', async () => {
        const token = await registerAndLogin(userA);

        // price: 20, stock: 5 (low stock: <= 10)
        await createProduct(token, { name: 'Product A', price: 20, stock: 5 });
        // price: 50, stock: 100
        await createProduct(token, { name: 'Product B', price: 50, stock: 100 });
        // price: 30, stock: 3 (low stock)
        await createProduct(token, { name: 'Product C', price: 30, stock: 3 });

        const res = await getStats(token);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBeDefined();
        expect(res.body.data).toMatchObject({
          totalProducts: 3,
          totalValue: 20 * 5 + 50 * 100 + 30 * 3, // 100 + 5000 + 90 = 5190
          lowStockCount: 2,
        });
      });

      it('returns correct totalValue as sum of (price × stock) for all products', async () => {
        const token = await registerAndLogin(userA);

        await createProduct(token, { name: 'P1', price: 100, stock: 2 }); // 200
        await createProduct(token, { name: 'P2', price: 25, stock: 4 }); // 100

        const res = await getStats(token);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.totalValue).toBe(300);
      });

      it('response structure conforms to the standard API format', async () => {
        const token = await registerAndLogin(userA);
        await createProduct(token);

        const res = await getStats(token);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('message');
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('totalProducts');
        expect(res.body.data).toHaveProperty('totalValue');
        expect(res.body.data).toHaveProperty('lowStockCount');
      });
    });

    // ─── Edge Cases ───────────────────────────────────────────────────────────

    describe('Edge Cases', () => {
      it('returns zeros for all metrics when the user has no products', async () => {
        const token = await registerAndLogin(userA);

        const res = await getStats(token);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toMatchObject({
          totalProducts: 0,
          totalValue: 0,
          lowStockCount: 0,
        });
      });

      it('counts all products as low stock when all have stock === 0', async () => {
        const token = await registerAndLogin(userA);

        await createProduct(token, { name: 'Out A', price: 10, stock: 0 });
        await createProduct(token, { name: 'Out B', price: 20, stock: 0 });

        const res = await getStats(token);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.totalProducts).toBe(2);
        expect(res.body.data.totalValue).toBe(0);
        expect(res.body.data.lowStockCount).toBe(2);
      });

      it('counts all products as low stock when all have stock <= 10', async () => {
        const token = await registerAndLogin(userA);

        await createProduct(token, { name: 'Low A', price: 10, stock: 1 });
        await createProduct(token, { name: 'Low B', price: 10, stock: 10 });

        const res = await getStats(token);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.lowStockCount).toBe(2);
      });

      it('counts 0 low stock when all products have stock > 10', async () => {
        const token = await registerAndLogin(userA);

        await createProduct(token, { name: 'Well A', price: 10, stock: 11 });
        await createProduct(token, { name: 'Well B', price: 10, stock: 500 });

        const res = await getStats(token);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.lowStockCount).toBe(0);
      });

      it('handles mixed stock levels: some low, some normal', async () => {
        const token = await registerAndLogin(userA);

        await createProduct(token, { name: 'Low', price: 5, stock: 2 }); // low
        await createProduct(token, { name: 'Zero', price: 15, stock: 0 }); // low
        await createProduct(token, { name: 'High', price: 10, stock: 50 }); // normal

        const res = await getStats(token);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.totalProducts).toBe(3);
        expect(res.body.data.lowStockCount).toBe(2);
        expect(res.body.data.totalValue).toBe(5 * 2 + 15 * 0 + 10 * 50); // 10 + 0 + 500 = 510
      });

      it('handles a single product correctly', async () => {
        const token = await registerAndLogin(userA);

        await createProduct(token, { name: 'Solo', price: 99.99, stock: 5 });

        const res = await getStats(token);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.totalProducts).toBe(1);
        expect(res.body.data.totalValue).toBeCloseTo(99.99 * 5, 2);
        expect(res.body.data.lowStockCount).toBe(1);
      });
    });

    // ─── Authorization (Data Isolation) ──────────────────────────────────────

    describe('Authorization — data isolation', () => {
      it('only aggregates products belonging to the authenticated user', async () => {
        const tokenA = await registerAndLogin(userA);
        const tokenB = await registerAndLogin(userB);

        // User A creates 3 products
        await createProduct(tokenA, { name: 'A1', price: 100, stock: 5 });
        await createProduct(tokenA, { name: 'A2', price: 200, stock: 2 });
        await createProduct(tokenA, { name: 'A3', price: 50, stock: 50 });

        // User B creates 1 product
        await createProduct(tokenB, { name: 'B1', price: 999, stock: 0 });

        const resA = await getStats(tokenA);
        const resB = await getStats(tokenB);

        // User A sees only their own 3 products
        expect(resA.body.data.totalProducts).toBe(3);
        expect(resA.body.data.totalValue).toBe(100 * 5 + 200 * 2 + 50 * 50); // 500+400+2500=3400
        expect(resA.body.data.lowStockCount).toBe(2); // A1 (stock:5) and A2 (stock:2)

        // User B sees only their own 1 product
        expect(resB.body.data.totalProducts).toBe(1);
        expect(resB.body.data.totalValue).toBe(0);
        expect(resB.body.data.lowStockCount).toBe(1);
      });

      it('returns zeros for a user with no products even though other users have products', async () => {
        const tokenA = await registerAndLogin(userA);
        const tokenB = await registerAndLogin(userB);

        await createProduct(tokenA, { name: 'A1', price: 50, stock: 10 });

        const resB = await getStats(tokenB);

        expect(resB.statusCode).toBe(200);
        expect(resB.body.data).toMatchObject({
          totalProducts: 0,
          totalValue: 0,
          lowStockCount: 0,
        });
      });
    });

    // ─── Authentication Errors ────────────────────────────────────────────────

    describe('Authentication Errors', () => {
      it('returns 401 when no token is provided', async () => {
        const res = await request(app).get('/api/dashboard/stats');

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBeDefined();
      });

      it('returns 401 when an invalid token is provided', async () => {
        const res = await request(app)
          .get('/api/dashboard/stats')
          .set('Authorization', 'Bearer invalid.token.value');

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBeDefined();
      });

      it('returns 401 when a malformed Authorization header is sent', async () => {
        const res = await request(app)
          .get('/api/dashboard/stats')
          .set('Authorization', 'NotBearer somevalue');

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
      });
    });
  });
});
