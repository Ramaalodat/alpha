import { FastifyRequest, FastifyReply } from 'fastify';
import { CycleService } from '../services/cycle.service';
import { CycleSettlementService } from '../services/cycle-settlement.service';
import { BucketBalanceService } from '../services/bucket-balance.service';

export class CycleController {
  static async getCurrentCycle(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const cycle = await CycleService.getCurrentCycle(userId);

    if (!cycle) {
      return reply.code(404).send({
        success: false,
        message: 'No active cycle found for this user.'
      });
    }

    return reply.send({
      success: true,
      data: cycle
    });
  }

  static async getCycleById(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const { id } = request.params as { id: string };
    
    const cycle = await CycleService.getCycleById(userId, id);

    if (!cycle) {
      return reply.code(404).send({
        success: false,
        message: 'Cycle not found.'
      });
    }

    return reply.send({
      success: true,
      data: cycle
    });
  }

  static async getBucketsStatus(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const cycle = await CycleService.getCurrentCycle(userId);

    if (!cycle) {
      return reply.code(404).send({
        success: false,
        message: 'No active cycle found.'
      });
    }

    const statuses = await BucketBalanceService.getAllBucketsStatus(cycle.id);

    return reply.send({
      success: true,
      data: statuses
    });
  }

  static async previewSettlement(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const cycle = await CycleService.getCurrentCycle(userId);

    if (!cycle) {
      return reply.code(404).send({
        success: false,
        message: 'No active cycle found.'
      });
    }

    try {
      const preview = await CycleSettlementService.previewSettlement(cycle.id);
      return reply.send({
        success: true,
        data: preview
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        message: error.message
      });
    }
  }

  static async executeSettlement(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const { actions } = request.body as any; // Array of SettlementActionDto

    const cycle = await CycleService.getCurrentCycle(userId);

    if (!cycle) {
      return reply.code(404).send({
        success: false,
        message: 'No active cycle found.'
      });
    }

    try {
      const settlement = await CycleSettlementService.executeSettlement(cycle.id, actions);
      return reply.send({
        success: true,
        message: 'Cycle closed and settled successfully.',
        data: settlement
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        message: error.message
      });
    }
  }
}
