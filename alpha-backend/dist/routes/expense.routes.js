"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseRoutes = void 0;
const expense_controller_1 = require("../controllers/expense.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const expenseRoutes = async (fastify) => {
    /**
     * @route   GET /api/expenses/categories
     * @desc    Get expense categories (public or authenticated)
     * @access  Public/Private
     */
    fastify.get('/categories', {
        preHandler: [auth_middleware_1.optionalAuth],
    }, expense_controller_1.expenseController.getCategories);
    await fastify.register(async (instance) => {
        instance.addHook('onRequest', auth_middleware_1.authenticate);
        instance.addHook('onRequest', auth_middleware_1.requireOnboarding);
        /**
         * @route   POST /api/expenses
         * @desc    Create new expense
         * @access  Private
         */
        instance.post('/', {
            preHandler: [(0, validation_middleware_1.validate)(validation_middleware_1.createExpenseSchema)],
        }, expense_controller_1.expenseController.createExpense);
        /**
         * @route   GET /api/expenses
         * @desc    Get all user expenses
         * @access  Private
         */
        instance.get('/', expense_controller_1.expenseController.getUserExpenses);
        /**
         * @route   GET /api/expenses/stats
         * @desc    Get expense statistics
         * @access  Private
         */
        instance.get('/stats', expense_controller_1.expenseController.getExpenseStats);
        /**
         * @route   GET /api/expenses/monthly-comparison
         * @desc    Get monthly comparison
         * @access  Private
         */
        instance.get('/monthly-comparison', expense_controller_1.expenseController.getMonthlyComparison);
        /**
         * @route   GET /api/expenses/:expenseId
         * @desc    Get expense by ID
         * @access  Private
         */
        instance.get('/:expenseId', expense_controller_1.expenseController.getExpenseById);
        /**
         * @route   PATCH /api/expenses/:expenseId
         * @desc    Update expense
         * @access  Private
         */
        instance.patch('/:expenseId', {
            preHandler: [(0, validation_middleware_1.validate)(validation_middleware_1.updateExpenseSchema)],
        }, expense_controller_1.expenseController.updateExpense);
        /**
         * @route   DELETE /api/expenses/:expenseId
         * @desc    Delete expense
         * @access  Private
         */
        instance.delete('/:expenseId', expense_controller_1.expenseController.deleteExpense);
        /**
         * @route   POST /api/expenses/categories
         * @desc    Create custom category
         * @access  Private
         */
        instance.post('/categories', {
            preHandler: [(0, validation_middleware_1.validate)(validation_middleware_1.createCategorySchema)],
        }, expense_controller_1.expenseController.createCategory);
    });
};
exports.expenseRoutes = expenseRoutes;
//# sourceMappingURL=expense.routes.js.map