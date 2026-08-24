export const rule = {
  id: 'PCR-R6-01-MFG-DATE',
  title: 'Date of Manufacture / Packing / Import',
  legalSource: {
    instrument: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    rule: 'Rule 6(1)(d)',
    clause: 'Month and year in which the commodity is manufactured, packed or imported',
    gazetteNotification: 'GSR 202(E) dated 7th March 2011',
    officialUrl: 'https://consumeraffairs.nic.in/acts-and-rules/legal-metrology',
  },
  severity: 'CRITICAL',
  evaluate(facts) {
    const date = facts.manufactureDate;
    if (!date || !date.formatted) {
      return {
        status: facts.imageQuality === 'DEGRADED' ? 'REVIEW' : 'FAIL',
        explanation: 'Month and year of manufacture / packing / import is not visible on the package.',
        expected: 'Date of manufacture in MM/YYYY format (e.g. 07/2026 or July 2026).',
        observed: 'Not visible.',
      };
    }

    return {
      status: 'PASS',
      explanation: `Date of manufacture/packing is clearly declared as "${date.formatted}".`,
      expected: 'Month and Year of manufacture.',
      observed: date.formatted,
    };
  },
};

