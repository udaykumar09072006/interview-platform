import { Router } from 'express';
import {
  createInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  deleteInterview,
  joinInterview,
  endInterview,
} from '../controllers/interviewController.js';
import {
  createFeedback,
  getFeedbackByInterviewId,
} from '../controllers/feedbackController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/', requireRole(['interviewer', 'admin']), createInterview);
router.get('/', getInterviews);
router.get('/:id', getInterviewById);
router.put('/:id', updateInterview);
router.delete('/:id', requireRole(['interviewer', 'admin']), deleteInterview);
router.post('/:id/join', joinInterview);
router.post('/:id/end', endInterview);

// Feedback nested routes
router.post('/:id/feedback', requireRole(['interviewer', 'admin']), createFeedback);
router.get('/:id/feedback', getFeedbackByInterviewId);

export default router;
