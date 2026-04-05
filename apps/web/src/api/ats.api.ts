import { env } from '../config/env';
import type {
  ApplicationStatus,
  JobApplicationsResponse,
  UpdatedApplicationRecord,
} from '@pearl/common';

const API_BASE = env.VITE_API_URL;

export const getJobApplications = async (
  jobId: string,
  status?: ApplicationStatus,
): Promise<JobApplicationsResponse> => {
  const url = new URL(`${API_BASE}/api/admin/jobs/${jobId}/applications`);
  if (status) {
    url.searchParams.set('status', status);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
  });

  const data = (await response.json()) as {
    success: boolean;
    data?: JobApplicationsResponse;
    message?: string;
  };

  if (!response.ok) {
    throw new Error(data.message ?? 'Failed to fetch job applications');
  }

  if (!data.data) {
    throw new Error('Invalid response format from server');
  }

  return data.data;
};

export const updateApplicationStatus = async (
  applicationId: string,
  status: ApplicationStatus,
): Promise<UpdatedApplicationRecord> => {
  const response = await fetch(
    `${API_BASE}/api/admin/applications/${applicationId}/status`,
    {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    },
  );

  const data = (await response.json()) as {
    success: boolean;
    data?: UpdatedApplicationRecord;
    message?: string;
  };

  if (!response.ok) {
    throw new Error(data.message ?? 'Failed to update application status');
  }

  if (!data.data) {
    throw new Error('Invalid response format from server');
  }

  return data.data;
};

export const exportJobApplications = async (
  jobId: string,
  companyName: string,
): Promise<void> => {
  const response = await fetch(
    `${API_BASE}/api/admin/jobs/${jobId}/export`,
    {
      method: 'GET',
      credentials: 'include',
    },
  );

  if (!response.ok) {
    let message = 'Failed to export applications';
    try {
      const errData = (await response.json()) as { message?: string };
      message = errData.message ?? message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = `drive_${companyName.replace(/[^a-z0-9]/gi, '_')}_ALL.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(downloadUrl);
};
