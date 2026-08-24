export const rule = {
  id: 'PCR-R6-01-NET-QTY',
  title: 'Net Quantity Declaration in Standard Units',
  legalSource: {
    instrument: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    rule: 'Rule 6(1)(b) & Rules 11, 12, 13',
    clause: 'Net quantity in terms of standard unit of weight, measure or number without non-standard symbols',
    gazetteNotification: 'GSR 202(E) dated 7th March 2011',
    officialUrl: 'https://consumeraffairs.nic.in/acts-and-rules/legal-metrology',
  },
  severity: 'CRITICAL',
  evaluate(facts) {
    const netQty = facts.netQuantity;
    if (!netQty || !netQty.raw) {
      return {
        status: facts.imageQuality === 'DEGRADED' ? 'REVIEW' : 'FAIL',
        explanation: 'Net quantity declaration is missing from the package.',
        expected: 'Net quantity declaration with standard metric unit (e.g., 500 g, 1 kg, 1 L, 10 N).',
        observed: 'Not visible.',
      };
    }

    if (!netQty.isStandardMetric) {
      return {
        status: 'FAIL',
        explanation: `Net quantity "${netQty.raw}" uses a non-standard or illegal unit representation. Only standard metric symbols (g, kg, ml, l, m, cm, mm, N) are permitted.`,
        expected: 'Standard metric unit (g, kg, ml, l, N).',
        observed: netQty.raw,
      };
    }

    return {
      status: 'PASS',
      explanation: `Net quantity is declared in standard metric units: "${netQty.raw}".`,
      expected: 'Standard net quantity declaration.',
      observed: netQty.raw,
    };
  },
};

