import { FastifyRequest, FastifyReply } from 'fastify';
import { budgetService } from '../services/budget.service';
import { createSuccessResponse, createErrorResponse, ErrorCodes } from '../types/api.types';
import { HTTP_STATUS } from '../utils/constants';
import logger from '../utils/logger';

export class BudgetController {
  async createBudget(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const body = request.body as any;

      const budget = await budgetService.createBudget({ userId, ...body });
      return reply.status(HTTP_STATUS.CREATED).send(createSuccessResponse(budget, 'تم إنشاء الميزانية بنجاح'));
    } catch (error: any) {
      logger.error('Create budget failed', { error: error.message });
      return reply.status(error.statusCode || HTTP_STATUS.BAD_REQUEST).send(createErrorResponse(error.code || ErrorCodes.INTERNAL_ERROR, error.message));
    }
  }

  async getUserBudgets(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const query = request.query as any;

      const budgets = await budgetService.getUserBudgets(userId, query);
      return reply.status(HTTP_STATUS.OK).send(createSuccessResponse(budgets));
    } catch (error: any) {
      logger.error('Get user budgets failed', { error: error.message });
      return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(createErrorResponse(ErrorCodes.INTERNAL_ERROR, error.message));
    }
  }

  async getBudgetById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { budgetId } = request.params as { budgetId: string };

      const budget = await budgetService.getBudgetById(userId, budgetId);
      return reply.status(HTTP_STATUS.OK).send(createSuccessResponse(budget));
    } catch (error: any) {
      logger.error('Get budget by ID failed', { error: error.message });
      return reply.status(HTTP_STATUS.NOT_FOUND).send(createErrorResponse(error.code || ErrorCodes.NOT_FOUND, error.message));
    }
  }

  async updateBudget(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { budgetId } = request.params as { budgetId: string };
      const body = request.body as any;

      const budget = await budgetService.updateBudget(userId, budgetId, body);
      return reply.status(HTTP_STATUS.OK).send(createSuccessResponse(budget, 'تم تحديث الميزانية بنجاح'));
    } catch (error: any) {
      logger.error('Update budget failed', { error: error.message });
      return reply.status(HTTP_STATUS.BAD_REQUEST).send(createErrorResponse(error.code || ErrorCodes.INTERNAL_ERROR, error.message));
    }
  }

  async deleteBudget(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { budgetId } = request.params as { budgetId: string };

      const result = await budgetService.deleteBudget(userId, budgetId);
      return reply.status(HTTP_STATUS.OK).send(createSuccessResponse(null, result.message));
    } catch (error: any) {
      logger.error('Delete budget failed', { error: error.message });
      return reply.status(HTTP_STATUS.BAD_REQUEST).send(createErrorResponse(error.code || ErrorCodes.INTERNAL_ERROR, error.message));
    }
  }

  async recalculateBudget(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { budgetId } = request.params as { budgetId: string };

      const budget = await budgetService.recalculateBudget(userId, budgetId);
      return reply.status(HTTP_STATUS.OK).send(createSuccessResponse(budget, 'تم إعادة حساب الميزانية'));
    } catch (error: any) {
      logger.error('Recalculate budget failed', { error: error.message });
      return reply.status(HTTP_STATUS.BAD_REQUEST).send(createErrorResponse(error.code || ErrorCodes.INTERNAL_ERROR, error.message));
    }
  }

  async getBudgetSummary(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;

      const summary = await budgetService.getBudgetSummary(userId);
      return reply.status(HTTP_STATUS.OK).send(createSuccessResponse(summary));
    } catch (error: any) {
      logger.error('Get budget summary failed', { error: error.message });
      return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(createErrorResponse(ErrorCodes.INTERNAL_ERROR, error.message));
    }
  }
}

export const budgetController = new BudgetController();
