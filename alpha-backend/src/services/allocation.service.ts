import { AllocationSource } from '@prisma/client';
import prisma from '../lib/prisma';

export interface AllocationPlan {
  needsBps: number;
  wantsBps: number;
  savingsBps: number;
}

export interface AllocationAmounts {
  needsAmount: number;
  wantsAmount: number;
  savingsAmount: number;
}

export class AllocationService {
  /**
   * Validates if the sum of basis points equals exactly 10,000 (100%).
   */
  public static validateBps(needsBps: number, wantsBps: number, savingsBps: number): boolean {
    return (needsBps + wantsBps + savingsBps) === 10000;
  }

  /**
   * Calculates the exact distribution of an amount based on the Largest Remainder Method
   * to ensure no pennies are lost during rounding.
   */
  public static calculateAllocation(amount: number, plan: AllocationPlan): AllocationAmounts {
    if (!this.validateBps(plan.needsBps, plan.wantsBps, plan.savingsBps)) {
      throw new Error('Allocation plan must sum up to exactly 10,000 BPS.');
    }

    // Exact unrounded amounts
    const exactNeeds = (amount * plan.needsBps) / 10000;
    const exactWants = (amount * plan.wantsBps) / 10000;
    const exactSavings = (amount * plan.savingsBps) / 10000;

    // Floored amounts (Base distribution)
    let needsAmount = Math.floor(exactNeeds);
    let wantsAmount = Math.floor(exactWants);
    let savingsAmount = Math.floor(exactSavings);

    // Calculate remainder
    let remaining = amount - (needsAmount + wantsAmount + savingsAmount);

    // Calculate remainders (decimals) for each bucket
    const remainders = [
      { key: 'needs', value: exactNeeds - needsAmount, priority: 3 }, // Highest priority if equal
      { key: 'wants', value: exactWants - wantsAmount, priority: 1 },
      { key: 'savings', value: exactSavings - savingsAmount, priority: 2 }
    ];

    // Sort remainders descending by value, then descending by priority
    remainders.sort((a, b) => {
      if (b.value === a.value) {
        return b.priority - a.priority;
      }
      return b.value - a.value;
    });

    // Distribute remaining full units
    for (let i = 0; i < remaining; i++) {
      const bucket = remainders[i].key;
      if (bucket === 'needs') needsAmount++;
      else if (bucket === 'wants') wantsAmount++;
      else if (bucket === 'savings') savingsAmount++;
    }

    return {
      needsAmount,
      wantsAmount,
      savingsAmount
    };
  }

  /**
   * Returns the system default tier based on user's monthly income.
   */
  public static async getSystemTierForIncome(income: number): Promise<AllocationPlan> {
    const tier = await prisma.allocationTier.findFirst({
      where: {
        isActive: true,
        minimumIncome: { lte: income },
        OR: [
          { maximumIncome: null },
          { maximumIncome: { gte: income } }
        ]
      },
      orderBy: { minimumIncome: 'desc' }
    });

    if (!tier) {
      // Fallback default (50/30/20) if no tier is found
      return { needsBps: 5000, wantsBps: 3000, savingsBps: 2000 };
    }

    return {
      needsBps: tier.needsBps,
      wantsBps: tier.wantsBps,
      savingsBps: tier.savingsBps
    };
  }

  /**
   * Retrieves the current effective allocation plan for a user.
   */
  public static async getUserAllocationPlan(userId: string, currentIncome: number): Promise<AllocationPlan> {
    const pref = await prisma.allocationPreference.findUnique({
      where: { userId }
    });

    if (pref) {
      return {
        needsBps: pref.needsBps,
        wantsBps: pref.wantsBps,
        savingsBps: pref.savingsBps
      };
    }

    // If no preference set, return system tier
    return this.getSystemTierForIncome(currentIncome);
  }

  /**
   * Saves a user's allocation preference.
   */
  public static async saveUserAllocationPlan(
    userId: string,
    plan: AllocationPlan,
    source: AllocationSource,
    basedOnIncome?: number
  ) {
    if (!this.validateBps(plan.needsBps, plan.wantsBps, plan.savingsBps)) {
      throw new Error('Allocation plan must sum up to exactly 10,000 BPS.');
    }

    return await prisma.allocationPreference.upsert({
      where: { userId },
      update: {
        needsBps: plan.needsBps,
        wantsBps: plan.wantsBps,
        savingsBps: plan.savingsBps,
        source,
        basedOnIncome
      },
      create: {
        userId,
        needsBps: plan.needsBps,
        wantsBps: plan.wantsBps,
        savingsBps: plan.savingsBps,
        source,
        basedOnIncome
      }
    });
  }
}
