import { LocationRepository } from '../../domain/repositories/location.repository';
import { Location } from '@prisma/client';
import { prisma } from '../../../lib/prisma';

export class PrismaLocationRepository implements LocationRepository {
  async findById(id: string): Promise<Location | null> {
    return prisma.location.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByBusinessId(businessId: string): Promise<Location[]> {
    return prisma.location.findMany({
      where: { businessId, deletedAt: null },
    });
  }

  async create(data: {
    businessId: string;
    latitude: number;
    longitude: number;
    formattedAddress: string;
    city: string;
    state: string;
    pincode: string;
    area: string;
  }): Promise<Location> {
    return prisma.location.create({
      data: {
        businessId: data.businessId,
        latitude: data.latitude,
        longitude: data.longitude,
        formattedAddress: data.formattedAddress,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        area: data.area,
      },
    });
  }

  async update(id: string, data: Partial<Location>): Promise<Location> {
    return prisma.location.update({
      where: { id },
      data,
    });
  }

  async deleteSoft(id: string, deletedBy: string): Promise<Location> {
    return prisma.location.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }
}
