import { ALL_RULES, RULESET_VERSION } from '../registry/ruleset.js';
import { calculateComplianceScore } from './scoring.js';

export function evaluateCompliance(normalizedFacts, extractionSnapshot = {}) {
  const evaluations = [];
  const rawProduct = extractionSnapshot.product || {};

  for (const ruleDef of ALL_RULES) {
    const result = ruleDef.evaluate(normalizedFacts);
    
    // Bind evidence from extraction snapshot
    let evidenceRefs = [];
    if (ruleDef.id === 'PCR-R6-01-NAME') {
      evidenceRefs = rawProduct.genericName?.evidence || rawProduct.productName?.evidence || [];
    } else if (ruleDef.id === 'PCR-R6-01-MFG-PACKER') {
      evidenceRefs = rawProduct.manufacturer?.evidence || rawProduct.packer?.evidence || rawProduct.importer?.evidence || [];
    } else if (ruleDef.id === 'PCR-R6-01-ORIGIN') {
      evidenceRefs = rawProduct.countryOfOrigin?.evidence || [];
    } else if (ruleDef.id === 'PCR-R6-01-NET-QTY') {
      evidenceRefs = rawProduct.netQuantity?.evidence || [];
    } else if (ruleDef.id === 'PCR-R6-01-MRP') {
      evidenceRefs = rawProduct.mrp?.evidence || [];
    } else if (ruleDef.id === 'PCR-R6-11-UNIT-PRICE') {
      evidenceRefs = rawProduct.unitSalePrice?.evidence || [];
    } else if (ruleDef.id === 'PCR-R6-01-MFG-DATE') {
      evidenceRefs = rawProduct.manufactureDate?.evidence || [];
    } else if (ruleDef.id === 'PCR-R6-01-EXP-DATE') {
      evidenceRefs = rawProduct.bestBefore?.evidence || [];
    } else if (ruleDef.id === 'PCR-R6-01-CONSUMER-CARE') {
      evidenceRefs = rawProduct.consumerCare?.evidence || [];
    }

    evaluations.push({
      ruleId: ruleDef.id,
      ruleTitle: ruleDef.title,
      legalSource: ruleDef.legalSource,
      status: result.status,
      severity: ruleDef.severity,
      explanation: result.explanation,
      expected: result.expected,
      observed: result.observed,
      evidenceRefs,
      evaluatedAt: new Date(),
    });
  }

  const summary = calculateComplianceScore(evaluations);

  return {
    ruleSetVersion: RULESET_VERSION,
    evaluations,
    summary,
  };
}

