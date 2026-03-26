import { userRoles } from '@oficios/domain';
import { z } from 'zod';

import { emailSchema, idSchema, phoneSchema } from './common';

export const userSchema = z.object({
  id: idSchema,
  email: emailSchema,
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  phone: phoneSchema.nullable(),
  avatarUrl: z.string().url().nullable(),
  roles: z.array(z.enum(userRoles)),
  emailVerifiedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const updateMeSchema = z.object({
  firstName: z.string().trim().min(2).max(80).optional(),
  lastName: z.string().trim().min(2).max(80).optional(),
  phone: phoneSchema.optional(),
  avatarUrl: z.string().url().optional(),
});

