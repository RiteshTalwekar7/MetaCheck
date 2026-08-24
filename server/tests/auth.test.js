import request from 'supertest';
import { createApp } from '../src/app.js';
import { seedDefaultUsers } from '../src/modules/auth/auth.service.js';

describe('Auth Module Tests', () => {
  let app;

  beforeAll(async () => {
    await seedDefaultUsers();
    app = createApp();
  });

  test('POST /api/v1/auth/login - should authenticate seeded officer', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'officer@metacheck.gov.in',
        password: 'Password@123',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.role).toBe('OFFICER');
  });

  test('POST /api/v1/auth/login - should reject invalid credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'officer@metacheck.gov.in',
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('AUTH_REQUIRED');
  });

  test('POST /api/v1/auth/register - should register a new officer', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Inspector Meera Sen',
        email: 'meera.sen@metacheck.gov.in',
        password: 'SecurePassword@2026',
        badgeNumber: 'LM-WB-3341',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('meera.sen@metacheck.gov.in');
  });

  test('GET /api/v1/auth/me - should reject unauthenticated request', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('AUTH_REQUIRED');
  });
});

