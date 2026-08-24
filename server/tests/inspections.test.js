import request from 'supertest';
import { createApp } from '../src/app.js';
import { seedDefaultUsers } from '../src/modules/auth/auth.service.js';

describe('Inspections End-to-End Workflow API Tests', () => {
  let app;
  let authToken;
  let inspectionId;

  beforeAll(async () => {
    await seedDefaultUsers();
    app = createApp();

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'officer@metacheck.gov.in',
        password: 'Password@123',
      });
    authToken = loginRes.body.data.accessToken;
  });

  test('POST /api/v1/inspections - create draft inspection', async () => {
    const res = await request(app)
      .post('/api/v1/inspections')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        establishmentName: 'Metro Supermarket Retail Ltd',
        location: 'Connaught Place, New Delhi',
        commodityCategory: 'Biscuits & Confectionery',
        notes: 'Random market surveillance sampling',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.inspection).toBeDefined();
    expect(res.body.data.inspection.status).toBe('DRAFT');
    inspectionId = res.body.data.inspection._id || res.body.data.inspection.id;
  });

  test('POST /api/v1/inspections/:id/evidence - upload product photograph', async () => {
    // 1x1 transparent PNG buffer for testing
    const sampleImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const res = await request(app)
      .post(`/api/v1/inspections/${inspectionId}/evidence`)
      .set('Authorization', `Bearer ${authToken}`)
      .attach('images', sampleImage, 'sample_package.png');

    expect(res.status).toBe(201);
    expect(res.body.data.evidence).toHaveLength(1);
    expect(res.body.data.evidence[0].evidenceId).toBeDefined();
  });

  test('POST /api/v1/inspections/:id/analyze - run AI extraction and rule evaluation', async () => {
    const res = await request(app)
      .post(`/api/v1/inspections/${inspectionId}/analyze`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.extraction).toBeDefined();
    expect(res.body.data.findings.length).toBeGreaterThan(0);
    expect(res.body.data.summary.score).toBeGreaterThanOrEqual(0);
  });

  test('POST /api/v1/inspections/:id/review - human officer corrects a declaration', async () => {
    const res = await request(app)
      .post(`/api/v1/inspections/${inspectionId}/review`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        fieldPath: 'netQuantity',
        value: '500',
        unit: 'g',
        reason: 'Officer verified standard net quantity in physical sample',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.normalizedFacts.netQuantity.value).toBe(500);
    expect(res.body.data.normalizedFacts.netQuantity.isHumanCorrected).toBe(true);
  });

  test('POST /api/v1/inspections/:id/finalize-review - marks inspection finalized', async () => {
    const res = await request(app)
      .post(`/api/v1/inspections/${inspectionId}/finalize-review`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.inspection.status).toBe('FINALIZED');
    expect(res.body.data.inspection.isReviewed).toBe(true);
  });

  test('POST /api/v1/inspections/:id/report - generate compliance PDF report', async () => {
    const res = await request(app)
      .post(`/api/v1/inspections/${inspectionId}/report`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.reportNumber).toBeDefined();
    expect(res.body.data.status).toBe('READY');
  });

  test('GET /api/v1/inspections - query inspection list', async () => {
    const res = await request(app)
      .get('/api/v1/inspections?search=Metro')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].establishmentName).toContain('Metro Supermarket');
  });
});

