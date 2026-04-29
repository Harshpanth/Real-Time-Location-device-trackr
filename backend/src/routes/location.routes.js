import { Router } from 'express';
import * as location from '../controllers/location.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.get('/:deviceId', location.getHistory);
router.get('/:deviceId/replay', location.getReplay);
export default router;
