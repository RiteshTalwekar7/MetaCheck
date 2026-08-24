
import assert from 'assert';
import { createApp } from './src/app.js';
import { seedDefaultUsers, loginUser, registerUser } from './src/modules/auth/auth.service.js';
import { ALL_RULES, RULESET_VERSION, evaluateCompliance, calculateComplianceScore } from './src/rules/index.js';
import { normalizeFacts } from './src/ai/normalizer.js';
import { MockAIProvider } from './src/ai/mockProvider.js';
import { ExtractionResultSchema } from './src/ai/schemas.js';
import { createInspection, uploadEvidence, analyzeInspection, listInspections } from './src/modules/inspections/inspections.service.js';
import { correctInspectionField, finalizeInspectionReview } from './src/modules/inspections/review.service.js';
import { generateInspectionPdf } from './src/modules/reports/reports.service.js';

async function runAllTests() {
  console.log('==================================================');
  console.log('      METACHECK BACKEND VERIFICATION SUITE       ');
  console.log('==================================================\n');

  let passed = 0;
  let total = 0;

  function it(desc, fn) {
    total++;
    try {
      fn();
      console.log(`  ✓ ${desc}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${desc}`);
      console.error('    Error:', err.message);
    }
  }

  async function itAsync(desc, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✓ ${desc}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${desc}`);
      console.error('    Error:', err.message);
    }
  }

  console.log('--- 1. Testing Rule Registry & Versioning ---');
  it('Active Rule-Set version should be PCR-INDIA-2026-08-v1', () => {
    assert.strictEqual(RULESET_VERSION, 'PCR-INDIA-2026-08-v1');
    assert.strictEqual(ALL_RULES.length, 10);
  });

  console.log('\n--- 2. Testing Deterministic Legal Rule Evaluators ---');
  it('PCR-R6-01-NAME: Generic name evaluation', () => {
    const nameRule = ALL_RULES.find(r => r.id === 'PCR-R6-01-NAME');
    assert.strictEqual(nameRule.evaluate({ genericName: 'Butter Cookies', imageQuality: 'GOOD' }).status, 'PASS');
    assert.strictEqual(nameRule.evaluate({ genericName: null, productName: null, imageQuality: 'GOOD' }).status, 'FAIL');
    assert.strictEqual(nameRule.evaluate({ genericName: null, productName: null, imageQuality: 'DEGRADED' }).status, 'REVIEW');
  });

  it('PCR-R6-01-NET-QTY: Standard metric units verification', () => {
    const netRule = ALL_RULES.find(r => r.id === 'PCR-R6-01-NET-QTY');
    assert.strictEqual(netRule.evaluate({ netQuantity: { raw: '500 g', isStandardMetric: true } }).status, 'PASS');
    assert.strictEqual(netRule.evaluate({ netQuantity: { raw: '5 lbs', isStandardMetric: false } }).status, 'FAIL');
    assert.strictEqual(netRule.evaluate({ netQuantity: null, imageQuality: 'GOOD' }).status, 'FAIL');
  });

  it('PCR-R6-01-MRP: Taxes clause and price presence', () => {
    const mrpRule = ALL_RULES.find(r => r.id === 'PCR-R6-01-MRP');
    assert.strictEqual(mrpRule.evaluate({ mrp: { value: 150, raw: '₹ 150 (incl. all taxes)', hasTaxesClause: true } }).status, 'PASS');
    assert.strictEqual(mrpRule.evaluate({ mrp: { value: 150, raw: '₹ 150', hasTaxesClause: false } }).status, 'REVIEW');
    assert.strictEqual(mrpRule.evaluate({ mrp: null, imageQuality: 'GOOD' }).status, 'FAIL');
  });

  it('PCR-R6-11-UNIT-PRICE: Unit Sale Price for packages >= 1kg', () => {
    const uspRule = ALL_RULES.find(r => r.id === 'PCR-R6-11-UNIT-PRICE');
    assert.strictEqual(uspRule.evaluate({ unitSalePrice: { declared: true, raw: '₹ 0.50 / g' } }).status, 'PASS');
    assert.strictEqual(uspRule.evaluate({ unitSalePrice: { declared: false }, netQuantity: { value: 1, unit: 'kg', raw: '1 kg' } }).status, 'FAIL');
    assert.strictEqual(uspRule.evaluate({ unitSalePrice: { declared: false }, netQuantity: { value: 200, unit: 'g', raw: '200 g' } }).status, 'REVIEW');
  });

  it('Scoring: Explainable score calculation formula', () => {
    const findings = [
      { status: 'PASS' },
      { status: 'PASS' },
      { status: 'PASS' },
      { status: 'FAIL' },
      { status: 'REVIEW' },
      { status: 'UNKNOWN' },
    ];
    const scoreSummary = calculateComplianceScore(findings);
    assert.strictEqual(scoreSummary.resolvedChecks, 4);
    assert.strictEqual(scoreSummary.score, 75); // (3/4) * 100
    assert.strictEqual(scoreSummary.overallStatus, 'FAIL');
  });

  console.log('\n--- 3. Testing AI Normalizer & Safety Boundary ---');
  it('Safety Boundary: AI confidence cannot bypass rule violation', () => {
    const simulatedAIExtraction = {
      imageQuality: 'GOOD',
      overallConfidence: 0.99,
      product: {
        productName: { value: 'Super Food', confidence: 0.99, visibility: 'VISIBLE' },
        genericName: { value: 'Snack Food', confidence: 0.99, visibility: 'VISIBLE' },
        mrp: { value: null, confidence: null, visibility: 'NOT_VISIBLE' }, // Missing MRP
        netQuantity: { value: '500 g', confidence: 0.99, visibility: 'VISIBLE' },
        manufacturer: { value: 'Manufactured by XYZ', confidence: 0.99, visibility: 'VISIBLE' },
        manufactureDate: { formatted: '01/2026', confidence: 0.99, visibility: 'VISIBLE' },
        consumerCare: { phone: '1800-11-22-33', email: 'care@xyz.in', isComplete: true, confidence: 0.99, visibility: 'VISIBLE' },
      },
    };
    const facts = normalizeFacts(simulatedAIExtraction);
    const evaluation = evaluateCompliance(facts, simulatedAIExtraction);
    const mrpFinding = evaluation.evaluations.find(e => e.ruleId === 'PCR-R6-01-MRP');
    assert.strictEqual(mrpFinding.status, 'FAIL');
    assert.strictEqual(evaluation.summary.overallStatus, 'FAIL');
  });

  it('Normalizer: parses units, prices, dates properly', () => {
    const raw = {
      imageQuality: 'GOOD',
      product: {
        mrp: { value: '₹ 199.99 (Incl. of all taxes)' },
        netQuantity: { value: '2.5 Kilograms' },
        manufactureDate: { formatted: '11/2026' },
      },
    };
    const normalized = normalizeFacts(raw);
    assert.strictEqual(normalized.mrp.value, 199.99);
    assert.strictEqual(normalized.mrp.hasTaxesClause, true);
    assert.strictEqual(normalized.netQuantity.value, 2.5);
    assert.strictEqual(normalized.netQuantity.unit, 'kg');
    assert.strictEqual(normalized.manufactureDate.formatted, '11/2026');
  });

  await itAsync('MockAIProvider: returns structured schema conforming to Zod', async () => {
    const mock = new MockAIProvider();
    const result = await mock.analyzeImages({
      images: [{ evidenceId: 'evi_01' }],
      inspectionContext: { commodityCategory: 'Food' },
    });
    const parsed = ExtractionResultSchema.safeParse(result);
    assert.strictEqual(parsed.success, true);
    assert.strictEqual(result.product.productName.value, 'Royal Butter Delight Biscuits');
  });

  console.log('\n--- 4. Testing Authentication & User Management ---');
  await itAsync('Auth: Seed default officer and login with JWT', async () => {
    await seedDefaultUsers();
    const result = await loginUser('officer@metacheck.gov.in', 'Password@123');
    assert.ok(result.accessToken);
    assert.strictEqual(result.user.role, 'OFFICER');
    assert.strictEqual(result.user.email, 'officer@metacheck.gov.in');
  });

  await itAsync('Auth: Register new officer account', async () => {
    const newOfficer = await registerUser({
      name: 'Inspector Vikram Rathore',
      email: 'vikram.rathore@metacheck.gov.in',
      password: 'Password@789',
      badgeNumber: 'LM-RJ-1099',
    });
    assert.strictEqual(newOfficer.email, 'vikram.rathore@metacheck.gov.in');
  });

  console.log('\n--- 5. Testing Inspection Lifecycle & Evidence ---');
  let inspection;
  const mockOfficer = { id: 'user_officer_default_01', name: 'Inspector Rajesh Kumar', role: 'OFFICER' };

  await itAsync('Inspection: Create draft inspection', async () => {
    inspection = await createInspection({
      establishmentName: 'Reliance Retail Hypermarket',
      location: 'South Extension, New Delhi',
      commodityCategory: 'Packaged Snacks',
      notes: 'Routine legal metrology surveillance inspection',
    }, mockOfficer);

    assert.ok(inspection._id || inspection.id);
    assert.strictEqual(inspection.status, 'DRAFT');
    assert.strictEqual(inspection.establishmentName, 'Reliance Retail Hypermarket');
  });

  await itAsync('Evidence: Upload product package images', async () => {
    const inspId = inspection._id || inspection.id;
    const mockImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    const mockFiles = [{
      originalname: 'front_panel_biscuit.png',
      mimetype: 'image/png',
      size: mockImageBuffer.length,
      buffer: mockImageBuffer,
    }];

    const uploaded = await uploadEvidence(inspId, mockFiles, mockOfficer);
    assert.strictEqual(uploaded.length, 1);
    assert.ok(uploaded[0].evidenceId);
  });

  await itAsync('Analysis: Execute AI extraction and deterministic rule evaluation', async () => {
    const inspId = inspection._id || inspection.id;
    const analysis = await analyzeInspection(inspId, mockOfficer);
    assert.ok(analysis.extraction);
    assert.strictEqual(analysis.findings.length, 10);
    assert.ok(analysis.summary.score >= 0);
  });

  await itAsync('Review: Officer corrects a field with audit logging', async () => {
    const inspId = inspection._id || inspection.id;
    const corrected = await correctInspectionField(inspId, {
      fieldPath: 'netQuantity',
      value: '500',
      unit: 'g',
      reason: 'Physical inspection verified 500g standard unit on package',
    }, mockOfficer);

    assert.strictEqual(corrected.normalizedFacts.netQuantity.value, 500);
    assert.strictEqual(corrected.normalizedFacts.netQuantity.isHumanCorrected, true);
  });

  await itAsync('Finalize: Mark inspection as reviewed and finalized', async () => {
    const inspId = inspection._id || inspection.id;
    const finalized = await finalizeInspectionReview(inspId, mockOfficer);
    assert.strictEqual(finalized.status, 'FINALIZED');
    assert.strictEqual(finalized.isReviewed, true);
  });

  await itAsync('Reports: Generate official PDF/HTML inspection report', async () => {
    const inspId = inspection._id || inspection.id;
    const report = await generateInspectionPdf(inspId, mockOfficer);
    assert.ok(report.reportNumber);
    assert.ok(report.pdfBuffer);
    assert.ok(report.pdfBuffer.length > 100);
  });

  await itAsync('Search & List: List inspections with pagination', async () => {
    const list = await listInspections({ search: 'Reliance' }, mockOfficer);
    assert.ok(list.inspections.length > 0);
    assert.strictEqual(list.inspections[0].establishmentName, 'Reliance Retail Hypermarket');
  });

  console.log('\n==================================================');
  console.log(`SUMMARY: ${passed} / ${total} TESTS PASSED (${Math.round(passed/total * 100)}%)`);
  console.log('==================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runAllTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

