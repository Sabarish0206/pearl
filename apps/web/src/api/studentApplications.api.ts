import { env } from '../config/env';
import type { StudentApplicationHistory } from '@pearl/common';

const API_BASE = env.VITE_API_URL;

export const getApplicationHistory = async (): Promise<StudentApplicationHistory[]> => {
  const response = await fetch(`${API_BASE}/api/student/applications`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = (await response.json()) as {
    success: boolean;
    data?: StudentApplicationHistory[];
    message?: string;
  };

  if (!response.ok) {
    throw new Error(data.message ?? 'Failed to fetch application history');
  }

  if (!data.data) {
    throw new Error('Invalid response format from server');
  }

  return data.data;
};
