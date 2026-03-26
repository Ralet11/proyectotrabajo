import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NotificationType, Prisma, ServiceRequestStatus } from '@prisma/client';
import {
  createServiceRequestMessageSchema,
  createServiceRequestSchema,
  listMyServiceRequestsQuerySchema,
} from '@oficios/contracts';
import { buildPaginatedResult } from '@oficios/utils';

import type { AuthenticatedUser } from '../../common/authenticated-user';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ServiceRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: AuthenticatedUser, payload: unknown) {
    const input = createServiceRequestSchema.parse(payload);

    const professional = await this.prisma.professionalProfile.findFirst({
      where: {
        id: input.professionalId,
        status: 'APPROVED',
      },
      include: {
        user: true,
        professionalCategories: true,
      },
    });

    if (!professional) {
      throw new NotFoundException('Professional not available');
    }

    const supportsCategory = professional.professionalCategories.some(
      (category) => category.categoryId === input.categoryId,
    );

    if (!supportsCategory) {
      throw new BadRequestException('Professional does not serve selected category');
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const serviceRequest = await tx.serviceRequest.create({
        data: {
          customerId: user.sub,
          professionalId: input.professionalId,
          categoryId: input.categoryId,
          message: input.message,
          placeId: input.placeId,
          addressText: input.addressText,
          lat: input.lat,
          lng: input.lng,
          preferredContactChannel: input.preferredContactChannel,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
        },
        include: this.serviceRequestInclude(),
      });

      await tx.serviceRequestMessage.create({
        data: {
          serviceRequestId: serviceRequest.id,
          senderUserId: user.sub,
          body: input.message,
        },
      });

      await tx.notification.create({
        data: {
          userId: professional.userId,
          type: NotificationType.SERVICE_REQUEST_CREATED,
          title: 'Nueva solicitud de trabajo',
          body: `Recibiste una solicitud para ${professional.businessName}.`,
          data: { serviceRequestId: serviceRequest.id },
        },
      });

      return serviceRequest;
    });

    return this.serializeServiceRequest(created, user.sub, this.isAdmin(user));
  }

  async listMine(user: AuthenticatedUser, query: unknown) {
    const input = listMyServiceRequestsQuerySchema.parse(query);

    const professionalProfile =
      input.as === 'professional'
        ? await this.prisma.professionalProfile.findUnique({
            where: { userId: user.sub },
            select: { id: true },
          })
        : null;

    if (input.as === 'professional' && !professionalProfile) {
      throw new NotFoundException('Professional profile not found');
    }

    const where: Prisma.ServiceRequestWhereInput =
      input.as === 'customer'
        ? { customerId: user.sub, status: input.status }
        : { professionalId: professionalProfile!.id, status: input.status };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.serviceRequest.findMany({
        where,
        include: this.serviceRequestInclude(),
        orderBy: { createdAt: 'desc' },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      this.prisma.serviceRequest.count({ where }),
    ]);

    return buildPaginatedResult(
      items.map((item) => this.serializeServiceRequest(item, user.sub, this.isAdmin(user))),
      input.page,
      input.pageSize,
      total,
    );
  }

  async getById(user: AuthenticatedUser, id: string) {
    const serviceRequest = await this.findAccessibleRequestOrThrow(user, id);
    return this.serializeServiceRequest(serviceRequest, user.sub, this.isAdmin(user));
  }

  async accept(user: AuthenticatedUser, id: string) {
    const serviceRequest = await this.findAccessibleRequestOrThrow(user, id);

    if (serviceRequest.professional.userId !== user.sub && !this.isAdmin(user)) {
      throw new ForbiddenException('Only the professional can accept this request');
    }

    if (serviceRequest.status !== ServiceRequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be accepted');
    }

    const acceptedAt = new Date();

    const updated = await this.prisma.$transaction(async (tx) => {
      const next = await tx.serviceRequest.update({
        where: { id },
        data: {
          status: ServiceRequestStatus.ACCEPTED,
          acceptedAt,
          contactUnlockedAt: acceptedAt,
        },
        include: this.serviceRequestInclude(),
      });

      await tx.notification.create({
        data: {
          userId: next.customerId,
          type: NotificationType.SERVICE_REQUEST_ACCEPTED,
          title: 'Solicitud aceptada',
          body: 'El profesional aceptó tu solicitud y ya podés ver sus datos de contacto.',
          data: { serviceRequestId: next.id },
        },
      });

      return next;
    });

    return this.serializeServiceRequest(updated, user.sub, this.isAdmin(user));
  }

  async reject(user: AuthenticatedUser, id: string) {
    const serviceRequest = await this.findAccessibleRequestOrThrow(user, id);

    if (serviceRequest.professional.userId !== user.sub && !this.isAdmin(user)) {
      throw new ForbiddenException('Only the professional can reject this request');
    }

    if (serviceRequest.status !== ServiceRequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be rejected');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const next = await tx.serviceRequest.update({
        where: { id },
        data: {
          status: ServiceRequestStatus.REJECTED,
          rejectedAt: new Date(),
        },
        include: this.serviceRequestInclude(),
      });

      await tx.notification.create({
        data: {
          userId: next.customerId,
          type: NotificationType.SERVICE_REQUEST_REJECTED,
          title: 'Solicitud rechazada',
          body: 'El profesional rechazó tu solicitud.',
          data: { serviceRequestId: next.id },
        },
      });

      return next;
    });

    return this.serializeServiceRequest(updated, user.sub, this.isAdmin(user));
  }

  async cancel(user: AuthenticatedUser, id: string) {
    const serviceRequest = await this.findAccessibleRequestOrThrow(user, id);

    if (serviceRequest.customerId !== user.sub && !this.isAdmin(user)) {
      throw new ForbiddenException('Only the customer can cancel this request');
    }

    if (
      serviceRequest.status !== ServiceRequestStatus.PENDING &&
      serviceRequest.status !== ServiceRequestStatus.ACCEPTED
    ) {
      throw new BadRequestException('Request cannot be cancelled');
    }

    const updated = await this.prisma.serviceRequest.update({
      where: { id },
      data: {
        status: ServiceRequestStatus.CANCELLED,
        cancelledAt: new Date(),
      },
      include: this.serviceRequestInclude(),
    });

    return this.serializeServiceRequest(updated, user.sub, this.isAdmin(user));
  }

  async complete(user: AuthenticatedUser, id: string) {
    const serviceRequest = await this.findAccessibleRequestOrThrow(user, id);
    const professionalOwnsRequest = serviceRequest.professional.userId === user.sub;
    const customerOwnsRequest = serviceRequest.customerId === user.sub;

    if (!professionalOwnsRequest && !customerOwnsRequest && !this.isAdmin(user)) {
      throw new ForbiddenException('Only participants can complete this request');
    }

    if (serviceRequest.status !== ServiceRequestStatus.ACCEPTED) {
      throw new BadRequestException('Only accepted requests can be completed');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const next = await tx.serviceRequest.update({
        where: { id },
        data: {
          status: ServiceRequestStatus.COMPLETED,
          completedAt: new Date(),
        },
        include: this.serviceRequestInclude(),
      });

      await tx.notification.create({
        data: {
          userId: next.customerId,
          type: NotificationType.REVIEW_REMINDER,
          title: 'Podés dejar una reseña',
          body: 'El servicio fue marcado como completado. Compartí tu experiencia.',
          data: { serviceRequestId: next.id },
        },
      });

      return next;
    });

    return this.serializeServiceRequest(updated, user.sub, this.isAdmin(user));
  }

  async listMessages(user: AuthenticatedUser, id: string) {
    const serviceRequest = await this.findAccessibleRequestOrThrow(user, id);
    const messages = await this.prisma.serviceRequestMessage.findMany({
      where: { serviceRequestId: serviceRequest.id },
      orderBy: { createdAt: 'asc' },
    });

    return messages.map((message) => ({
      id: message.id,
      serviceRequestId: message.serviceRequestId,
      senderUserId: message.senderUserId,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
    }));
  }

  async createMessage(user: AuthenticatedUser, id: string, payload: unknown) {
    const serviceRequest = await this.findAccessibleRequestOrThrow(user, id);
    const input = createServiceRequestMessageSchema.parse(payload);

    if (
      serviceRequest.status !== ServiceRequestStatus.PENDING &&
      serviceRequest.status !== ServiceRequestStatus.ACCEPTED
    ) {
      throw new BadRequestException('Messages are only allowed on pending or accepted requests');
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const message = await tx.serviceRequestMessage.create({
        data: {
          serviceRequestId: id,
          senderUserId: user.sub,
          body: input.body,
        },
      });

      const recipientUserId =
        serviceRequest.customerId === user.sub ? serviceRequest.professional.userId : serviceRequest.customerId;

      await tx.notification.create({
        data: {
          userId: recipientUserId,
          type: NotificationType.SERVICE_REQUEST_MESSAGE,
          title: 'Nuevo mensaje',
          body: input.body.slice(0, 120),
          data: { serviceRequestId: id },
        },
      });

      return message;
    });

    return {
      id: created.id,
      serviceRequestId: created.serviceRequestId,
      senderUserId: created.senderUserId,
      body: created.body,
      createdAt: created.createdAt.toISOString(),
    };
  }

  private async findAccessibleRequestOrThrow(user: AuthenticatedUser, id: string) {
    const serviceRequest = await this.prisma.serviceRequest.findUnique({
      where: { id },
      include: this.serviceRequestInclude(),
    });

    if (!serviceRequest) {
      throw new NotFoundException('Service request not found');
    }

    const isParticipant =
      serviceRequest.customerId === user.sub || serviceRequest.professional.userId === user.sub;

    if (!isParticipant && !this.isAdmin(user)) {
      throw new ForbiddenException('You do not have access to this request');
    }

    return serviceRequest;
  }

  private serializeServiceRequest(
    serviceRequest: Prisma.ServiceRequestGetPayload<{
      include: ReturnType<ServiceRequestsService['serviceRequestInclude']>;
    }>,
    viewerUserId: string,
    isAdmin: boolean,
  ) {
    const canSeeContact =
      isAdmin ||
      serviceRequest.status === ServiceRequestStatus.ACCEPTED ||
      serviceRequest.status === ServiceRequestStatus.COMPLETED;

    return {
      id: serviceRequest.id,
      customerId: serviceRequest.customerId,
      professionalId: serviceRequest.professionalId,
      categoryId: serviceRequest.categoryId,
      status: serviceRequest.status,
      message: serviceRequest.message,
      place:
        serviceRequest.placeId && serviceRequest.addressText && serviceRequest.lat !== null && serviceRequest.lng !== null
          ? {
              placeId: serviceRequest.placeId,
              addressText: serviceRequest.addressText,
              lat: serviceRequest.lat,
              lng: serviceRequest.lng,
            }
          : null,
      preferredContactChannel: serviceRequest.preferredContactChannel,
      contactUnlockedAt: serviceRequest.contactUnlockedAt?.toISOString() ?? null,
      acceptedAt: serviceRequest.acceptedAt?.toISOString() ?? null,
      rejectedAt: serviceRequest.rejectedAt?.toISOString() ?? null,
      completedAt: serviceRequest.completedAt?.toISOString() ?? null,
      createdAt: serviceRequest.createdAt.toISOString(),
      updatedAt: serviceRequest.updatedAt.toISOString(),
      professional: {
        id: serviceRequest.professional.id,
        businessName: serviceRequest.professional.businessName,
        profileImageUrl: serviceRequest.professional.profileImageUrl,
        phone: canSeeContact ? serviceRequest.professional.phone : null,
        whatsappNumber: canSeeContact ? serviceRequest.professional.whatsappNumber : null,
      },
      customer: {
        id: serviceRequest.customer.id,
        firstName:
          serviceRequest.customerId === viewerUserId || isAdmin ? serviceRequest.customer.firstName : 'Cliente',
        lastName:
          serviceRequest.customerId === viewerUserId || isAdmin ? serviceRequest.customer.lastName : '',
      },
    };
  }

  private serviceRequestInclude() {
    return {
      customer: true,
      professional: {
        include: {
          user: true,
        },
      },
      category: true,
      messages: true,
      review: true,
    } as const;
  }

  private isAdmin(user: AuthenticatedUser) {
    return user.roles.includes('ADMIN');
  }
}
