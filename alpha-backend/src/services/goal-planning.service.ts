import { GoalPlanningMode } from '@prisma/client';

export interface GoalPlanningResult {
  remainingAmount: number;
  requiredCycles?: number;
  requiredContribution?: number;
  isAchievable: boolean;
}

export class GoalPlanningEngine {
  /**
   * Calculates the required contribution or cycles based on the goal's planning mode.
   */
  public static calculateGoalPlan(
    targetAmount: number,
    currentAmount: number,
    planningMode: GoalPlanningMode,
    parameterValue: number // either contribution amount or number of cycles
  ): GoalPlanningResult {
    const remainingAmount = Math.max(0, targetAmount - currentAmount);

    if (remainingAmount === 0) {
      return {
        remainingAmount: 0,
        requiredCycles: 0,
        requiredContribution: 0,
        isAchievable: true
      };
    }

    if (planningMode === GoalPlanningMode.CONTRIBUTION_BASED) {
      // parameterValue is the fixed contribution
      const contribution = parameterValue;
      if (contribution <= 0) return { remainingAmount, isAchievable: false };

      const requiredCycles = Math.ceil(remainingAmount / contribution);
      
      return {
        remainingAmount,
        requiredCycles,
        requiredContribution: contribution,
        isAchievable: true
      };
    } else {
      // parameterValue is the number of cycles
      const cycles = parameterValue;
      if (cycles <= 0) return { remainingAmount, isAchievable: false };

      const requiredContribution = Math.ceil(remainingAmount / cycles);

      return {
        remainingAmount,
        requiredCycles: cycles,
        requiredContribution,
        isAchievable: true
      };
    }
  }

  /**
   * Reorders goals based on user priority, proximity to deadline, goal type, and completion percentage.
   */
  public static rankGoals(goals: any[]): any[] {
    return goals.sort((a, b) => {
      // 1. User Priority (1 to 10)
      if (a.priority !== b.priority) {
        return b.priority - a.priority; // higher priority first
      }

      // 2. Completion Percentage
      const aPercent = a.targetAmount > 0 ? a.currentAmount / a.targetAmount : 0;
      const bPercent = b.targetAmount > 0 ? b.currentAmount / b.targetAmount : 0;
      
      if (aPercent !== bPercent) {
        return bPercent - aPercent; // closer to completion first
      }

      // 3. Proximity to deadline (if applicable)
      if (a.targetDate && b.targetDate) {
        return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
      }

      return 0;
    });
  }
}
