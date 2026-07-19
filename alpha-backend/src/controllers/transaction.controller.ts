import { FastifyRequest, FastifyReply } from 'fastify';
import { TransactionService, RecordTransactionDto } from '../services/transaction.service';
import prisma from '../lib/prisma';
import { TransactionStatus } from '@prisma/client';

export class TransactionController {
  static async createTransaction(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const data = request.body as any;

    try {
      const transaction = await TransactionService.recordTransaction({
        ...data,
        userId
      });

      return reply.code(201).send({
        success: true,
        data: transaction
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        message: error.message || 'Failed to create transaction'
      });
    }
  }

  static async getUserTransactions(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const { cycleId, status, limit = 50, offset = 0 } = request.query as any;

    try {
      const where: any = { userId };
      if (cycleId) where.cycleId = cycleId;
      if (status) where.status = status;

      const transactions = await prisma.transaction.findMany({
        where,
        take: Number(limit),
        skip: Number(offset),
        orderBy: { occurredAt: 'desc' }
      });

      const total = await prisma.transaction.count({ where });

      return reply.send({
        success: true,
        data: transactions,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset)
        }
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        message: 'Failed to fetch transactions'
      });
    }
  }

  static async getTransactionById(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const { id } = request.params as { id: string };

    try {
      const transaction = await prisma.transaction.findFirst({
        where: { id, userId }
      });

      if (!transaction) {
        return reply.code(404).send({
          success: false,
          message: 'Transaction not found'
        });
      }

      return reply.send({
        success: true,
        data: transaction
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        message: 'Failed to fetch transaction'
      });
    }
  }

  static async updateTransaction(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const { id } = request.params as { id: string };
    const data = request.body as any;

    try {
      const transaction = await prisma.transaction.findFirst({
        where: { id, userId }
      });

      if (!transaction) {
        return reply.code(404).send({
          success: false,
          message: 'Transaction not found'
        });
      }

      const updated = await TransactionService.updateTransaction(id, data);

      return reply.send({
        success: true,
        message: 'Transaction updated successfully',
        data: updated
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        message: 'Failed to update transaction'
      });
    }
  }

  static async confirmTransaction(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const { id } = request.params as { id: string };

    try {
      const transaction = await prisma.transaction.findFirst({
        where: { id, userId }
      });

      if (!transaction) {
        return reply.code(404).send({
          success: false,
          message: 'Transaction not found'
        });
      }

      if (transaction.status === TransactionStatus.CONFIRMED) {
        return reply.code(400).send({
          success: false,
          message: 'Transaction is already confirmed'
        });
      }

      const updated = await prisma.transaction.update({
        where: { id },
        data: {
          status: TransactionStatus.CONFIRMED,
          confirmedAt: new Date()
        }
      });

      return reply.send({
        success: true,
        message: 'Transaction confirmed successfully',
        data: updated
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        message: 'Failed to confirm transaction'
      });
    }
  }

  static async cancelTransaction(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const { id } = request.params as { id: string };

    try {
      const transaction = await prisma.transaction.findFirst({
        where: { id, userId }
      });

      if (!transaction) {
        return reply.code(404).send({
          success: false,
          message: 'Transaction not found'
        });
      }

      const updated = await TransactionService.cancelTransaction(id);

      return reply.send({
        success: true,
        message: 'Transaction cancelled successfully',
        data: updated
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        message: 'Failed to cancel transaction'
      });
    }
  }
}
