import { Router } from 'express';
import multer from 'multer';
import { uploadAndParseResume, streamResume } from './resume.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Webapp upload: single URL that uploads to S3 and notifies AI.
// Use .any() so we don't care what the field name is (avoids Multer "Unexpected field").
router.post('/', upload.any(), uploadAndParseResume);

// Backwards-compatible alias: /api/resume/upload
router.post('/upload', upload.any(), uploadAndParseResume);

// Common URL for AI / consumers to read the resume
router.get('/:file', streamResume);

export default router;
