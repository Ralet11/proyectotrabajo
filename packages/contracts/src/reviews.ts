import { reviewStatuses } from '@oficios/domain';
import { z } from 'zod';

import { idSchema, paginatedResponseSchema, paginationQuerySchema } from './common';

export const reviewSchema = z.object({
  id: idSchema,
  serviceRequestId: idSchema,
  customerId: idSchema,
  professionalId: idSchema,
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).nullable(),
  status: z.enum(reviewStatuses),
  createdAt: z.string().datetime(),
});

export const createReviewSchema = z.object({
  serviceRequestId: idSchema,
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

export const reviewsQuerySchema = paginationQuerySchema.extend({
  professionalId: idSchema.optional(),
  status: z.enum(reviewStatuses).optional(),
});

export const reviewsResponseSchema = paginatedResponseSchema(reviewSchema);

