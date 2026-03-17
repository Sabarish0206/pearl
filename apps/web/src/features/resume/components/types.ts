import type { ParsedResumeData } from '@pearl/common';

export type UIState = 'loading' | 'not_uploaded' | 'parsing' | 'draft' | 'saving' | 'verified';

export interface DraftFormData {
  resume_id: string;
  ats_score: number;
  cgpa: number | null;
  active_arrears: number | null;
  history_of_arrears: number | null;
  tenth_mark: number | null;
  twelfth_mark: number | null;
  skills: string[];
  education: ParsedResumeData['education'];
  projects: ParsedResumeData['projects'];
  certifications: ParsedResumeData['certifications'];
  experience: ParsedResumeData['experience'];
  achievements: string[];
}
