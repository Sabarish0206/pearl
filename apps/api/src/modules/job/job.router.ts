import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { Router, Request, Response, NextFunction } from 'express';
import multer, { MulterError } from 'multer';
import rateLimit from 'express-rate-limit';
import { verifySession } from '../../middleware/verifySession.middleware';
import { requireRole } from '../../middleware/requireRole.middleware';
import { handleParseJob, handleGetJob, handlePublishJob } from './job.controller';
import { handleGetJobApplications, handleExportJobApplications } from '../ats/ats.controller';

const UPLOAD_DIR = path.resolve('uploads/jds');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    cb(null, `jd-${randomUUID()}${path.extname(file.originalname)}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    const err = new Error('Only PDF files are accepted. Please upload a valid PDF.') as Error & { status: number };
    err.status = 400;
    cb(err);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// Strict rate limit for AI parsing (expensive operation)
const parseRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many parse requests. Please try again later.' },
});

// General rate limit for job endpoints
const jobRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const router = Router();

// All job routes require a valid session and rate limiting
router.use(jobRateLimiter, verifySession);

// ADMIN and FACULTY job management routes
router.post('/parse', requireRole(['ADMIN', 'FACULTY']), parseRateLimiter, upload.single('jd'), handleParseJob);
router.get('/:id', requireRole(['ADMIN', 'FACULTY']), handleGetJob);
router.put('/:id/publish', requireRole(['ADMIN', 'FACULTY']), handlePublishJob);

// ATS (Applicant Tracking System) routes — ADMIN and FACULTY can access
router.get('/:id/applications', requireRole(['ADMIN', 'FACULTY']), handleGetJobApplications);
router.get('/:id/export', requireRole(['ADMIN', 'FACULTY']), handleExportJobApplications);

// Map multer-specific errors to proper HTTP status codes before the global error handler.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof MulterError) {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File too large. Maximum allowed size is 5 MB.'
        : `Upload error: ${err.message}`;
    res.status(status).json({ success: false, message });
    return;
  }
  _next(err);
});

export default router;
