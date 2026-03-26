import { notificationTypes } from '@oficios/domain';
import { z } from 'zod';

import { idSchema, paginatedResponseSchema, paginationQuerySchema } from './common';

export const notificationSchema = z.object({
  id: idSchema,
  userId: idSchema,
  type: z.enum(notificationTypes),
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(500),
  isRead: z.boolean(),
  createdAt: z.string().datetime(),
});

export const notificationsQuerySchema = paginationQuerySchema;
export const notificationsResponseSchema = paginatedResponseSchema(notificationSchema);

