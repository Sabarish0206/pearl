import { env } from '../config/env';
import type { ParseJobResponse, JobRow, JobListItem } from '@pearl/common';

const API_BASE = env.VITE_API_URL;

export const getAdminJobs = async (): Promise<JobListItem[]> => {
  const response = await fetch(`${API_BASE}/api/admin/jobs`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = (await response.json()) as { success: boolean; jobs: JobListItem[]; message?: string };

  if (!response.ok) {
    throw new Error(data.message ?? 'Failed to fetch jobs');
  }

  return data.jobs;
};

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

export const getJob = async (id: string): Promise<JobRow> => {
  const response = await fetch(`${API_BASE}/api/admin/jobs/${id}`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = (await response.json()) as { success: boolean; job: JobRow; message?: string };

  if (!response.ok) {
    throw new Error(data.message ?? 'Failed to fetch job');
  }

  return data.job;
};

export interface PublishJobPayload {
  companyName: string;
  jobRole: string;
  ctc: string | null;
  minCgpa: number;
  maxActiveArrears: number;
  maxHistoryOfArrears: number;
  allowedDepartments: string[];
  requiredSkills: string[];
  parsedData: unknown;
}

export const publishJob = async (id: string, payload: PublishJobPayload): Promise<JobRow> => {
  const response = await fetch(`${API_BASE}/api/admin/jobs/${id}/publish`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as { success: boolean; job: JobRow; message?: string };

  if (!response.ok) {
    throw new Error(data.message ?? 'Failed to publish job');
  }

  return data.job;
};
