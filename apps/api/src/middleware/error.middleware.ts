import { Request, Response, NextFunction } from 'express';
import { logger } from '../services/logger.service.js';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

    logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, err.stack);
    const statusCode = err.status || 500;
    res.status(statusCode).json({
        success: false,
        error: err.name || 'InternalServerError',
        message: err.message || 'Something went wrong on our end',
    });
};