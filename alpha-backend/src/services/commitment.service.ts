import { BudgetBucket, CommitmentFlexibility, CommitmentStatus, ExpenseFrequency, OccurrenceStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { addDays, addMonths, addWeeks, addYears } from 'date-fns';

export interface CreateCommitmentDto {
  userId: string;
  name: string;
  amount: number;
  frequency: ExpenseFrequency;
  nextDueDate: Date;
  budgetBucket?: BudgetBucket;
  flexibility?: CommitmentFlexibility;
}

export class CommitmentService {
  /**
   * Creates a new financial commitment and its first occurrence.
   */
  public static async createCommitment(dto: CreateCommitmentDto) {
    return await prisma.$transaction(async (tx) => {
      const commitment = await tx.financialCommitment.create({
        data: {
          userId: dto.userId,
          name: dto.name,
          amount: dto.amount,
          frequency: dto.frequency,
          nextDueDate: dto.nextDueDate,
          budgetBucket: dto.budgetBucket || BudgetBucket.NEEDS,
          flexibility: dto.flexibility || CommitmentFlexibility.FIXED,
          status: CommitmentStatus.ACTIVE
        }
      });

      // Find if there's an active cycle covering the due date
      const activeCycle = await tx.financialCycle.findFirst({
        where: {
          userId: dto.userId,
          startDate: { lte: dto.nextDueDate },
          endDate: { gte: dto.nextDueDate }
        }
      });

      await tx.commitmentOccurrence.create({
        data: {
          commitmentId: commitment.id,
          cycleId: activeCycle?.id,
          dueDate: dto.nextDueDate,
          amount: dto.amount,
          status: OccurrenceStatus.UPCOMING
        }
      });

      return commitment;
    });
  }

  /**
   * Marks a commitment occurrence as paid.
   */
  public static async payOccurrence(occurrenceId: string, transactionId: string) {
    return await prisma.$transaction(async (tx) => {
      const occurrence = await tx.commitmentOccurrence.update({
        where: { id: occurrenceId },
        data: {
          status: OccurrenceStatus.PAID,
          paidTransactionId: transactionId
        },
        include: { commitment: true }
      });

      // Generate the next occurrence date based on frequency
      let nextDate = new Date(occurrence.dueDate);
      const freq = occurrence.commitment.frequency;
      if (freq === ExpenseFrequency.MONTHLY) nextDate = addMonths(nextDate, 1);
      else if (freq === ExpenseFrequency.WEEKLY) nextDate = addWeeks(nextDate, 1);
      else if (freq === ExpenseFrequency.YEARLY) nextDate = addYears(nextDate, 1);
      else if (freq === ExpenseFrequency.DAILY) nextDate = addDays(nextDate, 1);
      
      if (freq !== ExpenseFrequency.ONE_TIME) {
        // Update commitment next due date
        await tx.financialCommitment.update({
          where: { id: occurrence.commitmentId },
          data: { nextDueDate: nextDate }
        });

        // Try to find the cycle for the new date
        const nextCycle = await tx.financialCycle.findFirst({
          where: {
            userId: occurrence.commitment.userId,
            startDate: { lte: nextDate },
            endDate: { gte: nextDate }
          }
        });

        // Create the next occurrence
        await tx.commitmentOccurrence.create({
          data: {
            commitmentId: occurrence.commitmentId,
            cycleId: nextCycle?.id,
            dueDate: nextDate,
            amount: occurrence.commitment.amount,
            status: OccurrenceStatus.UPCOMING
          }
        });
      } else {
        // One-time commitment completed
        await tx.financialCommitment.update({
          where: { id: occurrence.commitmentId },
          data: { status: CommitmentStatus.COMPLETED }
        });
      }

      return occurrence;
    });
  }

  /**
   * Links unlinked upcoming occurrences to a newly opened cycle.
   */
  public static async linkOccurrencesToCycle(userId: string, cycleId: string, startDate: Date, endDate: Date) {
    await prisma.commitmentOccurrence.updateMany({
      where: {
        commitment: { userId },
        cycleId: null,
        dueDate: {
          gte: startDate,
          lte: endDate
        },
        status: { in: [OccurrenceStatus.UPCOMING, OccurrenceStatus.DUE, OccurrenceStatus.OVERDUE] }
      },
      data: {
        cycleId
      }
    });
  }
}
