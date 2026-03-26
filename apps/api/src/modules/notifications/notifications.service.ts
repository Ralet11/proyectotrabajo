import { Injectable } from '@nestjs/common';
import { DevicePlatform } from '@prisma/client';
import { notificationsQuerySchema } from '@oficios/contracts';
import { z } from 'zod';
import { buildPaginatedResult } from '@oficios/utils';

import type { AuthenticatedUser } from '../../common/authenticated-user';
import { PrismaService } from '../../common/prisma/prisma.service';

const registerPushTokenSchema = z.object({
  token: z.string().min(1),
  platform: z.nativeEnum(DevicePlatform),
});

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async registerPushToken(user: AuthenticatedUser, payload: unknown) {
    const input = registerPushTokenSchema.parse(payload);

    const record = await this.prisma.devicePushToken.upsert({
      where: { token: input.token },
      update: {
        userId: user.sub,
        platform: input.platform,
        lastSeenAt: new Date(),
      },
      create: {
        userId: user.sub,
        token: input.token,
        platform: input.platform,
      },
    });

    return {
      id: record.id,
      token: record.token,
      platform: record.platform,
      lastSeenAt: record.lastSeenAt.toISOString(),
    };
  }

  async list(user: AuthenticatedUser, query: unknown) {
    const input = notificationsQuerySchema.parse(query);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where: { userId: user.sub },
        orderBy: { createdAt: 'desc' },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      this.prisma.notification.count({ where: { userId: user.sub } }),
    ]);

    return buildPaginatedResult(
      items.map((notification) => this.serializeNotification(notification)),
      input.page,
      input.pageSize,
      total,
    );
  }

  async markRead(user: AuthenticatedUser, id: string) {
    const existing = await this.prisma.notification.findFirstOrThrow({
      where: { id, userId: user.sub },
    });

    const notification = await this.prisma.notification.update({
      where: { id: existing.id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return this.serializeNotification(notification);
  }

  private serializeNotification(notification: {
    id: string;
    userId: string;
    type: string;
    title: string;
    body: string;
    isRead: boolean;
    createdAt: Date;
  }) {
    return {
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      isRead: notification.isRead,
      createdAt: notification.createdAt.toISOString(),
    };
  }
}
