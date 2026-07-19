import { FastifyInstance } from 'fastify';
import { CycleController } from '../controllers/cycle.controller';
import { authenticate } from '../middleware/auth.middleware';

export const cycleRoutes = async (fastify: FastifyInstance) => {
  fastify.get('/cycles/current', { preHandler: [authenticate] }, CycleController.getCurrentCycle);
  fastify.get('/cycles/:id', { preHandler: [authenticate] }, CycleController.getCycleById);
  fastify.get('/cycles/current/buckets', { preHandler: [authenticate] }, CycleController.getBucketsStatus);
  fastify.get('/cycles/current/settlement-preview', { preHandler: [authenticate] }, CycleController.previewSettlement);
  fastify.post('/cycles/current/settlement', { preHandler: [authenticate] }, CycleController.executeSettlement);
  fastify.post('/cycles/current/close', { preHandler: [authenticate] }, CycleController.executeSettlement);
}
