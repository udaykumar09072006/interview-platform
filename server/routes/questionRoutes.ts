import { Router } from 'express';
import {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '../controllers/questionController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getQuestions);
router.post('/', requireRole(['interviewer', 'admin']), createQuestion);
router.put('/:id', requireRole(['interviewer', 'admin']), updateQuestion);
router.delete('/:id', requireRole(['interviewer', 'admin']), deleteQuestion);

export default router;
