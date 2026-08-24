import { Router } from 'express';
import * as controller from './rules.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.get('/', controller.listRules);
router.get('/:ruleId', controller.getRule);

export default router;

