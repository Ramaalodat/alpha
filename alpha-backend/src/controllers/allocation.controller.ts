import { FastifyRequest, FastifyReply } from 'fastify';
import { AllocationService, AllocationPlan } from '../services/allocation.service';
import { AllocationTransitionService, CreateTransitionPlanDto } from '../services/allocation-transition.service';
import { AllocationSource } from '@prisma/client';

export class AllocationController {
  static async previewAllocation(request: FastifyRequest, reply: FastifyReply) {
    const { income, needsBps, wantsBps, savingsBps } = request.body as any;

    if (!AllocationService.validateBps(needsBps, wantsBps, savingsBps)) {
      return reply.code(400).send({
        success: false,
        message: 'Allocation must exactly equal 10,000 basis points (100%)'
      });
    }

    const plan: AllocationPlan = { needsBps, wantsBps, savingsBps };
    const amounts = AllocationService.calculateAllocation(income, plan);

    return reply.send({
      success: true,
      data: {
        plan,
        amounts,
        totalIncome: income
      }
    });
  }

  static async getAllocation(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    // We would typically get the user's expected income from profile
    const currentIncome = 500; // Placeholder until integrated with user profile
    const plan = await AllocationService.getUserAllocationPlan(userId, currentIncome);

    return reply.send({
      success: true,
      data: plan
    });
  }

  static async setAllocation(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const { needsBps, wantsBps, savingsBps, basedOnIncome } = request.body as any;

    try {
      const plan = await AllocationService.saveUserAllocationPlan(
        userId,
        { needsBps, wantsBps, savingsBps },
        AllocationSource.USER_ADJUSTED,
        basedOnIncome
      );

      return reply.send({
        success: true,
        message: 'Allocation preferences saved successfully.',
        data: plan
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        message: error.message
      });
    }
  }

  static async resetAllocation(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    // Current income placeholder
    const currentIncome = 500; 

    try {
      const systemPlan = await AllocationService.getSystemTierForIncome(currentIncome);
      const plan = await AllocationService.saveUserAllocationPlan(
        userId,
        systemPlan,
        AllocationSource.SYSTEM_TIER,
        currentIncome
      );

      return reply.send({
        success: true,
        message: 'Allocation preferences reset to system defaults.',
        data: plan
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        message: error.message
      });
    }
  }

  static async previewTransition(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as any;
    try {
      const preview = AllocationTransitionService.previewTransitionPlan(data as CreateTransitionPlanDto);
      return reply.send({ success: true, data: preview });
    } catch (error: any) {
      return reply.code(400).send({ success: false, message: error.message });
    }
  }

  static async approveTransition(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const data = request.body as any;
    try {
      const plan = await AllocationTransitionService.createTransitionPlan({ ...data, userId } as CreateTransitionPlanDto);
      return reply.send({ success: true, message: 'Transition approved', data: plan });
    } catch (error: any) {
      return reply.code(400).send({ success: false, message: error.message });
    }
  }

  static async pauseTransition(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const { id } = request.params as { id: string };
    try {
      const plan = await AllocationTransitionService.pauseTransition(id, userId);
      return reply.send({ success: true, message: 'Transition paused', data: plan });
    } catch (error: any) {
      return reply.code(400).send({ success: false, message: error.message });
    }
  }

  static async resumeTransition(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const { id } = request.params as { id: string };
    try {
      const plan = await AllocationTransitionService.resumeTransition(id, userId);
      return reply.send({ success: true, message: 'Transition resumed', data: plan });
    } catch (error: any) {
      return reply.code(400).send({ success: false, message: error.message });
    }
  }

  static async deleteTransition(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const { id } = request.params as { id: string };
    try {
      const plan = await AllocationTransitionService.deleteTransition(id, userId);
      return reply.send({ success: true, message: 'Transition cancelled', data: plan });
    } catch (error: any) {
      return reply.code(400).send({ success: false, message: error.message });
    }
  }
}
