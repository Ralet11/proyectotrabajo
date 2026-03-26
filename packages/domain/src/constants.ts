export const paginationDefaults = {
  page: 1,
  pageSize: 20,
  maxPageSize: 50,
} as const;

export const serviceRequestDefaultExpiryHours = 24;

export const professionalSearchSorts = [
  'recommended',
  'rating_desc',
  'distance_asc',
  'newest',
] as const;

export type ProfessionalSearchSort = (typeof professionalSearchSorts)[number];

