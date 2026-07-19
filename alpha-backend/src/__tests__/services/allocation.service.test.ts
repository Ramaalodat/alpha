import { AllocationService } from '../../services/allocation.service';
import prismaMock from '../../lib/__mocks__/prisma';
import { AllocationSource, AllocationTier } from '@prisma/client';

describe('AllocationService', () => {
  describe('calculateAllocation', () => {
    it('should correctly calculate allocation amounts based on BPS', () => {
      const plan = {
        needsBps: 5000,   // 50%
        wantsBps: 3000,   // 30%
        savingsBps: 2000, // 20%
      };
      const income = 1000;

      const result = AllocationService.calculateAllocation(income, plan);

      expect(result.needsAmount).toBe(500);
      expect(result.wantsAmount).toBe(300);
      expect(result.savingsAmount).toBe(200);
    });

    it('should calculate exact integer distribution using Largest Remainder Method', () => {
      const plan = {
        needsBps: 5000,
        wantsBps: 3000,
        savingsBps: 2000,
      };
      const income = 1001; // Not perfectly divisible

      // Exact: Needs: 500.5, Wants: 300.3, Savings: 200.2
      // Remainders: Needs (0.5), Wants (0.3), Savings (0.2)
      // Since we have 1 unit remaining, it goes to Needs (highest remainder).
      // So Needs = 501, Wants = 300, Savings = 200

      const result = AllocationService.calculateAllocation(income, plan);

      expect(result.needsAmount).toBe(501);
      expect(result.wantsAmount).toBe(300);
      expect(result.savingsAmount).toBe(200);
    });
  });

  describe('getUserAllocationPlan', () => {
    it('should return custom plan if preference is CUSTOM', async () => {
      prismaMock.allocationPreference.findUnique.mockResolvedValue({
        id: '123',
        userId: 'user-1',
        source: AllocationSource.USER_ADJUSTED,
        needsBps: 6000,
        wantsBps: 2000,
        savingsBps: 2000,
        basedOnIncome: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const plan = await AllocationService.getUserAllocationPlan('user-1', 1000);

      expect(plan).toEqual({
        needsBps: 6000,
        wantsBps: 2000,
        savingsBps: 2000,
      });
    });

    it('should return tier-based plan if preference is SYSTEM_TIER', async () => {
      prismaMock.allocationPreference.findUnique.mockResolvedValue(null as any);

      prismaMock.allocationTier.findFirst.mockResolvedValue({
        id: 'tier-1',
        code: 'LOW_INCOME',
        labelAr: 'دخل منخفض',
        labelEn: 'Low Income',
        minimumIncome: 0 as any,
        maximumIncome: 1000 as any,
        needsBps: 7000,
        wantsBps: 2000,
        savingsBps: 1000,
        version: 1,
        isActive: true,
        createdAt: new Date()
      });

      const plan = await AllocationService.getUserAllocationPlan('user-1', 500);

      expect(plan).toEqual({
        needsBps: 7000,
        wantsBps: 2000,
        savingsBps: 1000,
      });
    });
  });
});
