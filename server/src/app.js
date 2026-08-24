import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './modules/auth/auth.routes.js';
import inspectionRoutes from './modules/inspections/inspections.routes.js';
import rulesRoutes from './modules/rules/rules.routes.js';
import reportRoutes from './modules/reports/reports.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import { isDbConnected } from './config/db.js';
import { RULESET_VERSION } from './rules/index.js';

export function createApp() {
  const app = express();

  // Basic CORS configuration
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
  }));

  // Body parsers
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Logging
  app.use(requestLogger);

  // Health endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'MetaCheck AI API',
      version: '1.0.0',
      ruleSetVersion: RULESET_VERSION,
      database: isDbConnected() ? 'connected' : 'disconnected/mock',
      aiProvider: env.AI_PROVIDER,
      timestamp: new Date().toISOString(),
    });
  });

  // REST API v1 routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/inspections', inspectionRoutes);
  app.use('/api/v1/rules', rulesRoutes);
  app.use('/api/v1', reportRoutes);
  app.use('/api/v1/admin', adminRoutes);

  // Global 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: `Endpoint ${req.method} ${req.originalUrl} not found`,
        details: [],
      },
    });
  });

  // Central Error Handler
  app.use(errorHandler);

  return app;
}

export default createApp;

