import { Injectable } from '@nestjs/common';
import { NotificationType, ProfessionalStatus, ServiceRequestStatus } from '@prisma/client';
import {
  adminDecisionSchema,
  adminProfessionalsQuerySchema,
  adminReviewsQuerySchema,
  adminUsersQuerySchema,
} from '@oficios/contracts';
import { buildPaginatedResult } from '@oficios/utils';
import { z } from 'zod';

import type { AuthenticatedUser } from '../../common/authenticated-user';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CategoriesService } from '../categories/categories.service';
import { ReviewsService } from '../reviews/reviews.service';

const adminServiceRequestsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  status: z.nativeEnum(ServiceRequestStatus).optional(),
});

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoriesService: CategoriesService,
    private readonly reviewsService: ReviewsService,
  ) {}

  async dashboard() {
    const [users, professionals, pendingProfessionals, requests, pendingRequests, reviews] =
      await this.prisma.$transaction([
        this.prisma.user.count(),
        this.prisma.professionalProfile.count(),
        this.prisma.professionalProfile.count({
          where: { status: ProfessionalStatus.PENDING_APPROVAL },
        }),
        this.prisma.serviceRequest.count(),
        this.prisma.serviceRequest.count({ where: { status: ServiceRequestStatus.PENDING } }),
        this.prisma.review.count(),
      ]);

    return {
      users,
      professionals,
      pendingProfessionals,
      requests,
      pendingRequests,
      reviews,
    };
  }

  async listUsers(query: unknown) {
    const input = adminUsersQuerySchema.parse(query);
    const where = {
      OR: input.search
        ? [
            { firstName: { contains: input.search, mode: 'insensitive' as const } },
            { lastName: { contains: input.search, mode: 'insensitive' as const } },
            { email: { contains: input.search, mode: 'insensitive' as const } },
          ]
        : undefined,
      roles: input.role ? { has: input.role as 'CUSTOMER' | 'PROFESSIONAL' | 'ADMIN' } : undefined,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);

    return buildPaginatedResult(
      items.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        roles: user.roles,
        emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
        createdAt: user.createdAt.toISOString(),
      })),
      input.page,
      input.pageSize,
      total,
    );
  }

  async listProfessionals(query: unknown) {
    const input = adminProfessionalsQuerySchema.parse(query);
    const where = {
      status: input.status,
      OR: input.search
        ? [
            { businessName: { contains: input.search, mode: 'insensitive' as const } },
            { user: { email: { contains: input.search, mode: 'insensitive' as const } } },
          ]
        : undefined,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.professionalProfile.findMany({
        where,
        include: { user: true, professionalCategories: true, serviceAreas: true },
        orderBy: { createdAt: 'desc' },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      this.prisma.professionalProfile.count({ where }),
    ]);

    return buildPaginatedResult(
      items.map((profile) => ({
        id: profile.id,
        userId: profile.userId,
        businessName: profile.businessName,
        status: profile.status,
        categoryIds: profile.professionalCategories.map((category) => category.categoryId),
        areasCount: profile.serviceAreas.length,
        averageRating: profile.averageRating,
        reviewCount: profile.reviewCount,
        createdAt: profile.createdAt.toISOString(),
        user: {
          email: profile.user.email,
          firstName: profile.user.firstName,
          lastName: profile.user.lastName,
        },
      })),
      input.page,
      input.pageSize,
      total,
    );
  }

  async approveProfessional(admin: AuthenticatedUser, id: string, payload: unknown) {
    adminDecisionSchema.parse(payload);
    const professional = await this.prisma.professionalProfile.update({
      where: { id },
      data: {
        status: ProfessionalStatus.APPROVED,
        approvedAt: new Date(),
        rejectedAt: null,
      },
      include: { user: true },
    });

    await this.prisma.$transaction([
      this.prisma.notification.create({
        data: {
          userId: professional.userId,
          type: NotificationType.PROFESSIONAL_APPROVED,
          title: 'Perfil aprobado',
          body: 'Tu perfil profesional fue aprobado y ya es visible en la app.',
          data: { professionalId: professional.id },
        },
      }),
      this.prisma.adminActionLog.create({
        data: {
          adminUserId: admin.sub,
          action: 'professional.approved',
          entityType: 'professional_profile',
          entityId: professional.id,
        },
      }),
    ]);

    return {
      id: professional.id,
      status: professional.status,
      approvedAt: professional.approvedAt?.toISOString() ?? null,
    };
  }

  async rejectProfessional(admin: AuthenticatedUser, id: string, payload: unknown) {
    const input = adminDecisionSchema.parse(payload);
    const professional = await this.prisma.professionalProfile.update({
      where: { id },
      data: {
        status: ProfessionalStatus.REJECTED,
        rejectedAt: new Date(),
      },
      include: { user: true },
    });

    await this.prisma.adminActionLog.create({
      data: {
        adminUserId: admin.sub,
        action: 'professional.rejected',
        entityType: 'professional_profile',
        entityId: professional.id,
        payload: input.reason ? { reason: input.reason } : undefined,
      },
    });

    return {
      id: professional.id,
      status: professional.status,
      rejectedAt: professional.rejectedAt?.toISOString() ?? null,
    };
  }

  async createCategory(payload: unknown) {
    return this.categoriesService.create(payload);
  }

  async updateCategory(id: string, payload: unknown) {
    return this.categoriesService.update(id, payload);
  }

  async deleteCategory(id: string) {
    return this.categoriesService.remove(id);
  }

  async listServiceRequests(query: unknown) {
    const input = adminServiceRequestsQuerySchema.parse(query);
    const where = {
      status: input.status,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.serviceRequest.findMany({
        where,
        include: {
          customer: true,
          professional: true,
          category: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      this.prisma.serviceRequest.count({ where }),
    ]);

    return buildPaginatedResult(
      items.map((request) => ({
        id: request.id,
        status: request.status,
        customerId: request.customerId,
        professionalId: request.professionalId,
        categoryId: request.categoryId,
        message: request.message,
        createdAt: request.createdAt.toISOString(),
        customer: {
          email: request.customer.email,
          firstName: request.customer.firstName,
          lastName: request.customer.lastName,
        },
        professional: {
          businessName: request.professional.businessName,
        },
        category: {
          name: request.category.name,
        },
      })),
      input.page,
      input.pageSize,
      total,
    );
  }

  async listReviews(query: unknown) {
    return this.reviewsService.listAdmin(query);
  }

  async hideReview(admin: AuthenticatedUser, id: string) {
    const review = await this.reviewsService.hide(id);

    await this.prisma.adminActionLog.create({
      data: {
        adminUserId: admin.sub,
        action: 'review.hidden',
        entityType: 'review',
        entityId: id,
      },
    });

    return review;
  }

  async unhideReview(admin: AuthenticatedUser, id: string) {
    const review = await this.reviewsService.unhide(id);

    await this.prisma.adminActionLog.create({
      data: {
        adminUserId: admin.sub,
        action: 'review.unhidden',
        entityType: 'review',
        entityId: id,
      },
    });

    return review;
  }
}

