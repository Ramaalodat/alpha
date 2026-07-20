import { FastifyRequest, FastifyReply } from 'fastify';
import { createSuccessResponse, createErrorResponse, ErrorCodes } from '../types/api.types';
import { HTTP_STATUS } from '../utils/constants';
import logger from '../utils/logger';
import prisma from '../lib/prisma';

export class ChatController {
  /**
   * Send message to N8N chatbot
   * POST /api/chat/message
   */
  async sendMessage(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user!.userId;
      const { text } = request.body as { text: string };

      if (!text || text.trim() === '') {
        return reply
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(createErrorResponse(ErrorCodes.VALIDATION_ERROR, 'Message text is required'));
      }

      // 1. Fetch user data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profiles: {
            where: { isCurrent: true },
            take: 1
          },
          settings: true,
        }
      });

      if (!user) {
        return reply.status(HTTP_STATUS.NOT_FOUND).send(createErrorResponse(ErrorCodes.NOT_FOUND, 'User not found'));
      }

      const profile = user.profiles[0];

      // 2. Fetch financial data (Income, Expenses, Goals)
      // Since it's an estimate for chatbot, we aggregate recent data or active data
      const expenses = await prisma.expense.findMany({
        where: { userId, deletedAt: null },
        orderBy: { expenseDate: 'desc' },
        take: 50 // Last 50 expenses
      });

      const goals = await prisma.financialGoal.findMany({
        where: { userId, deletedAt: null, status: 'ACTIVE' },
      });

      // Simple aggregations
      let totalSpent = 0;
      expenses.forEach(e => {
        totalSpent += Number(e.amount);
      });

      const monthlyIncome = profile?.monthlyIncome ? Number(profile.monthlyIncome) : 0;
      const remainingBudget = Math.max(0, monthlyIncome - totalSpent);
      const safeDailySpend = Math.max(0, remainingBudget / 30);

      // Transactions formatting
      const transactions = expenses.map(e => ({
        id: e.id,
        date: e.expenseDate.toISOString(),
        type: "expense",
        amount: Number(e.amount),
        currency: user.settings?.currency || "JOD",
        category: e.categoryId || "Other", // Using ID for now, could join category table
        subcategory: "",
        description: e.description || "",
      }));

      // Goals formatting
      const goalsList = goals.map(g => ({
        id: g.id,
        name: g.name,
        targetAmount: Number(g.targetAmount),
        savedAmount: Number(g.currentAmount),
        remainingAmount: Number(g.targetAmount) - Number(g.currentAmount),
        targetDate: g.targetDate.toISOString(),
        status: g.status.toLowerCase(),
      }));

      // Build payload for N8N
      const payload = {
        request: {
          id: Date.now().toString(),
          text: text,
          intent: "chat",
          language: user.settings?.language || "ar",
          source: "webhook",
          timestamp: new Date().toISOString()
        },
        user: {
          id: user.id,
          name: user.fullName,
          currency: user.settings?.currency || "JOD"
        },
        financial: {
          monthlyIncome: monthlyIncome,
          needs: {
            target: 0,
            spent: totalSpent * 0.7,
            remaining: 0
          },
          wants: {
            target: 0,
            spent: totalSpent * 0.3,
            remaining: 0
          },
          savings: {
            target: 0,
            saved: 0,
            remaining: 0
          },
          overall: {
            totalSpent: totalSpent,
            remainingBudget: remainingBudget
          },
          analytics: {
            projectedExpenses: totalSpent,
            safeDailySpend: safeDailySpend
          },
          commitments: {
            monthly: 0,
            unpaid: 0
          }
        },
        transactions: transactions,
        goals: goalsList,
        conversation: [
          {
            role: "user",
            content: text,
            timestamp: new Date().toISOString()
          }
        ],
        context: {
          purchase: {
            item: "",
            price: 0,
            category: ""
          },
          currentCycle: {
            status: "active",
            elapsedDays: new Date().getDate(),
            remainingDays: 30 - new Date().getDate(),
            totalDays: 30
          }
        }
      };

      // 3. Send to N8N webhook using native fetch
      const webhookUrl = 'https://n8ns.mohammadn8n.cfd/webhook/chat';
      const n8nResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      let n8nData = null;
      if (n8nResponse.ok) {
        try {
          n8nData = await n8nResponse.json();
        } catch (e) {
          n8nData = { message: "Success but empty JSON response" };
        }
      } else {
        logger.warn(`N8N webhook returned status \${n8nResponse.status}`);
      }

      return reply
        .status(HTTP_STATUS.OK)
        .send(createSuccessResponse({
          n8nResponse: n8nData,
          sentPayload: payload
        }));

    } catch (error: any) {
      logger.error('Chat webhook failed', { error: error.message });
      
      return reply
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(createErrorResponse(ErrorCodes.INTERNAL_ERROR, error.message));
    }
  }
}

export const chatController = new ChatController();
