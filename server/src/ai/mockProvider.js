export class MockAIProvider {
  constructor() {
    this.name = 'MockAIProvider';
  }

  async analyzeImages({ images, inspectionContext }) {
    // Select fixture based on inspection metadata or round-robin
    const category = (inspectionContext?.commodityCategory || '').toLowerCase();
    const estName = (inspectionContext?.establishmentName || '').toLowerCase();

    if (category.includes('oil') || estName.includes('oil')) {
      return this.getMissingMrpFixture(images);
    }
    if (category.includes('import') || estName.includes('import') || estName.includes('duty free')) {
      return this.getImportedNoImporterFixture(images);
    }
    if (category.includes('spice') || estName.includes('spice')) {
      return this.getInvalidDateFixture(images);
    }
    if (estName.includes('blur') || category.includes('degraded')) {
      return this.getBlurryLabelFixture(images);
    }

    // Default: Compliant FMCG Biscuit/Food Product
    return this.getCompliantFixture(images);
  }

  getCompliantFixture(images) {
    const imgId = images[0]?.evidenceId || 'evidence_001';
    return {
      schemaVersion: '1.0',
      imageQuality: 'GOOD',
      product: {
        productName: {
          value: 'Royal Butter Delight Biscuits',
          unit: null,
          confidence: 0.98,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.15, y: 0.10, width: 0.70, height: 0.12 }, text: 'Royal Butter Delight Biscuits' }],
        },
        genericName: {
          value: 'Butter Cookies / Biscuits',
          unit: null,
          confidence: 0.95,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.20, y: 0.22, width: 0.60, height: 0.08 }, text: 'Butter Cookies' }],
        },
        manufacturer: {
          value: 'Manufactured by: Surya Food Products Pvt. Ltd., Plot No. 45, Industrial Area Phase II, Sonipat, Haryana - 131001',
          unit: null,
          confidence: 0.96,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.05, y: 0.75, width: 0.90, height: 0.08 }, text: 'Manufactured by: Surya Food Products Pvt. Ltd.' }],
        },
        packer: {
          value: 'Packed by: Surya Food Products Pvt. Ltd., Sonipat, Haryana - 131001',
          unit: null,
          confidence: 0.92,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.05, y: 0.83, width: 0.90, height: 0.05 }, text: 'Packed by: Surya Food Products Pvt. Ltd.' }],
        },
        importer: {
          value: null,
          unit: null,
          confidence: null,
          visibility: 'NOT_VISIBLE',
          evidence: [],
        },
        countryOfOrigin: {
          value: 'India',
          unit: null,
          confidence: 0.99,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.70, y: 0.90, width: 0.25, height: 0.05 }, text: 'Country of Origin: India' }],
        },
        netQuantity: {
          value: '500 g',
          unit: 'g',
          confidence: 0.97,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.10, y: 0.35, width: 0.30, height: 0.08 }, text: 'Net Qty: 500 g' }],
        },
        mrp: {
          value: '₹ 150.00 (Incl. of all taxes)',
          unit: 'INR',
          confidence: 0.96,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.55, y: 0.35, width: 0.40, height: 0.08 }, text: 'MRP Rs. 150.00 (Incl. of all taxes)' }],
        },
        manufactureDate: {
          month: 7,
          year: 2026,
          formatted: '07/2026',
          confidence: 0.94,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.10, y: 0.45, width: 0.35, height: 0.06 }, text: 'Mfg Date: 07/2026' }],
        },
        bestBefore: {
          value: 'Best Before 9 Months from Manufacture',
          unit: null,
          confidence: 0.93,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.50, y: 0.45, width: 0.45, height: 0.06 }, text: 'Best Before 9 Months from Manufacture' }],
        },
        consumerCare: {
          nameOrDesignation: 'Consumer Care Executive',
          address: 'Surya Food Products Pvt. Ltd., Plot No. 45, Industrial Area, Sonipat, Haryana - 131001',
          phone: '1800-180-2244',
          email: 'customercare@suryafoods.co.in',
          confidence: 0.95,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.05, y: 0.88, width: 0.90, height: 0.09 }, text: 'Consumer Care: 1800-180-2244, email: customercare@suryafoods.co.in' }],
        },
        unitSalePrice: {
          value: '₹ 0.30 / g (₹ 300.00 / kg)',
          unit: 'g',
          confidence: 0.92,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.55, y: 0.42, width: 0.40, height: 0.05 }, text: 'Unit Sale Price: Rs. 0.30 / g' }],
        },
        dimensions: {
          value: null,
          unit: null,
          confidence: null,
          visibility: 'NOT_VISIBLE',
          evidence: [],
        },
      },
      rawText: [
        'Royal Butter Delight Biscuits',
        'Net Qty: 500 g',
        'MRP Rs. 150.00 (Incl. of all taxes)',
        'Unit Sale Price: Rs. 0.30 / g',
        'Mfg Date: 07/2026',
        'Best Before 9 Months from Manufacture',
        'Manufactured by: Surya Food Products Pvt. Ltd.',
        'Plot No. 45, Industrial Area Phase II, Sonipat, Haryana - 131001',
        'Country of Origin: India',
        'Consumer Care: 1800-180-2244, customercare@suryafoods.co.in'
      ],
      overallConfidence: 0.96,
    };
  }

  getMissingMrpFixture(images) {
    const imgId = images[0]?.evidenceId || 'evidence_002';
    return {
      schemaVersion: '1.0',
      imageQuality: 'GOOD',
      product: {
        productName: {
          value: 'Golden Gold Refined Sunflower Oil',
          unit: null,
          confidence: 0.94,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.10, y: 0.10, width: 0.80, height: 0.15 }, text: 'Golden Gold Refined Sunflower Oil' }],
        },
        genericName: {
          value: 'Edible Vegetable Oil (Sunflower)',
          unit: null,
          confidence: 0.90,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.10, y: 0.25, width: 0.80, height: 0.08 }, text: 'Edible Vegetable Oil' }],
        },
        manufacturer: {
          value: 'Manufactured by: Kisan Agro Foods Ltd, G.T. Road, Karnal, Haryana',
          unit: null,
          confidence: 0.92,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.05, y: 0.70, width: 0.90, height: 0.10 }, text: 'Manufactured by: Kisan Agro Foods Ltd' }],
        },
        packer: { value: null, unit: null, confidence: null, visibility: 'NOT_VISIBLE', evidence: [] },
        importer: { value: null, unit: null, confidence: null, visibility: 'NOT_VISIBLE', evidence: [] },
        countryOfOrigin: {
          value: 'India',
          unit: null,
          confidence: 0.95,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.05, y: 0.82, width: 0.40, height: 0.05 }, text: 'Country of Origin: India' }],
        },
        netQuantity: {
          value: '1 L',
          unit: 'l',
          confidence: 0.96,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.10, y: 0.35, width: 0.30, height: 0.08 }, text: 'Net Volume: 1 L' }],
        },
        mrp: {
          value: null, // VIOLATION: Missing MRP
          unit: null,
          confidence: null,
          visibility: 'NOT_VISIBLE',
          evidence: [],
        },
        manufactureDate: {
          month: 6,
          year: 2026,
          formatted: '06/2026',
          confidence: 0.91,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.10, y: 0.45, width: 0.35, height: 0.06 }, text: 'Pkd: 06/2026' }],
        },
        bestBefore: {
          value: 'Best before 12 months',
          unit: null,
          confidence: 0.88,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.50, y: 0.45, width: 0.45, height: 0.06 }, text: 'Best before 12 months' }],
        },
        consumerCare: {
          nameOrDesignation: 'Manager Customer Relations',
          address: 'Kisan Agro Foods Ltd, Karnal',
          phone: '0184-225588',
          email: null, // Partial consumer care
          confidence: 0.85,
          visibility: 'PARTIALLY_VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.05, y: 0.88, width: 0.90, height: 0.08 }, text: 'For feedback call: 0184-225588' }],
        },
        unitSalePrice: {
          value: null, // VIOLATION: Missing USP for 1L package
          unit: null,
          confidence: null,
          visibility: 'NOT_VISIBLE',
          evidence: [],
        },
        dimensions: { value: null, unit: null, confidence: null, visibility: 'NOT_VISIBLE', evidence: [] },
      },
      rawText: [
        'Golden Gold Refined Sunflower Oil',
        'Net Volume: 1 L',
        'Pkd: 06/2026',
        'Manufactured by: Kisan Agro Foods Ltd, G.T. Road, Karnal, Haryana',
        'Country of Origin: India',
        'For feedback call: 0184-225588'
      ],
      overallConfidence: 0.89,
    };
  }

  getImportedNoImporterFixture(images) {
    const imgId = images[0]?.evidenceId || 'evidence_003';
    return {
      schemaVersion: '1.0',
      imageQuality: 'GOOD',
      product: {
        productName: {
          value: 'Alpine Swiss Dark Chocolate Bar',
          unit: null,
          confidence: 0.95,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.10, y: 0.10, width: 0.80, height: 0.15 }, text: 'Alpine Swiss Dark Chocolate' }],
        },
        genericName: {
          value: 'Dark Chocolate 70% Cocoa',
          unit: null,
          confidence: 0.92,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.10, y: 0.25, width: 0.80, height: 0.08 }, text: 'Dark Chocolate' }],
        },
        manufacturer: {
          value: 'Manufactured by: Chocolatier Suisse SA, Zurich, Switzerland',
          unit: null,
          confidence: 0.94,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.05, y: 0.65, width: 0.90, height: 0.08 }, text: 'Chocolatier Suisse SA, Switzerland' }],
        },
        packer: { value: null, unit: null, confidence: null, visibility: 'NOT_VISIBLE', evidence: [] },
        importer: {
          value: null, // VIOLATION: Missing Indian Importer details for imported package
          unit: null,
          confidence: null,
          visibility: 'NOT_VISIBLE',
          evidence: [],
        },
        countryOfOrigin: {
          value: 'Switzerland',
          unit: null,
          confidence: 0.97,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.10, y: 0.75, width: 0.40, height: 0.05 }, text: 'Product of Switzerland' }],
        },
        netQuantity: {
          value: '100 g',
          unit: 'g',
          confidence: 0.95,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.10, y: 0.35, width: 0.30, height: 0.08 }, text: 'Net Wt: 100 g' }],
        },
        mrp: {
          value: '₹ 299.00 (Inclusive of all taxes)',
          unit: 'INR',
          confidence: 0.93,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.50, y: 0.35, width: 0.45, height: 0.08 }, text: 'MRP ₹299.00 (Inclusive of all taxes)' }],
        },
        manufactureDate: {
          month: 5,
          year: 2026,
          formatted: '05/2026',
          confidence: 0.90,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.10, y: 0.45, width: 0.35, height: 0.06 }, text: 'Date of Packing: 05/2026' }],
        },
        bestBefore: {
          value: 'Expiry: 05/2027',
          unit: null,
          confidence: 0.91,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.50, y: 0.45, width: 0.45, height: 0.06 }, text: 'Expiry: 05/2027' }],
        },
        consumerCare: {
          nameOrDesignation: null, // VIOLATION: Missing Indian consumer helpline
          address: null,
          phone: null,
          email: null,
          confidence: null,
          visibility: 'NOT_VISIBLE',
          evidence: [],
        },
        unitSalePrice: {
          value: '₹ 2.99 / g',
          unit: 'g',
          confidence: 0.90,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.50, y: 0.52, width: 0.45, height: 0.05 }, text: 'USP: ₹2.99 / g' }],
        },
        dimensions: { value: null, unit: null, confidence: null, visibility: 'NOT_VISIBLE', evidence: [] },
      },
      rawText: [
        'Alpine Swiss Dark Chocolate',
        'Product of Switzerland',
        'Net Wt: 100 g',
        'MRP ₹299.00 (Inclusive of all taxes)',
        'USP: ₹2.99 / g',
        'Chocolatier Suisse SA, Zurich, Switzerland'
      ],
      overallConfidence: 0.93,
    };
  }

  getInvalidDateFixture(images) {
    const imgId = images[0]?.evidenceId || 'evidence_004';
    return {
      schemaVersion: '1.0',
      imageQuality: 'GOOD',
      product: {
        productName: {
          value: 'Desi Tadka Garam Masala Powder',
          unit: null,
          confidence: 0.95,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.10, y: 0.10, width: 0.80, height: 0.15 }, text: 'Desi Tadka Garam Masala' }],
        },
        genericName: {
          value: 'Garam Masala (Mixed Spices)',
          unit: null,
          confidence: 0.91,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.10, y: 0.25, width: 0.80, height: 0.08 }, text: 'Mixed Spices' }],
        },
        manufacturer: {
          value: 'Manufactured by: Spice Magic LLP, Jaipur, Rajasthan - 302013',
          unit: null,
          confidence: 0.94,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.05, y: 0.70, width: 0.90, height: 0.08 }, text: 'Manufactured by: Spice Magic LLP' }],
        },
        packer: { value: null, unit: null, confidence: null, visibility: 'NOT_VISIBLE', evidence: [] },
        importer: { value: null, unit: null, confidence: null, visibility: 'NOT_VISIBLE', evidence: [] },
        countryOfOrigin: {
          value: 'India',
          unit: null,
          confidence: 0.96,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.05, y: 0.80, width: 0.40, height: 0.05 }, text: 'Made in India' }],
        },
        netQuantity: {
          value: '200 g',
          unit: 'g',
          confidence: 0.95,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.10, y: 0.35, width: 0.30, height: 0.08 }, text: 'Net Weight: 200 g' }],
        },
        mrp: {
          value: '₹ 85.00 (Incl. of all taxes)',
          unit: 'INR',
          confidence: 0.94,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.50, y: 0.35, width: 0.45, height: 0.08 }, text: 'MRP ₹85.00 (Incl. of all taxes)' }],
        },
        manufactureDate: {
          month: null, // VIOLATION: Missing manufacturing month & year
          year: null,
          formatted: null,
          confidence: null,
          visibility: 'NOT_VISIBLE',
          evidence: [],
        },
        bestBefore: {
          value: 'Use within 6 months',
          unit: null,
          confidence: 0.87,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.50, y: 0.45, width: 0.45, height: 0.06 }, text: 'Use within 6 months' }],
        },
        consumerCare: {
          nameOrDesignation: 'Customer Service Executive',
          address: 'Jaipur, Rajasthan',
          phone: '9829012345',
          email: 'care@spicemagic.in',
          confidence: 0.92,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.05, y: 0.88, width: 0.90, height: 0.08 }, text: 'Helpline: 9829012345, care@spicemagic.in' }],
        },
        unitSalePrice: {
          value: '₹ 0.425 / g',
          unit: 'g',
          confidence: 0.91,
          visibility: 'VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.50, y: 0.52, width: 0.45, height: 0.05 }, text: 'USP: ₹0.43/g' }],
        },
        dimensions: { value: null, unit: null, confidence: null, visibility: 'NOT_VISIBLE', evidence: [] },
      },
      rawText: [
        'Desi Tadka Garam Masala',
        'Net Weight: 200 g',
        'MRP ₹85.00 (Incl. of all taxes)',
        'Manufactured by: Spice Magic LLP, Jaipur',
        'Care: care@spicemagic.in'
      ],
      overallConfidence: 0.91,
    };
  }

  getBlurryLabelFixture(images) {
    const imgId = images[0]?.evidenceId || 'evidence_005';
    return {
      schemaVersion: '1.0',
      imageQuality: 'DEGRADED',
      product: {
        productName: {
          value: 'Natural Herbal Toothpaste',
          unit: null,
          confidence: 0.72,
          visibility: 'PARTIALLY_VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.10, y: 0.10, width: 0.80, height: 0.15 }, text: 'Herbal Toothpaste' }],
        },
        genericName: { value: null, unit: null, confidence: null, visibility: 'NOT_VISIBLE', evidence: [] },
        manufacturer: {
          value: 'Manufactured by: Ayurvedic Herbals Ltd',
          unit: null,
          confidence: 0.65,
          visibility: 'PARTIALLY_VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.05, y: 0.70, width: 0.90, height: 0.08 }, text: 'Ayurvedic Herbals' }],
        },
        packer: { value: null, unit: null, confidence: null, visibility: 'NOT_VISIBLE', evidence: [] },
        importer: { value: null, unit: null, confidence: null, visibility: 'NOT_VISIBLE', evidence: [] },
        countryOfOrigin: { value: null, unit: null, confidence: null, visibility: 'NOT_VISIBLE', evidence: [] },
        netQuantity: {
          value: null, // UNREADABLE
          unit: null,
          confidence: 0.40,
          visibility: 'ILLEGIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.10, y: 0.35, width: 0.30, height: 0.08 }, text: '... g' }],
        },
        mrp: {
          value: '₹ 95.00',
          unit: 'INR',
          confidence: 0.68,
          visibility: 'PARTIALLY_VISIBLE',
          evidence: [{ imageId: imgId, bbox: { x: 0.50, y: 0.35, width: 0.45, height: 0.08 }, text: 'MRP 95' }],
        },
        manufactureDate: {
          month: null,
          year: null,
          formatted: null,
          confidence: null,
          visibility: 'ILLEGIBLE',
          evidence: [],
        },
        bestBefore: { value: null, unit: null, confidence: null, visibility: 'NOT_VISIBLE', evidence: [] },
        consumerCare: {
          nameOrDesignation: null,
          address: null,
          phone: null,
          email: null,
          confidence: null,
          visibility: 'NOT_VISIBLE',
          evidence: [],
        },
        unitSalePrice: { value: null, unit: null, confidence: null, visibility: 'NOT_VISIBLE', evidence: [] },
        dimensions: { value: null, unit: null, confidence: null, visibility: 'NOT_VISIBLE', evidence: [] },
      },
      rawText: ['Herbal Toothpaste', 'MRP 95'],
      overallConfidence: 0.55,
    };
  }
}

