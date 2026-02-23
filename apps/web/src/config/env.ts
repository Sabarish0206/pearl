import { webEnvSchema } from '@pearl/config';

const parsed = webEnvSchema.safeParse({
  VITE_API_URL: import.meta.env.VITE_API_URL,
});

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;
