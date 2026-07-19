import { FastifyInstance } from 'fastify';
import { CommitmentController } from '../controllers/commitment.controller';
import { authenticate, requireOnboarding } from '../middleware/auth.middleware';

export const commitmentRoutes = async (fastify: FastifyInstance) => {
  // All routes require authentication and completed onboarding
  fastify.addHook('onRequest', authenticate);
  fastify.addHook('onRequest', requireOnboarding);

  /**
   * @route   POST /api/commitments
   * @desc    Create new commitment
   * @access  Private
   */
  fastify.post('/', CommitmentController.createCommitment);

  /**
   * @route   GET /api/commitments
   * @desc    Get all user commitments
   * @access  Private
   */
  fastify.get('/', CommitmentController.getUserCommitments);

  /**
   * @route   GET /api/commitments/:id
   * @desc    Get commitment by ID
   * @access  Private
   */
  fastify.get('/:id', CommitmentController.getCommitmentById);

  /**
   * @route   PATCH /api/commitments/:id
   * @desc    Update commitment
   * @access  Private
   */
  fastify.patch('/:id', CommitmentController.updateCommitment);

  /**
   * @route   DELETE /api/commitments/:id
   * @desc    Delete commitment
   * @access  Private
   */
  fastify.delete('/:id', CommitmentController.deleteCommitment);
};
