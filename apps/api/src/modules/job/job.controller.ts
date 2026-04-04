import fs from 'fs/promises';
import path from 'path';
import { Request, Response } from 'express';
import { logger } from '../../services/logger.service';
import * as JobService from './job.service';

const UPLOAD_DIR = path.resolve('uploads/jds');

const safeDeleteFile = async (filePath: string) => {
  try {
    await fs.unlink(filePath);
  } catch (unlinkErr) {
    logger.error('Failed to delete uploaded JD file', unlinkErr);
  }
};

export const handleParseJob = async (req: Request, res: Response): Promise<void> => {
  const rawText = typeof req.body?.rawText === 'string' ? (req.body.rawText as string).trim() : '';
  const createdById = req.user!.id;

  if (!req.file && !rawText) {
    res.status(400).json({
      success: false,
      message: 'Please upload a PDF file or provide the job description text.',
    });
    return;
  }

  let input: { base64Data: string; description: string } | { rawText: string };

  if (req.file) {
    // Validate path is within the expected upload directory before reading
    const resolvedPath = path.resolve(req.file.path);
    const relPath = path.relative(UPLOAD_DIR, resolvedPath);
    if (relPath.startsWith('..') || path.isAbsolute(relPath)) {
      res.status(400).json({ success: false, message: 'Invalid file path.' });
      return;
    }

    let base64Data: string;
    try {
      const fileBuffer = await fs.readFile(resolvedPath);
      base64Data = fileBuffer.toString('base64');
    } catch (readErr) {
      logger.error('Failed to read uploaded JD file', readErr);
      res.status(500).json({ success: false, message: 'Failed to read uploaded file. Please try again.' });
      return;
    } finally {
      await safeDeleteFile(resolvedPath);
    }

    // Use the original filename as description placeholder for PDF uploads
    input = { base64Data, description: req.file.originalname };
  } else {
    input = { rawText };
  }

  const result = await JobService.parseAndDraftJob(input, createdById);
  res.status(200).json({ success: true, ...result });
};
