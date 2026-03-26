import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ProfessionalStatus, UserRole } from '@prisma/client';
import {
  availabilitySchema,
  professionalSearchQuerySchema,
  replaceProfessionalCategoriesSchema,
  replaceServiceAreasSchema,
  upsertProfessionalProfileSchema,
} from '@oficios/contracts';
import { buildPaginatedResult } from '@oficios/utils';

import type { AuthenticatedUser } from '../../common/authenticated-user';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ProfessionalsService {
  constructor(private readonly prisma: PrismaService) {}

  async searchPublic(query: unknown) {
    const input = professionalSearchQuerySchema.parse(query);

    const profiles = await this.prisma.professionalProfile.findMany({
      where: {
        status: ProfessionalStatus.APPROVED,
        isAcceptingRequests: input.availableNow ? true : undefined,
        professionalCategories: input.categoryId
          ? {
              some: { categoryId: input.categoryId },
            }
          : undefined,
        OR: input.text
          ? [
              { businessName: { contains: input.text, mode: 'insensitive' } },
              { description: { contains: input.text, mode: 'insensitive' } },
              {
                professionalCategories: {
                  some: {
                    category: {
                      name: { contains: input.text, mode: 'insensitive' },
                    },
                  },
                },
              },
            ]
          : undefined,
        averageRating: input.minRating ? { gte: input.minRating } : undefined,
        serviceAreas: input.placeId
          ? {
              some: { placeId: input.placeId },
            }
          : undefined,
      },
      include: {
        user: true,
        serviceAreas: true,
        professionalCategories: true,
      },
      orderBy:
        input.sort === 'rating_desc'
          ? { averageRating: 'desc' }
          : input.sort === 'newest'
            ? { createdAt: 'desc' }
            : [{ averageRating: 'desc' }, { createdAt: 'desc' }],
      take: 200,
    });

    const filtered = profiles
      .filter((profile) => {
        if (input.availableNow && !profile.isAcceptingRequests) {
          return false;
        }

        if (input.lat === undefined || input.lng === undefined) {
          return true;
        }

        const radiusLimit = input.radiusKm ?? 20;
        return profile.serviceAreas.some((area) => {
          const distance = this.calculateDistanceKm(input.lat!, input.lng!, area.lat, area.lng);
          return distance <= Math.max(radiusLimit, area.radiusKm);
        });
      })
      .map((profile) => ({
        ...profile,
        distanceKm:
          input.lat !== undefined && input.lng !== undefined && profile.serviceAreas[0]
            ? this.calculateDistanceKm(input.lat, input.lng, profile.serviceAreas[0].lat, profile.serviceAreas[0].lng)
            : null,
      }));

    const sorted = [...filtered].sort((left, right) => {
      if (input.sort === 'distance_asc') {
        return (left.distanceKm ?? Number.MAX_SAFE_INTEGER) - (right.distanceKm ?? Number.MAX_SAFE_INTEGER);
      }

      if (input.sort === 'rating_desc') {
        return right.averageRating - left.averageRating;
      }

      if (input.sort === 'newest') {
        return right.createdAt.getTime() - left.createdAt.getTime();
      }

      const ratingDiff = right.averageRating - left.averageRating;
      if (ratingDiff !== 0) {
        return ratingDiff;
      }

      return (left.distanceKm ?? Number.MAX_SAFE_INTEGER) - (right.distanceKm ?? Number.MAX_SAFE_INTEGER);
    });

    const pageStart = (input.page - 1) * input.pageSize;
    const pageItems = sorted.slice(pageStart, pageStart + input.pageSize);

    return buildPaginatedResult(
      pageItems.map((profile) => this.serializeProfile(profile, false)),
      input.page,
      input.pageSize,
      sorted.length,
    );
  }

  async getPublicById(id: string) {
    const profile = await this.prisma.professionalProfile.findFirst({
      where: {
        id,
        status: ProfessionalStatus.APPROVED,
      },
      include: {
        user: true,
        serviceAreas: true,
        professionalCategories: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Professional not found');
    }

    return this.serializeProfile(profile, false);
  }

  async getMyProfile(user: AuthenticatedUser) {
    const profile = await this.prisma.professionalProfile.findUnique({
      where: { userId: user.sub },
      include: {
        user: true,
        serviceAreas: true,
        professionalCategories: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Professional profile not found');
    }

    return this.serializeProfile(profile, true);
  }

  async createMyProfile(user: AuthenticatedUser, payload: unknown) {
    const input = upsertProfessionalProfileSchema.parse(payload);

    const existing = await this.prisma.professionalProfile.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });

    if (existing) {
      throw new BadRequestException('Professional profile already exists');
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const currentUser = await tx.user.findUniqueOrThrow({
        where: { id: user.sub },
        select: { roles: true },
      });

      const roles = currentUser.roles.includes(UserRole.PROFESSIONAL)
        ? currentUser.roles
        : [...currentUser.roles, UserRole.PROFESSIONAL];

      await tx.user.update({
        where: { id: user.sub },
        data: { roles },
      });

      return tx.professionalProfile.create({
        data: {
          userId: user.sub,
          businessName: input.businessName,
          description: input.description,
          yearsOfExperience: input.yearsOfExperience,
          phone: input.phone,
          whatsappNumber: input.whatsappNumber,
          profileImageUrl: input.profileImageUrl,
          galleryImageUrls: input.galleryImageUrls,
          preferredContactChannel: input.preferredContactChannel,
          isAcceptingRequests: input.availability.isAcceptingRequests,
          availableToday: input.availability.availableToday,
          availabilitySummary: input.availability.summary,
          status: ProfessionalStatus.PENDING_APPROVAL,
        },
        include: {
          user: true,
          serviceAreas: true,
          professionalCategories: true,
        },
      });
    });

    return this.serializeProfile(created, true);
  }

  async updateMyProfile(user: AuthenticatedUser, payload: unknown) {
    const input = upsertProfessionalProfileSchema.parse(payload);

    const updated = await this.prisma.professionalProfile.update({
      where: { userId: user.sub },
      data: {
        businessName: input.businessName,
        description: input.description,
        yearsOfExperience: input.yearsOfExperience,
        phone: input.phone,
        whatsappNumber: input.whatsappNumber,
        profileImageUrl: input.profileImageUrl,
        galleryImageUrls: input.galleryImageUrls,
        preferredContactChannel: input.preferredContactChannel,
        isAcceptingRequests: input.availability.isAcceptingRequests,
        availableToday: input.availability.availableToday,
        availabilitySummary: input.availability.summary,
        status: ProfessionalStatus.PENDING_APPROVAL,
      },
      include: {
        user: true,
        serviceAreas: true,
        professionalCategories: true,
      },
    });

    return this.serializeProfile(updated, true);
  }

  async replaceCategories(user: AuthenticatedUser, payload: unknown) {
    const input = replaceProfessionalCategoriesSchema.parse(payload);
    const profile = await this.prisma.professionalProfile.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Professional profile not found');
    }

    await this.prisma.$transaction([
      this.prisma.professionalCategory.deleteMany({
        where: { professionalProfileId: profile.id },
      }),
      this.prisma.professionalCategory.createMany({
        data: input.categoryIds.map((categoryId) => ({
          professionalProfileId: profile.id,
          categoryId,
        })),
      }),
      this.prisma.professionalProfile.update({
        where: { id: profile.id },
        data: { status: ProfessionalStatus.PENDING_APPROVAL },
      }),
    ]);

    return this.getMyProfile(user);
  }

  async replaceServiceAreas(user: AuthenticatedUser, payload: unknown) {
    const input = replaceServiceAreasSchema.parse(payload);
    const profile = await this.prisma.professionalProfile.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Professional profile not found');
    }

    await this.prisma.$transaction([
      this.prisma.serviceArea.deleteMany({
        where: { professionalProfileId: profile.id },
      }),
      this.prisma.serviceArea.createMany({
        data: input.areas.map((area) => ({
          professionalProfileId: profile.id,
          placeId: area.placeId,
          label: area.addressText,
          lat: area.lat,
          lng: area.lng,
          radiusKm: area.radiusKm,
        })),
      }),
      this.prisma.professionalProfile.update({
        where: { id: profile.id },
        data: { status: ProfessionalStatus.PENDING_APPROVAL },
      }),
    ]);

    return this.getMyProfile(user);
  }

  async updateAvailability(user: AuthenticatedUser, payload: unknown) {
    const input = availabilitySchema.parse(payload);

    const updated = await this.prisma.professionalProfile.update({
      where: { userId: user.sub },
      data: {
        isAcceptingRequests: input.isAcceptingRequests,
        availableToday: input.availableToday,
        availabilitySummary: input.summary,
      },
      include: {
        user: true,
        serviceAreas: true,
        professionalCategories: true,
      },
    });

    return this.serializeProfile(updated, true);
  }

  private serializeProfile(
    profile: Prisma.ProfessionalProfileGetPayload<{
      include: {
        user: true;
        serviceAreas: true;
        professionalCategories: true;
      };
    }> & { distanceKm?: number | null },
    includeDirectContact: boolean,
  ) {
    return {
      id: profile.id,
      userId: profile.userId,
      status: profile.status,
      businessName: profile.businessName,
      description: profile.description,
      yearsOfExperience: profile.yearsOfExperience,
      phone: includeDirectContact ? profile.phone : null,
      whatsappNumber: includeDirectContact ? profile.whatsappNumber : null,
      profileImageUrl: profile.profileImageUrl,
      galleryImageUrls: profile.galleryImageUrls,
      averageRating: profile.averageRating,
      reviewCount: profile.reviewCount,
      availability: {
        isAcceptingRequests: profile.isAcceptingRequests,
        availableToday: profile.availableToday,
        summary: profile.availabilitySummary,
      },
      serviceAreas: profile.serviceAreas.map((area) => ({
        id: area.id,
        placeId: area.placeId,
        label: area.label,
        lat: area.lat,
        lng: area.lng,
        radiusKm: area.radiusKm,
      })),
      categoryIds: profile.professionalCategories.map((category) => category.categoryId),
      preferredContactChannel: profile.preferredContactChannel,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
      distanceKm: profile.distanceKm ?? null,
    };
  }

  private calculateDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
    const toRadians = (value: number) => (value * Math.PI) / 180;
    const earthRadiusKm = 6371;
    const deltaLat = toRadians(lat2 - lat1);
    const deltaLng = toRadians(lng2 - lng1);
    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(deltaLng / 2) *
        Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }
}

