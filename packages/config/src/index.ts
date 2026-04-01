import { z } from 'zod';

const optionalString = () =>
  z.preprocess((value) => {
    if (typeof value === 'string' && value.trim() === '') {
      return undefined;
    }

    return value;
  }, z.string().min(1).optional());

export const apiEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  APPLE_CLIENT_ID: optionalString(),
  GOOGLE_CLIENT_ID: optionalString(),
  RESEND_API_KEY: optionalString(),
  CLOUDINARY_CLOUD_NAME: optionalString(),
  CLOUDINARY_API_KEY: optionalString(),
  CLOUDINARY_API_SECRET: optionalString(),
  GOOGLE_MAPS_API_KEY: optionalString(),
  FCM_PROJECT_ID: optionalString(),
  POSTHOG_KEY: optionalString(),
  SENTRY_DSN: optionalString(),
});

export const adminEnvSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_POSTHOG_KEY: optionalString(),
  VITE_SENTRY_DSN: optionalString(),
});

export const mobileEnvSchema = z.object({
  EXPO_PUBLIC_API_URL: z.string().url(),
  EXPO_PUBLIC_GOOGLE_MAPS_API_KEY: optionalString(),
  EXPO_PUBLIC_POSTHOG_KEY: optionalString(),
  EXPO_PUBLIC_SENTRY_DSN: optionalString(),
});

export const workerEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  REDIS_URL: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  RESEND_API_KEY: optionalString(),
  FCM_PROJECT_ID: optionalString(),
  POSTHOG_KEY: optionalString(),
  SENTRY_DSN: optionalString(),
});

export const parseEnv = <T extends z.ZodTypeAny>(schema: T, env: unknown): z.infer<T> => {
  return schema.parse(env);
};

