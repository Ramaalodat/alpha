import { Notification, NotificationType, PriorityLevel } from '@prisma/client';
import { NotificationFilters } from '../types/user.types';
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
export declare class NotificationService {
    /**
     * Create notification
     */
    createNotification(params: CreateNotificationParams): Promise<Notification>;
    /**
     * Get user notifications
     */
    getUserNotifications(userId: string, filters?: NotificationFilters): Promise<Notification[]>;
    /**
     * Get notification by ID
     */
    getNotificationById(userId: string, notificationId: string): Promise<Notification>;
    /**
     * Mark notification as read
     */
    markAsRead(userId: string, notificationId: string): Promise<Notification>;
    /**
     * Mark all notifications as read
     */
    markAllAsRead(userId: string): Promise<{
        count: number;
    }>;
    /**
     * Get unread count
     */
    getUnreadCount(userId: string): Promise<number>;
    /**
     * Delete notification
     */
    deleteNotification(userId: string, notificationId: string): Promise<void>;
    /**
     * Delete all read notifications
     */
    deleteAllRead(userId: string): Promise<{
        count: number;
    }>;
    /**
     * Send push notification (integration with push service)
     */
    sendPushNotification(notification: Notification): Promise<boolean>;
}
export declare const notificationService: NotificationService;
export {};
//# sourceMappingURL=notification.service.d.ts.map