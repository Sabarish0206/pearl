import { env } from '../config/env';
import type { EligibleJobsResponse } from '@pearl/common';

const API_BASE = env.VITE_API_URL;

export const getEligibleJobs = async (): Promise<EligibleJobsResponse> => {
  const response = await fetch(`${API_BASE}/api/student/jobs/eligible`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = (await response.json()) as {
    success: boolean;
    data?: EligibleJobsResponse;
    message?: string;
  };

  if (!response.ok) {
    throw new Error(data.message ?? 'Failed to fetch eligible jobs');
  }

  if (!data.data) {
    throw new Error('Invalid response format from server');
  }

  return data.data;
};
