import { Router } from 'express';
import { register, login, logout, getMe, syncClerkUser, updateRole } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/clerk-sync', syncClerkUser);
router.post('/role', authenticate, updateRole);
router.get('/me', authenticate, getMe);

export default router;
