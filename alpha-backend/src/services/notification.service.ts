import { Notification, NotificationType, PriorityLevel } from '@prisma/client';
import { ErrorCodes } from '../types/api.types';
import { NotificationFilters } from '../types/user.types';
import logger from '../utils/logger';
import prisma from '../lib/prisma';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  titleAr?: string;
  message: string;
  messageAr?: string;
  priority?: PriorityLevel;
  channels?: string[];
  data?: any;
  actionUrl?: string;
  imageUrl?: string;
  scheduledAt?: Date;
}

export class NotificationService {
  /**
   * Create notification
   */
  async createNotification(params: CreateNotificationParams): Promise<Notification> {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        titleAr: params.titleAr || params.title,
        message: params.message,
        messageAr: params.messageAr || params.message,
        priority: params.priority || 'MEDIUM',
        channels: params.channels || ['push', 'app'],
        data: params.data,
        actionUrl: params.actionUrl,
        imageUrl: params.imageUrl,
        scheduledAt: params.scheduledAt,
        isSent: params.scheduledAt ? false : true,
        sentAt: params.scheduledAt ? null : new Date(),
      },
    });

    logger.info('Notification created', {
      userId: params.userId,
      notificationId: notification.id,
      type: params.type,
    });

    return notification;
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string, filters?: NotificationFilters): Promise<Notification[]> {
    const where: any = {
      userId,
    };

    if (filters) {
      if (filters.type) where.type = filters.type;
      if (filters.isRead !== undefined) where.isRead = filters.isRead;
      if (filters.startDate) {
        where.createdAt = { gte: new Date(filters.startDate) };
      }
      if (filters.endDate) {
        where.createdAt = { ...where.createdAt, lte: new Date(filters.endDate) };
      }
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to recent 50
    });

    return notifications;
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(userId: string, notificationId: string): Promise<Notification> {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw {
        code: ErrorCodes.NOT_FOUND,
        message: 'الإشعار غير موجود',
      };
    }

    return notification;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(userId: string, notificationId: string): Promise<Notification> {
    const notification = await this.getNotificationById(userId, notificationId);

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    logger.info('Notification marked as read', { userId, notificationId });

    return updated;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    logger.info('All notifications marked as read', { userId, count: result.count });

    return { count: result.count };
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string): Promise<number> {
    return await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  /**
   * Delete notification
   */
  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    await this.getNotificationById(userId, notificationId);

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    logger.info('Notification deleted', { userId, notificationId });
  }

  /**
   * Delete all read notifications
   */
  async deleteAllRead(userId: string): Promise<{ count: number }> {
    const result = await prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true,
      },
    });

    logger.info('All read notifications deleted', { userId, count: result.count });

    return { count: result.count };
  }

  /**
   * Send push notification (integration with push service)
   */
  async sendPushNotification(notification: Notification): Promise<boolean> {
    try {
      // TODO: Integrate with actual push notification service (FCM, APNs, etc.)
      
      if (process.env.NODE_ENV === 'development') {
        logger.info('Push notification (DEV MODE)', {
          userId: notification.userId,
          title: notification.title,
          message: notification.message,
        });
        return true;
      }

      // Production push notification logic here
      // Example with Firebase Cloud Messaging:
      // await admin.messaging().send({
      //   notification: {
      //     title: notification.title,
      //     body: notification.message,
      //   },
      //   data: notification.data as any,
      //   token: userDeviceToken,
      // });

      logger.info('Push notification sent', {
        notificationId: notification.id,
        userId: notification.userId,
      });

      return true;
    } catch (error) {
      logger.error('Failed to send push notification', {
        notificationId: notification.id,
        error,
      });
      return false;
    }
  }
}

export const notificationService = new NotificationService();
