import { Request, Response } from 'express';
import * as StudentJobsService from './student.jobs.service';

export const handleGetEligibleJobs = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const data = await StudentJobsService.getEligibleJobs(userId);
  res.status(200).json({ success: true, data });
};
