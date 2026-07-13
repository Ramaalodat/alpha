"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const client_1 = require("@prisma/client");
const api_types_1 = require("../types/api.types");
const logger_1 = __importDefault(require("../utils/logger"));
const prisma = new client_1.PrismaClient();
class NotificationService {
    /**
     * Create notification
     */
    async createNotification(params) {
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
        logger_1.default.info('Notification created', {
            userId: params.userId,
            notificationId: notification.id,
            type: params.type,
        });
        return notification;
    }
    /**
     * Get user notifications
     */
    async getUserNotifications(userId, filters) {
        const where = {
            userId,
        };
        if (filters) {
            if (filters.type)
                where.type = filters.type;
            if (filters.isRead !== undefined)
                where.isRead = filters.isRead;
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
    async getNotificationById(userId, notificationId) {
        const notification = await prisma.notification.findFirst({
            where: {
                id: notificationId,
                userId,
            },
        });
        if (!notification) {
            throw {
                code: api_types_1.ErrorCodes.NOT_FOUND,
                message: 'الإشعار غير موجود',
            };
        }
        return notification;
    }
    /**
     * Mark notification as read
     */
    async markAsRead(userId, notificationId) {
        const notification = await this.getNotificationById(userId, notificationId);
        const updated = await prisma.notification.update({
            where: { id: notificationId },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
        logger_1.default.info('Notification marked as read', { userId, notificationId });
        return updated;
    }
    /**
     * Mark all notifications as read
     */
    async markAllAsRead(userId) {
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
        logger_1.default.info('All notifications marked as read', { userId, count: result.count });
        return { count: result.count };
    }
    /**
     * Get unread count
     */
    async getUnreadCount(userId) {
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
    async deleteNotification(userId, notificationId) {
        await this.getNotificationById(userId, notificationId);
        await prisma.notification.delete({
            where: { id: notificationId },
        });
        logger_1.default.info('Notification deleted', { userId, notificationId });
    }
    /**
     * Delete all read notifications
     */
    async deleteAllRead(userId) {
        const result = await prisma.notification.deleteMany({
            where: {
                userId,
                isRead: true,
            },
        });
        logger_1.default.info('All read notifications deleted', { userId, count: result.count });
        return { count: result.count };
    }
    /**
     * Send push notification (integration with push service)
     */
    async sendPushNotification(notification) {
        try {
            // TODO: Integrate with actual push notification service (FCM, APNs, etc.)
            if (process.env.NODE_ENV === 'development') {
                logger_1.default.info('Push notification (DEV MODE)', {
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
            logger_1.default.info('Push notification sent', {
                notificationId: notification.id,
                userId: notification.userId,
            });
            return true;
        }
        catch (error) {
            logger_1.default.error('Failed to send push notification', {
                notificationId: notification.id,
                error,
            });
            return false;
        }
    }
}
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
//# sourceMappingURL=notification.service.js.map