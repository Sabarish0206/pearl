import { Router } from 'express';
import multer from 'multer';
import { uploadAndParseResume, streamResume } from '../controllers/resume.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Webapp upload: single URL that uploads to S3 and notifies AI.
// Use .any() so the field name from frontend/Postman does not matter.
router.post('/', upload.any(), uploadAndParseResume);

// Backwards-compatible alias: /api/resume/upload
router.post('/upload', upload.any(), uploadAndParseResume);

// Common URL for AI / consumers to read the resume
router.get('/:file', streamResume);

export default router;
