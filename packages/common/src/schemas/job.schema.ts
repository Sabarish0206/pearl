import { z } from "zod";

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
  companyName: string;
  jobRole: string;
  ctc: string | null;
  minCgpa: number;
  maxActiveArrears: number;
  maxHistoryOfArrears: number;
  allowedDepartments: string[];
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  parsedData: ParsedJobData | null;
  createdAt: string;
  updatedAt: string;
}

export interface ParseJobResponse {
  job_id: string;
  parsed_data: ParsedJobData;
}
