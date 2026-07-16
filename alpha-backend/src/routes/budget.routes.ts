import { FastifyInstance } from 'fastify';
import { budgetController } from '../controllers/budget.controller';
import { authenticate, requireOnboarding } from '../middleware/auth.middleware';
import { validate, createBudgetSchema, updateBudgetSchema } from '../middleware/validation.middleware';

export const budgetRoutes = async (fastify: FastifyInstance) => {
  fastify.addHook('onRequest', authenticate);
  fastify.addHook('onRequest', requireOnboarding);

  // Get budget summary
  fastify.get('/summary', budgetController.getBudgetSummary);

  // Create budget
  fastify.post('/', { preHandler: [validate(createBudgetSchema)] }, budgetController.createBudget);

  // Get user budgets
  fastify.get('/', budgetController.getUserBudgets);

  // Get budget by ID
  fastify.get('/:budgetId', budgetController.getBudgetById);

  // Update budget
  fastify.patch('/:budgetId', { preHandler: [validate(updateBudgetSchema)] }, budgetController.updateBudget);

  // Delete budget
  fastify.delete('/:budgetId', budgetController.deleteBudget);

  // Recalculate budget
  fastify.post('/:budgetId/recalculate', budgetController.recalculateBudget);
};
