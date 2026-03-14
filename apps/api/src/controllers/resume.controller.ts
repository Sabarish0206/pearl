import type { Request, Response } from 'express';
import crypto from 'crypto';
import path from 'path';
import mime from 'mime-types';
import { uploadToS3, getFromS3 } from '../services/s3.service';
import { sendResumeToAI, type ParsedResume } from '../services/ai.service';
import { env } from '../config/env';

// POST /api/resume
export async function uploadAndParseResume(req: Request, res: Response): Promise<void> {
  try {
    const files = (req as any).files as Express.Multer.File[] | undefined;
    const file = files && files.length > 0 ? files[0] : undefined;
    if (!file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const id = crypto.randomBytes(16).toString('hex');
    const key = `resumes/${id}${ext}`;
    const mimeType: string = mime.lookup(file.originalname) || 'application/octet-stream';

    await uploadToS3(key, file.buffer, mimeType);

    const publicBaseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${env.PORT}`;
    const resumeUrl = `${publicBaseUrl}/api/resume/${id}${ext}`;

    const aiResult: ParsedResume | null = await sendResumeToAI(file.buffer, mimeType).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('AI parsing error (non-fatal):', err);
      return null;
    });

    res.status(201).json({
      id,
      fileUrl: resumeUrl,
      aiResult,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('uploadAndParseResume error:', error);
    res.status(500).json({ error: 'Upload or AI parsing failed.' });
  }
}

// GET /api/resume/:file
export async function streamResume(req: Request, res: Response): Promise<void> {
  try {
    const { file } = req.params; // e.g. <id>.pdf
    const key = `resumes/${file}`;
    const mimeType: string = mime.lookup(file) || 'application/octet-stream';

    const bodyStream = await getFromS3(key);

    res.setHeader('Content-Type', mimeType);
    bodyStream.pipe(res);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('streamResume error:', error);
    res.status(404).json({ error: 'File not found.' });
  }
}
