import { FastifyRequest, FastifyReply } from 'fastify';
import { CommitmentService, CreateCommitmentDto } from '../services/commitment.service';
import prisma from '../lib/prisma';
import { CommitmentStatus } from '@prisma/client';

export class CommitmentController {
  static async createCommitment(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const data = request.body as any;

    try {
      const commitment = await CommitmentService.createCommitment({
        ...data,
        userId
      } as CreateCommitmentDto);

      return reply.code(201).send({
        success: true,
        data: commitment
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        message: error.message || 'Failed to create commitment'
      });
    }
  }

  static async getUserCommitments(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const { status, limit = 50, offset = 0 } = request.query as any;

    try {
      const where: any = { userId };
      if (status) where.status = status;

      const commitments = await prisma.financialCommitment.findMany({
        where,
        take: Number(limit),
        skip: Number(offset),
        orderBy: { createdAt: 'desc' },
        include: {
          occurrences: {
            where: { status: { in: ['UPCOMING', 'DUE', 'OVERDUE'] } },
            take: 1,
            orderBy: { dueDate: 'asc' }
          }
        }
      });

      const total = await prisma.financialCommitment.count({ where });

      return reply.send({
        success: true,
        data: commitments,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset)
        }
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        message: 'Failed to fetch commitments'
      });
    }
  }

  static async getCommitmentById(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const { id } = request.params as { id: string };

    try {
      const commitment = await prisma.financialCommitment.findFirst({
        where: { id, userId },
        include: {
          occurrences: {
            orderBy: { dueDate: 'desc' },
            take: 5
          }
        }
      });

      if (!commitment) {
        return reply.code(404).send({
          success: false,
          message: 'Commitment not found'
        });
      }

      return reply.send({
        success: true,
        data: commitment
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        message: 'Failed to fetch commitment'
      });
    }
  }

  static async updateCommitment(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const { id } = request.params as { id: string };
    const updates = request.body as any;

    try {
      const commitment = await prisma.financialCommitment.findFirst({
        where: { id, userId }
      });

      if (!commitment) {
        return reply.code(404).send({
          success: false,
          message: 'Commitment not found'
        });
      }

      const updated = await prisma.financialCommitment.update({
        where: { id },
        data: updates
      });

      return reply.send({
        success: true,
        message: 'Commitment updated successfully',
        data: updated
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        message: 'Failed to update commitment'
      });
    }
  }

  static async deleteCommitment(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user!.userId;
    const { id } = request.params as { id: string };

    try {
      const commitment = await prisma.financialCommitment.findFirst({
        where: { id, userId }
      });

      if (!commitment) {
        return reply.code(404).send({
          success: false,
          message: 'Commitment not found'
        });
      }

      // Mark as CANCELLED instead of hard delete
      const updated = await prisma.financialCommitment.update({
        where: { id },
        data: {
          status: CommitmentStatus.CANCELLED
        }
      });

      return reply.send({
        success: true,
        message: 'Commitment deleted successfully',
        data: updated
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        message: 'Failed to delete commitment'
      });
    }
  }
}
