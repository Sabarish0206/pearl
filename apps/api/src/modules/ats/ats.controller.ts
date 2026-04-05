import { Request, Response } from 'express';
import * as AtsService from './ats.service';

export const handleGetJobApplications = async (req: Request, res: Response): Promise<void> => {
  const jobId = req.params['id'] as string;
  const status = typeof req.query['status'] === 'string' ? req.query['status'].trim() : undefined;

  const data = await AtsService.getJobApplications(jobId, status);
  res.status(200).json({ success: true, data });
};

export const handleUpdateApplicationStatus = async (req: Request, res: Response): Promise<void> => {
  const applicationId = req.params['applicationId'] as string;
  const newStatus = req.body?.status;

  if (typeof newStatus !== 'string' || !newStatus.trim()) {
    res.status(400).json({ success: false, message: 'The status field is required.' });
    return;
  }

  const application = await AtsService.updateApplicationStatus(applicationId, newStatus.trim());
  res.status(200).json({ success: true, data: application });
};

export const handleExportJobApplications = async (req: Request, res: Response): Promise<void> => {
  const jobId = req.params['id'] as string;
  const status = typeof req.query['status'] === 'string' ? req.query['status'].trim() : undefined;

  const { companyName, status: resolvedStatus, csvString } = await AtsService.exportJobApplications(jobId, status);

  const filename = `drive_${companyName.replace(/[^a-z0-9]/gi, '_')}_${resolvedStatus}.csv`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csvString);
};
