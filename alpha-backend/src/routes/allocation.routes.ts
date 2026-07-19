import { FastifyInstance } from 'fastify';
import { AllocationController } from '../controllers/allocation.controller';
import { authenticate } from '../middleware/auth.middleware';

export const allocationRoutes = async (fastify: FastifyInstance) => {
  fastify.post('/financial-profile/allocation-preview', { preHandler: [authenticate] }, AllocationController.previewAllocation);
  fastify.get('/financial-profile/allocation', { preHandler: [authenticate] }, AllocationController.getAllocation);
  fastify.put('/financial-profile/allocation', { preHandler: [authenticate] }, AllocationController.setAllocation);
  fastify.post('/financial-profile/allocation/reset', { preHandler: [authenticate] }, AllocationController.resetAllocation);

  /**
   * Transition endpoints
   */
  fastify.post('/transition/preview', AllocationController.previewTransition);
  fastify.post('/transition/approve', AllocationController.approveTransition);
  fastify.post('/transition/:id/pause', AllocationController.pauseTransition);
  fastify.post('/transition/:id/resume', AllocationController.resumeTransition);
  fastify.delete('/transition/:id', AllocationController.deleteTransition);
}
