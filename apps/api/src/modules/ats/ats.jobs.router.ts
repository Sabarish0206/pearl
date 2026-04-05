import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { verifySession } from '../../middleware/verifySession.middleware';
import { requireRole } from '../../middleware/requireRole.middleware';
import { handleGetJobApplications, handleExportJobApplications } from './ats.controller';

const atsJobsRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const router = Router();

router.use(atsJobsRateLimiter, verifySession, requireRole(['ADMIN', 'FACULTY']));

router.get('/:id/applications', handleGetJobApplications);
router.get('/:id/export', handleExportJobApplications);

export default router;
