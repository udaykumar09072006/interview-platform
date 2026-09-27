import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  getPlatformStats,
} from '../controllers/userController.js';
import { NotificationModel } from '../models/index.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Admin stats
router.get('/stats', requireRole(['admin']), getPlatformStats);

// User listings and profiles
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);

// Notification endpoints
router.get('/notifications/me', async (req, res) => {
  try {
    const user = req.user!;
    const notifs = await NotificationModel.find({ userId: user.userId });
    notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res.json(notifs);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve notifications.' });
  }
});

router.put('/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await NotificationModel.findByIdAndUpdate(id, { isRead: true });
    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update notification.' });
  }
});

export default router;
