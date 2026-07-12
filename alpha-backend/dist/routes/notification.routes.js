"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRoutes = void 0;
const notification_controller_1 = require("../controllers/notification.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const notificationRoutes = async (fastify) => {
    // All routes require authentication
    fastify.addHook('onRequest', auth_middleware_1.authenticate);
    /**
     * @route   GET /api/notifications
     * @desc    Get user notifications
     * @access  Private
     */
    fastify.get('/', notification_controller_1.notificationController.getUserNotifications);
    /**
     * @route   GET /api/notifications/unread-count
     * @desc    Get unread count
     * @access  Private
     */
    fastify.get('/unread-count', notification_controller_1.notificationController.getUnreadCount);
    /**
     * @route   POST /api/notifications/read-all
     * @desc    Mark all notifications as read
     * @access  Private
     */
    fastify.post('/read-all', notification_controller_1.notificationController.markAllAsRead);
    /**
     * @route   DELETE /api/notifications/read
     * @desc    Delete all read notifications
     * @access  Private
     */
    fastify.delete('/read', notification_controller_1.notificationController.deleteAllRead);
    /**
     * @route   GET /api/notifications/:notificationId
     * @desc    Get notification by ID
     * @access  Private
     */
    fastify.get('/:notificationId', notification_controller_1.notificationController.getNotificationById);
    /**
     * @route   PATCH /api/notifications/:notificationId/read
     * @desc    Mark notification as read
     * @access  Private
     */
    fastify.patch('/:notificationId/read', notification_controller_1.notificationController.markAsRead);
    /**
     * @route   DELETE /api/notifications/:notificationId
     * @desc    Delete notification
     * @access  Private
     */
    fastify.delete('/:notificationId', notification_controller_1.notificationController.deleteNotification);
};
exports.notificationRoutes = notificationRoutes;
//# sourceMappingURL=notification.routes.js.map