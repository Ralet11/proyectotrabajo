import { Injectable, NotFoundException } from '@nestjs/common';
import { categoriesQuerySchema, upsertCategorySchema } from '@oficios/contracts';
import { buildPaginatedResult } from '@oficios/utils';

import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(query: unknown) {
    const input = categoriesQuerySchema.parse(query);
    const where = {
      isActive: input.isActive ?? true,
      name: input.search
        ? {
            contains: input.search,
            mode: 'insensitive' as const,
          }
        : undefined,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (input.page - 1) * input.pageSize,
        take: input.pageSize,
      }),
      this.prisma.category.count({ where }),
    ]);

    return buildPaginatedResult(
      items.map((category) => this.serializeCategory(category)),
      input.page,
      input.pageSize,
      total,
    );
  }

  async getPublicById(id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, isActive: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.serializeCategory(category);
  }

  async create(payload: unknown) {
    const input = upsertCategorySchema.parse(payload);
    const created = await this.prisma.category.create({
      data: input,
    });

    return this.serializeCategory(created);
  }

  async update(id: string, payload: unknown) {
    const input = upsertCategorySchema.parse(payload);
    const updated = await this.prisma.category.update({
      where: { id },
      data: input,
    });

    return this.serializeCategory(updated);
  }

  async remove(id: string) {
    await this.prisma.category.delete({ where: { id } });
    return { success: true };
  }

  async listAdmin(query: unknown) {
    return this.listPublic(query);
  }

  private serializeCategory(category: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    icon: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description,
      icon: category.icon,
      isActive: category.isActive,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }
}

