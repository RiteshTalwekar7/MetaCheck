import { Router } from 'express';
import * as controller from './admin.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('ADMIN'));

router.get('/users', controller.listUsers);
router.get('/audit', controller.listAuditLogs);

export default router;

