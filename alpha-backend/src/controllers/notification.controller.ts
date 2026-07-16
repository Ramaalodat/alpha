import { FastifyRequest, FastifyReply } from 'fastify';
import { notificationService } from '../services/notification.service';
import { createSuccessResponse, createErrorResponse, ErrorCodes } from '../types/api.types';
import { HTTP_STATUS } from '../utils/constants';
import { NotificationFilters } from '../types/user.types';
import logger from '../utils/logger';
import { normalizeFilterQuery } from '../utils/query.utils';

export class NotificationController {
  /**
   * Get user notifications
   * GET /api/notifications
   */
  async getUserNotifications(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const query = normalizeFilterQuery<NotificationFilters>(request.query as Record<string, any>);

      const notifications = await notificationService.getUserNotifications(userId, query);

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(notifications));
    } catch (error: any) {
      logger.error('Get notifications failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(createErrorResponse(ErrorCodes.INTERNAL_ERROR, error.message));
    }
  }

  /**
   * Get notification by ID
   * GET /api/notifications/:notificationId
   */
  async getNotificationById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { notificationId } = request.params as { notificationId: string };

      const notification = await notificationService.getNotificationById(userId, notificationId);

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(notification));
    } catch (error: any) {
      logger.error('Get notification by ID failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.NOT_FOUND)
        .send(createErrorResponse(error.code, error.message));
    }
  }

  /**
   * Mark notification as read
   * PATCH /api/notifications/:notificationId/read
   */
  async markAsRead(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { notificationId } = request.params as { notificationId: string };

      const notification = await notificationService.markAsRead(userId, notificationId);

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(notification, 'تم تحديد الإشعار كمقروء'));
    } catch (error: any) {
      logger.error('Mark as read failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(createErrorResponse(error.code, error.message));
    }
  }

  /**
   * Mark all notifications as read
   * POST /api/notifications/read-all
   */
  async markAllAsRead(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;

      const result = await notificationService.markAllAsRead(userId);

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(result, 'تم تحديد جميع الإشعارات كمقروءة'));
    } catch (error: any) {
      logger.error('Mark all as read failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(createErrorResponse(ErrorCodes.INTERNAL_ERROR, error.message));
    }
  }

  /**
   * Get unread count
   * GET /api/notifications/unread-count
   */
  async getUnreadCount(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;

      const count = await notificationService.getUnreadCount(userId);

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse({ count }));
    } catch (error: any) {
      logger.error('Get unread count failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(createErrorResponse(ErrorCodes.INTERNAL_ERROR, error.message));
    }
  }

  /**
   * Delete notification
   * DELETE /api/notifications/:notificationId
   */
  async deleteNotification(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { notificationId } = request.params as { notificationId: string };

      await notificationService.deleteNotification(userId, notificationId);

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(null, 'تم حذف الإشعار بنجاح'));
    } catch (error: any) {
      logger.error('Delete notification failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(createErrorResponse(error.code, error.message));
    }
  }

  /**
   * Delete all read notifications
   * DELETE /api/notifications/read
   */
  async deleteAllRead(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;

      const result = await notificationService.deleteAllRead(userId);

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(result, 'تم حذف جميع الإشعارات المقروءة'));
    } catch (error: any) {
      logger.error('Delete all read failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(createErrorResponse(ErrorCodes.INTERNAL_ERROR, error.message));
    }
  }
}

export const notificationController = new NotificationController();
