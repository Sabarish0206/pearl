import { env } from '../config/env';

const API_BASE = env.VITE_API_URL;

export interface StudentSearchPayload {
  skills?: string[];
  minCgpa?: number;
  maxActiveArrears?: number;
  departments?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'cgpa' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface StudentRecord {
  id: string;
  firstName: string;
  lastName: string;
  registerNumber: string;
  department: string;
  cgpa: number | null;
  activeArrears: number | null;
  isPlaced: boolean;
  skills: string[];
}

export interface StudentSearchResponse {
  students: StudentRecord[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const searchStudents = async (
  payload: StudentSearchPayload,
): Promise<StudentSearchResponse> => {
  const response = await fetch(`${API_BASE}/api/admin/students/search`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as {
    success: boolean;
    data?: StudentSearchResponse;
    message?: string;
  };

  if (!response.ok) {
    throw new Error(data.message ?? 'Failed to search students');
  }

  if (!data.data) {
    throw new Error('Invalid response format from server');
  }

  return data.data;
};

export const exportStudents = async (payload: StudentSearchPayload): Promise<Blob> => {
  const response = await fetch(`${API_BASE}/api/admin/students/export`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorMessage = 'Failed to export students';
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // If parsing json fails, just use default message
    }
    throw new Error(errorMessage);
  }

  return response.blob();
};
