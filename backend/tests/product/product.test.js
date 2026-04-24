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

// Minimal valid 1×1 PNG (no fs read needed)
const TINY_PNG = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108060000001f' +
    '15c4890000000a49444154789c6260000000020001e221bc330000000049454e44ae426082',
  'hex'
);

const validProduct = {
  name: 'Widget Pro',
  description: 'A high quality widget',
  price: 29.99,
  category: 'Electronics',
  stock: 100,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const registerAndLogin = async (user) => {
  await request(app).post('/api/auth/register').send(user);
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: user.email, password: user.password });
  return res.body.data.accessToken;
};

const createProduct = (token, body = validProduct) =>
  request(app).post('/api/products').set('Authorization', `Bearer ${token}`).send(body);

// Sends product fields + optional image as multipart/form-data
const createProductMultipart = (token, fields = validProduct, imageBuffer = null) => {
  let req = request(app).post('/api/products').set('Authorization', `Bearer ${token}`);
  Object.entries(fields).forEach(([k, v]) => req.field(k, String(v)));
  if (imageBuffer)
    req = req.attach('image', imageBuffer, { filename: 'product.png', contentType: 'image/png' });
  return req;
};

const updateProductMultipart = (token, id, fields = {}, imageBuffer = null) => {
  let req = request(app).put(`/api/products/${id}`).set('Authorization', `Bearer ${token}`);
  Object.entries(fields).forEach(([k, v]) => req.field(k, String(v)));
  if (imageBuffer)
    req = req.attach('image', imageBuffer, { filename: 'update.png', contentType: 'image/png' });
  return req;
};

const getProducts = (token, query = '') =>
  request(app).get(`/api/products${query}`).set('Authorization', `Bearer ${token}`);

const getProduct = (token, id) =>
  request(app).get(`/api/products/${id}`).set('Authorization', `Bearer ${token}`);

const updateProduct = (token, id, body) =>
  request(app).put(`/api/products/${id}`).set('Authorization', `Bearer ${token}`).send(body);

