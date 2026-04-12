import { z } from "zod";

const COLLEGE_EMAIL_DOMAIN = "@psnacet.edu.in";

const emailSchema = z
  .string()
  .email("Invalid email address")
  .refine((email) => email.toLowerCase().endsWith(COLLEGE_EMAIL_DOMAIN), {
    message: `Email must be a college email ending with ${COLLEGE_EMAIL_DOMAIN}`,
  });

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters");

// --- Signup Schemas ---

const StudentSignupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: z.literal("STUDENT"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  registerNumber: z.string().min(1, "Register number is required"),
  department: z.string().min(1, "Department is required"),
  batchYear: z
    .number()
    .int()
    .min(2000, "Invalid batch year")
    .max(2100, "Invalid batch year"),
});

const FacultySignupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: z.literal("FACULTY"),
  fullName: z.string().min(1, "Full name is required"),
  designation: z.string().min(1, "Designation is required"),
  department: z.string().min(1, "Department is required"),
});

export const SignupSchema = z.discriminatedUnion("role", [
  StudentSignupSchema,
  FacultySignupSchema,
]);

export type SignupInput = z.infer<typeof SignupSchema>;
export type StudentSignupInput = z.infer<typeof StudentSignupSchema>;
export type FacultySignupInput = z.infer<typeof FacultySignupSchema>;

// --- Login Schema ---

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// --- Auth Response Schemas ---

export const AuthUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(["STUDENT", "FACULTY", "ADMIN"]),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;

export const AuthResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user: AuthUserSchema.optional(),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;
