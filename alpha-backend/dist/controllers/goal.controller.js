"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.goalController = exports.GoalController = void 0;
const goal_service_1 = require("../services/goal.service");
const api_types_1 = require("../types/api.types");
const constants_1 = require("../utils/constants");
const logger_1 = __importDefault(require("../utils/logger"));
class GoalController {
    /**
     * Create new goal
     * POST /api/goals
     */
    async createGoal(request, reply) {
        try {
            const userId = request.user.userId;
            const body = request.body;
            const goal = await goal_service_1.goalService.createGoal(userId, body);
            logger_1.default.info('Goal created', { userId, goalId: goal.id });
            return reply
                .status(constants_1.HTTP_STATUS.CREATED)
                .send((0, api_types_1.createSuccessResponse)(goal, 'تم إنشاء الهدف المالي بنجاح'));
        }
        catch (error) {
            logger_1.default.error('Create goal failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.BAD_REQUEST)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message));
        }
    }
    /**
     * Get all user goals
     * GET /api/goals
     */
    async getUserGoals(request, reply) {
        try {
            const userId = request.user.userId;
            const query = request.query;
            const goals = await goal_service_1.goalService.getUserGoals(userId, query);
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(goals));
        }
        catch (error) {
            logger_1.default.error('Get user goals failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
                .send((0, api_types_1.createErrorResponse)(api_types_1.ErrorCodes.INTERNAL_ERROR, error.message));
        }
    }
    /**
     * Get goal by ID
     * GET /api/goals/:goalId
     */
    async getGoalById(request, reply) {
        try {
            const userId = request.user.userId;
            const { goalId } = request.params;
            const goal = await goal_service_1.goalService.getGoalById(userId, goalId);
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(goal));
        }
        catch (error) {
            logger_1.default.error('Get goal by ID failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.NOT_FOUND)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message));
        }
    }
    /**
     * Update goal
     * PATCH /api/goals/:goalId
     */
    async updateGoal(request, reply) {
        try {
            const userId = request.user.userId;
            const { goalId } = request.params;
            const body = request.body;
            const goal = await goal_service_1.goalService.updateGoal(userId, goalId, body);
            logger_1.default.info('Goal updated', { userId, goalId });
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(goal, 'تم تحديث الهدف المالي بنجاح'));
        }
        catch (error) {
            logger_1.default.error('Update goal failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.BAD_REQUEST)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message));
        }
    }
    /**
     * Delete goal
     * DELETE /api/goals/:goalId
     */
    async deleteGoal(request, reply) {
        try {
            const userId = request.user.userId;
            const { goalId } = request.params;
            const result = await goal_service_1.goalService.deleteGoal(userId, goalId);
            logger_1.default.info('Goal deleted', { userId, goalId });
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(null, result.message));
        }
        catch (error) {
            logger_1.default.error('Delete goal failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.BAD_REQUEST)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message));
        }
    }
    /**
     * Add transaction to goal
     * POST /api/goals/:goalId/transactions
     */
    async addTransaction(request, reply) {
        try {
            const userId = request.user.userId;
            const { goalId } = request.params;
            const body = request.body;
            const result = await goal_service_1.goalService.addTransaction(userId, goalId, body);
            logger_1.default.info('Goal transaction added', {
                userId,
                goalId,
                transactionId: result.transaction.id,
            });
            return reply
                .status(constants_1.HTTP_STATUS.CREATED)
                .send((0, api_types_1.createSuccessResponse)(result, 'تم إضافة المعاملة بنجاح'));
        }
        catch (error) {
            logger_1.default.error('Add goal transaction failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.BAD_REQUEST)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message));
        }
    }
    /**
     * Get goal transactions
     * GET /api/goals/:goalId/transactions
     */
    async getGoalTransactions(request, reply) {
        try {
            const userId = request.user.userId;
            const { goalId } = request.params;
            const transactions = await goal_service_1.goalService.getGoalTransactions(userId, goalId);
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(transactions));
        }
        catch (error) {
            logger_1.default.error('Get goal transactions failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.BAD_REQUEST)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message));
        }
    }
    /**
     * Get goal statistics
     * GET /api/goals/:goalId/stats
     */
    async getGoalStats(request, reply) {
        try {
            const userId = request.user.userId;
            const { goalId } = request.params;
            const stats = await goal_service_1.goalService.getGoalStats(userId, goalId);
            return reply
                .status(constants_1.HTTP_STATUS.OK)
                .send((0, api_types_1.createSuccessResponse)(stats));
        }
        catch (error) {
            logger_1.default.error('Get goal stats failed', { error: error.message });
            return reply
                .status(constants_1.HTTP_STATUS.BAD_REQUEST)
                .send((0, api_types_1.createErrorResponse)(error.code, error.message));
        }
    }
}
exports.GoalController = GoalController;
exports.goalController = new GoalController();
//# sourceMappingURL=goal.controller.js.map