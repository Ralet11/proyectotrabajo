import { professionalStatuses, reviewStatuses } from '@oficios/domain';
import { z } from 'zod';

import { idSchema, paginationQuerySchema } from './common';

export const adminProfessionalsQuerySchema = paginationQuerySchema.extend({
  status: z.enum(professionalStatuses).optional(),
  search: z.string().trim().max(120).optional(),
});

export const adminUsersQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().max(120).optional(),
  role: z.string().trim().max(20).optional(),
});

export const adminReviewsQuerySchema = paginationQuerySchema.extend({
  status: z.enum(reviewStatuses).optional(),
});

export const adminDecisionSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export const markNotificationReadSchema = z.object({
  id: idSchema,
});

