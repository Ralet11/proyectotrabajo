import {
  preferredContactChannels,
  professionalSearchSorts,
  professionalStatuses,
} from '@oficios/domain';
import { z } from 'zod';

import { idSchema, paginatedResponseSchema, paginationQuerySchema, placeReferenceSchema } from './common';

export const serviceAreaSchema = z.object({
  id: idSchema,
  placeId: z.string().min(1).max(255),
  label: z.string().min(1).max(255),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radiusKm: z.number().min(1).max(500),
});

export const availabilitySchema = z.object({
  isAcceptingRequests: z.boolean().default(true),
  availableToday: z.boolean().default(false),
  summary: z.string().trim().max(255).optional(),
});

export const professionalProfileSchema = z.object({
  id: idSchema,
  userId: idSchema,
  status: z.enum(professionalStatuses),
  businessName: z.string().min(2).max(120),
  description: z.string().max(1200),
  yearsOfExperience: z.number().int().min(0).max(80).nullable(),
  phone: z.string().min(7).max(32).nullable(),
  whatsappNumber: z.string().min(7).max(32).nullable(),
  profileImageUrl: z.string().url().nullable(),
  galleryImageUrls: z.array(z.string().url()).default([]),
  averageRating: z.number().min(0).max(5),
  reviewCount: z.number().int().min(0),
  availability: availabilitySchema,
  serviceAreas: z.array(serviceAreaSchema),
  categoryIds: z.array(idSchema),
  preferredContactChannel: z.enum(preferredContactChannels),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const upsertProfessionalProfileSchema = z.object({
  businessName: z.string().trim().min(2).max(120),
  description: z.string().trim().min(20).max(1200),
  yearsOfExperience: z.number().int().min(0).max(80).optional(),
  phone: z.string().trim().min(7).max(32).optional(),
  whatsappNumber: z.string().trim().min(7).max(32).optional(),
  profileImageUrl: z.string().url().optional(),
  galleryImageUrls: z.array(z.string().url()).max(8).default([]),
  preferredContactChannel: z.enum(preferredContactChannels).default('WHATSAPP'),
  availability: availabilitySchema,
});

export const replaceProfessionalCategoriesSchema = z.object({
  categoryIds: z.array(idSchema).min(1).max(10),
});

export const replaceServiceAreasSchema = z.object({
  areas: z.array(placeReferenceSchema.extend({ radiusKm: z.number().min(1).max(500) })).min(1).max(10),
});

export const professionalSearchQuerySchema = paginationQuerySchema.extend({
  categoryId: idSchema.optional(),
  placeId: z.string().trim().max(255).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().min(1).max(500).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  availableNow: z.coerce.boolean().optional(),
  text: z.string().trim().max(120).optional(),
  sort: z.enum(professionalSearchSorts).default('recommended'),
});

export const professionalSearchResponseSchema = paginatedResponseSchema(professionalProfileSchema);

