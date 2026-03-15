import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { Router } from 'express';
import multer from 'multer';
import rateLimit from 'express-rate-limit';
import { verifySession } from '../../middleware/verifySession.middleware';
import { requireRole } from '../../middleware/requireRole.middleware';
import { handleGetResume, handleParseResume, handleCommitResume } from './resume.controller';

const UPLOAD_DIR = path.resolve('uploads/resumes');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    cb(null, `resume-${randomUUID()}${path.extname(file.originalname)}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
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

// General rate limit for resume endpoints
const resumeRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const router = Router();

// All resume routes require authentication and STUDENT role
router.use(resumeRateLimiter, verifySession, requireRole(['STUDENT']));

router.get('/', handleGetResume);
router.post('/parse', parseRateLimiter, upload.single('resume'), handleParseResume);
router.put('/commit', handleCommitResume);

export default router;
