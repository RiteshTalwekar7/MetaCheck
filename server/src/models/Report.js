import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reportNumber: { type: String, required: true, unique: true, index: true },
  inspectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inspection', required: true, index: true },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  officerName: { type: String, required: true },
  ruleSetVersion: { type: String, required: true },
  status: { type: String, enum: ['READY', 'FAILED'], default: 'READY' },
  disclaimer: {
    type: String,
    default: 'AI-assisted inspection support tool. Findings are indicative and require officer verification. This system does not make legally binding determinations under the Legal Metrology Act, 2009.',
  },
  pdfBase64: { type: String }, // stored base64 for self-contained report download
}, { timestamps: true });

export const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);

