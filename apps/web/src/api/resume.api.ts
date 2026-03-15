import { env } from '../config/env';
import type { GetResumeResponse, ParseResumeResponse, CommitResumeInput } from '@pearl/common';

const API_BASE = env.VITE_API_URL;

const fetchWithCredentials = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
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

export const fetchResume = async (): Promise<GetResumeResponse & { success: boolean }> => {
  return fetchWithCredentials<GetResumeResponse & { success: boolean }>('/api/student/resume');
};

export const parseResume = async (file: File): Promise<ParseResumeResponse & { success: boolean }> => {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await fetch(`${API_BASE}/api/student/resume/parse`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const data = (await response.json()) as ParseResumeResponse & { success: boolean; message?: string };

  if (!response.ok) {
    throw new Error(data.message ?? 'Failed to parse resume');
  }

  return data;
};

export const commitResume = async (payload: CommitResumeInput): Promise<void> => {
  await fetchWithCredentials<{ success: boolean }>('/api/student/resume/commit', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};
