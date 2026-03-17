import { env } from '../config/env';
import type { CreateJobInput, JobRequirementRow, ShortlistedCandidate } from '@pearl/common';

const API_BASE = env.VITE_API_URL;

const fetchWithCredentials = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = (await response.json()) as T;
  if (!response.ok) {
    const errorData = data as { message?: string };
    throw new Error(errorData.message ?? 'An unexpected error occurred');
  }
  return data;
};

export const fetchJobs = async (): Promise<JobRequirementRow[]> => {
  const res = await fetchWithCredentials<{ success: boolean; data: JobRequirementRow[] }>('/api/placement');
  return res.data;
};

export const fetchJob = async (id: string): Promise<JobRequirementRow> => {
  const res = await fetchWithCredentials<{ success: boolean; data: JobRequirementRow }>(`/api/placement/${id}`);
  return res.data;
};

export const createJobReq = async (input: CreateJobInput): Promise<JobRequirementRow> => {
  const res = await fetchWithCredentials<{ success: boolean; data: JobRequirementRow }>('/api/placement', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return res.data;
};

export const updateJobReq = async (id: string, input: Partial<CreateJobInput>): Promise<JobRequirementRow> => {
  const res = await fetchWithCredentials<{ success: boolean; data: JobRequirementRow }>(`/api/placement/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  return res.data;
};

export const deleteJobReq = async (id: string): Promise<void> => {
  await fetchWithCredentials<{ success: boolean }>(`/api/placement/${id}`, { method: 'DELETE' });
};

export const fetchShortlist = async (jobId: string): Promise<ShortlistedCandidate[]> => {
  const res = await fetchWithCredentials<{ success: boolean; data: ShortlistedCandidate[] }>(
    `/api/placement/${jobId}/shortlist`
  );
  return res.data;
};
