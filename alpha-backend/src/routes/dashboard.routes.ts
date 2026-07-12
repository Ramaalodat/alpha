import { FastifyInstance } from 'fastify';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate, requireOnboarding } from '../middleware/auth.middleware';

export const dashboardRoutes = async (fastify: FastifyInstance) => {
  // All routes require authentication and completed onboarding
  fastify.addHook('onRequest', authenticate);
  fastify.addHook('onRequest', requireOnboarding);

  /**
   * @route   GET /api/dashboard
   * @desc    Get dashboard summary
   * @access  Private
   */
  fastify.get('/', dashboardController.getDashboardSummary);

  /**
   * @route   GET /api/dashboard/health-score
   * @desc    Get financial health score
   * @access  Private
   */
  fastify.get('/health-score', dashboardController.getFinancialHealthScore);
};
