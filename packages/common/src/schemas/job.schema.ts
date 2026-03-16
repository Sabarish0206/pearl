import { z } from "zod";

export const CreateJobSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  companyName: z.string().min(1, "Company name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  requiredSkills: z.array(z.string().min(1)).min(1, "At least one skill is required"),
  minCgpa: z.number().min(0).max(10).nullable().optional(),
  maxArrears: z.number().int().min(0).nullable().optional(),
  eligibleDepts: z.array(z.string().min(1)).min(1, "At least one department is required"),
  minExperienceYr: z.number().int().min(0).default(0),
  salaryLpa: z.number().min(0).nullable().optional(),
  deadline: z.string().datetime().nullable().optional(),
  isActive: z.boolean().default(true),
});

export type CreateJobInput = z.infer<typeof CreateJobSchema>;

export interface JobRequirementRow {
  id: string;
  title: string;
  companyName: string;
  description: string;
  requiredSkills: string[];
  minCgpa: number | null;
  maxArrears: number | null;
  eligibleDepts: string[];
  minExperienceYr: number;
  salaryLpa: number | null;
  deadline: string | null;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShortlistedCandidate {
  studentId: string;
  userId: string;
  firstName: string;
  lastName: string;
  registerNumber: string;
  department: string;
  batchYear: number;
  email: string;
  cgpa: number | null;
  activeArrears: number | null;
  atsScore: number | null;
  skills: string[];
  matchedSkills: string[];
  skillMatchPct: number;
  compositeScore: number;
  rank: number;
}

export interface PlacementAnalytics {
  totalStudents: number;
  studentsWithResume: number;
  studentsVerified: number;
  averageAtsScore: number;
  departmentBreakdown: { department: string; count: number; avgAts: number }[];
  skillDistribution: { skill: string; count: number }[];
  cgpaDistribution: { range: string; count: number }[];
}
