import { FastifyRequest, FastifyReply } from 'fastify';
import { goalService } from '../services/goal.service';
import { createSuccessResponse, createErrorResponse, ErrorCodes } from '../types/api.types';
import { HTTP_STATUS } from '../utils/constants';
import { CreateGoalRequest, UpdateGoalRequest, GoalTransactionRequest, GoalFilters } from '../types/user.types';
import logger from '../utils/logger';
import { normalizeFilterQuery } from '../utils/query.utils';
import prisma from '../lib/prisma';

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
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(createErrorResponse(ErrorCodes.INTERNAL_ERROR, 'حدث خطأ أثناء جلب إحصائيات الهدف'));
    }
  }

  /**
   * Execute a completed goal
   */
  async executeGoal(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const { goalId } = request.params as { goalId: string };

    try {
      const updated = await prisma.financialGoal.update({
        where: { id: goalId, userId },
        data: {
          status: 'EXECUTED',
          executedAt: new Date(),
          completedAt: new Date()
        }
      });
      return reply.send(createSuccessResponse(updated, 'تم تنفيذ الهدف بنجاح'));
    } catch (error: any) {
      return reply.status(400).send(createErrorResponse(ErrorCodes.VALIDATION_ERROR, error.message));
    }
  }

  /**
   * Reallocate goal funds
   */
  async reallocateGoal(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const { goalId } = request.params as { goalId: string };
    const { targetGoalId, amount } = request.body as any;

    try {
      const result = await prisma.$transaction(async (tx: any) => {
        const source = await tx.financialGoal.findUnique({ where: { id: goalId, userId } });
        const target = await tx.financialGoal.findUnique({ where: { id: targetGoalId, userId } });
        
        if (!source || !target || Number(source.currentAmount) < amount) throw new Error('Invalid reallocation');

        await tx.financialGoal.update({
          where: { id: source.id },
          data: { currentAmount: { decrement: amount } }
        });
        await tx.financialGoal.update({
          where: { id: target.id },
          data: { currentAmount: { increment: amount } }
        });

        return { success: true };
      });
      return reply.send(createSuccessResponse(result, 'تم إعادة توجيه الأموال بنجاح'));
    } catch (error: any) {
      return reply.status(400).send(createErrorResponse(ErrorCodes.VALIDATION_ERROR, error.message));
    }
  }

  /**
   * Pause a goal
   */
  async pauseGoal(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const { goalId } = request.params as { goalId: string };

    try {
      const updated = await prisma.financialGoal.update({
        where: { id: goalId, userId },
        data: { status: 'PAUSED', stage: 'PAUSED' }
      });
      return reply.send(createSuccessResponse(updated, 'تم إيقاف الهدف مؤقتاً'));
    } catch (error: any) {
      return reply.status(400).send(createErrorResponse(ErrorCodes.VALIDATION_ERROR, error.message));
    }
  }

  /**
   * Resume a goal
   */
  async resumeGoal(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const { goalId } = request.params as { goalId: string };

    try {
      const updated = await prisma.financialGoal.update({
        where: { id: goalId, userId },
        data: { status: 'ACTIVE', stage: 'ACTIVE' }
      });
      return reply.send(createSuccessResponse(updated, 'تم استئناف الهدف بنجاح'));
    } catch (error: any) {
      return reply.status(400).send(createErrorResponse(ErrorCodes.VALIDATION_ERROR, error.message));
    }
  }
}

export const goalController = new GoalController();
