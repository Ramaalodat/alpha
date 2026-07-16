import { FastifyRequest, FastifyReply } from 'fastify';
import { expenseService } from '../services/expense.service';
import { createSuccessResponse, createErrorResponse, ErrorCodes } from '../types/api.types';
import { HTTP_STATUS } from '../utils/constants';
import { CreateExpenseRequest, UpdateExpenseRequest, CreateExpenseCategoryRequest, ExpenseFilters } from '../types/user.types';
import logger from '../utils/logger';
import { normalizeFilterQuery } from '../utils/query.utils';

export class ExpenseController {
  /**
   * Create new expense
   * POST /api/expenses
   */
  async createExpense(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const body = request.body as CreateExpenseRequest;

      const expense = await expenseService.createExpense(userId, body);

      logger.info('Expense created', { userId, expenseId: expense.id });

      return reply
        .status(HTTP_STATUS.CREATED)
        .send(createSuccessResponse(expense, 'تم إضافة المصروف بنجاح'));
    } catch (error: any) {
      logger.error('Create expense failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(createErrorResponse(error.code, error.message));
    }
  }

  /**
   * Get all user expenses
   * GET /api/expenses
   */
  async getUserExpenses(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const query = normalizeFilterQuery<ExpenseFilters>(request.query as Record<string, any>);

      const expenses = await expenseService.getUserExpenses(userId, query);

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(expenses));
    } catch (error: any) {
      logger.error('Get user expenses failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(createErrorResponse(ErrorCodes.INTERNAL_ERROR, error.message));
    }
  }

  /**
   * Get expense by ID
   * GET /api/expenses/:expenseId
   */
  async getExpenseById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { expenseId } = request.params as { expenseId: string };

      const expense = await expenseService.getExpenseById(userId, expenseId);

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(expense));
    } catch (error: any) {
      logger.error('Get expense by ID failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.NOT_FOUND)
        .send(createErrorResponse(error.code, error.message));
    }
  }

  /**
   * Update expense
   * PATCH /api/expenses/:expenseId
   */
  async updateExpense(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { expenseId } = request.params as { expenseId: string };
      const body = request.body as UpdateExpenseRequest;

      const expense = await expenseService.updateExpense(userId, expenseId, body);

      logger.info('Expense updated', { userId, expenseId });

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(expense, 'تم تحديث المصروف بنجاح'));
    } catch (error: any) {
      logger.error('Update expense failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(createErrorResponse(error.code, error.message));
    }
  }

  /**
   * Delete expense
   * DELETE /api/expenses/:expenseId
   */
  async deleteExpense(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { expenseId } = request.params as { expenseId: string };

      const result = await expenseService.deleteExpense(userId, expenseId);

      logger.info('Expense deleted', { userId, expenseId });

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(null, result.message));
    } catch (error: any) {
      logger.error('Delete expense failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(createErrorResponse(error.code, error.message));
    }
  }

  /**
   * Get expense categories
   * GET /api/expenses/categories
   */
  async getCategories(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user?.userId;

      const categories = await expenseService.getCategories(userId);

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(categories));
    } catch (error: any) {
      logger.error('Get categories failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(createErrorResponse(ErrorCodes.INTERNAL_ERROR, error.message));
    }
  }

  /**
   * Create custom category
   * POST /api/expenses/categories
   */
  async createCategory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const body = request.body as CreateExpenseCategoryRequest;

      const category = await expenseService.createCategory(userId, body);

      logger.info('Category created', { userId, categoryId: category.id });

      return reply
        .status(HTTP_STATUS.CREATED)
        .send(createSuccessResponse(category, 'تم إنشاء الفئة بنجاح'));
    } catch (error: any) {
      logger.error('Create category failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.BAD_REQUEST)
        .send(createErrorResponse(error.code, error.message));
    }
  }

  /**
   * Get expense statistics
   * GET /api/expenses/stats
   */
  async getExpenseStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const query = request.query as {
        startDate?: string;
        endDate?: string;
      };

      const startDate = query.startDate ? new Date(query.startDate) : undefined;
      const endDate = query.endDate ? new Date(query.endDate) : undefined;

      const stats = await expenseService.getExpenseStats(userId, startDate, endDate);

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(stats));
    } catch (error: any) {
      logger.error('Get expense stats failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(createErrorResponse(ErrorCodes.INTERNAL_ERROR, error.message));
    }
  }

  /**
   * Get monthly comparison
   * GET /api/expenses/monthly-comparison
   */
  async getMonthlyComparison(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;

      const comparison = await expenseService.getMonthlyComparison(userId);

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse(comparison));
    } catch (error: any) {
      logger.error('Get monthly comparison failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(createErrorResponse(ErrorCodes.INTERNAL_ERROR, error.message));
    }
  }
}

export const expenseController = new ExpenseController();
