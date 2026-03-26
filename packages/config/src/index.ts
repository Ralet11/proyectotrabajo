import { z } from 'zod';

export const apiEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  APPLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
  GOOGLE_MAPS_API_KEY: z.string().min(1).optional(),
  FCM_PROJECT_ID: z.string().min(1).optional(),
  POSTHOG_KEY: z.string().min(1).optional(),
  SENTRY_DSN: z.string().min(1).optional(),
});

export const adminEnvSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_POSTHOG_KEY: z.string().optional(),
  VITE_SENTRY_DSN: z.string().optional(),
});

export const mobileEnvSchema = z.object({
  EXPO_PUBLIC_API_URL: z.string().url(),
  EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
  EXPO_PUBLIC_POSTHOG_KEY: z.string().optional(),
  EXPO_PUBLIC_SENTRY_DSN: z.string().optional(),
});

export const workerEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  REDIS_URL: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  RESEND_API_KEY: z.string().optional(),
  FCM_PROJECT_ID: z.string().optional(),
  POSTHOG_KEY: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
});

export const parseEnv = <T extends z.ZodTypeAny>(schema: T, env: unknown): z.infer<T> => {
  return schema.parse(env);
};

