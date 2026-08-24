import { AppError, ErrorCodes } from '../utils/errors.js';
import { sendError } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';
import { ZodError } from 'zod';

export function errorHandler(err, req, res, next) {
  logger.error('Unhandled Error', {
    requestId: req.id,
    message: err.message,
    stack: err.stack,
  });

  // Handle AppError
  if (err instanceof AppError) {
    return sendError(res, err.code, err.message, err.details, err.statusCode);
  }

  // Handle Zod validation error
  if (err instanceof ZodError) {
    const formatted = err.issues.map(issue => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    return sendError(res, ErrorCodes.VALIDATION_ERROR, 'Request validation failed', formatted, 400);
  }

  // Handle Multer upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, ErrorCodes.FILE_TOO_LARGE, 'Uploaded image exceeds allowed size limit', [], 400);
    }
    return sendError(res, ErrorCodes.UNSUPPORTED_FILE, err.message, [], 400);
  }

  // Handle Mongoose CastError / ValidationError
  if (err.name === 'CastError') {
    return sendError(res, ErrorCodes.VALIDATION_ERROR, `Invalid identifier format: ${err.value}`, [], 400);
  }

  // Default internal server error
  return sendError(res, ErrorCodes.INTERNAL_ERROR, 'An internal server error occurred', [], 500);
}

