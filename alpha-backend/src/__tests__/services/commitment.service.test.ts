import { CommitmentService } from '../../services/commitment.service';
import prismaMock from '../../lib/__mocks__/prisma';
import { CommitmentStatus, ExpenseFrequency, OccurrenceStatus, BudgetBucket, CommitmentFlexibility } from '@prisma/client';
import { addMonths } from 'date-fns';

describe('CommitmentService', () => {
  describe('payOccurrence', () => {
    it('should correctly mark occurrence as paid and create the next occurrence for monthly frequency', async () => {
      const initialDate = new Date('2026-07-01T00:00:00Z');
      const expectedNextDate = addMonths(initialDate, 1);

      // 1. Mock the transaction setup
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaMock as any);
      });

      // 2. Mock updating the current occurrence
      prismaMock.commitmentOccurrence.update.mockResolvedValue({
        id: 'occ-1',
        commitmentId: 'com-1',
        cycleId: 'cycle-1',
        dueDate: initialDate,
        amount: 50,
        status: OccurrenceStatus.PAID,
        paidTransactionId: 'txn-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        commitment: {
          id: 'com-1',
          userId: 'user-1',
          name: 'Internet Bill',
          amount: 50,
          frequency: ExpenseFrequency.MONTHLY,
          nextDueDate: initialDate,
          budgetBucket: BudgetBucket.NEEDS,
          flexibility: CommitmentFlexibility.FIXED,
          status: CommitmentStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date()
        } as any
      } as any);

      // 3. Mock updating the commitment
      prismaMock.financialCommitment.update.mockResolvedValue({} as any);

      // 4. Mock finding the next cycle
      prismaMock.financialCycle.findFirst.mockResolvedValue({
        id: 'cycle-2'
      } as any);

      // 5. Mock creating the new occurrence
      prismaMock.commitmentOccurrence.create.mockResolvedValue({} as any);

      // Execute
      const result = await CommitmentService.payOccurrence('occ-1', 'txn-1');

      // Assertions
      expect(result.status).toBe(OccurrenceStatus.PAID);
      expect(result.paidTransactionId).toBe('txn-1');

      // Verify it updated the commitment with the new date
      expect(prismaMock.financialCommitment.update).toHaveBeenCalledWith({
        where: { id: 'com-1' },
        data: { nextDueDate: expectedNextDate }
      });

      // Verify it created the next occurrence
      expect(prismaMock.commitmentOccurrence.create).toHaveBeenCalledWith({
        data: {
          commitmentId: 'com-1',
          cycleId: 'cycle-2', // Linked correctly
          dueDate: expectedNextDate,
          amount: 50,
          status: OccurrenceStatus.UPCOMING
        }
      });
    });
  });
});
