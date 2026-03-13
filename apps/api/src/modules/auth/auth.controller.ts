import { Request, Response } from 'express';
import { SignupSchema, LoginSchema } from '@pearl/common';
import * as AuthService from './auth.service';
import { env } from '../../config/env';

const AUTH_COOKIE_NAME = 'auth_token';

const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
});

export const handleSignup = async (req: Request, res: Response): Promise<void> => {
  const parsed = SignupSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const user = await AuthService.signupUser(parsed.data);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    user,
  });
};

export const handleLogin = async (req: Request, res: Response): Promise<void> => {
  const parsed = LoginSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { user, token } = await AuthService.loginUser(parsed.data);

  res.cookie(AUTH_COOKIE_NAME, token, getCookieOptions());

  res.status(200).json({
    success: true,
    message: 'Login successful',
    user,
  });
};

export const handleGetMe = async (req: Request, res: Response): Promise<void> => {
  const jwtPayload = req.user;

  if (!jwtPayload) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const user = await AuthService.getCurrentUser(jwtPayload.id);

  res.status(200).json({
    success: true,
    user,
  });
};

export const handleLogout = (_req: Request, res: Response): void => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};
