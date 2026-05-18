import { env } from '../config/env';
import {
  StudentProfileDataSchema,
  AdminProfileDataSchema,
  type StudentProfileData,
  type AdminProfileData,
} from '@pearl/common';

const API_BASE = env.VITE_API_URL;

interface ProfileApiResponse {
  success: boolean;
  data?: unknown;
  message?: string;
}

const fetchProfileData = async (
  path: string,
): Promise<ProfileApiResponse> => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });

  const payload = (await response.json()) as ProfileApiResponse;

  if (!response.ok) {
    throw new Error(payload.message ?? 'Failed to fetch profile');
  }

  if (!payload.data) {
    throw new Error('Invalid response format from server');
  }

  return payload;
};

export const getStudentProfile = async (): Promise<StudentProfileData> => {
  const payload = await fetchProfileData('/api/student/profile');
  return StudentProfileDataSchema.parse(payload.data);
};

export const getAdminProfile = async (): Promise<AdminProfileData> => {
  const payload = await fetchProfileData('/api/admin/profile');
  return AdminProfileDataSchema.parse(payload.data);
};
