import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../../app.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer?.stop();
});

afterEach(async () => {
  if (mongoose.connection.readyState !== 1) return;
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map(col => col.deleteMany({})));
});

// ─── Fixtures ────────────────────────────────────────────────────────────────

const validUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const register = (body = validUser) =>
  request(app).post('/api/auth/register').send(body);

const login = (body = { email: validUser.email, password: validUser.password }) =>
  request(app).post('/api/auth/login').send(body);

const getRefreshCookie = cookies => cookies?.find(c => c.startsWith('refreshToken='));

const isCookieCleared = (cookies, name) => {
  const cookie = cookies?.find(c => c.includes(`${name}=`));
  return !!(
    cookie &&
    (cookie.includes('Max-Age=0') ||
      cookie.includes('Expires=Thu, 01 Jan 1970') ||
      cookie.match(new RegExp(`${name}=(?:;|\\s|$)`)))
  );
};

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe('Auth API', () => {
  // ─── Register ─────────────────────────────────────────────────────────────
  describe('POST /api/auth/register', () => {
    describe('Happy Path', () => {
      it('registers a new user and returns 201 with access token and user data', async () => {
        const res = await register();

        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toMatch(/registered/i);
        expect(res.body.data).toHaveProperty('accessToken');
        expect(res.body.data.user).toMatchObject({
          name: validUser.name,
          email: validUser.email,
          role: 'user',
        });
        expect(res.body.data.user).not.toHaveProperty('password');
        expect(res.body.data.user).not.toHaveProperty('refreshToken');
      });

      it('sets an httpOnly refreshToken cookie on register', async () => {
        const res = await register();

        const cookies = res.headers['set-cookie'];
        expect(getRefreshCookie(cookies)).toBeDefined();
        expect(cookies.some(c => c.includes('HttpOnly'))).toBe(true);
      });
    });

    describe('Validation Errors', () => {
      it.each([
        ['name is missing', { email: 'a@b.com', password: 'password123' }],
        ['email is missing', { name: 'Test User', password: 'password123' }],
        ['password is missing', { name: 'Test User', email: 'a@b.com' }],
        ['email format is invalid', { ...validUser, email: 'not-an-email' }],
        ['password is shorter than 8 characters', { ...validUser, password: 'short' }],
      ])('returns 400 when %s', async (_, body) => {
        const res = await register(body);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBeDefined();
      });
    });

    describe('Conflict', () => {
      it('returns 409 when the email is already registered', async () => {
        await register();
        const res = await register();

        expect(res.statusCode).toBe(409);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBeDefined();
      });
    });
  });

  // ─── Login ────────────────────────────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await register();
    });

    describe('Happy Path', () => {
      it('returns 200 with access token and user data on valid credentials', async () => {
        const res = await login();

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toMatch(/logged in|login successful/i);
        expect(res.body.data).toHaveProperty('accessToken');
        expect(res.body.data.user).toMatchObject({ email: validUser.email });
        expect(res.body.data.user).not.toHaveProperty('password');
        expect(res.body.data.user).not.toHaveProperty('refreshToken');
      });

      it('sets an httpOnly refreshToken cookie on login', async () => {
        const res = await login();

        const cookies = res.headers['set-cookie'];
        expect(getRefreshCookie(cookies)).toBeDefined();
        expect(cookies.some(c => c.includes('HttpOnly'))).toBe(true);
      });
    });

    describe('Authentication Failures', () => {
      it('returns 401 for a wrong password', async () => {
        const res = await login({ email: validUser.email, password: 'wrongpassword' });

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBeDefined();
      });

      it('returns 401 for a non-existing email', async () => {
        const res = await login({ email: 'nobody@example.com', password: 'password123' });

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
      });
    });

    describe('Validation Errors', () => {
      it.each([
        ['email is missing', { password: 'password123' }],
        ['password is missing', { email: validUser.email }],
      ])('returns 400 when %s', async (_, body) => {
        const res = await request(app).post('/api/auth/login').send(body);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
      });
    });
  });

  // ─── Refresh Token ────────────────────────────────────────────────────────
  describe('POST /api/auth/refresh', () => {
    let refreshCookie;

    beforeEach(async () => {
      await register();
      const loginRes = await login();
      refreshCookie = loginRes.headers['set-cookie'];
    });

    describe('Happy Path', () => {
      it('returns 200 with a new access token when a valid refresh token cookie is provided', async () => {
        const res = await request(app)
          .post('/api/auth/refresh')
          .set('Cookie', refreshCookie);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('accessToken');
      });

      it('rotates the refresh token by issuing a new cookie on each use', async () => {
        const res = await request(app)
          .post('/api/auth/refresh')
          .set('Cookie', refreshCookie);

        expect(getRefreshCookie(res.headers['set-cookie'])).toBeDefined();
      });
    });

    describe('Authentication Failures', () => {
      it('returns 401 when no refresh token cookie is sent', async () => {
        const res = await request(app).post('/api/auth/refresh');

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
      });

      it('returns 401 for a tampered/invalid refresh token', async () => {
        const res = await request(app)
          .post('/api/auth/refresh')
          .set('Cookie', ['refreshToken=invalid.token.here; HttpOnly; Path=/']);

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
      });

      it('returns 401 when a used (rotated) refresh token is replayed', async () => {
        await request(app).post('/api/auth/refresh').set('Cookie', refreshCookie);

        const res = await request(app)
          .post('/api/auth/refresh')
          .set('Cookie', refreshCookie);

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
      });
    });
  });

  // ─── Logout ───────────────────────────────────────────────────────────────
  describe('POST /api/auth/logout', () => {
    let refreshCookie;
    let accessToken;

    beforeEach(async () => {
      await register();
      const loginRes = await login();
      refreshCookie = loginRes.headers['set-cookie'];
      accessToken = loginRes.body.data.accessToken;
    });

    describe('Happy Path', () => {
      it('returns 200 and clears the refreshToken cookie on valid logout', async () => {
        const res = await request(app)
          .post('/api/auth/logout')
          .set('Cookie', refreshCookie)
          .set('Authorization', `Bearer ${accessToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toMatch(/logged out/i);
        expect(isCookieCleared(res.headers['set-cookie'], 'refreshToken')).toBe(true);
      });
    });

    describe('Post-Logout Security', () => {
      it('returns 401 when the refresh token is reused after logout', async () => {
        await request(app)
          .post('/api/auth/logout')
          .set('Cookie', refreshCookie)
          .set('Authorization', `Bearer ${accessToken}`);

        const res = await request(app)
          .post('/api/auth/refresh')
          .set('Cookie', refreshCookie);

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
      });
    });

    describe('Authentication Failures', () => {
      it('returns 401 when no access token is provided', async () => {
        const res = await request(app).post('/api/auth/logout');

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
      });
    });
  });
});
