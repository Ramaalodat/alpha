import { CycleSettlementService } from '../../services/cycle-settlement.service';
import prismaMock from '../../lib/__mocks__/prisma';
import { CycleStatus, SettlementActionType, BudgetBucket } from '@prisma/client';
import { TransactionService } from '../../services/transaction.service';

// Mock TransactionService
jest.mock('../../services/transaction.service', () => ({
  TransactionService: {
    getCycleSpendingSummary: jest.fn().mockResolvedValue({
      'NEEDS': 400,
      'WANTS': 250,
      'SAVINGS': 0,
    }),
    getCycleIncomeSummary: jest.fn().mockResolvedValue(1000),
  }
}));

describe('CycleSettlementService', () => {
  describe('previewSettlement', () => {
    it('should correctly calculate the surplus for a given cycle', async () => {
      // Mock cycle data
      prismaMock.financialCycle.findUnique.mockResolvedValue({
        id: 'cycle-1',
        status: CycleStatus.OPEN,
        expectedIncome: 1000,
        unexpectedIncome: 50,
        allocationSnapshot: {
          needsTarget: 500,
          wantsTarget: 300,
          savingsTarget: 200,
        }
      } as any);

      const preview = await CycleSettlementService.previewSettlement('cycle-1');

      // Total Income = 1000 (recurring) + 50 (unexpected) = 1050
      // Total Outflow = 400 (needs) + 250 (wants) + 0 (savings) = 650
      // Surplus = 1050 - 650 = 400

      expect(preview.surplus).toBe(400);
      expect(preview.deficit).toBe(0);
      expect(preview.expectedIncome).toBe(1000);
      expect(preview.actualRecurringIncome).toBe(1000);
      expect(preview.unexpectedIncome).toBe(50);
      expect(preview.actualNeeds).toBe(400);
    });
  });

  describe('executeSettlement', () => {
    it('should throw an error if actions exceed the available surplus', async () => {
      prismaMock.financialCycle.findUnique.mockResolvedValue({
        id: 'cycle-1',
        status: CycleStatus.OPEN,
        expectedIncome: 1000,
        unexpectedIncome: 0,
        allocationSnapshot: {
          needsTarget: 500,
          wantsTarget: 300,
          savingsTarget: 200,
        }
      } as any);

      // Surplus is 350 (1000 income - 650 spent)
      const actions = [
        { actionType: SettlementActionType.GOAL_ALLOCATION, amount: 400, targetGoalId: 'goal-1' } // Exceeds 350
      ];

      await expect(CycleSettlementService.executeSettlement('cycle-1', actions))
        .rejects
        .toThrow('Total settlement actions amount exceeds available surplus.');
    });

    it('should correctly execute settlement actions when valid', async () => {
      prismaMock.financialCycle.findUnique.mockResolvedValue({
        id: 'cycle-1',
        status: CycleStatus.OPEN,
        expectedIncome: 1000,
        unexpectedIncome: 0,
        allocationSnapshot: {
          needsTarget: 500,
          wantsTarget: 300,
          savingsTarget: 200,
        }
      } as any);

      // 1. Mock transaction setup
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaMock as any);
      });

      // 2. Mock creation of settlement and cycle update
      prismaMock.cycleSettlement.create.mockResolvedValue({ id: 'settlement-1' } as any);
      prismaMock.settlementAction.create.mockResolvedValue({} as any);
      prismaMock.financialCycle.update.mockResolvedValue({} as any);

      // Surplus is 350. Let's transfer 200 to a goal and carry over 150.
      const actions = [
        { actionType: SettlementActionType.GOAL_ALLOCATION, amount: 200, targetGoalId: 'goal-1' },
        { actionType: SettlementActionType.CARRY_FORWARD, amount: 150 }
      ];

      const result = await CycleSettlementService.executeSettlement('cycle-1', actions);

      expect(result.id).toBe('settlement-1');
      expect(prismaMock.cycleSettlement.create).toHaveBeenCalled();
      expect(prismaMock.settlementAction.create).toHaveBeenCalledTimes(2);
      expect(prismaMock.financialCycle.update).toHaveBeenCalledWith({
        where: { id: 'cycle-1' },
        data: {
          status: CycleStatus.CLOSED,
          closedAt: expect.any(Date)
        }
      });
    });
  });
});
