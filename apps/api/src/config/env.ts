import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { apiEnvSchema } from '@pearl/config';

// 1. Try to load from the monorepo root .env (for Local Development)
const rootEnvPath = path.resolve(process.cwd(), '../../.env');
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  // 2. Fallback to standard dotenv behavior (Current Directory .env)
  dotenv.config();
}

// 3. Validate the environment (Works natively with Docker/Vercel/Heroku injected variables)
const parsed = apiEnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
