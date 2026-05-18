import { z } from "zod";

// --- Job Status ---

export const JobStatusSchema = z.enum(["DRAFT", "ACTIVE", "CLOSED", "COMPLETED", "CANCELLED"]);
export type JobStatus = z.infer<typeof JobStatusSchema>;

// --- Parsed Job Data returned by Gemini ---

export const UnstructuredJobDataSchema = z.object({
  responsibilities: z.array(z.string()),
  perks: z.array(z.string()),
});

export const ParsedJobDataSchema = z.object({
  companyName: z.string(),
  jobRole: z.string(),
  ctc: z.string().nullable(),
  minCgpa: z.number().default(0),
  maxActiveArrears: z.number().int().default(0),
  maxHistoryOfArrears: z.number().int().default(99),
  allowedDepartments: z.array(z.string()),
  requiredSkills: z.array(z.string()),
  unstructuredData: UnstructuredJobDataSchema,
});

export type ParsedJobData = z.infer<typeof ParsedJobDataSchema>;

// --- TypeScript interfaces for frontend ---

export interface JobRow {
  id: string;
  createdById: string;
  companyName: string;
  jobRole: string;
  ctc: string | null;
  description: string;
  minCgpa: number | null;
  maxActiveArrears: number | null;
  maxHistoryOfArrears: number | null;
  allowedDepartments: string[];
  status: JobStatus;
  parsedData: ParsedJobData | null;
  createdAt: string;
  updatedAt: string;
}

export interface ParseJobResponse {
  job_id: string;
  parsed_data: ParsedJobData;
}

// --- Jobs list (GET /api/admin/jobs) ---

export interface JobListItem {
  id: string;
  companyName: string;
  jobRole: string;
  ctc: string | null;
  status: JobStatus;
  allowedDepartments: string[];
  applicationCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobsListResponse {
  jobs: JobListItem[];
}

// --- Eligible Jobs (GET /api/student/jobs/eligible) ---

export interface EligibleJobApplication {
  id: string;
  status: 'APPLIED' | 'SHORTLISTED' | 'OFFERED' | 'REJECTED';
}

export interface EligibleJob {
  id: string;
  companyName: string;
  jobRole: string;
  ctc: string | null;
  applicationDeadline: string | null;
  allowedDepartments: string[];
  requiredSkills: string[];
  parsedData: ParsedJobData | null;
  applications: EligibleJobApplication[];
}

export interface EligibleJobsResponse {
  isPlaced: boolean;
  jobs: EligibleJob[];
}
