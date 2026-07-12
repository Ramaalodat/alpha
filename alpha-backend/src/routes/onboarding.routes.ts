import { FastifyInstance } from 'fastify';
import { onboardingController } from '../controllers/onboarding.controller';
import { authenticate, requireVerified } from '../middleware/auth.middleware';
import {
  validate,
  financialInfoSchema,
  createFirstGoalSchema,
} from '../middleware/validation.middleware';

export const onboardingRoutes = async (fastify: FastifyInstance) => {
  // All routes require authentication and verified account
  fastify.addHook('onRequest', authenticate);
  fastify.addHook('onRequest', requireVerified);

  /**
   * @route   GET /api/onboarding/status
   * @desc    Get onboarding status
   * @access  Private
   */
  fastify.get('/status', onboardingController.getStatus);

  /**
   * @route   POST /api/onboarding/financial-info
   * @desc    Complete financial information step
   * @access  Private
   */
  fastify.post(
    '/financial-info',
    {
      preHandler: [validate(financialInfoSchema)],
    },
    onboardingController.completeFinancialInfo
  );

  /**
   * @route   POST /api/onboarding/first-goal
   * @desc    Create first goal
   * @access  Private
   */
  fastify.post(
    '/first-goal',
    {
      preHandler: [validate(createFirstGoalSchema)],
    },
    onboardingController.createFirstGoal
  );

  /**
   * @route   GET /api/onboarding/recommended-goals
   * @desc    Get recommended goals
   * @access  Private
   */
  fastify.get('/recommended-goals', onboardingController.getRecommendedGoals);

  /**
   * @route   POST /api/onboarding/skip
   * @desc    Skip onboarding
   * @access  Private
   */
  fastify.post('/skip', onboardingController.skipOnboarding);
};
