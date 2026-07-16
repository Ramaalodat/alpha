import { FastifyRequest, FastifyReply } from 'fastify';
import { goalService } from '../services/goal.service';
import { createSuccessResponse, createErrorResponse, ErrorCodes } from '../types/api.types';
import { HTTP_STATUS } from '../utils/constants';
import { CreateGoalRequest, UpdateGoalRequest, GoalTransactionRequest, GoalFilters } from '../types/user.types';
import logger from '../utils/logger';
import { normalizeFilterQuery } from '../utils/query.utils';

export class GoalController {
  /**
   * Create new goal
   * POST /api/goals
   */
  async createGoal(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const body = request.body as CreateGoalRequest;

      const goal = await goalService.createGoal(userId, body);

      logger.info('Goal created', { userId, goalId: goal.id });

      return reply
        .status(HTTP_STATUS.CREATED)
        .send(createSuccessResponse(goal, 'تم إنشاء الهدف المالي بنجاح'));
    } catch (error: any) {
      logger.error('Create goal failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(createErrorResponse(error.code, error.message));
    }
  }

  /**
   * Get all user goals
   * GET /api/goals
   */
  async getUserGoals(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const query = normalizeFilterQuery<GoalFilters>(request.query as Record<string, any>);

      const goals = await goalService.getUserGoals(userId, query);

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(goals));
    } catch (error: any) {
      logger.error('Get user goals failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(createErrorResponse(ErrorCodes.INTERNAL_ERROR, error.message));
    }
  }

  /**
   * Get goal by ID
   * GET /api/goals/:goalId
   */
  async getGoalById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { goalId } = request.params as { goalId: string };

      const goal = await goalService.getGoalById(userId, goalId);

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(goal));
    } catch (error: any) {
      logger.error('Get goal by ID failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.NOT_FOUND)
        .send(createErrorResponse(error.code, error.message));
    }
  }

  /**
   * Update goal
   * PATCH /api/goals/:goalId
   */
  async updateGoal(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { goalId } = request.params as { goalId: string };
      const body = request.body as UpdateGoalRequest;

      const goal = await goalService.updateGoal(userId, goalId, body);

      logger.info('Goal updated', { userId, goalId });

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(goal, 'تم تحديث الهدف المالي بنجاح'));
    } catch (error: any) {
      logger.error('Update goal failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(createErrorResponse(error.code, error.message));
    }
  }

  /**
   * Delete goal
   * DELETE /api/goals/:goalId
   */
  async deleteGoal(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { goalId } = request.params as { goalId: string };

      const result = await goalService.deleteGoal(userId, goalId);

      logger.info('Goal deleted', { userId, goalId });

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(null, result.message));
    } catch (error: any) {
      logger.error('Delete goal failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(createErrorResponse(error.code, error.message));
    }
  }

  /**
   * Add transaction to goal
   * POST /api/goals/:goalId/transactions
   */
  async addTransaction(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { goalId } = request.params as { goalId: string };
      const body = request.body as GoalTransactionRequest;

      const result = await goalService.addTransaction(userId, goalId, body);

      logger.info('Goal transaction added', {
        userId,
        goalId,
        transactionId: result.transaction.id,
      });

      return reply
        .status(HTTP_STATUS.CREATED)
        .send(createSuccessResponse(result, 'تم إضافة المعاملة بنجاح'));
    } catch (error: any) {
      logger.error('Add goal transaction failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(createErrorResponse(error.code, error.message));
    }
  }

  /**
   * Get goal transactions
   * GET /api/goals/:goalId/transactions
   */
  async getGoalTransactions(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { goalId } = request.params as { goalId: string };

      const transactions = await goalService.getGoalTransactions(userId, goalId);

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(transactions));
    } catch (error: any) {
      logger.error('Get goal transactions failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(createErrorResponse(error.code, error.message));
    }
  }

  /**
   * Get goal statistics
   * GET /api/goals/:goalId/stats
   */
  async getGoalStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { goalId } = request.params as { goalId: string };

      const stats = await goalService.getGoalStats(userId, goalId);

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(stats));
    } catch (error: any) {
      logger.error('Get goal stats failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(createErrorResponse(error.code, error.message));
    }
  }
}

export const goalController = new GoalController();
