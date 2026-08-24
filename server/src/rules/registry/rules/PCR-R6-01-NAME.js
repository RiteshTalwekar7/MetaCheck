export const rule = {
  id: 'PCR-R6-01-NAME',
  title: 'Common or Generic Name of Commodity',
  legalSource: {
    instrument: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    rule: 'Rule 6(1)(a)',
    clause: 'Declaration of the name and description of the commodity',
    gazetteNotification: 'GSR 202(E) dated 7th March 2011',
    officialUrl: 'https://consumeraffairs.nic.in/acts-and-rules/legal-metrology',
  },
  severity: 'CRITICAL',
  evaluate(facts) {
    const name = facts.genericName || facts.productName;
    if (!name) {
      return {
        status: facts.imageQuality === 'DEGRADED' || facts.imageQuality === 'UNREADABLE' ? 'REVIEW' : 'FAIL',
        explanation: 'The common or generic name of the packaged commodity is not visibly declared on the packaging.',
        expected: 'Generic or common name clearly declared on principal display panel (e.g. Butter Biscuits, Refined Sunflower Oil).',
        observed: 'Not visible in uploaded evidence.',
      };
    }

    return {
      status: 'PASS',
      explanation: `Generic/common name is prominently declared as "${name}".`,
      expected: 'Common or generic name on package.',
      observed: name,
    };
  },
};

