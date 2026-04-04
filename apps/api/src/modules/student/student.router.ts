import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { verifySession } from '../../middleware/verifySession.middleware';
import { requireRole } from '../../middleware/requireRole.middleware';
import { handleSearchStudents } from './student.controller';

// General rate limit for student admin endpoints
const studentRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const router = Router();

// All student admin routes require authentication and ADMIN or FACULTY role
router.use(studentRateLimiter, verifySession, requireRole(['ADMIN', 'FACULTY']));

router.post('/search', handleSearchStudents);

export default router;
