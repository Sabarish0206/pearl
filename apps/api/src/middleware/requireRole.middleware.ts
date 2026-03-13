import { Request, Response, NextFunction } from 'express';
import type { JwtPayload } from '../modules/auth/auth.service';

type AllowedRole = JwtPayload['role'];

export const requireRole =
  (allowedRoles: AllowedRole[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource',
      });
      return;
    }

    next();
  };
