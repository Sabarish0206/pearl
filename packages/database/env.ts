import { dbEnvSchema } from '@pearl/config';

const parsed = dbEnvSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment variables: ${JSON.stringify(parsed.error.format())}`);
}

export const env = parsed.data;
