import { CycleStatus, AllocationSource } from '@prisma/client';
import prisma from '../lib/prisma';
import { AllocationService } from './allocation.service';
import { addMonths, endOfMonth, startOfMonth } from 'date-fns';

export class CycleService {
  /**
   * Starts a new financial cycle for the user.
   * Ensures no other open cycles exist.
   */
  public static async startCycle(userId: string, expectedIncome: number, startDate?: Date, endDate?: Date) {
    const existingOpenCycle = await prisma.financialCycle.findFirst({
      where: { userId, status: CycleStatus.OPEN }
    });

    if (existingOpenCycle) {
      throw new Error('User already has an open financial cycle. Close it before starting a new one.');
    }

    // Determine cycle dates
    const cycleStart = startDate || new Date();
    const cycleEnd = endDate || endOfMonth(addMonths(cycleStart, 1)); // Default to end of next month roughly if not specified

    // Calculate allocation based on expected income
    const plan = await AllocationService.getUserAllocationPlan(userId, expectedIncome);
    const amounts = AllocationService.calculateAllocation(expectedIncome, plan);

    // Find the source
    const pref = await prisma.allocationPreference.findUnique({ where: { userId } });
    const source = pref ? pref.source : AllocationSource.SYSTEM_TIER;

    // Use atomic transaction to create cycle and its snapshot
    return await prisma.$transaction(async (tx) => {
      const cycle = await tx.financialCycle.create({
        data: {
          userId,
          startDate: cycleStart,
          endDate: cycleEnd,
          expectedIncome,
          status: CycleStatus.OPEN
        }
      });

      await tx.cycleAllocationSnapshot.create({
        data: {
          cycleId: cycle.id,
          allocationBaseIncome: expectedIncome,
          allocationSource: source,
          needsBps: plan.needsBps,
          wantsBps: plan.wantsBps,
          savingsBps: plan.savingsBps,
          needsTarget: amounts.needsAmount,
          wantsTarget: amounts.wantsAmount,
          savingsTarget: amounts.savingsAmount,
          policyVersion: '1.0',
          calculationVersion: '1.0'
        }
      });

      return cycle;
    });
  }

  /**
   * Gets the currently active cycle for a user.
   */
  public static async getCurrentCycle(userId: string) {
    return await prisma.financialCycle.findFirst({
      where: { userId, status: CycleStatus.OPEN },
      include: {
        allocationSnapshot: true
      }
    });
  }

  /**
   * Gets a specific cycle by ID for a user.
   */
  public static async getCycleById(userId: string, cycleId: string) {
    return await prisma.financialCycle.findFirst({
      where: { id: cycleId, userId },
      include: {
        allocationSnapshot: true,
        transactions: true,
        savingsAllocations: true,
        goalAllocations: true,
        settlement: true
      }
    });
  }

  /**
   * Prepares a cycle for settlement.
   */
  public static async markSettlementPending(cycleId: string) {
    return await prisma.financialCycle.update({
      where: { id: cycleId },
      data: {
        status: CycleStatus.SETTLEMENT_PENDING,
        settlementStartedAt: new Date()
      }
    });
  }
}
