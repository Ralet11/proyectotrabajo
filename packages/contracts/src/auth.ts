import { authProviders, userRoles } from '@oficios/domain';
import { z } from 'zod';

import { emailSchema, passwordSchema } from './common';

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(7).max(32).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  deviceName: z.string().trim().min(1).max(120).optional(),
});

export const socialLoginSchema = z.object({
  provider: z.enum(authProviders),
  idToken: z.string().min(1),
  deviceName: z.string().trim().min(1).max(120).optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: passwordSchema,
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export const authSessionSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.string().uuid(),
    email: emailSchema,
    firstName: z.string(),
    lastName: z.string(),
    roles: z.array(z.enum(userRoles)),
    emailVerifiedAt: z.string().datetime().nullable(),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SocialLoginInput = z.infer<typeof socialLoginSchema>;

