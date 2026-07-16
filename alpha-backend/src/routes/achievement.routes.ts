import { FastifyInstance } from 'fastify';
import { achievementController } from '../controllers/achievement.controller';
import { authenticate, requireOnboarding } from '../middleware/auth.middleware';

export const achievementRoutes = async (fastify: FastifyInstance) => {
  fastify.addHook('onRequest', authenticate);
  fastify.addHook('onRequest', requireOnboarding);

  // Get achievement summary (must be before /:id routes)
  fastify.get('/summary', achievementController.getAchievementSummary);

  // Get user achievements
  fastify.get('/', achievementController.getUserAchievements);

  // Check and unlock achievements
  fastify.post('/check', achievementController.checkAndUnlock);

  // Initialize achievements for new user
  fastify.post('/initialize', achievementController.initializeAchievements);
};
