export const rule = {
  id: 'PCR-R6-01-EXP-DATE',
  title: 'Best Before / Expiry Date Declaration',
  legalSource: {
    instrument: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    rule: 'Rule 6(1)(d) Proviso',
    clause: 'Best before or use by date for commodities which may become unfit for human consumption',
    gazetteNotification: 'GSR 202(E) as amended',
    officialUrl: 'https://consumeraffairs.nic.in/acts-and-rules/legal-metrology',
  },
  severity: 'MAJOR',
  evaluate(facts) {
    const exp = facts.bestBefore;
    if (!exp) {
      return {
        status: 'UNKNOWN',
        explanation: 'Best before / Expiry date declaration was not detected. Mandatory for food/perishable commodities.',
        expected: 'Best before / Expiry statement (e.g., "Best before 12 months from manufacture").',
        observed: 'Not visible in evidence.',
      };
    }

    return {
      status: 'PASS',
      explanation: `Expiry/Best Before declaration is present: "${exp}".`,
      expected: 'Best before / Expiry date declaration.',
      observed: exp,
    };
  },
};

