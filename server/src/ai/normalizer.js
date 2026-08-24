export function normalizeFacts(extractionResult) {
  const p = extractionResult.product || {};

  const normalized = {
    productName: cleanString(p.productName?.value),
    genericName: cleanString(p.genericName?.value),
    manufacturer: normalizeEntity(p.manufacturer),
    packer: normalizeEntity(p.packer),
    importer: normalizeEntity(p.importer),
    countryOfOrigin: cleanString(p.countryOfOrigin?.value),
    netQuantity: normalizeNetQuantity(p.netQuantity),
    mrp: normalizeMrp(p.mrp),
    manufactureDate: normalizeDate(p.manufactureDate),
    bestBefore: cleanString(p.bestBefore?.value),
    consumerCare: normalizeConsumerCare(p.consumerCare),
    unitSalePrice: normalizeUnitPrice(p.unitSalePrice, p.mrp, p.netQuantity),
    dimensions: cleanString(p.dimensions?.value),
    imageQuality: extractionResult.imageQuality || 'GOOD',
    overallConfidence: extractionResult.overallConfidence || 0.85,
  };

  return normalized;
}

function cleanString(str) {
  if (!str || typeof str !== 'string') return null;
  const trimmed = str.trim().replace(/\s+/g, ' ');
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeEntity(field) {
  if (!field || !field.value) return null;
  const raw = cleanString(field.value);
  if (!raw) return null;

  const hasPrefix = /^(mfg|manufactured|pkd|packed|imp|imported|marketed)\s+by/i.test(raw);
  return {
    raw,
    hasPrefix,
    confidence: field.confidence || null,
    evidence: field.evidence || [],
  };
}

function normalizeNetQuantity(field) {
  if (!field || !field.value) return null;
  const raw = cleanString(field.value);
  if (!raw) return null;

  // Match e.g. "500 g", "1.5 kg", "200 ml", "1 L", "10 N", "5 units"
  const match = raw.match(/([\d.]+)\s*([a-zA-Z]+)/);
  if (match) {
    const valueNum = parseFloat(match[1]);
    let unit = match[2].toLowerCase();
    
    // Normalize unit abbreviations
    if (unit === 'grams' || unit === 'gm' || unit === 'gms') unit = 'g';
    if (unit === 'kilogram' || unit === 'kilograms' || unit === 'kgs') unit = 'kg';
    if (unit === 'milliliter' || unit === 'millilitre' || unit === 'mls') unit = 'ml';
    if (unit === 'liter' || unit === 'litre' || unit === 'litres' || unit === 'ltr' || unit === 'ltrs') unit = 'l';
    if (unit === 'meter' || unit === 'metre' || unit === 'mtr') unit = 'm';
    if (unit === 'centimeter' || unit === 'centimetre') unit = 'cm';
    if (unit === 'pieces' || unit === 'pcs' || unit === 'nos' || unit === 'no' || unit === 'units' || unit === 'unit') unit = 'N';

    const isStandardMetric = ['g', 'kg', 'ml', 'l', 'm', 'cm', 'mm', 'N'].includes(unit);

    return {
      raw,
      value: isNaN(valueNum) ? null : valueNum,
      unit,
      isStandardMetric,
      confidence: field.confidence || null,
      evidence: field.evidence || [],
    };
  }

  return {
    raw,
    value: null,
    unit: null,
    isStandardMetric: false,
    confidence: field.confidence || null,
    evidence: field.evidence || [],
  };
}

function normalizeMrp(field) {
  if (!field || !field.value) return null;
  const raw = cleanString(field.value);
  if (!raw) return null;

  // Extract numeric price
  const cleanPriceStr = raw.replace(/[^0-9.]/g, '');
  const numericPrice = parseFloat(cleanPriceStr);
  const mentionsInclusive = /incl|inclusive|all\s+taxes/i.test(raw);

  return {
    raw,
    value: isNaN(numericPrice) ? null : numericPrice,
    currency: 'INR',
    hasTaxesClause: mentionsInclusive,
    confidence: field.confidence || null,
    evidence: field.evidence || [],
  };
}

function normalizeDate(field) {
  if (!field) return null;
  if (field.month && field.year) {
    return {
      month: field.month,
      year: field.year,
      formatted: `${String(field.month).padStart(2, '0')}/${field.year}`,
      confidence: field.confidence || null,
      evidence: field.evidence || [],
    };
  }

  if (field.formatted) {
    const raw = cleanString(field.formatted);
    // match MM/YYYY or MM-YYYY
    const match = raw?.match(/(0[1-9]|1[0-2])[\/\-.](20\d{2})/);
    if (match) {
      return {
        month: parseInt(match[1], 10),
        year: parseInt(match[2], 10),
        formatted: `${match[1]}/${match[2]}`,
        confidence: field.confidence || null,
        evidence: field.evidence || [],
      };
    }
  }

  return null;
}

function normalizeConsumerCare(field) {
  if (!field) return null;
  const hasPhone = Boolean(field.phone && field.phone.replace(/\D/g, '').length >= 10);
  const hasEmail = Boolean(field.email && /^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(field.email.trim()));
  const hasAddress = Boolean(field.address && field.address.trim().length > 5);
  const hasDesignation = Boolean(field.nameOrDesignation && field.nameOrDesignation.trim().length > 2);

  const isComplete = hasPhone && hasEmail && (hasAddress || hasDesignation);

  return {
    nameOrDesignation: cleanString(field.nameOrDesignation),
    address: cleanString(field.address),
    phone: cleanString(field.phone),
    email: cleanString(field.email),
    hasPhone,
    hasEmail,
    hasAddress,
    hasDesignation,
    isComplete,
    confidence: field.confidence || null,
    evidence: field.evidence || [],
  };
}

function normalizeUnitPrice(field, mrpField, netQtyField) {
  if (field && field.value) {
    const raw = cleanString(field.value);
    return {
      raw,
      declared: true,
      confidence: field.confidence || null,
      evidence: field.evidence || [],
    };
  }

  // Calculate estimated USP if missing and Net Qty > 1kg / 1L
  if (mrpField?.value && netQtyField?.value) {
    const mrp = parseFloat(String(mrpField.value).replace(/[^0-9.]/g, ''));
    const qtyMatch = String(netQtyField.value).match(/([\d.]+)\s*([a-zA-Z]+)/);
    if (!isNaN(mrp) && qtyMatch) {
      const val = parseFloat(qtyMatch[1]);
      const unit = qtyMatch[2].toLowerCase();
      let calculatedUsp = null;

      if ((unit === 'g' || unit === 'gm') && val > 0) {
        const perGram = (mrp / val).toFixed(2);
        calculatedUsp = `₹${perGram} / g (or ₹${(mrp / val * 1000).toFixed(2)} / kg)`;
      } else if (unit === 'kg' && val > 0) {
        calculatedUsp = `₹${(mrp / val).toFixed(2)} / kg`;
      } else if ((unit === 'ml') && val > 0) {
        calculatedUsp = `₹${(mrp / val).toFixed(2)} / ml (or ₹${(mrp / val * 1000).toFixed(2)} / L)`;
      } else if (unit === 'l' && val > 0) {
        calculatedUsp = `₹${(mrp / val).toFixed(2)} / L`;
      }

      return {
        raw: calculatedUsp,
        declared: false,
        isCalculatedEstimate: true,
        confidence: 0.9,
        evidence: [],
      };
    }
  }

  return {
    raw: null,
    declared: false,
    isCalculatedEstimate: false,
    confidence: null,
    evidence: [],
  };
}

