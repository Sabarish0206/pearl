import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { verifySession } from '../../middleware/verifySession.middleware';
import { requireRole } from '../../middleware/requireRole.middleware';
import { handleGetApplicationHistory } from './student.applications.controller';

const studentApplicationsRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const router = Router();

// All routes require authentication and STUDENT role
router.use(studentApplicationsRateLimiter, verifySession, requireRole(['STUDENT']));

router.get('/', handleGetApplicationHistory);

export default router;
