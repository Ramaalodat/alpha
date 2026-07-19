import prisma from '../lib/prisma';
import { OccurrenceStatus } from '@prisma/client';
import logger from '../utils/logger';
import { startOfDay, endOfDay } from 'date-fns';

/**
 * Job that finds UPCOMING commitment occurrences that are due today
 * and marks them as DUE. Also marks past DUE occurrences as OVERDUE.
 */
export const commitmentMonitorJob = async () => {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  logger.info('Commitment Monitor: Starting job...');

  try {
    // 1. Mark UPCOMING as DUE if dueDate is exactly today
    const dueResult = await prisma.commitmentOccurrence.updateMany({
      where: {
        status: OccurrenceStatus.UPCOMING,
        dueDate: {
          gte: todayStart,
          lte: todayEnd
        }
      },
      data: {
        status: OccurrenceStatus.DUE
      }
    });

    if (dueResult.count > 0) {
      logger.info(`Commitment Monitor: Marked ${dueResult.count} occurrences as DUE.`);
      // TODO: Queue notifications for these users
    }

    // 2. Mark DUE as OVERDUE if dueDate is strictly before today
    const overdueResult = await prisma.commitmentOccurrence.updateMany({
      where: {
        status: OccurrenceStatus.DUE,
        dueDate: {
          lt: todayStart
        }
      },
      data: {
        status: OccurrenceStatus.OVERDUE
      }
    });

    if (overdueResult.count > 0) {
      logger.info(`Commitment Monitor: Marked ${overdueResult.count} occurrences as OVERDUE.`);
      // TODO: Queue urgent notifications for these users
    }

    logger.info('Commitment Monitor: Job completed successfully.');
  } catch (error: any) {
    logger.error('Commitment Monitor: Job failed.', { error: error.message });
  }
};
