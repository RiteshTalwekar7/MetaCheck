import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(process.env.PORT),
  MONGODB_URI: z.string().default(process.env.MONGODB_URI),
  JWT_SECRET: z.string().default(process.env.JWT_SECRET),
  JWT_EXPIRES_IN: z.string().default(process.env.JWT_EXPIRES_IN),
  AI_PROVIDER: z.enum(['mock', 'gemini']).default('mock'),
  GEMINI_API_KEY: z.string().optional().default(process.env.GEMINI_API_KEY),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  MAX_UPLOAD_MB: z.coerce.number().default(process.env.MAX_UPLOAD_MB),
  RULESET_VERSION: z.string().default('PCR-INDIA-2026-08-v1'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
export default env;

