import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  userName: { type: String, default: 'System' },
  action: { type: String, required: true, index: true },
  inspectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inspection', index: true },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  ipAddress: { type: String, default: '' },
}, { timestamps: true });

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

