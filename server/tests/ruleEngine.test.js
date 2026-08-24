import { ALL_RULES, RULESET_VERSION, evaluateCompliance, calculateComplianceScore } from '../src/rules/index.js';
import { rule as nameRule } from '../src/rules/registry/rules/PCR-R6-01-NAME.js';
import { rule as netQtyRule } from '../src/rules/registry/rules/PCR-R6-01-NET-QTY.js';
import { rule as mrpRule } from '../src/rules/registry/rules/PCR-R6-01-MRP.js';
import { rule as unitPriceRule } from '../src/rules/registry/rules/PCR-R6-11-UNIT-PRICE.js';
import { rule as mfgPackerRule } from '../src/rules/registry/rules/PCR-R6-01-MFG-PACKER.js';
import { rule as mfgDateRule } from '../src/rules/registry/rules/PCR-R6-01-MFG-DATE.js';
import { rule as consumerCareRule } from '../src/rules/registry/rules/PCR-R6-01-CONSUMER-CARE.js';

describe('Deterministic Legal Metrology Rule Engine Tests', () => {
  test('Active Rule-Set version should match expected standard', () => {
    expect(RULESET_VERSION).toBe('PCR-INDIA-2026-08-v1');
    expect(ALL_RULES.length).toBe(10);
  });

  test('PCR-R6-01-NAME: PASS on valid generic name, FAIL on missing', () => {
    expect(nameRule.evaluate({ genericName: 'Butter Cookies', imageQuality: 'GOOD' }).status).toBe('PASS');
    expect(nameRule.evaluate({ genericName: null, productName: null, imageQuality: 'GOOD' }).status).toBe('FAIL');
    expect(nameRule.evaluate({ genericName: null, productName: null, imageQuality: 'DEGRADED' }).status).toBe('REVIEW');
  });

  test('PCR-R6-01-NET-QTY: Standard metric units check', () => {
    // Valid standard metric units
    expect(netQtyRule.evaluate({ netQuantity: { raw: '500 g', isStandardMetric: true } }).status).toBe('PASS');
    expect(netQtyRule.evaluate({ netQuantity: { raw: '1 L', isStandardMetric: true } }).status).toBe('PASS');
    // Illegal non-metric unit
    expect(netQtyRule.evaluate({ netQuantity: { raw: '2 lbs', isStandardMetric: false } }).status).toBe('FAIL');
    // Missing declaration
    expect(netQtyRule.evaluate({ netQuantity: null, imageQuality: 'GOOD' }).status).toBe('FAIL');
  });

  test('PCR-R6-01-MRP: Retail price inclusive of taxes clause', () => {
    expect(mrpRule.evaluate({ mrp: { value: 150, raw: '₹ 150 (Incl. of all taxes)', hasTaxesClause: true } }).status).toBe('PASS');
    expect(mrpRule.evaluate({ mrp: { value: 150, raw: '₹ 150', hasTaxesClause: false } }).status).toBe('REVIEW');
    expect(mrpRule.evaluate({ mrp: null, imageQuality: 'GOOD' }).status).toBe('FAIL');
  });

  test('PCR-R6-11-UNIT-PRICE: Unit Sale Price evaluation for packages >= 1kg/1L', () => {
    // Declared USP -> PASS
    expect(unitPriceRule.evaluate({ unitSalePrice: { declared: true, raw: '₹ 0.50 / g' } }).status).toBe('PASS');
    // 1kg package without USP -> FAIL under Rule 6(11)
    expect(unitPriceRule.evaluate({
      unitSalePrice: { declared: false },
      netQuantity: { value: 1, unit: 'kg', raw: '1 kg' },
    }).status).toBe('FAIL');
    // 200g small package without USP -> REVIEW
    expect(unitPriceRule.evaluate({
      unitSalePrice: { declared: false },
      netQuantity: { value: 200, unit: 'g', raw: '200 g' },
    }).status).toBe('REVIEW');
  });

  test('PCR-R6-01-MFG-PACKER: Prefix requirement ("Manufactured by" / "Packed by")', () => {
    expect(mfgPackerRule.evaluate({
      manufacturer: { raw: 'Manufactured by: Surya Foods Ltd, Sonipat', hasPrefix: true },
    }).status).toBe('PASS');

    expect(mfgPackerRule.evaluate({
      manufacturer: { raw: 'Surya Foods Ltd, Sonipat', hasPrefix: false },
    }).status).toBe('REVIEW');

    expect(mfgPackerRule.evaluate({
      manufacturer: null,
      packer: null,
      importer: null,
      imageQuality: 'GOOD',
    }).status).toBe('FAIL');
  });

  test('PCR-R6-01-MFG-DATE: Manufacturing month and year', () => {
    expect(mfgDateRule.evaluate({ manufactureDate: { formatted: '07/2026' } }).status).toBe('PASS');
    expect(mfgDateRule.evaluate({ manufactureDate: null, imageQuality: 'GOOD' }).status).toBe('FAIL');
  });

  test('PCR-R6-01-CONSUMER-CARE: Consumer helpline and contact details', () => {
    expect(consumerCareRule.evaluate({
      consumerCare: { phone: '1800-111-222', email: 'care@brand.in', isComplete: true },
    }).status).toBe('PASS');

    expect(consumerCareRule.evaluate({
      consumerCare: { phone: '1800-111-222', email: null, isComplete: false, hasPhone: true, hasEmail: false },
    }).status).toBe('REVIEW');
  });

  test('calculateComplianceScore: Explainable Scoring Metric Calculation', () => {
    const mockFindings = [
      { status: 'PASS' },
      { status: 'PASS' },
      { status: 'PASS' },
      { status: 'FAIL' },
      { status: 'REVIEW' },
      { status: 'UNKNOWN' },
      { status: 'NOT_APPLICABLE' },
    ];

    const result = calculateComplianceScore(mockFindings);
    expect(result.totalChecks).toBe(7);
    expect(result.passedChecks).toBe(3);
    expect(result.failedChecks).toBe(1);
    expect(result.resolvedChecks).toBe(4); // 3 PASS + 1 FAIL
    expect(result.score).toBe(75); // (3/4) * 100 = 75%
    expect(result.overallStatus).toBe('FAIL');
  });
});

