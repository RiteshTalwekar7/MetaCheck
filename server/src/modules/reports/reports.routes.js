import { Router } from 'express';
import * as controller from './reports.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.post('/inspections/:id/report', controller.generateReport);
router.get('/inspections/:id/report', controller.downloadReport);

export default router;

