"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.goalRoutes = void 0;
const goal_controller_1 = require("../controllers/goal.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const goalRoutes = async (fastify) => {
    // All routes require authentication and completed onboarding
    fastify.addHook('onRequest', auth_middleware_1.authenticate);
    fastify.addHook('onRequest', auth_middleware_1.requireOnboarding);
    /**
     * @route   POST /api/goals
     * @desc    Create new goal
     * @access  Private
     */
    fastify.post('/', {
        preHandler: [(0, validation_middleware_1.validate)(validation_middleware_1.createGoalSchema)],
    }, goal_controller_1.goalController.createGoal);
    /**
     * @route   GET /api/goals
     * @desc    Get all user goals
     * @access  Private
     */
    fastify.get('/', goal_controller_1.goalController.getUserGoals);
    /**
     * @route   GET /api/goals/:goalId
     * @desc    Get goal by ID
     * @access  Private
     */
    fastify.get('/:goalId', goal_controller_1.goalController.getGoalById);
    /**
     * @route   PATCH /api/goals/:goalId
     * @desc    Update goal
     * @access  Private
     */
    fastify.patch('/:goalId', {
        preHandler: [(0, validation_middleware_1.validate)(validation_middleware_1.updateGoalSchema)],
    }, goal_controller_1.goalController.updateGoal);
    /**
     * @route   DELETE /api/goals/:goalId
     * @desc    Delete goal
     * @access  Private
     */
    fastify.delete('/:goalId', goal_controller_1.goalController.deleteGoal);
    /**
     * @route   POST /api/goals/:goalId/transactions
     * @desc    Add transaction to goal
     * @access  Private
     */
    fastify.post('/:goalId/transactions', {
        preHandler: [(0, validation_middleware_1.validate)(validation_middleware_1.goalTransactionSchema)],
    }, goal_controller_1.goalController.addTransaction);
    /**
     * @route   GET /api/goals/:goalId/transactions
     * @desc    Get goal transactions
     * @access  Private
     */
    fastify.get('/:goalId/transactions', goal_controller_1.goalController.getGoalTransactions);
    /**
     * @route   GET /api/goals/:goalId/stats
     * @desc    Get goal statistics
     * @access  Private
     */
    fastify.get('/:goalId/stats', goal_controller_1.goalController.getGoalStats);
};
exports.goalRoutes = goalRoutes;
//# sourceMappingURL=goal.routes.js.map