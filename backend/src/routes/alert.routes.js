import { Router } from 'express';
import * as alert from '../controllers/alert.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.get('/', alert.getAlerts);
router.get('/unread-count', alert.getUnreadCount);
router.patch('/:id/read', alert.markRead);
router.patch('/mark-all-read', alert.markAllRead);
export default router;
