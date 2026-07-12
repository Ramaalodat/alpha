"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseController = exports.ExpenseController = void 0;
const expense_service_1 = require("../services/expense.service");
const api_types_1 = require("../types/api.types");
const constants_1 = require("../utils/constants");
const logger_1 = __importDefault(require("../utils/logger"));
class ExpenseController {
    /**
     * Create new expense
     * POST /api/expenses
     */
    async createExpense(request, reply) {
        try {
            const userId = request.user.userId;
            const body = request.body;
            const expense = await expense_service_1.expenseService.createExpense(userId, body);
            logger_1.default.info('Expense created', { userId, expenseId: expense.id });
            return reply
                .status(constants_1.HTTP_STATUS.CREATED)
                .send((0, api_types_1.createSuccessResponse)(expense, 'تم إضافة المصروف بنجاح'));
        }
        catch (error) {
            logger_1.default.error('Create expense failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.BAD_REQUEST)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message));
        }
    }
    /**
     * Get all user expenses
     * GET /api/expenses
     */
    async getUserExpenses(request, reply) {
        try {
            const userId = request.user.userId;
            const query = request.query;
            const expenses = await expense_service_1.expenseService.getUserExpenses(userId, query);
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(expenses));
        }
        catch (error) {
            logger_1.default.error('Get user expenses failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.INTERNAL_ERROR, error.message));
        }
    }
    /**
     * Get expense by ID
     * GET /api/expenses/:expenseId
     */
    async getExpenseById(request, reply) {
        try {
            const userId = request.user.userId;
            const { expenseId } = request.params;
            const expense = await expense_service_1.expenseService.getExpenseById(userId, expenseId);
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(expense));
        }
        catch (error) {
            logger_1.default.error('Get expense by ID failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.NOT_FOUND)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message));
        }
    }
    /**
     * Update expense
     * PATCH /api/expenses/:expenseId
     */
    async updateExpense(request, reply) {
        try {
            const userId = request.user.userId;
            const { expenseId } = request.params;
            const body = request.body;
            const expense = await expense_service_1.expenseService.updateExpense(userId, expenseId, body);
            logger_1.default.info('Expense updated', { userId, expenseId });
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(expense, 'تم تحديث المصروف بنجاح'));
        }
        catch (error) {
            logger_1.default.error('Update expense failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.BAD_REQUEST)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message));
        }
    }
    /**
     * Delete expense
     * DELETE /api/expenses/:expenseId
     */
    async deleteExpense(request, reply) {
        try {
            const userId = request.user.userId;
            const { expenseId } = request.params;
            const result = await expense_service_1.expenseService.deleteExpense(userId, expenseId);
            logger_1.default.info('Expense deleted', { userId, expenseId });
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(null, result.message));
        }
        catch (error) {
            logger_1.default.error('Delete expense failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.BAD_REQUEST)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message));
        }
    }
    /**
     * Get expense categories
     * GET /api/expenses/categories
     */
    async getCategories(request, reply) {
        try {
            const userId = request.user?.userId;
            const categories = await expense_service_1.expenseService.getCategories(userId);
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(categories));
        }
        catch (error) {
            logger_1.default.error('Get categories failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.INTERNAL_ERROR, error.message));
        }
    }
    /**
     * Create custom category
     * POST /api/expenses/categories
     */
    async createCategory(request, reply) {
        try {
            const userId = request.user.userId;
            const body = request.body;
            const category = await expense_service_1.expenseService.createCategory(userId, body);
            logger_1.default.info('Category created', { userId, categoryId: category.id });
            return reply
                .status(constants_1.HTTP_STATUS.CREATED)
                .send((0, api_types_1.createSuccessResponse)(category, 'تم إنشاء الفئة بنجاح'));
        }
        catch (error) {
            logger_1.default.error('Create category failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.BAD_REQUEST)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message));
        }
    }
    /**
     * Get expense statistics
     * GET /api/expenses/stats
     */
    async getExpenseStats(request, reply) {
        try {
            const userId = request.user.userId;
            const query = request.query;
            const startDate = query.startDate ? new Date(query.startDate) : undefined;
            const endDate = query.endDate ? new Date(query.endDate) : undefined;
            const stats = await expense_service_1.expenseService.getExpenseStats(userId, startDate, endDate);
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(stats));
        }
        catch (error) {
            logger_1.default.error('Get expense stats failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.INTERNAL_ERROR, error.message));
        }
    }
    /**
     * Get monthly comparison
     * GET /api/expenses/monthly-comparison
     */
    async getMonthlyComparison(request, reply) {
        try {
            const userId = request.user.userId;
            const comparison = await expense_service_1.expenseService.getMonthlyComparison(userId);
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(comparison));
        }
        catch (error) {
            logger_1.default.error('Get monthly comparison failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.INTERNAL_ERROR, error.message));
        }
    }
}
exports.ExpenseController = ExpenseController;
exports.expenseController = new ExpenseController();
//# sourceMappingURL=expense.controller.js.map