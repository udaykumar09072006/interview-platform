import { Router } from 'express';
import {
  getProblems,
  getProblemById,
  createProblem,
} from '../controllers/problemController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getProblems);
router.get('/:id', getProblemById);
router.post('/', requireRole(['interviewer', 'admin']), createProblem);

export default router;
