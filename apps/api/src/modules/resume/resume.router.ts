import path from 'path';
import fs from 'fs';
import { randomUUID } from 'crypto';
import { Router } from 'express';
import multer from 'multer';
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

const router = Router();

// All resume routes require authentication and STUDENT role
router.use(verifySession, requireRole(['STUDENT']));

router.get('/', handleGetResume);
router.post('/parse', upload.single('resume'), handleParseResume);
router.put('/commit', handleCommitResume);

export default router;
