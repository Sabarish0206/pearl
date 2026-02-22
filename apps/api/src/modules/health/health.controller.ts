import { Request, Response } from 'express';
import * as HealthService from './health.service.js';

export const handleHealthCheck = (req: Request, res: Response) => {
  const status = HealthService.getHealthStatus();
  res.json(status);
};