import { preferredContactChannels, serviceRequestStatuses } from '@oficios/domain';
import { z } from 'zod';

import { idSchema, paginatedResponseSchema, paginationQuerySchema, placeReferenceSchema } from './common';

export const serviceRequestSchema = z.object({
  id: idSchema,
  customerId: idSchema,
  professionalId: idSchema,
  categoryId: idSchema,
  status: z.enum(serviceRequestStatuses),
  message: z.string().min(5).max(2000),
  place: placeReferenceSchema.nullable(),
  preferredContactChannel: z.enum(preferredContactChannels),
  contactUnlockedAt: z.string().datetime().nullable(),
  acceptedAt: z.string().datetime().nullable(),
  rejectedAt: z.string().datetime().nullable(),
  completedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createServiceRequestSchema = z.object({
  professionalId: idSchema,
  categoryId: idSchema,
  message: z.string().trim().min(5).max(2000),
  placeId: z.string().trim().max(255).optional(),
  addressText: z.string().trim().max(255).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  preferredContactChannel: z.enum(preferredContactChannels).default('WHATSAPP'),
});

export const listMyServiceRequestsQuerySchema = paginationQuerySchema.extend({
  as: z.enum(['customer', 'professional']).default('customer'),
  status: z.enum(serviceRequestStatuses).optional(),
});

export const serviceRequestMessageSchema = z.object({
  id: idSchema,
  serviceRequestId: idSchema,
  senderUserId: idSchema,
  body: z.string().min(1).max(2000),
  createdAt: z.string().datetime(),
});

export const createServiceRequestMessageSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

export const serviceRequestsResponseSchema = paginatedResponseSchema(serviceRequestSchema);

