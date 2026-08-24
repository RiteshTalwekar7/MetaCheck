import mongoose from 'mongoose';

const evidenceSchema = new mongoose.Schema({
  evidenceId: { type: String, required: true, unique: true, index: true },
  inspectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inspection', required: true, index: true },
  originalFilename: { type: String, required: true },
  mimeType: { type: String, required: true },
  sizeBytes: { type: Number, required: true },
  base64Data: { type: String, required: true }, // inlined for self-contained portability & demo
  qualityAssessment: {
    status: { type: String, enum: ['GOOD', 'DEGRADED', 'UNREADABLE'], default: 'GOOD' },
    resolution: { type: String, default: '' },
    notes: { type: String, default: null },
  },
}, { timestamps: true });

export const Evidence = mongoose.models.Evidence || mongoose.model('Evidence', evidenceSchema);

