import { Router } from 'express';
import * as controller from './inspections.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { upload } from '../../middleware/upload.js';
import { validate } from '../../middleware/validate.js';
import { createInspectionSchema, reviewFieldSchema } from './inspections.validator.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(createInspectionSchema), controller.create);
router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/:id/evidence', upload.array('images', 6), controller.uploadEvidence);
router.get('/:id/evidence/:evidenceId', controller.getEvidenceImage);
router.post('/:id/analyze', controller.analyze);
router.post('/:id/review', validate(reviewFieldSchema), controller.reviewField);
router.post('/:id/finalize-review', controller.finalizeReview);

export default router;

