import { Router } from 'express';
import * as auth from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate, schemas } from '../middleware/validate.js';

const router = Router();
router.post('/register', authLimiter, validate(schemas.register), auth.register);
router.post('/login', authLimiter, validate(schemas.login), auth.login);
router.post('/refresh', auth.refresh);
router.post('/logout', protect, auth.logout);
router.get('/me', protect, auth.getMe);
export default router;
