import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ReviewStatus, ServiceRequestStatus } from '@prisma/client';
import { createReviewSchema, reviewsQuerySchema } from '@oficios/contracts';
import { buildPaginatedResult } from '@oficios/utils';

import type { AuthenticatedUser } from '../../common/authenticated-user';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthenticatedUser, payload: unknown) {
    const input = createReviewSchema.parse(payload);

    const serviceRequest = await this.prisma.serviceRequest.findUnique({
      where: { id: input.serviceRequestId },
      include: {
        review: true,
      },
    });

    if (!serviceRequest) {
      throw new NotFoundException('Service request not found');
    }

    if (serviceRequest.customerId !== user.sub) {
      throw new ForbiddenException('Only the customer can review this request');
    }

    if (
      serviceRequest.status !== ServiceRequestStatus.ACCEPTED &&
      serviceRequest.status !== ServiceRequestStatus.COMPLETED
    ) {
      throw new BadRequestException('Request is not eligible for review');
    }

    if (serviceRequest.review) {
      throw new BadRequestException('Request already has a review');
    }

    const review = await this.prisma.review.create({
      data: {
        serviceRequestId: input.serviceRequestId,
        customerId: user.sub,
        professionalId: serviceRequest.professionalId,
        rating: input.rating,
        comment: input.comment,
      },
    });

    await this.refreshProfessionalRating(serviceRequest.professionalId);

    return this.serializeReview(review);
  }

  async listPublicByProfessional(professionalId: string, query: unknown) {
    const input = reviewsQuerySchema.parse({ ...((query as object) ?? {}), professionalId });

    const where = {
      professionalId: input.professionalId,
      status: ReviewStatus.VISIBLE,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      this.prisma.review.count({ where }),
    ]);

    return buildPaginatedResult(
      items.map((review) => this.serializeReview(review)),
      input.page,
      input.pageSize,
      total,
    );
  }

  async listAdmin(query: unknown) {
    const input = reviewsQuerySchema.parse(query);
    const where = {
      status: input.status,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      this.prisma.review.count({ where }),
    ]);

    return buildPaginatedResult(
      items.map((review) => this.serializeReview(review)),
      input.page,
      input.pageSize,
      total,
    );
  }

  async hide(id: string) {
    const review = await this.prisma.review.update({
      where: { id },
      data: { status: ReviewStatus.HIDDEN },
    });

    await this.refreshProfessionalRating(review.professionalId);
    return this.serializeReview(review);
  }

  async unhide(id: string) {
    const review = await this.prisma.review.update({
      where: { id },
      data: { status: ReviewStatus.VISIBLE },
    });

    await this.refreshProfessionalRating(review.professionalId);
    return this.serializeReview(review);
  }

  private async refreshProfessionalRating(professionalId: string) {
    const aggregate = await this.prisma.review.aggregate({
      where: {
        professionalId,
        status: ReviewStatus.VISIBLE,
      },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await this.prisma.professionalProfile.update({
      where: { id: professionalId },
      data: {
        averageRating: aggregate._avg.rating ?? 0,
        reviewCount: aggregate._count.rating,
      },
    });
  }

  private serializeReview(review: {
    id: string;
    serviceRequestId: string;
    customerId: string;
    professionalId: string;
    rating: number;
    comment: string | null;
    status: ReviewStatus;
    createdAt: Date;
  }) {
    return {
      id: review.id,
      serviceRequestId: review.serviceRequestId,
      customerId: review.customerId,
      professionalId: review.professionalId,
      rating: review.rating,
      comment: review.comment,
      status: review.status,
      createdAt: review.createdAt.toISOString(),
    };
  }
}
