import { env } from '../config/env';
import type { SignupInput, LoginInput, AuthUser, AuthResponse } from '@pearl/common';

const API_BASE = env.VITE_API_URL;

const fetchWithCredentials = async <T>(
  path: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = (await response.json()) as T;

  if (!response.ok) {
    const errorData = data as { message?: string };
    throw new Error(errorData.message ?? 'An unexpected error occurred');
  }

  return data;
};

export const signupUser = async (input: SignupInput): Promise<AuthResponse> => {
  return fetchWithCredentials<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(input),
  });
};

export const loginUser = async (input: LoginInput): Promise<AuthResponse> => {
  return fetchWithCredentials<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
};

export const fetchCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const data = await fetchWithCredentials<AuthResponse>('/api/auth/me');
    return data.user ?? null;
  } catch {
    return null;
  }
};

export const logoutUser = async (): Promise<void> => {
  await fetchWithCredentials<AuthResponse>('/api/auth/logout', {
    method: 'POST',
  });
};
