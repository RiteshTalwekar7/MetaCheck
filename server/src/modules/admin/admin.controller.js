import { User } from '../../models/User.js';
import { AuditLog } from '../../models/AuditLog.js';
import { isDbConnected } from '../../config/db.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export async function listUsers(req, res, next) {
  try {
    if (isDbConnected()) {
      const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
      return sendSuccess(res, { users }, 'Users list');
    }
    return sendSuccess(res, { users: [] }, 'Users list (mock mode)');
  } catch (error) {
    next(error);
  }
}

export async function listAuditLogs(req, res, next) {
  try {
    if (isDbConnected()) {
      const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
      return sendSuccess(res, { logs }, 'Audit logs');
    }
    return sendSuccess(res, { logs: [] }, 'Audit logs (mock mode)');
  } catch (error) {
    next(error);
  }
}

