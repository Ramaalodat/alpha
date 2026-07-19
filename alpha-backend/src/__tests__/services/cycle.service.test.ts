import { CycleService } from '../../services/cycle.service';
import prismaMock from '../../lib/__mocks__/prisma';
import { CycleStatus, AllocationSource } from '@prisma/client';

// Mock the dependencies
jest.mock('../../services/allocation.service', () => ({
  AllocationService: {
    getUserAllocationPlan: jest.fn().mockResolvedValue({
      needsBps: 5000,
      wantsBps: 3000,
      savingsBps: 2000,
    }),
    calculateAllocation: jest.fn().mockReturnValue({
      needsAmount: 500,
      wantsAmount: 300,
      savingsAmount: 200,
    }),
  }
}));

describe('CycleService', () => {
  describe('startCycle', () => {
    it('should throw an error if an open cycle already exists', async () => {
      // Mock that there is an open cycle
      prismaMock.financialCycle.findFirst.mockResolvedValue({
        id: 'cycle-1',
        userId: 'user-1',
        status: CycleStatus.OPEN,
        expectedIncome: 1000,
        startDate: new Date(),
        endDate: new Date(),
        unexpectedIncome: 0,
        settlementStartedAt: null,
        closedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any);

      await expect(CycleService.startCycle('user-1', 1000))
        .rejects
        .toThrow('User already has an open financial cycle. Close it before starting a new one.');
    });

    it('should successfully create a new cycle if no open cycles exist', async () => {
      // Mock no open cycles
      prismaMock.financialCycle.findFirst.mockResolvedValue(null);

      // Mock preferences
      prismaMock.allocationPreference.findUnique.mockResolvedValue({
        id: 'pref-1',
        userId: 'user-1',
        source: AllocationSource.SYSTEM_TIER,
        needsBps: 0,
        wantsBps: 0,
        savingsBps: 0,
        basedOnIncome: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Mock the transaction creation returning a mock cycle
      const mockCycle = {
        id: 'new-cycle',
        userId: 'user-1',
        expectedIncome: 1000,
        status: CycleStatus.OPEN,
      };
      
      prismaMock.$transaction.mockImplementation(async (callback) => {
        // We pass the mocked prisma instance directly into the transaction callback
        return await callback(prismaMock as any);
      });

      prismaMock.financialCycle.create.mockResolvedValue(mockCycle as any);
      prismaMock.cycleAllocationSnapshot.create.mockResolvedValue({} as any);

      const result = await CycleService.startCycle('user-1', 1000);

      expect(result).toEqual(mockCycle);
      expect(prismaMock.financialCycle.create).toHaveBeenCalled();
      expect(prismaMock.cycleAllocationSnapshot.create).toHaveBeenCalled();
    });
  });
});
