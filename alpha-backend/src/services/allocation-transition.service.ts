import { BudgetBucket, TransitionPlanStatus } from '@prisma/client';
import prisma from '../lib/prisma';

export interface CreateTransitionPlanDto {
  userId: string;
  stepBps: number;
  startNeedsBps: number;
  startWantsBps: number;
  startSavingsBps: number;
  targetNeedsBps: number;
  targetWantsBps: number;
  targetSavingsBps: number;
  fundingBucket: BudgetBucket;
}

export class AllocationTransitionService {
  /**
   * Preview a transition plan before creating it
   */
  public static previewTransitionPlan(dto: CreateTransitionPlanDto) {
    // Just a basic preview logic returning expected steps
    const totalDiff = Math.abs(dto.targetSavingsBps - dto.startSavingsBps);
    const stepsCount = Math.ceil(totalDiff / dto.stepBps);
    return {
      stepsCount,
      estimatedCycles: stepsCount,
      targetSavingsBps: dto.targetSavingsBps
    };
  }

  /**
   * Creates and approves a new transition plan
   */
  public static async createTransitionPlan(dto: CreateTransitionPlanDto) {
    return await prisma.allocationTransitionPlan.create({
      data: {
        userId: dto.userId,
        status: TransitionPlanStatus.ACTIVE,
        currentStep: 1,
        stepBps: dto.stepBps,
        startNeedsBps: dto.startNeedsBps,
        startWantsBps: dto.startWantsBps,
        startSavingsBps: dto.startSavingsBps,
        targetNeedsBps: dto.targetNeedsBps,
        targetWantsBps: dto.targetWantsBps,
        targetSavingsBps: dto.targetSavingsBps,
        fundingBucket: dto.fundingBucket,
        approved_at: new Date()
      }
    });
  }

  public static async pauseTransition(planId: string, userId: string) {
    return await prisma.allocationTransitionPlan.update({
      where: { id: planId, userId },
      data: {
        status: TransitionPlanStatus.PAUSED,
        paused_at: new Date()
      }
    });
  }

  public static async resumeTransition(planId: string, userId: string) {
    return await prisma.allocationTransitionPlan.update({
      where: { id: planId, userId },
      data: {
        status: TransitionPlanStatus.ACTIVE,
        paused_at: null
      }
    });
  }

  public static async deleteTransition(planId: string, userId: string) {
    return await prisma.allocationTransitionPlan.update({
      where: { id: planId, userId },
      data: {
        status: TransitionPlanStatus.CANCELLED
      }
    });
  }
}
