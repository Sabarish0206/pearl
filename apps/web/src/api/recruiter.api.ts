import { env } from '../config/env';
import type { PlacementAnalytics } from '@pearl/common';

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

export interface StudentListItem {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  registerNumber: string;
  department: string;
  batchYear: number;
  cgpa: number | null;
  activeArrears: number | null;
  atsScore: number | null;
  isVerified: boolean;
  skills: string[];
}

export const fetchAnalytics = async (): Promise<PlacementAnalytics> => {
  const res = await fetchWithCredentials<{ success: boolean; data: PlacementAnalytics }>('/api/recruiter/analytics');
  return res.data;
};

export const fetchStudents = async (): Promise<StudentListItem[]> => {
  const res = await fetchWithCredentials<{ success: boolean; data: StudentListItem[] }>('/api/recruiter/students');
  return res.data;
};
