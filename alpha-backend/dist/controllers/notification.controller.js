"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = exports.NotificationController = void 0;
const notification_service_1 = require("../services/notification.service");
const api_types_1 = require("../types/api.types");
const constants_1 = require("../utils/constants");
const logger_1 = __importDefault(require("../utils/logger"));
class NotificationController {
    /**
     * Get user notifications
     * GET /api/notifications
     */
    async getUserNotifications(request, reply) {
        try {
            const userId = request.user.userId;
            const query = request.query;
            const notifications = await notification_service_1.notificationService.getUserNotifications(userId, query);
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(notifications));
        }
        catch (error) {
            logger_1.default.error('Get notifications failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.INTERNAL_ERROR, error.message));
        }
    }
    /**
     * Get notification by ID
     * GET /api/notifications/:notificationId
     */
    async getNotificationById(request, reply) {
        try {
            const userId = request.user.userId;
            const { notificationId } = request.params;
            const notification = await notification_service_1.notificationService.getNotificationById(userId, notificationId);
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(notification));
        }
        catch (error) {
            logger_1.default.error('Get notification by ID failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.NOT_FOUND)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message));
        }
    }
    /**
     * Mark notification as read
     * PATCH /api/notifications/:notificationId/read
     */
    async markAsRead(request, reply) {
        try {
            const userId = request.user.userId;
            const { notificationId } = request.params;
            const notification = await notification_service_1.notificationService.markAsRead(userId, notificationId);
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(notification, 'تم تحديد الإشعار كمقروء'));
        }
        catch (error) {
            logger_1.default.error('Mark as read failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.BAD_REQUEST)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message));
        }
    }
    /**
     * Mark all notifications as read
     * POST /api/notifications/read-all
     */
    async markAllAsRead(request, reply) {
        try {
            const userId = request.user.userId;
            const result = await notification_service_1.notificationService.markAllAsRead(userId);
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(result, 'تم تحديد جميع الإشعارات كمقروءة'));
        }
        catch (error) {
            logger_1.default.error('Mark all as read failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.INTERNAL_ERROR, error.message));
        }
    }
    /**
     * Get unread count
     * GET /api/notifications/unread-count
     */
    async getUnreadCount(request, reply) {
        try {
            const userId = request.user.userId;
            const count = await notification_service_1.notificationService.getUnreadCount(userId);
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)({ count }));
        }
        catch (error) {
            logger_1.default.error('Get unread count failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.INTERNAL_ERROR, error.message));
        }
    }
    /**
     * Delete notification
     * DELETE /api/notifications/:notificationId
     */
    async deleteNotification(request, reply) {
        try {
            const userId = request.user.userId;
            const { notificationId } = request.params;
            await notification_service_1.notificationService.deleteNotification(userId, notificationId);
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(null, 'تم حذف الإشعار بنجاح'));
        }
        catch (error) {
            logger_1.default.error('Delete notification failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.BAD_REQUEST)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message));
        }
    }
    /**
     * Delete all read notifications
     * DELETE /api/notifications/read
     */
    async deleteAllRead(request, reply) {
        try {
            const userId = request.user.userId;
            const result = await notification_service_1.notificationService.deleteAllRead(userId);
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(result, 'تم حذف جميع الإشعارات المقروءة'));
        }
        catch (error) {
            logger_1.default.error('Delete all read failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.INTERNAL_ERROR, error.message));
        }
    }
}
exports.NotificationController = NotificationController;
exports.notificationController = new NotificationController();
//# sourceMappingURL=notification.controller.js.map