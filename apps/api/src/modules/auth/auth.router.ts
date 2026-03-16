import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { handleSignup, handleLogin, handleGetMe, handleLogout } from './auth.controller';
import { verifySession } from '../../middleware/verifySession.middleware';
import { asyncHandler } from '../../utils/asyncHandler';

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const meRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const router = Router();

router.post('/signup', authRateLimiter, asyncHandler(handleSignup));
router.post('/login', authRateLimiter, asyncHandler(handleLogin));
router.get('/me', meRateLimiter, verifySession, asyncHandler(handleGetMe));
router.post('/logout', handleLogout);

export default router;
