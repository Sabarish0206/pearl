import { z } from "zod";

export const apiEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.string().transform((s) => parseInt(s, 10)).default("3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CORS_ORIGIN: z.string().url().default("http://localhost:5173"),
});

export const webEnvSchema = z.object({
  VITE_API_URL: z.string().url().default("http://localhost:3000"),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;
export type WebEnv = z.infer<typeof webEnvSchema>;
