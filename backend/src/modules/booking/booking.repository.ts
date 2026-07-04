import { prisma } from '@/lib/prisma';

export class BookingRepository {
  async findBookings(whereClause: any) {
    return prisma.booking.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBookingById(id: string) {
    return prisma.booking.findUnique({
      where: { id },
    });
  }

  async createBooking(data: any) {
    return prisma.booking.create({
      data,
    });
  }

  async updateBooking(id: string, data: any) {
    return prisma.booking.update({
      where: { id },
      data,
    });
  }

  async findVendorById(id: string) {
    return prisma.vendor.findUnique({
      where: { id },
    });
  }

  async createNotification(data: any) {
    return prisma.notificationItem.create({
      data,
    });
  }

  async createReview(data: any) {
    return prisma.review.create({
      data,
    });
  }

  async findReviewsByVendorId(vendorId: string) {
    return prisma.review.findMany({
      where: { vendorId },
      select: { rating: true },
    });
  }

  async updateVendorStats(vendorId: string, ratingAvg: number, reviewsCount: number) {
    return prisma.vendor.update({
      where: { id: vendorId },
      data: {
        ratingAvg,
        reviewsCount,
      },
    });
  }
}
