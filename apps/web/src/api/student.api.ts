import { env } from '../config/env';

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

export interface StudentProfileData {
  id: string;
  firstName: string;
  lastName: string;
  registerNumber: string;
  department: string;
  batchYear: number;
  cgpa: number | null;
  activeArrears: number | null;
  historyOfArrears: number | null;
  tenthMark: number | null;
  twelfthMark: number | null;
  email: string;
  atsScore: number | null;
  isVerified: boolean;
  skills: string[];
}

export const fetchStudentProfile = async (): Promise<StudentProfileData | null> => {
  try {
    const res = await fetchWithCredentials<{ success: boolean; data: StudentProfileData }>(
      '/api/student/profile'
    );
    return res.data;
  } catch {
    return null;
  }
};
