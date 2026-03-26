import type { UserRole } from '@oficios/domain';

export type AuthenticatedUser = {
  sub: string;
  roles: UserRole[];
  sessionId: string;
  sessionVersion: number;
};

