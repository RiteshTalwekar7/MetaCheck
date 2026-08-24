export const rule = {
  id: 'PCR-R6-01-MFG-PACKER',
  title: 'Manufacturer / Packer / Importer Identity and Address',
  legalSource: {
    instrument: 'Legal Metrology (Packaged Commodities) Rules, 2011',
    rule: 'Rule 6(1)(a) & Rule 6(1)(ab)',
    clause: 'Name and complete address of the manufacturer, or packer, or importer with appropriate qualifying words',
    gazetteNotification: 'GSR 202(E) as amended',
    officialUrl: 'https://consumeraffairs.nic.in/acts-and-rules/legal-metrology',
  },
  severity: 'CRITICAL',
  evaluate(facts) {
    const mfg = facts.manufacturer;
    const pkr = facts.packer;
    const imp = facts.importer;

    if (!mfg && !pkr && !imp) {
      return {
        status: facts.imageQuality === 'DEGRADED' ? 'REVIEW' : 'FAIL',
        explanation: 'No manufacturer, packer, or importer name and address could be found on the package.',
        expected: 'Complete legal name and address with qualifying words: "Manufactured by", "Packed by", or "Imported by".',
        observed: 'Not visible in supplied evidence.',
      };
    }

    const entity = mfg || pkr || imp;
    if (!entity.hasPrefix) {
      return {
        status: 'REVIEW',
        explanation: `Manufacturer/Packer name "${entity.raw}" appears on label but lacks the mandatory prefix ("Manufactured by:", "Packed by:", or "Imported by:").`,
        expected: 'Mandatory prefix "Manufactured by" / "Packed by" preceding the address.',
        observed: entity.raw,
      };
    }

    return {
      status: 'PASS',
      explanation: `Manufacturer/Packer declaration is present with proper prefix and address: "${entity.raw}".`,
      expected: 'Complete manufacturer/packer declaration.',
      observed: entity.raw,
    };
  },
};

