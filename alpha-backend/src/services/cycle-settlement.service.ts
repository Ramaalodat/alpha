import { CycleStatus, SettlementActionType, BudgetBucket, TransactionDirection, TransactionStatus, OccurrenceStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { TransactionService } from './transaction.service';
import { BucketBalanceService } from './bucket-balance.service';

export interface SettlementActionDto {
  actionType: SettlementActionType;
  amount: number;
  targetGoalId?: string;
}

export class CycleSettlementService {
  /**
   * Prepares a preview of the settlement numbers without closing the cycle.
   */
  public static async previewSettlement(cycleId: string) {
    const cycle = await prisma.financialCycle.findUnique({
      where: { id: cycleId },
      include: { allocationSnapshot: true }
    });

    if (!cycle || cycle.status === CycleStatus.CLOSED) {
      throw new Error('Cycle is not open or does not exist.');
    }

    const spending = await TransactionService.getCycleSpendingSummary(cycleId);
    const actualRecurringIncome = await TransactionService.getCycleIncomeSummary(cycleId); // Simplified: Should ideally separate recurring vs unexpected

    const snapshot = cycle.allocationSnapshot!;

    const plannedNeeds = Number(snapshot.needsTarget);
    const plannedWants = Number(snapshot.wantsTarget);
    const plannedSavings = Number(snapshot.savingsTarget);

    const actualNeeds = spending[BudgetBucket.NEEDS] || 0;
    const actualWants = spending[BudgetBucket.WANTS] || 0;
    const actualSavings = spending[BudgetBucket.SAVINGS] || 0; // This should be actual contributions to goals/savings

    const totalIncome = actualRecurringIncome + Number(cycle.unexpectedIncome);
    const totalOutflow = actualNeeds + actualWants + actualSavings;

    const netResult = totalIncome - totalOutflow;
    const surplus = netResult > 0 ? netResult : 0;
    const deficit = netResult < 0 ? Math.abs(netResult) : 0;

    return {
      expectedIncome: Number(cycle.expectedIncome),
      actualRecurringIncome,
      unexpectedIncome: Number(cycle.unexpectedIncome),
      plannedNeeds,
      actualNeeds,
      plannedWants,
      actualWants,
      plannedSavings,
      actualSavings,
      surplus,
      deficit
    };
  }

  /**
   * Closes a cycle and executes the settlement actions atomically.
   */
  public static async executeSettlement(cycleId: string, actions: SettlementActionDto[]) {
    const preview = await this.previewSettlement(cycleId);

    // Validate that actions do not exceed surplus
    const actionsTotal = actions.reduce((sum, act) => sum + act.amount, 0);
    if (actionsTotal > preview.surplus) {
      throw new Error('Total settlement actions amount exceeds available surplus.');
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Create the Settlement record
      const settlement = await tx.cycleSettlement.create({
        data: {
          cycleId,
          expectedIncome: preview.expectedIncome,
          actualRecurringIncome: preview.actualRecurringIncome,
          unexpectedIncome: preview.unexpectedIncome,
          plannedNeeds: preview.plannedNeeds,
          actualNeeds: preview.actualNeeds,
          plannedWants: preview.plannedWants,
          actualWants: preview.actualWants,
          plannedSavings: preview.plannedSavings,
          actualSavings: preview.actualSavings,
          surplus: preview.surplus,
          deficit: preview.deficit,
          status: CycleStatus.CLOSED,
          approvedAt: new Date(),
          closedAt: new Date()
        }
      });

      // 2. Execute and store actions
      for (const action of actions) {
        await tx.settlementAction.create({
          data: {
            settlementId: settlement.id,
            actionType: action.actionType,
            amount: action.amount,
            targetGoalId: action.targetGoalId
          }
        });

        // Apply specific side effects of the actions
        if (action.actionType === SettlementActionType.GOAL_ALLOCATION && action.targetGoalId) {
          // Add transaction to goal
          const goal = await tx.financialGoal.findUnique({ where: { id: action.targetGoalId } });
          if (goal) {
            await tx.goalTransaction.create({
              data: {
                userId: goal.userId,
                goalId: goal.id,
                amount: action.amount,
                transactionType: 'DEPOSIT',
                description: 'Cycle settlement surplus allocation',
                balanceBefore: goal.currentAmount,
                balanceAfter: Number(goal.currentAmount) + action.amount,
                transactionDate: new Date(),
                cycleId
              }
            });

            await tx.financialGoal.update({
              where: { id: goal.id },
              data: { currentAmount: { increment: action.amount } }
            });
          }
        }
        // Additional side effects (Emergency Fund, etc.) would be handled similarly
      }

      // 3. Mark Cycle as Closed
      await tx.financialCycle.update({
        where: { id: cycleId },
        data: {
          status: CycleStatus.CLOSED,
          closedAt: new Date()
        }
      });

      // 4. Cancel any unpaid commitments?
      // According to PDF: Unpaid commitments remain.
      
      return settlement;
    });
  }
}
