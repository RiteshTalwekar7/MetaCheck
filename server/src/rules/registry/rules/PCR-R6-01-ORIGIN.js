export const rule = {
  id: 'PCR-R6-01-ORIGIN',
  title: 'Country of Origin Declaration',
  legalSource: {
    instrument: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    rule: 'Rule 6(10) / Rule 6(1)(a)',
    clause: 'Declaration of country of origin or manufacture on every package',
    gazetteNotification: 'GSR 629(E) / GSR 779(E)',
    officialUrl: 'https://consumeraffairs.nic.in/acts-and-rules/legal-metrology',
  },
  severity: 'MAJOR',
  evaluate(facts) {
    const origin = facts.countryOfOrigin;
    if (!origin) {
      return {
        status: facts.imageQuality === 'DEGRADED' ? 'REVIEW' : 'UNKNOWN',
        explanation: 'Country of Origin declaration is not visible on the label evidence.',
        expected: 'Country of Origin clearly declared (e.g. "Country of Origin: India", "Made in India").',
        observed: 'Not visible in evidence.',
      };
    }

    return {
      status: 'PASS',
      explanation: `Country of origin is declared as "${origin}".`,
      expected: 'Country of Origin declaration.',
      observed: origin,
    };
  },
};

