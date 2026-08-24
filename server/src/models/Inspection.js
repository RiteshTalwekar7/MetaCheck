import mongoose from 'mongoose';

const inspectionSchema = new mongoose.Schema({
  referenceNumber: { type: String, required: true, unique: true, index: true },
  officerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  officerName: { type: String, required: true },
  establishmentName: { type: String, required: true, trim: true, index: true },
  location: { type: String, default: '' },
  commodityCategory: { type: String, default: 'General Packaged Commodity' },
  notes: { type: String, default: '' },
  status: {
    type: String,
    enum: ['DRAFT', 'ANALYZING', 'COMPLETED', 'REVIEW_REQUIRED', 'FINALIZED'],
    default: 'DRAFT',
    index: true,
  },
  evidence: [{
    evidenceId: { type: String, required: true },
    originalFilename: { type: String, required: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    quality: { type: String, enum: ['GOOD', 'DEGRADED', 'UNREADABLE'], default: 'GOOD' },
    uploadedAt: { type: Date, default: Date.now },
  }],
  extractionSnapshot: {
    schemaVersion: { type: String, default: '1.0' },
    extractedAt: { type: Date },
    provider: { type: String, default: 'mock' },
    model: { type: String, default: '' },
    product: { type: mongoose.Schema.Types.Mixed, default: {} },
    rawText: [{ type: String }],
    overallConfidence: { type: Number, default: null },
  },
  normalizedFacts: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  ruleEvaluations: [{
    ruleId: { type: String, required: true },
    ruleTitle: { type: String, required: true },
    legalSource: {
      instrument: { type: String, default: 'Legal Metrology (Packaged Commodities) Rules, 2011' },
      rule: { type: String },
      clause: { type: String },
      gazetteNotification: { type: String },
      officialUrl: { type: String },
    },
    status: {
      type: String,
      enum: ['PASS', 'FAIL', 'REVIEW', 'UNKNOWN', 'NOT_APPLICABLE'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['CRITICAL', 'MAJOR', 'MINOR', 'INFORMATIONAL'],
      default: 'MAJOR',
    },
    explanation: { type: String, required: true },
    expected: { type: String, default: '' },
    observed: { type: String, default: '' },
    evidenceRefs: [{
      evidenceId: { type: String },
      bbox: {
        x: { type: Number },
        y: { type: Number },
        width: { type: Number },
        height: { type: Number },
      },
      text: { type: String },
    }],
    evaluatedAt: { type: Date, default: Date.now },
  }],
  summary: {
    overallStatus: { type: String, enum: ['PASS', 'FAIL', 'REVIEW', 'UNKNOWN'], default: 'UNKNOWN' },
    score: { type: Number, default: 0 },
    totalChecks: { type: Number, default: 0 },
    resolvedChecks: { type: Number, default: 0 },
    passedChecks: { type: Number, default: 0 },
    failedChecks: { type: Number, default: 0 },
    reviewChecks: { type: Number, default: 0 },
    unknownChecks: { type: Number, default: 0 },
  },
  ruleSetVersion: { type: String, default: 'PCR-INDIA-2026-08-v1', index: true },
  auditTrail: [{
    action: { type: String, required: true },
    performedBy: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    details: { type: mongoose.Schema.Types.Mixed },
  }],
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },
  isReviewed: { type: Boolean, default: false },
  reviewedAt: { type: Date },
}, { timestamps: true });

export const Inspection = mongoose.models.Inspection || mongoose.model('Inspection', inspectionSchema);

