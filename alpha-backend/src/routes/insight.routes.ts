import { FastifyInstance } from 'fastify';
import { insightController } from '../controllers/insight.controller';
import { authenticate, requireOnboarding } from '../middleware/auth.middleware';
import { validateQuery, insightFilterSchema } from '../middleware/validation.middleware';

export const insightRoutes = async (fastify: FastifyInstance) => {
  fastify.addHook('onRequest', authenticate);
  fastify.addHook('onRequest', requireOnboarding);

  // Get unread count
  fastify.get('/unread-count', insightController.getUnreadCount);

  // Generate insights
  fastify.post('/generate', insightController.generateInsights);

  // Get insights (with filters)
  fastify.get('/', { preHandler: [validateQuery(insightFilterSchema)] }, insightController.getUserInsights);

  // Get insight by ID
  fastify.get('/:insightId', insightController.getInsightById);

  // Mark as read
  fastify.patch('/:insightId/read', insightController.markAsRead);

  // Dismiss insight
  fastify.patch('/:insightId/dismiss', insightController.dismissInsight);

  // Mark as acted on
  fastify.patch('/:insightId/acted', insightController.markAsActedOn);
};
