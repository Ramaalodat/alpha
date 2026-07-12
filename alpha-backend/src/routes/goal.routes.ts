import { FastifyInstance } from 'fastify';
import { goalController } from '../controllers/goal.controller';
import { authenticate, requireOnboarding } from '../middleware/auth.middleware';
import {
  validate,
  createGoalSchema,
  updateGoalSchema,
  goalTransactionSchema,
} from '../middleware/validation.middleware';

export const goalRoutes = async (fastify: FastifyInstance) => {
  // All routes require authentication and completed onboarding
  fastify.addHook('onRequest', authenticate);
  fastify.addHook('onRequest', requireOnboarding);

  /**
   * @route   POST /api/goals
   * @desc    Create new goal
   * @access  Private
   */
  fastify.post(
    '/',
    {
      preHandler: [validate(createGoalSchema)],
    },
    goalController.createGoal
  );

  /**
   * @route   GET /api/goals
   * @desc    Get all user goals
   * @access  Private
   */
  fastify.get('/', goalController.getUserGoals);

  /**
   * @route   GET /api/goals/:goalId
   * @desc    Get goal by ID
   * @access  Private
   */
  fastify.get('/:goalId', goalController.getGoalById);

  /**
   * @route   PATCH /api/goals/:goalId
   * @desc    Update goal
   * @access  Private
   */
  fastify.patch(
    '/:goalId',
    {
      preHandler: [validate(updateGoalSchema)],
    },
    goalController.updateGoal
  );

  /**
   * @route   DELETE /api/goals/:goalId
   * @desc    Delete goal
   * @access  Private
   */
  fastify.delete('/:goalId', goalController.deleteGoal);

  /**
   * @route   POST /api/goals/:goalId/transactions
   * @desc    Add transaction to goal
   * @access  Private
   */
  fastify.post(
    '/:goalId/transactions',
    {
      preHandler: [validate(goalTransactionSchema)],
    },
    goalController.addTransaction
  );

  /**
   * @route   GET /api/goals/:goalId/transactions
   * @desc    Get goal transactions
   * @access  Private
   */
  fastify.get('/:goalId/transactions', goalController.getGoalTransactions);

  /**
   * @route   GET /api/goals/:goalId/stats
   * @desc    Get goal statistics
   * @access  Private
   */
  fastify.get('/:goalId/stats', goalController.getGoalStats);
};
