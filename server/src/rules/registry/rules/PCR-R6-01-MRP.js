export const rule = {
  id: 'PCR-R6-01-MRP',
  title: 'Retail Sale Price / Maximum Retail Price (MRP)',
  legalSource: {
    instrument: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    rule: 'Rule 6(1)(e)',
    clause: 'Maximum retail price inclusive of all taxes in Indian currency format',
    gazetteNotification: 'GSR 779(E) dated 2nd November 2021',
    officialUrl: 'https://consumeraffairs.nic.in/acts-and-rules/legal-metrology',
  },
  severity: 'CRITICAL',
  evaluate(facts) {
    const mrp = facts.mrp;
    if (!mrp || mrp.value === null) {
      return {
        status: facts.imageQuality === 'DEGRADED' ? 'REVIEW' : 'FAIL',
        explanation: 'Maximum Retail Price (MRP) declaration is missing or not visible.',
        expected: 'Maximum Retail Price formatted as "MRP Rs. XX.XX (incl. of all taxes)" or "₹ XX.XX (inclusive of all taxes)".',
        observed: 'Not visible in evidence.',
      };
    }

    if (!mrp.hasTaxesClause) {
      return {
        status: 'REVIEW',
        explanation: `MRP is declared as "₹ ${mrp.value}" but lacks explicit "Inclusive of all taxes" / "Incl. of all taxes" text.`,
        expected: 'MRP declaration must explicitly include "Inclusive of all taxes".',
        observed: mrp.raw,
      };
    }

    return {
      status: 'PASS',
      explanation: `Maximum Retail Price is properly declared: "${mrp.raw}".`,
      expected: 'Complete MRP declaration inclusive of all taxes.',
      observed: mrp.raw,
    };
  },
};

