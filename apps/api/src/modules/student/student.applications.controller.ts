import { Request, Response } from 'express';
import * as StudentApplicationsService from './student.applications.service';

export const handleApplyToJob = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const jobId = req.params['id'] as string;

  const { companyName } = await StudentApplicationsService.applyToJob(userId, jobId);
  res.status(201).json({ success: true, message: `Successfully applied to ${companyName}` });
};

export const handleGetApplicationHistory = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const data = await StudentApplicationsService.getApplicationHistory(userId);
  res.status(200).json({ success: true, data });
};
