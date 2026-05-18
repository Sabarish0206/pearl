import { Request, Response } from 'express';
import * as AdminProfileService from './admin.profile.service';

export const handleGetAdminProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const data = await AdminProfileService.getAdminProfile(userId);
  res.status(200).json({ success: true, data });
};
