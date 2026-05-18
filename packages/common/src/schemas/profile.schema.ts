import { z } from 'zod';

export const PlacementStatusSchema = z.enum(['PLACED', 'UNPLACED']);
export type PlacementStatus = z.infer<typeof PlacementStatusSchema>;

export const StudentProfileDataSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  registerNumber: z.string(),
  department: z.string(),
  batchYear: z.number().int(),
  cgpa: z.number().nullable(),
  activeArrears: z.number().int().nullable(),
  historyOfArrears: z.number().int().nullable(),
  tenthMark: z.number().nullable(),
  twelfthMark: z.number().nullable(),
  placementStatus: PlacementStatusSchema,
});

export type StudentProfileData = z.infer<typeof StudentProfileDataSchema>;

export const AdminProfileDataSchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  designation: z.string(),
  department: z.string(),
  jobsCreatedCount: z.number().int().nonnegative(),
});

export type AdminProfileData = z.infer<typeof AdminProfileDataSchema>;
