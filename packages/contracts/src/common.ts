import { z } from 'zod';

export const idSchema = z.string().uuid();
export const emailSchema = z.string().trim().email().max(255);
export const phoneSchema = z.string().trim().min(7).max(32);
export const passwordSchema = z.string().min(8).max(128);

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const placeReferenceSchema = z.object({
  placeId: z.string().min(1).max(255),
  addressText: z.string().trim().min(3).max(255),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    total: z.number().int().min(0),
  });

