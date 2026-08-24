export const rule = {
  id: 'PCR-R6-11-UNIT-PRICE',
  title: 'Unit Sale Price (USP) Declaration',
  legalSource: {
    instrument: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    rule: 'Rule 6(11)',
    clause: 'Declaration of unit sale price in terms of rupee per g/kg or ml/litre on packages containing more than 1 kg or 1 L',
    gazetteNotification: 'GSR 779(E) effective 1st January 2022',
    officialUrl: 'https://consumeraffairs.nic.in/acts-and-rules/legal-metrology',
  },
  severity: 'MAJOR',
  evaluate(facts) {
    const usp = facts.unitSalePrice;
    const netQty = facts.netQuantity;

    // Check if package is > 1kg / 1L or if USP is already declared
    if (usp && usp.declared) {
      return {
        status: 'PASS',
        explanation: `Unit Sale Price is visibly declared on the packaging: "${usp.raw}".`,
        expected: 'Unit Sale Price declaration.',
        observed: usp.raw,
      };
    }

    if (netQty && netQty.value) {
      const isLargePackage = (netQty.unit === 'kg' && netQty.value >= 1) ||
                             (netQty.unit === 'g' && netQty.value >= 1000) ||
                             (netQty.unit === 'l' && netQty.value >= 1) ||
                             (netQty.unit === 'ml' && netQty.value >= 1000);

      if (isLargePackage) {
        return {
          status: 'FAIL',
          explanation: `Package contains ${netQty.raw} (>= 1kg/1L) and is legally required to declare Unit Sale Price (USP) under Rule 6(11), but no USP declaration was detected.`,
          expected: `Unit sale price e.g. "${usp?.raw || '₹ XX per kg / per L'}"`,
          observed: 'Not declared on package.',
        };
      }
    }

    return {
      status: 'REVIEW',
      explanation: 'Unit Sale Price is not declared. For small packages (< 1kg/1L), officer should verify if USP is required under state-specific notification.',
      expected: 'Unit Sale Price declaration or exemption.',
      observed: usp?.raw || 'Not declared',
    };
  },
};

