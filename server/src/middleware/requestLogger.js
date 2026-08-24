import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';

export function requestLogger(req, res, next) {
  req.id = req.headers['x-request-id'] || uuidv4();
  const startTime = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    logger.info('HTTP Request', {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      userId: req.user?.id || null,
    });
  });

  next();
}

