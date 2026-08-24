import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError, ErrorCodes } from '../utils/errors.js';
import { User } from '../models/User.js';

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(ErrorCodes.AUTH_REQUIRED, 'Authentication token required', 401));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded; // { id, email, role, name }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError(ErrorCodes.AUTH_REQUIRED, 'Authentication token has expired', 401));
    }
    return next(new AppError(ErrorCodes.AUTH_REQUIRED, 'Invalid authentication token', 401));
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError(ErrorCodes.AUTH_REQUIRED, 'Authentication required', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(ErrorCodes.FORBIDDEN, `Forbidden. Requires one of roles: ${roles.join(', ')}`, 403));
    }
    next();
  };
}

