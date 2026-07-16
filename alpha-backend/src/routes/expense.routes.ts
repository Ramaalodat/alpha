import { FastifyInstance } from 'fastify';
import { expenseController } from '../controllers/expense.controller';
import { authenticate, requireOnboarding, optionalAuth } from '../middleware/auth.middleware';
import {
  validate,
  createExpenseSchema,
  updateExpenseSchema,
  createCategorySchema,
} from '../middleware/validation.middleware';

export const expenseRoutes = async (fastify: FastifyInstance) => {
  /**
   * @route   GET /api/expenses/categories
   * @desc    Get expense categories (public or authenticated)
   * @access  Public/Private
   */
  fastify.get(
    '/categories',
    {
      preHandler: [optionalAuth],
    },
    expenseController.getCategories
  );

  await fastify.register(async (instance) => {
    instance.addHook('onRequest', authenticate);
    instance.addHook('onRequest', requireOnboarding);

    /**
     * @route   POST /api/expenses
     * @desc    Create new expense
     * @access  Private
     */
    instance.post(
      '/',
      {
        preHandler: [validate(createExpenseSchema)],
      },
      expenseController.createExpense
    );

    /**
     * @route   GET /api/expenses
     * @desc    Get all user expenses
     * @access  Private
     */
    instance.get('/', expenseController.getUserExpenses);

    /**
     * @route   GET /api/expenses/stats
     * @desc    Get expense statistics
     * @access  Private
     */
    instance.get('/stats', expenseController.getExpenseStats);

    /**
     * @route   GET /api/expenses/monthly-comparison
     * @desc    Get monthly comparison
     * @access  Private
     */
    instance.get('/monthly-comparison', expenseController.getMonthlyComparison);

    /**
     * @route   GET /api/expenses/:expenseId
     * @desc    Get expense by ID
     * @access  Private
     */
    instance.get('/:expenseId', expenseController.getExpenseById);

    /**
     * @route   PATCH /api/expenses/:expenseId
     * @desc    Update expense
     * @access  Private
     */
    instance.patch(
      '/:expenseId',
      {
        preHandler: [validate(updateExpenseSchema)],
      },
      expenseController.updateExpense
    );

    /**
     * @route   DELETE /api/expenses/:expenseId
     * @desc    Delete expense
     * @access  Private
     */
    instance.delete('/:expenseId', expenseController.deleteExpense);

    /**
     * @route   POST /api/expenses/categories
     * @desc    Create custom category
     * @access  Private
     */
    instance.post(
      '/categories',
      {
        preHandler: [validate(createCategorySchema)],
      },
      expenseController.createCategory
    );
  });
};
