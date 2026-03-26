export const userRoles = ['CUSTOMER', 'PROFESSIONAL', 'ADMIN'] as const;
export type UserRole = (typeof userRoles)[number];

export const authProviders = ['PASSWORD', 'GOOGLE', 'APPLE'] as const;
export type AuthProvider = (typeof authProviders)[number];

export const professionalStatuses = [
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'REJECTED',
  'PAUSED',
] as const;
export type ProfessionalStatus = (typeof professionalStatuses)[number];

export const serviceRequestStatuses = [
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'CANCELLED',
  'COMPLETED',
  'EXPIRED',
] as const;
export type ServiceRequestStatus = (typeof serviceRequestStatuses)[number];

export const reviewStatuses = ['VISIBLE', 'HIDDEN'] as const;
export type ReviewStatus = (typeof reviewStatuses)[number];

export const notificationTypes = [
  'SERVICE_REQUEST_CREATED',
  'SERVICE_REQUEST_ACCEPTED',
  'SERVICE_REQUEST_REJECTED',
  'SERVICE_REQUEST_MESSAGE',
  'REVIEW_REMINDER',
  'PROFESSIONAL_APPROVED',
] as const;
export type NotificationType = (typeof notificationTypes)[number];

export const preferredContactChannels = ['WHATSAPP', 'PHONE', 'IN_APP'] as const;
export type PreferredContactChannel = (typeof preferredContactChannels)[number];

