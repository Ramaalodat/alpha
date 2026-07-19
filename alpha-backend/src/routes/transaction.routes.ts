import { FastifyInstance } from 'fastify';
import { TransactionController } from '../controllers/transaction.controller';
import { authenticate, requireOnboarding } from '../middleware/auth.middleware';

export const transactionRoutes = async (fastify: FastifyInstance) => {
  // All routes require authentication and completed onboarding
  fastify.addHook('onRequest', authenticate);
  fastify.addHook('onRequest', requireOnboarding);

  /**
   * @route   POST /api/transactions
   * @desc    Create new transaction
   * @access  Private
   */
  fastify.post('/', TransactionController.createTransaction);

  /**
   * @route   GET /api/transactions
   * @desc    Get all user transactions
   * @access  Private
   */
  fastify.get('/', TransactionController.getUserTransactions);

  /**
   * @route   GET /api/transactions/:id
   * @desc    Get transaction by ID
   * @access  Private
   */
  fastify.get('/:id', TransactionController.getTransactionById);

  /**
   * @route   PATCH /api/transactions/:id
   * @desc    Update transaction
   * @access  Private
   */
  fastify.patch('/:id', TransactionController.updateTransaction);

  /**
   * @route   POST /api/transactions/:id/confirm
   * @desc    Confirm transaction
   * @access  Private
   */
  fastify.post('/:id/confirm', TransactionController.confirmTransaction);

  /**
   * @route   POST /api/transactions/:id/cancel
   * @desc    Cancel transaction
   * @access  Private
   */
  fastify.post('/:id/cancel', TransactionController.cancelTransaction);
};
