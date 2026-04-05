import { z } from 'zod';

// --- Application Status ---

export const ApplicationStatusSchema = z.enum(['APPLIED', 'SHORTLISTED', 'OFFERED', 'REJECTED']);
export type ApplicationStatus = z.infer<typeof ApplicationStatusSchema>;

// --- Application Student Info ---

export interface ApplicationStudent {
  id: string;
  name: string;
  registerNumber: string;
  department: string;
  cgpa: number | null;
  isPlaced: boolean;
  skills: string[];
}

// --- Application Record ---

export interface ApplicationRecord {
  id: string;
  status: ApplicationStatus;
  appliedAt: string;
  student: ApplicationStudent;
}

// --- Job info embedded in applications response ---

export interface ApplicationsJobInfo {
  id: string;
  companyName: string;
  jobRole: string;
}

// --- Full response from GET /api/admin/jobs/:id/applications ---

export interface JobApplicationsResponse {
  job: ApplicationsJobInfo;
  applications: ApplicationRecord[];
}

// --- Response from PATCH /api/admin/applications/:applicationId/status ---

export interface UpdatedApplicationRecord {
  id: string;
  studentId: string;
  jobId: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}
