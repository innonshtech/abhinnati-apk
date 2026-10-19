import { prisma } from './prisma';

export async function createUserNotification(input: {
  userId?: string | null;
  titleMr: string;
  titleEn: string;
  messageMr: string;
  messageEn: string;
  type?: string;
}) {
  if (!input.userId) return;
  try {
    await prisma.notification.create({
      data: {
        userId: input.userId,
        titleMr: input.titleMr,
        titleEn: input.titleEn,
        messageMr: input.messageMr,
        messageEn: input.messageEn,
        type: input.type || 'booking',
      },
    });
  } catch (error) {
    console.warn('[notifications] Failed to create notification:', error);
  }
}
