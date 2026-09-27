import { Router } from 'express';
import {
  createSubmission,
  getSubmissionById,
  getSubmissions,
} from '../controllers/submissionController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/', createSubmission);
router.get('/', getSubmissions);
router.get('/:id', getSubmissionById);

export default router;
