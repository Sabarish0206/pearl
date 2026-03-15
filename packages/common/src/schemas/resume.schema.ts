import { z } from "zod";

// --- Parsed Data Sub-schemas ---

export const EducationSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  start_year: z.string(),
  end_year: z.string(),
  score: z.string(),
});

export const ProjectSchema = z.object({
  title: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
  link: z.string().nullable(),
});

export const CertificationSchema = z.object({
  name: z.string(),
  issuer: z.string(),
  date: z.string(),
});

export const ExperienceSchema = z.object({
  role: z.string(),
  company: z.string(),
  duration: z.string(),
  description: z.string(),
});

// --- Full Parsed Resume Data Schema (from Gemini) ---

export const ParsedResumeDataSchema = z.object({
  ats_score: z.number().int().min(0).max(100),
  cgpa: z.number().nullable(),
  active_arrears: z.number().int().nullable(),
  history_of_arrears: z.number().int().nullable(),
  tenth_mark: z.number().nullable(),
  twelfth_mark: z.number().nullable(),
  skills: z.array(z.string()),
  education: z.array(EducationSchema),
  projects: z.array(ProjectSchema),
  certifications: z.array(CertificationSchema),
  experience: z.array(ExperienceSchema),
  achievements: z.array(z.string()),
});

export type ParsedResumeData = z.infer<typeof ParsedResumeDataSchema>;

// --- Commit Payload Schema (Phase 2 input from client) ---

export const CommitResumeSchema = z.object({
  resume_id: z.string().uuid("Invalid resume ID"),
  cgpa: z.number().min(0).max(10).nullable(),
  active_arrears: z.number().int().min(0).nullable(),
  history_of_arrears: z.number().int().min(0).nullable(),
  tenth_mark: z.number().min(0).max(100).nullable(),
  twelfth_mark: z.number().min(0).max(100).nullable(),
  skills: z.array(z.string().min(1)),
  education: z.array(EducationSchema),
  projects: z.array(ProjectSchema),
  certifications: z.array(CertificationSchema),
  experience: z.array(ExperienceSchema),
  achievements: z.array(z.string()),
});

export type CommitResumeInput = z.infer<typeof CommitResumeSchema>;

// --- TypeScript interfaces for frontend ---

export interface ResumeRow {
  id: string;
  student_id: string;
  file_path: string;
  ats_score: number | null;
  parsed_data: ParsedResumeData | null;
  is_verified: boolean;
}

export interface GetResumeResponse {
  status: "NOT_UPLOADED" | "DRAFT" | "VERIFIED";
  data?: ResumeRow;
}

export interface ParseResumeResponse {
  resume_id: string;
  parsed_data: ParsedResumeData;
}