const deleteProduct = (token, id) =>
  request(app).delete(`/api/products/${id}`).set('Authorization', `Bearer ${token}`);

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe('Products API', () => {
  // ─── Create Product ────────────────────────────────────────────────────────
  describe('POST /api/products', () => {
    describe('Happy Path', () => {
      it('creates a product and returns 201 with product data', async () => {
        const token = await registerAndLogin(userA);
        const res = await createProduct(token);

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toMatch(/created/i);
        expect(res.body.data).toMatchObject({
          name: validProduct.name,
          price: validProduct.price,
          category: validProduct.category,
          stock: validProduct.stock,
        });
        expect(res.body.data).toHaveProperty('_id');
        expect(res.body.data).toHaveProperty('createdBy');
      });

      it('creates a product without optional fields (description, sku, imageUrl)', async () => {
        const token = await registerAndLogin(userA);
        const res = await createProduct(token, {
          name: 'Minimal Product',
          price: 10,
          category: 'Misc',
          stock: 5,
        });

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
      });

      it('creates a product with a unique SKU', async () => {
        const token = await registerAndLogin(userA);
        const res = await createProduct(token, { ...validProduct, sku: 'SKU-001' });

        expect(res.statusCode).toBe(201);
        expect(res.body.data.sku).toBe('SKU-001');
      });
    });

    describe('Authentication Errors', () => {
      it('returns 401 when no token is provided', async () => {
        const res = await request(app).post('/api/products').send(validProduct);

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
      });

      it('returns 401 for an invalid token', async () => {
        const res = await request(app)
          .post('/api/products')
          .set('Authorization', 'Bearer invalid.token.here')
          .send(validProduct);

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
      });
    });

    describe('Validation Errors', () => {
      it.each([
        ['name is missing', { price: 10, category: 'Misc', stock: 5 }],
        ['price is missing', { name: 'X', category: 'Misc', stock: 5 }],
        ['category is missing', { name: 'X', price: 10, stock: 5 }],
        ['stock is missing', { name: 'X', price: 10, category: 'Misc' }],
        ['price is negative', { ...validProduct, price: -1 }],
        ['stock is negative', { ...validProduct, stock: -1 }],
        ['stock is a decimal', { ...validProduct, stock: 1.5 }],
        ['name exceeds max length', { ...validProduct, name: 'a'.repeat(201) }],
        ['description exceeds max length', { ...validProduct, description: 'a'.repeat(2001) }],
      ])('returns 400 when %s', async (_, body) => {
        const token = await registerAndLogin(userA);
        const res = await createProduct(token, body);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBeDefined();
      });
    });

    describe('Conflict', () => {
      it('returns 409 when a duplicate SKU is used', async () => {
        const token = await registerAndLogin(userA);
        await createProduct(token, { ...validProduct, sku: 'SKU-DUP' });
        const res = await createProduct(token, { ...validProduct, sku: 'SKU-DUP' });

        expect(res.statusCode).toBe(409);
        expect(res.body.success).toBe(false);
      });
    });

    describe('Image Upload (multipart/form-data)', () => {
      it('creates a product with an image and returns imageUrl in data', async () => {
        const token = await registerAndLogin(userA);

        const res = await createProductMultipart(token, validProduct, TINY_PNG);

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('imageUrl');
        expect(res.body.data.imageUrl).toMatch(/^\/uploads\/.+/);
      });

      it('creates a product without an image via multipart and omits imageUrl', async () => {
        const token = await registerAndLogin(userA);

        const res = await createProductMultipart(token, validProduct, null);

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        // imageUrl should not be set (undefined or null)
        expect(res.body.data.imageUrl == null).toBe(true);
      });

      it('returns 400 when a non-image file is attached on product create', async () => {
        const token = await registerAndLogin(userA);
        const textBuffer = Buffer.from('not an image');

        let req = request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${token}`)
          .attach('image', textBuffer, { filename: 'doc.txt', contentType: 'text/plain' });
        Object.entries(validProduct).forEach(([k, v]) => req.field(k, String(v)));

        const res = await req;

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
      });
    });
  });

  // ─── Get Products (List) ───────────────────────────────────────────────────
  describe('GET /api/products', () => {
    describe('Happy Path', () => {
      it('returns 200 with an array of products belonging to the authenticated user', async () => {
        const token = await registerAndLogin(userA);
        await createProduct(token);
        await createProduct(token, { ...validProduct, name: 'Widget Lite' });

        const res = await getProducts(token);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data.products)).toBe(true);
        expect(res.body.data.products).toHaveLength(2);
      });

      it('returns an empty array when the user has no products', async () => {
        const token = await registerAndLogin(userA);
        const res = await getProducts(token);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.products).toHaveLength(0);
      });

      it('does NOT return products belonging to another user', async () => {
        const tokenA = await registerAndLogin(userA);
        const tokenB = await registerAndLogin(userB);
        await createProduct(tokenA);

        const res = await getProducts(tokenB);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.products).toHaveLength(0);
      });
    });

    describe('Search', () => {
      it('returns products matching the search term in name', async () => {
        const token = await registerAndLogin(userA);
        await createProduct(token, { ...validProduct, name: 'Blue Gadget' });
        await createProduct(token, { ...validProduct, name: 'Red Widget' });

        const res = await getProducts(token, '?search=Blue');

        expect(res.statusCode).toBe(200);
        expect(res.body.data.products.some((p) => p.name === 'Blue Gadget')).toBe(true);
        expect(res.body.data.products.every((p) => p.name !== 'Red Widget')).toBe(true);
      });

      it('returns products matching the search term in description', async () => {
        const token = await registerAndLogin(userA);
        await createProduct(token, {
          ...validProduct,
          name: 'Alpha',
          description: 'Unique solar powered device',
        });
        await createProduct(token, { ...validProduct, name: 'Beta', description: 'Plain item' });

        const res = await getProducts(token, '?search=solar');

        expect(res.statusCode).toBe(200);
        expect(res.body.data.products.some((p) => p.name === 'Alpha')).toBe(true);
        expect(res.body.data.products.every((p) => p.name !== 'Beta')).toBe(true);
      });

      it('returns empty array when search term matches no products', async () => {
        const token = await registerAndLogin(userA);
        await createProduct(token);

        const res = await getProducts(token, '?search=nonexistentterm12345');

        expect(res.statusCode).toBe(200);
        expect(res.body.data.products).toHaveLength(0);
      });
    });

    describe('Filter', () => {
      it('filters products by category', async () => {
        const token = await registerAndLogin(userA);
        await createProduct(token, { ...validProduct, category: 'Electronics' });
        await createProduct(token, { ...validProduct, category: 'Furniture' });

        const res = await getProducts(token, '?category=Electronics');

        expect(res.statusCode).toBe(200);
        expect(res.body.data.products.every((p) => p.category === 'Electronics')).toBe(true);
      });

      it('filters products with inStock=true (stock > 0)', async () => {
        const token = await registerAndLogin(userA);
        await createProduct(token, { ...validProduct, stock: 10 });
        await createProduct(token, { ...validProduct, stock: 0 });

        const res = await getProducts(token, '?inStock=true');

        expect(res.statusCode).toBe(200);
        expect(res.body.data.products.every((p) => p.stock > 0)).toBe(true);
      });

      it('filters products with inStock=false (stock === 0)', async () => {
        const token = await registerAndLogin(userA);
        await createProduct(token, { ...validProduct, stock: 10 });
        await createProduct(token, { ...validProduct, stock: 0 });

        const res = await getProducts(token, '?inStock=false');

        expect(res.statusCode).toBe(200);
        expect(res.body.data.products.every((p) => p.stock === 0)).toBe(true);
      });
    });

    describe('Sort', () => {
      it('sorts products by price ascending', async () => {
        const token = await registerAndLogin(userA);
        await createProduct(token, { ...validProduct, price: 50 });
        await createProduct(token, { ...validProduct, price: 10 });
        await createProduct(token, { ...validProduct, price: 30 });

        const res = await getProducts(token, '?sortBy=price&order=asc');

        expect(res.statusCode).toBe(200);
        const prices = res.body.data.products.map((p) => p.price);
        expect(prices).toEqual([...prices].sort((a, b) => a - b));
      });

      it('sorts products by price descending', async () => {
        const token = await registerAndLogin(userA);
        await createProduct(token, { ...validProduct, price: 50 });
        await createProduct(token, { ...validProduct, price: 10 });
        await createProduct(token, { ...validProduct, price: 30 });

        const res = await getProducts(token, '?sortBy=price&order=desc');

        expect(res.statusCode).toBe(200);
        const prices = res.body.data.products.map((p) => p.price);
        expect(prices).toEqual([...prices].sort((a, b) => b - a));
      });

      it('sorts products by stock ascending', async () => {
        const token = await registerAndLogin(userA);
        await createProduct(token, { ...validProduct, stock: 5 });
        await createProduct(token, { ...validProduct, stock: 100 });
        await createProduct(token, { ...validProduct, stock: 50 });

        const res = await getProducts(token, '?sortBy=stock&order=asc');

        expect(res.statusCode).toBe(200);
        const stocks = res.body.data.products.map((p) => p.stock);
        expect(stocks).toEqual([...stocks].sort((a, b) => a - b));
      });

      it('sorts products by createdAt descending (newest first)', async () => {
        const token = await registerAndLogin(userA);
        await createProduct(token, { ...validProduct, name: 'First' });
        await createProduct(token, { ...validProduct, name: 'Second' });

        const res = await getProducts(token, '?sortBy=createdAt&order=desc');

        expect(res.statusCode).toBe(200);
        expect(res.body.data.products[0].name).toBe('Second');
      });
    });

    describe('Pagination', () => {
      it('returns paginated results with correct total and page metadata', async () => {
        const token = await registerAndLogin(userA);
        for (let i = 1; i <= 5; i++) {
          await createProduct(token, { ...validProduct, name: `Product ${i}` });
        }

        const res = await getProducts(token, '?page=1&limit=3');

        expect(res.statusCode).toBe(200);
        expect(res.body.data.products).toHaveLength(3);
        expect(res.body.data.total).toBe(5);
        expect(res.body.data.page).toBe(1);
        expect(res.body.data.totalPages).toBe(2);
      });

      it('returns second page of results', async () => {
        const token = await registerAndLogin(userA);
        for (let i = 1; i <= 5; i++) {
          await createProduct(token, { ...validProduct, name: `Product ${i}` });
        }

        const res = await getProducts(token, '?page=2&limit=3');

        expect(res.statusCode).toBe(200);
        expect(res.body.data.products).toHaveLength(2);
        expect(res.body.data.page).toBe(2);
      });

      it('returns empty array for a page beyond total pages', async () => {
        const token = await registerAndLogin(userA);
        await createProduct(token);

        const res = await getProducts(token, '?page=99&limit=10');

        expect(res.statusCode).toBe(200);
        expect(res.body.data.products).toHaveLength(0);
      });
    });

    describe('Authentication Errors', () => {
      it('returns 401 when no token is provided', async () => {
        const res = await request(app).get('/api/products');

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
      });
    });
  });

  // ─── Get Single Product ────────────────────────────────────────────────────
  describe('GET /api/products/:id', () => {
    describe('Happy Path', () => {
      it('returns 200 with the product when the owner requests it', async () => {
        const token = await registerAndLogin(userA);
        const created = await createProduct(token);
        const id = created.body.data._id;

        const res = await getProduct(token, id);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data._id).toBe(id);
      });
    });

    describe('Authorization Errors', () => {
      it('returns 403 when a non-owner requests the product', async () => {
        const tokenA = await registerAndLogin(userA);
        const tokenB = await registerAndLogin(userB);
        const created = await createProduct(tokenA);
        const id = created.body.data._id;

        const res = await getProduct(tokenB, id);

        expect(res.statusCode).toBe(403);
        expect(res.body.success).toBe(false);
      });
    });

    describe('Not Found', () => {
      it('returns 404 for a valid ObjectId that does not exist', async () => {
        const token = await registerAndLogin(userA);
        const fakeId = new mongoose.Types.ObjectId().toString();

        const res = await getProduct(token, fakeId);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
      });
    });

    describe('Validation Errors', () => {
      it('returns 400 for an invalid ObjectId format', async () => {
        const token = await registerAndLogin(userA);

        const res = await getProduct(token, 'not-a-valid-id');

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
      });
    });

    describe('Authentication Errors', () => {
      it('returns 401 when no token is provided', async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const res = await request(app).get(`/api/products/${fakeId}`);

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
      });
    });
  });

  // ─── Update Product ────────────────────────────────────────────────────────
  describe('PUT /api/products/:id', () => {
    describe('Happy Path', () => {
      it('returns 200 and updates product when the owner sends valid data', async () => {
        const token = await registerAndLogin(userA);
        const created = await createProduct(token);
        const id = created.body.data._id;

        const res = await updateProduct(token, id, { name: 'Updated Name', price: 49.99 });

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe('Updated Name');
        expect(res.body.data.price).toBe(49.99);
      });

      it('allows partial updates (only updating one field)', async () => {
        const token = await registerAndLogin(userA);
        const created = await createProduct(token);
        const id = created.body.data._id;

        const res = await updateProduct(token, id, { stock: 999 });

        expect(res.statusCode).toBe(200);
        expect(res.body.data.stock).toBe(999);
        expect(res.body.data.name).toBe(validProduct.name);
      });

      it('updates imageUrl when an image is attached via multipart', async () => {
        const token = await registerAndLogin(userA);
        const created = await createProduct(token);
        const id = created.body.data._id;

        const res = await updateProductMultipart(token, id, { name: 'With Image' }, TINY_PNG);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('imageUrl');
        expect(res.body.data.imageUrl).toMatch(/^\/uploads\/.+/);
        expect(res.body.data.name).toBe('With Image');
      });

      it('does not change imageUrl when no image is attached on update', async () => {
        const token = await registerAndLogin(userA);
        // Create with an image first
        const created = await createProductMultipart(token, validProduct, TINY_PNG);
        const id = created.body.data._id;
        const originalImageUrl = created.body.data.imageUrl;

        // Update only the name, no image attached
        const res = await updateProductMultipart(token, id, { name: 'No Image Update' }, null);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.name).toBe('No Image Update');
        expect(res.body.data.imageUrl).toBe(originalImageUrl);
      });
    });

    describe('Authorization Errors', () => {
      it('returns 403 when a non-owner attempts to update the product', async () => {
        const tokenA = await registerAndLogin(userA);
        const tokenB = await registerAndLogin(userB);
        const created = await createProduct(tokenA);
        const id = created.body.data._id;

        const res = await updateProduct(tokenB, id, { name: 'Hijacked' });

        expect(res.statusCode).toBe(403);
        expect(res.body.success).toBe(false);
      });
    });

    describe('Not Found', () => {
      it('returns 404 for a valid ObjectId that does not exist', async () => {
        const token = await registerAndLogin(userA);
        const fakeId = new mongoose.Types.ObjectId().toString();

        const res = await updateProduct(token, fakeId, { name: 'Ghost' });

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
      });
    });

    describe('Validation Errors', () => {
      it.each([
        ['price is negative', { price: -5 }],
        ['stock is negative', { stock: -1 }],
        ['stock is a decimal', { stock: 2.7 }],
        ['name exceeds max length', { name: 'a'.repeat(201) }],
      ])('returns 400 when %s', async (_, body) => {
        const token = await registerAndLogin(userA);
        const created = await createProduct(token);
        const id = created.body.data._id;

        const res = await updateProduct(token, id, body);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
      });

      it('returns 400 for an invalid ObjectId format', async () => {
        const token = await registerAndLogin(userA);

        const res = await updateProduct(token, 'bad-id', { name: 'X' });

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
      });
    });

    describe('Conflict', () => {
      it('returns 409 when updating to an SKU already used by another product', async () => {
        const token = await registerAndLogin(userA);
        await createProduct(token, { ...validProduct, sku: 'SKU-TAKEN' });
        const second = await createProduct(token, { ...validProduct, name: 'Second' });
        const id = second.body.data._id;

        const res = await updateProduct(token, id, { sku: 'SKU-TAKEN' });

        expect(res.statusCode).toBe(409);
        expect(res.body.success).toBe(false);
      });
    });

    describe('Authentication Errors', () => {
      it('returns 401 when no token is provided', async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const res = await request(app).put(`/api/products/${fakeId}`).send({ name: 'X' });

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
      });
    });
  });

  // ─── Delete Product ────────────────────────────────────────────────────────
  describe('DELETE /api/products/:id', () => {
    describe('Happy Path', () => {
      it('returns 200 and deletes the product when the owner requests it', async () => {
        const token = await registerAndLogin(userA);
        const created = await createProduct(token);
        const id = created.body.data._id;

        const res = await deleteProduct(token, id);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toMatch(/deleted/i);
      });

      it('product is no longer retrievable after deletion', async () => {
        const token = await registerAndLogin(userA);
        const created = await createProduct(token);
        const id = created.body.data._id;

        await deleteProduct(token, id);
        const res = await getProduct(token, id);

        expect(res.statusCode).toBe(404);
      });
    });

    describe('Authorization Errors', () => {
      it('returns 403 when a non-owner attempts to delete the product', async () => {
        const tokenA = await registerAndLogin(userA);
        const tokenB = await registerAndLogin(userB);
        const created = await createProduct(tokenA);
        const id = created.body.data._id;

        const res = await deleteProduct(tokenB, id);

        expect(res.statusCode).toBe(403);
        expect(res.body.success).toBe(false);
      });
    });

    describe('Not Found', () => {
      it('returns 404 for a valid ObjectId that does not exist', async () => {
        const token = await registerAndLogin(userA);
        const fakeId = new mongoose.Types.ObjectId().toString();

        const res = await deleteProduct(token, fakeId);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
      });
    });

    describe('Validation Errors', () => {
      it('returns 400 for an invalid ObjectId format', async () => {
        const token = await registerAndLogin(userA);

        const res = await deleteProduct(token, 'not-valid');

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
      });
    });

    describe('Authentication Errors', () => {
      it('returns 401 when no token is provided', async () => {
        const fakeId = new mongoose.Types.ObjectId().toString();
        const res = await request(app).delete(`/api/products/${fakeId}`);

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
      });
    });
  });
});
