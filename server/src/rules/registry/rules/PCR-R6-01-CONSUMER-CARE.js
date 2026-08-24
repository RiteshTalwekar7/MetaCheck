export const rule = {
  id: 'PCR-R6-01-CONSUMER-CARE',
  title: 'Consumer Care Contact Details',
  legalSource: {
    instrument: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    rule: 'Rule 6(1)(f)',
    clause: 'Name, address, telephone number and e-mail address of the person or office to be contacted in case of consumer complaints',
    gazetteNotification: 'GSR 202(E) dated 7th March 2011',
    officialUrl: 'https://consumeraffairs.nic.in/acts-and-rules/legal-metrology',
  },
  severity: 'CRITICAL',
  evaluate(facts) {
    const care = facts.consumerCare;
    if (!care) {
      return {
        status: facts.imageQuality === 'DEGRADED' ? 'REVIEW' : 'FAIL',
        explanation: 'Consumer care details are missing entirely from the package.',
        expected: 'Designation/name, address, telephone helpline number, and email address.',
        observed: 'Not visible in evidence.',
      };
    }

    if (!care.isComplete) {
      const missingParts = [];
      if (!care.hasPhone) missingParts.push('helpline phone number');
      if (!care.hasEmail) missingParts.push('email address');
      if (!care.hasAddress && !care.hasDesignation) missingParts.push('contact address / designation');

      return {
        status: 'REVIEW',
        explanation: `Consumer care declaration is incomplete. Missing: ${missingParts.join(', ')}.`,
        expected: 'Complete consumer care with phone, email, and postal address/designation.',
        observed: `Phone: ${care.phone || 'None'}, Email: ${care.email || 'None'}`,
      };
    }

    return {
      status: 'PASS',
      explanation: `Consumer care details are fully declared: Helpline ${care.phone}, Email ${care.email}.`,
      expected: 'Complete consumer care declaration.',
      observed: `Phone: ${care.phone}, Email: ${care.email}, Contact: ${care.nameOrDesignation || care.address}`,
    };
  },
};

