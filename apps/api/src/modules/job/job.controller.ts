import { Request, Response } from 'express';
import * as JobService from './job.service';

export const handleParseJob = async (req: Request, res: Response): Promise<void> => {
  const rawText = typeof req.body?.rawText === 'string' ? (req.body.rawText as string).trim() : '';

  if (!req.file && !rawText) {
    res.status(400).json({
      success: false,
      message: 'Please upload a PDF file or provide the job description text.',
    });
    return;
  }

  const input = req.file ? { filePath: req.file.path } : { rawText };

  const result = await JobService.parseAndDraftJob(input);
  res.status(200).json({ success: true, ...result });
};
