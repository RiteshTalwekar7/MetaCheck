import { ExtractionResultSchema } from '../src/ai/schemas.js';
import { normalizeFacts } from '../src/ai/normalizer.js';
import { MockAIProvider } from '../src/ai/mockProvider.js';
import { evaluateCompliance } from '../src/rules/index.js';

describe('AI Pipeline & Safety Invariant Tests', () => {
  const mockProvider = new MockAIProvider();

  test('Extraction Schema validates compliant mock output', async () => {
    const result = await mockProvider.analyzeImages({
      images: [{ evidenceId: 'evi_test_01' }],
      inspectionContext: { commodityCategory: 'Biscuits' },
    });

    const parsed = ExtractionResultSchema.safeParse(result);
    expect(parsed.success).toBe(true);
    expect(result.product.productName.value).toBe('Royal Butter Delight Biscuits');
  });

  test('Safety Invariant: AI Output cannot override deterministic rule evaluation', () => {
    // Fabricate an AI extraction claiming high confidence
    const simulatedAIExtraction = {
      imageQuality: 'GOOD',
      overallConfidence: 0.99,
      product: {
        productName: { value: 'Test Product', confidence: 0.99, visibility: 'VISIBLE' },
        genericName: { value: 'Food Item', confidence: 0.99, visibility: 'VISIBLE' },
        mrp: { value: null, confidence: null, visibility: 'NOT_VISIBLE' }, // Missing MRP
        netQuantity: { value: '500 g', confidence: 0.99, visibility: 'VISIBLE' },
        manufacturer: { value: 'Manufactured by ABC', confidence: 0.99, visibility: 'VISIBLE' },
        manufactureDate: { formatted: '01/2026', confidence: 0.99, visibility: 'VISIBLE' },
        consumerCare: { phone: '1800123456', email: 'a@b.com', isComplete: true, confidence: 0.99, visibility: 'VISIBLE' },
      },
    };

    const normalized = normalizeFacts(simulatedAIExtraction);
    const evaluation = evaluateCompliance(normalized, simulatedAIExtraction);

    // Rule engine must identify MRP as FAIL despite AI confidence
    const mrpFinding = evaluation.evaluations.find(e => e.ruleId === 'PCR-R6-01-MRP');
    expect(mrpFinding.status).toBe('FAIL');
    expect(evaluation.summary.overallStatus).toBe('FAIL');
  });

  test('Normalizer cleanly parses units and currency', () => {
    const rawData = {
      imageQuality: 'GOOD',
      product: {
        mrp: { value: 'Rs. 249.50 (incl. all taxes)' },
        netQuantity: { value: '1.5 Kilograms' },
        manufactureDate: { formatted: '08-2026' },
      },
    };

    const facts = normalizeFacts(rawData);
    expect(facts.mrp.value).toBe(249.50);
    expect(facts.mrp.hasTaxesClause).toBe(true);
    expect(facts.netQuantity.value).toBe(1.5);
    expect(facts.netQuantity.unit).toBe('kg');
    expect(facts.netQuantity.isStandardMetric).toBe(true);
    expect(facts.manufactureDate.formatted).toBe('08/2026');
  });
});

