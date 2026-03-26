import { z } from 'zod';

import { idSchema, paginatedResponseSchema, paginationQuerySchema } from './common';

export const categorySchema = z.object({
  id: idSchema,
  slug: z.string().min(1).max(120),
  name: z.string().min(1).max(120),
  description: z.string().max(255).nullable(),
  isActive: z.boolean(),
  icon: z.string().max(255).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const upsertCategorySchema = z.object({
  slug: z.string().trim().min(2).max(120),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(255).optional(),
  icon: z.string().trim().max(255).optional(),
  isActive: z.boolean().default(true),
});

export const categoriesQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().max(120).optional(),
  isActive: z.coerce.boolean().optional(),
});

export const categoriesResponseSchema = paginatedResponseSchema(categorySchema);

