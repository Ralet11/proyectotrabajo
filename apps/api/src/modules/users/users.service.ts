import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { updateMeSchema } from '@oficios/contracts';

import type { AuthenticatedUser } from '../../common/authenticated-user';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(user: AuthenticatedUser) {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
    });

    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    return this.serializeUser(currentUser);
  }

  async updateMe(user: AuthenticatedUser, payload: unknown) {
    const input = updateMeSchema.parse(payload);

    const updatedUser = await this.prisma.user.update({
      where: { id: user.sub },
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        avatarUrl: input.avatarUrl,
      },
    });

    return this.serializeUser(updatedUser);
  }

  async listSessions(user: AuthenticatedUser) {
    const sessions = await this.prisma.session.findMany({
      where: { userId: user.sub },
      orderBy: { createdAt: 'desc' },
    });

    return sessions.map((session) => ({
      id: session.id,
      deviceName: session.deviceName,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      expiresAt: session.expiresAt.toISOString(),
      revokedAt: session.revokedAt?.toISOString() ?? null,
      createdAt: session.createdAt.toISOString(),
      isCurrent: session.id === user.sessionId,
    }));
  }

  async revokeSession(user: AuthenticatedUser, sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      select: { id: true, userId: true },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.userId !== user.sub) {
      throw new ForbiddenException('Session does not belong to user');
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });

    return { success: true };
  }

  private serializeUser(user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    avatarUrl: string | null;
    roles: string[];
    emailVerifiedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      roles: user.roles,
      emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}

