export class AppError extends Error {
  constructor(code, message, statusCode = 400, details = []) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const ErrorCodes = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  FORBIDDEN: 'FORBIDDEN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNSUPPORTED_FILE: 'UNSUPPORTED_FILE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  AI_PROVIDER_ERROR: 'AI_PROVIDER_ERROR',
  AI_SCHEMA_ERROR: 'AI_SCHEMA_ERROR',
  IMAGE_UNREADABLE: 'IMAGE_UNREADABLE',
  RULESET_NOT_FOUND: 'RULESET_NOT_FOUND',
  REPORT_GENERATION_ERROR: 'REPORT_GENERATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
};

