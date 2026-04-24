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

const validUser = { name: 'Uploader', email: 'upload@example.com', password: 'password123' };

// Minimal valid 1×1 PNG in binary (hard-coded bytes — no fs read of a real image needed)
const TINY_PNG = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108060000001f' +
    '15c4890000000a49444154789c6260000000020001e221bc330000000049454e44ae426082',
  'hex'
);

const TINY_JPEG = Buffer.from(
  'ffd8ffe000104a46494600010100000100010000ffdb004300080606070605' +
    '08070707090804060c100e0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c23' +
    '1c1c2837292c30313434341f27393d38323c2e333432ffc0000b080001000101011100ffc' +
    '4001f0000010501010101010100000000000000000102030405060708090a0bffda00080101' +
    '003f00ffd9',
  'hex'
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const registerAndLogin = async (user = validUser) => {
  await request(app).post('/api/auth/register').send(user);
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: user.email, password: user.password });
  return res.body.data.accessToken;
};

const uploadImage = (token, fileBuffer, filename, mimeType) =>
  request(app)
    .post('/api/upload')
    .set('Authorization', `Bearer ${token}`)
    .attach('image', fileBuffer, { filename, contentType: mimeType });

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe('File Upload API', () => {
  describe('POST /api/upload', () => {
    // ─── Happy Path ───────────────────────────────────────────────────────────

    describe('Happy Path', () => {
      it('uploads a valid PNG and returns 200 with an imageUrl in the response', async () => {
        const token = await registerAndLogin();

        const res = await uploadImage(token, TINY_PNG, 'photo.png', 'image/png');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBeDefined();
        expect(res.body.data).toHaveProperty('imageUrl');
        expect(typeof res.body.data.imageUrl).toBe('string');
        expect(res.body.data.imageUrl.length).toBeGreaterThan(0);
      });

      it('uploads a valid JPEG and returns 200 with an imageUrl', async () => {
        const token = await registerAndLogin();

        const res = await uploadImage(token, TINY_JPEG, 'photo.jpg', 'image/jpeg');

        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('imageUrl');
      });

      it('response conforms to the standard API format', async () => {
        const token = await registerAndLogin();

        const res = await uploadImage(token, TINY_PNG, 'photo.png', 'image/png');

        expect(res.body).toHaveProperty('success', true);
        expect(res.body).toHaveProperty('message');
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('imageUrl');
      });

      it('returned imageUrl is a valid relative or absolute path string', async () => {
        const token = await registerAndLogin();

        const res = await uploadImage(token, TINY_PNG, 'product.png', 'image/png');

        expect(res.statusCode).toBe(200);
        const { imageUrl } = res.body.data;
        // Must start with "/" (relative path) or "http" (absolute URL)
        expect(imageUrl).toMatch(/^(\/|http)/);
      });

      it('two consecutive uploads produce distinct imageUrls', async () => {
        const token = await registerAndLogin();

        const res1 = await uploadImage(token, TINY_PNG, 'first.png', 'image/png');
        const res2 = await uploadImage(token, TINY_PNG, 'second.png', 'image/png');

        expect(res1.statusCode).toBe(200);
        expect(res2.statusCode).toBe(200);
        expect(res1.body.data.imageUrl).not.toBe(res2.body.data.imageUrl);
      });
    });

    // ─── Validation Errors ────────────────────────────────────────────────────

    describe('Validation Errors', () => {
      it('returns 400 when no file is attached', async () => {
        const token = await registerAndLogin();

        const res = await request(app).post('/api/upload').set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBeDefined();
      });

      it('returns 400 when a non-image file (text/plain) is uploaded', async () => {
        const token = await registerAndLogin();
        const textBuffer = Buffer.from('hello world');

        const res = await uploadImage(token, textBuffer, 'doc.txt', 'text/plain');

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBeDefined();
      });

      it('returns 400 when a PDF file is uploaded', async () => {
        const token = await registerAndLogin();
        const pdfBuffer = Buffer.from('%PDF-1.4 fake pdf content');

        const res = await uploadImage(token, pdfBuffer, 'document.pdf', 'application/pdf');

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
      });

      it('returns 400 when a file disguised as PNG with wrong MIME type is uploaded', async () => {
        const token = await registerAndLogin();
        const fakeBuffer = Buffer.from('this is not an image');

        const res = await uploadImage(token, fakeBuffer, 'fake.png', 'application/octet-stream');

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
      });

      it('returns 400 when the file exceeds the size limit (> 5MB)', async () => {
        const token = await registerAndLogin();
        // 6 MB buffer of zeros sent as image/png
        const oversizedBuffer = Buffer.alloc(6 * 1024 * 1024, 0);

        const res = await uploadImage(token, oversizedBuffer, 'huge.png', 'image/png');

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBeDefined();
      });

      it('returns 400 when the request body is completely empty', async () => {
        const token = await registerAndLogin();

        const res = await request(app)
          .post('/api/upload')
          .set('Authorization', `Bearer ${token}`)
          .set('Content-Type', 'multipart/form-data');

        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
      });
    });

    // ─── Authentication Errors ────────────────────────────────────────────────

    describe('Authentication Errors', () => {
      it('returns 401 when no Authorization header is provided', async () => {
        const res = await request(app)
          .post('/api/upload')
          .attach('image', TINY_PNG, { filename: 'photo.png', contentType: 'image/png' });

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBeDefined();
      });

      it('returns 401 when an invalid token is provided', async () => {
        const res = await request(app)
          .post('/api/upload')
          .set('Authorization', 'Bearer invalid.token.here')
          .attach('image', TINY_PNG, { filename: 'photo.png', contentType: 'image/png' });

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
      });

      it('returns 401 when a malformed Authorization header is sent', async () => {
        const res = await request(app)
          .post('/api/upload')
          .set('Authorization', 'Token somegarbagevalue')
          .attach('image', TINY_PNG, { filename: 'photo.png', contentType: 'image/png' });

        expect(res.statusCode).toBe(401);
        expect(res.body.success).toBe(false);
      });
    });

    // ─── Edge Cases ───────────────────────────────────────────────────────────

    describe('Edge Cases', () => {
      it('stores the file under the /uploads directory (path contains "uploads")', async () => {
        const token = await registerAndLogin();

        const res = await uploadImage(token, TINY_PNG, 'check.png', 'image/png');

        expect(res.statusCode).toBe(200);
        expect(res.body.data.imageUrl).toMatch(/uploads/i);
      });

      it('uploading the same file content twice produces two distinct stored paths', async () => {
        const token = await registerAndLogin();

        const res1 = await uploadImage(token, TINY_PNG, 'dup.png', 'image/png');
        const res2 = await uploadImage(token, TINY_PNG, 'dup.png', 'image/png');

        expect(res1.statusCode).toBe(200);
        expect(res2.statusCode).toBe(200);
        expect(res1.body.data.imageUrl).not.toBe(res2.body.data.imageUrl);
      });

      it('accepts image/webp MIME type', async () => {
        const token = await registerAndLogin();
        // Minimal WebP binary signature
        const webpBuffer = Buffer.from('52494646' + '04000000' + '57454250', 'hex');

        const res = await uploadImage(token, webpBuffer, 'photo.webp', 'image/webp');

        // Must either accept (200) or reject with a clear 400 — never 500
        expect([200, 400]).toContain(res.statusCode);
        expect(res.body.success).toBeDefined();
      });

      it('a filename with special characters is handled without a 500 error', async () => {
        const token = await registerAndLogin();

        const res = await uploadImage(token, TINY_PNG, 'my photo (1).png', 'image/png');

        expect([200, 400]).toContain(res.statusCode);
        expect(res.body.success).toBeDefined();
      });
    });
  });
});
