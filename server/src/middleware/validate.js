import { ZodError } from 'zod';
import { AppError, ErrorCodes } from '../utils/errors.js';

export function validate(schema) {
  return async (req, res, next) => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map(i => ({
          path: i.path.join('.'),
          message: i.message,
        }));
        next(new AppError(ErrorCodes.VALIDATION_ERROR, 'Request validation failed', 400, details));
      } else {
        next(error);
      }
    }
  };
}

