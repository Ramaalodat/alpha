import { FastifyRequest, FastifyReply } from 'fastify';
export declare class NotificationController {
    /**
     * Get user notifications
     * GET /api/notifications
     */
    getUserNotifications(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Get notification by ID
     * GET /api/notifications/:notificationId
     */
    getNotificationById(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Mark notification as read
     * PATCH /api/notifications/:notificationId/read
     */
    markAsRead(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Mark all notifications as read
     * POST /api/notifications/read-all
     */
    markAllAsRead(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Get unread count
     * GET /api/notifications/unread-count
     */
    getUnreadCount(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Delete notification
     * DELETE /api/notifications/:notificationId
     */
    deleteNotification(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /**
     * Delete all read notifications
     * DELETE /api/notifications/read
     */
    deleteAllRead(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
export declare const notificationController: NotificationController;
//# sourceMappingURL=notification.controller.d.ts.map