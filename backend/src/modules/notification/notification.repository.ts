import { prisma } from '@/lib/prisma';

export class NotificationRepository {
  async findNotificationsByUserId(userId: string) {
    return prisma.notificationItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notificationItem.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });
  }
}
