import { FastifyInstance } from 'fastify';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

export const notificationRoutes = async (fastify: FastifyInstance) => {
  // All routes require authentication
  fastify.addHook('onRequest', authenticate);

  /**
   * @route   GET /api/notifications
   * @desc    Get user notifications
   * @access  Private
   */
  fastify.get('/', notificationController.getUserNotifications);

  /**
   * @route   GET /api/notifications/unread-count
   * @desc    Get unread count
   * @access  Private
   */
  fastify.get('/unread-count', notificationController.getUnreadCount);

  /**
   * @route   POST /api/notifications/read-all
   * @desc    Mark all notifications as read
   * @access  Private
   */
  fastify.post('/read-all', notificationController.markAllAsRead);

  /**
   * @route   DELETE /api/notifications/read
   * @desc    Delete all read notifications
   * @access  Private
   */
  fastify.delete('/read', notificationController.deleteAllRead);

  /**
   * @route   GET /api/notifications/:notificationId
   * @desc    Get notification by ID
   * @access  Private
   */
  fastify.get('/:notificationId', notificationController.getNotificationById);

  /**
   * @route   PATCH /api/notifications/:notificationId/read
   * @desc    Mark notification as read
   * @access  Private
   */
  fastify.patch('/:notificationId/read', notificationController.markAsRead);

  /**
   * @route   DELETE /api/notifications/:notificationId
   * @desc    Delete notification
   * @access  Private
   */
  fastify.delete('/:notificationId', notificationController.deleteNotification);
};
