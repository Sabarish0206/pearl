import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { verifySession } from '../middleware/verifySession.middleware';
import { requireRole } from '../middleware/requireRole.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import { CreateJobSchema } from '@pearl/common';
import {
  createJob,
  listJobs,
  getJob,
  updateJob,
  deleteJob,
  getShortlist,
  getAnalytics,
  listStudents,
} from './jobs.service';

const router = Router();

const rateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// All routes require auth + FACULTY or ADMIN role
router.use(rateLimiter, verifySession, requireRole(['FACULTY', 'ADMIN']));

// Analytics
router.get('/analytics', asyncHandler(async (_req, res) => {
  const data = await getAnalytics();
  res.json({ success: true, data });
}));

// Students list
router.get('/students', asyncHandler(async (_req, res) => {
  const data = await listStudents();
  res.json({ success: true, data });
}));

// Job CRUD
router.get('/', asyncHandler(async (_req, res) => {
  const jobs = await listJobs();
  res.json({ success: true, data: jobs });
}));

router.post('/', asyncHandler(async (req, res) => {
  const parsed = CreateJobSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.flatten().fieldErrors });
    return;
  }
  const job = await createJob(parsed.data, req.user!.id);
  res.status(201).json({ success: true, data: job });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const job = await getJob(req.params['id'] as string);
  res.json({ success: true, data: job });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const parsed = CreateJobSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.flatten().fieldErrors });
    return;
  }
  const job = await updateJob(req.params['id'] as string, parsed.data);
  res.json({ success: true, data: job });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await deleteJob(req.params['id'] as string);
  res.json({ success: true, message: 'Job deleted' });
}));

// Shortlist
router.get('/:id/shortlist', asyncHandler(async (req, res) => {
  const candidates = await getShortlist(req.params['id'] as string);
  res.json({ success: true, data: candidates });
}));

export default router;
