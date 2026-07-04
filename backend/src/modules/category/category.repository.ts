import { prisma } from '@/lib/prisma';

export class CategoryRepository {
  async findAllActive() {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findAll() {
    return prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findByIdOrSlug(idOrSlug: string) {
    // Try querying by ID first, then by unique slug
    const byId = await prisma.category.findUnique({
      where: { id: idOrSlug },
    });
    if (byId) return byId;

    return prisma.category.findUnique({
      where: { slug: idOrSlug },
    });
  }

  async create(data: {
    slug: string;
    name_en: string;
    name_mr: string;
    iconName: string;
    isActive?: boolean;
    displayOrder?: number;
  }) {
    return prisma.category.create({
      data,
    });
  }

  async update(
    id: string,
    data: {
      slug?: string;
      name_en?: string;
      name_mr?: string;
      iconName?: string;
      isActive?: boolean;
      displayOrder?: number;
    }
  ) {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.category.delete({
      where: { id },
    });
  }
}
