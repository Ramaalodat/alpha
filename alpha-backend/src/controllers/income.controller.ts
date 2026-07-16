import { FastifyRequest, FastifyReply } from 'fastify';
import { incomeService } from '../services/income.service';
import { createSuccessResponse, createErrorResponse, ErrorCodes } from '../types/api.types';
import { HTTP_STATUS } from '../utils/constants';
import { CreateIncomeRequest, UpdateIncomeRequest } from '../types/user.types';
import logger from '../utils/logger';
import { normalizeFilterQuery } from '../utils/query.utils';

export class IncomeController {
  async createIncome(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const body = request.body as CreateIncomeRequest;

      const income = await incomeService.createIncome(userId, body);

      logger.info('Income created', { userId, incomeId: income.id });

      // Serialize Prisma/Decimal/Date values to plain JSON
      const incomePayload = JSON.parse(JSON.stringify(income));

      return reply.status(HTTP_STATUS.CREATED).send(createSuccessResponse(incomePayload, 'تم إضافة الدخل بنجاح'));
    } catch (error: any) {
      logger.error('Create income failed', { error: error.message });
      return reply.status(HTTP_STATUS.BAD_REQUEST).send(createErrorResponse(error.code, error.message));
    }
  }

  async getUserIncomes(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const query = normalizeFilterQuery(request.query as Record<string, any>);

      const incomes = await incomeService.getUserIncomes(userId, query);

      // Serialize Prisma/Decimal/Date values to plain JSON
      const incomesPayload = JSON.parse(JSON.stringify(incomes));

      return reply.status(HTTP_STATUS.OK).send(createSuccessResponse(incomesPayload));
    } catch (error: any) {
      logger.error('Get user incomes failed', { error: error.message });
      return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(createErrorResponse(ErrorCodes.INTERNAL_ERROR, error.message));
    }
  }

  async getIncomeById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { incomeId } = request.params as { incomeId: string };

      const income = await incomeService.getIncomeById(userId, incomeId);

      const incomePayload = JSON.parse(JSON.stringify(income));

      return reply.status(HTTP_STATUS.OK).send(createSuccessResponse(incomePayload));
    } catch (error: any) {
      logger.error('Get income by id failed', { error: error.message });
      return reply.status(HTTP_STATUS.NOT_FOUND).send(createErrorResponse(error.code, error.message));
    }
  }

  async updateIncome(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { incomeId } = request.params as { incomeId: string };
      const body = request.body as UpdateIncomeRequest;

      const income = await incomeService.updateIncome(userId, incomeId, body);

      logger.info('Income updated', { userId, incomeId });

      const incomePayload = JSON.parse(JSON.stringify(income));

      return reply.status(HTTP_STATUS.OK).send(createSuccessResponse(incomePayload, 'تم تحديث الدخل بنجاح'));
    } catch (error: any) {
      logger.error('Update income failed', { error: error.message });
      return reply.status(HTTP_STATUS.BAD_REQUEST).send(createErrorResponse(error.code, error.message));
    }
  }

  async deleteIncome(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { incomeId } = request.params as { incomeId: string };

      const result = await incomeService.deleteIncome(userId, incomeId);

      logger.info('Income deleted', { userId, incomeId });

      return reply.status(HTTP_STATUS.OK).send(createSuccessResponse(null, result.message));
    } catch (error: any) {
      logger.error('Delete income failed', { error: error.message });
      return reply.status(HTTP_STATUS.BAD_REQUEST).send(createErrorResponse(error.code, error.message));
    }
  }

  async getMonthlyComparison(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;

      const comparison = await incomeService.getMonthlyComparison(userId);
      return reply.status(HTTP_STATUS.OK).send(createSuccessResponse(comparison));
    } catch (error: any) {
      logger.error('Get monthly comparison failed', { error: error.message });
      return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(createErrorResponse(ErrorCodes.INTERNAL_ERROR, error.message));
    }
  }

  async getIncomeStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const query = request.query as { startDate?: string; endDate?: string };

      const startDate = query.startDate ? new Date(query.startDate) : undefined;
      const endDate = query.endDate ? new Date(query.endDate) : undefined;

      const stats = await incomeService.getIncomeStats(userId, startDate, endDate);

      return reply.status(HTTP_STATUS.OK).send(createSuccessResponse(stats));
    } catch (error: any) {
      logger.error('Get income stats failed', { error: error.message });
      return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(createErrorResponse(ErrorCodes.INTERNAL_ERROR, error.message));
    }
  }
}

export const incomeController = new IncomeController();
