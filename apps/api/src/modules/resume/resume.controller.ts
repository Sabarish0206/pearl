import { Request, Response } from 'express';
import { CommitResumeSchema } from '@pearl/common';
import * as ResumeService from './resume.service';

export const handleGetResume = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const result = await ResumeService.getStudentResume(userId);
  res.status(200).json({ success: true, ...result });
};

export const handleParseResume = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ success: false, message: 'No PDF file uploaded' });
    return;
  }

  const userId = req.user!.id;
  const result = await ResumeService.parseAndDraftResume(userId, req.file.path);
  res.status(200).json({ success: true, ...result });
};

export const handleCommitResume = async (req: Request, res: Response): Promise<void> => {
  const parsed = CommitResumeSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const userId = req.user!.id;
  await ResumeService.commitResume(userId, parsed.data);
  res.status(200).json({ success: true, message: 'Resume verified and saved successfully' });
};
