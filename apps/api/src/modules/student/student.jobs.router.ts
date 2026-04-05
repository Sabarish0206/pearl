import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { verifySession } from '../../middleware/verifySession.middleware';
import { requireRole } from '../../middleware/requireRole.middleware';
import { handleGetEligibleJobs } from './student.jobs.controller';

const studentJobsRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const router = Router();

// All routes require authentication and STUDENT role
router.use(studentJobsRateLimiter, verifySession, requireRole(['STUDENT']));

router.get('/eligible', handleGetEligibleJobs);

export default router;
