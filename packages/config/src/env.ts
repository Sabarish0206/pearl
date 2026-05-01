import { z } from "zod";

export const apiEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.string().transform((s) => parseInt(s, 10)).default("3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CORS_ORIGIN: z.string().url().default("http://localhost:5173"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  GEMINI_API_KEY: z.string().optional(),
});

export const webEnvSchema = z.object({
  VITE_API_URL: z.string().url().default("http://localhost:3001"),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;
export type WebEnv = z.infer<typeof webEnvSchema>;
