import { BucketBalanceService } from '../../services/bucket-balance.service';
import prismaMock from '../../lib/__mocks__/prisma';
import { BudgetBucket, TransactionDirection, TransactionStatus, OccurrenceStatus } from '@prisma/client';

describe('BucketBalanceService', () => {
  describe('getBucketStatus', () => {
    it('should correctly calculate the remaining amount for NEEDS including unpaid commitments', async () => {
      // Mock cycle snapshot
      prismaMock.financialCycle.findUnique.mockResolvedValue({
        id: 'cycle-1',
        allocationSnapshot: {
          needsTarget: 500, // 500 Allocated
          wantsTarget: 300,
          savingsTarget: 200,
        }
      } as any);

      // Mock paid expenses (actual spent) = 150
      prismaMock.transaction.aggregate.mockResolvedValue({
        _sum: { amount: 150 }
      } as any);

      // Mock unpaid commitments (reserved) = 100
      prismaMock.commitmentOccurrence.aggregate.mockResolvedValue({
        _sum: { amount: 100 }
      } as any);

      const status = await BucketBalanceService.getBucketStatus('cycle-1', BudgetBucket.NEEDS);

      expect(status.allocatedAmount).toBe(500);
      expect(status.actualAmount).toBe(150);
      
      // remainingAmount = 500 - 150 (spent) - 100 (reserved) = 250
      expect(status.remainingAmount).toBe(250);
      
      // usagePercent = ((150 + 100) / 500) * 100 = (250 / 500) * 100 = 50%
      expect(status.usagePercent).toBe(50);
      expect(status.status).toBe('Moderate');
    });

    it('should correctly calculate the remaining amount for WANTS without commitments', async () => {
      prismaMock.financialCycle.findUnique.mockResolvedValue({
        id: 'cycle-1',
        allocationSnapshot: {
          needsTarget: 500,
          wantsTarget: 300, // 300 Allocated
          savingsTarget: 200,
        }
      } as any);

      // Mock paid expenses (actual spent) = 280
      prismaMock.transaction.aggregate.mockResolvedValue({
        _sum: { amount: 280 }
      } as any);

      const status = await BucketBalanceService.getBucketStatus('cycle-1', BudgetBucket.WANTS);

      expect(status.allocatedAmount).toBe(300);
      expect(status.actualAmount).toBe(280);
      
      // remainingAmount = 300 - 280 = 20
      expect(status.remainingAmount).toBe(20);
      
      // usagePercent = (280 / 300) * 100 = 93.33%
      expect(status.usagePercent).toBeCloseTo(93.33, 2);
      expect(status.status).toBe('Critical');
    });

    it('should throw an error if cycle or snapshot does not exist', async () => {
      prismaMock.financialCycle.findUnique.mockResolvedValue(null);

      await expect(BucketBalanceService.getBucketStatus('cycle-invalid', BudgetBucket.NEEDS))
        .rejects
        .toThrow('Cycle or allocation snapshot not found');
    });
  });
});
