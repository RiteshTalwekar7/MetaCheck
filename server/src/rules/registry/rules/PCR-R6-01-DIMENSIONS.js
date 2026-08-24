export const rule = {
  id: 'PCR-R6-01-DIMENSIONS',
  title: 'Dimensions of Commodity (when applicable)',
  legalSource: {
    instrument: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    rule: 'Rule 6(1)(c)',
    clause: 'Declaration of dimensions and size where commodity is sold by dimensions',
    gazetteNotification: 'GSR 202(E)',
    officialUrl: 'https://consumeraffairs.nic.in/acts-and-rules/legal-metrology',
  },
  severity: 'INFORMATIONAL',
  evaluate(facts) {
    const dim = facts.dimensions;
    if (dim) {
      return {
        status: 'PASS',
        explanation: `Dimensions are declared: "${dim}".`,
        expected: 'Dimensions declaration where sold by size.',
        observed: dim,
      };
    }

    return {
      status: 'NOT_APPLICABLE',
      explanation: 'Dimensions declaration is not mandatory for weight/volume based packaged goods.',
      expected: 'Not applicable unless commodity is sold by size/dimension.',
      observed: 'N/A',
    };
  },
};

