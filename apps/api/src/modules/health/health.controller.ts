import { Request, Response } from 'express';
import { prisma } from '@pearl/database';
import * as HealthService from './health.service';

export const handleHealthCheck = async (req: Request, res: Response) => {
  const status = HealthService.getHealthStatus();
  
  try {
    // Perform a very lightweight DB check
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      ...status,
      database: 'Connected'
    });
  } catch (error) {
    res.status(500).json({
      ...status,
      database: 'Disconnected',
      error: error instanceof Error ? error.message : 'Unknown database error'
    });
  }
};