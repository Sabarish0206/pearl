import { env } from '../config/env';
import type { ParseJobResponse } from '@pearl/common';

const API_BASE = env.VITE_API_URL;

export const parseJob = async (input: { file: File } | { rawText: string }): Promise<ParseJobResponse & { success: boolean }> => {
  let response: Response;

  if ('file' in input) {
    const formData = new FormData();
    formData.append('jd', input.file);

    response = await fetch(`${API_BASE}/api/admin/jobs/parse`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
  } else {
    response = await fetch(`${API_BASE}/api/admin/jobs/parse`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText: input.rawText }),
    });
  }

  const data = (await response.json()) as ParseJobResponse & { success: boolean; message?: string };

  if (!response.ok) {
    throw new Error(data.message ?? 'Failed to parse job description');
  }

  return data;
};
