import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { handleSignup, handleLogin, handleGetMe, handleLogout } from './auth.controller';
import { verifySession } from '../../middleware/verifySession.middleware';

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const router = Router();

router.post('/signup', authRateLimiter, handleSignup);
router.post('/login', authRateLimiter, handleLogin);
router.get('/me', verifySession, handleGetMe);
router.post('/logout', handleLogout);

export default router;
