import { AiInsight, InsightType, PriorityLevel } from '@prisma/client';
import { ErrorCodes } from '../types/api.types';
import logger from '../utils/logger';
import prisma from '../lib/prisma';

interface InsightFilters {
  type?: InsightType;
  isRead?: boolean;
  priority?: PriorityLevel;
  isExpired?: boolean;
  page?: number;
  limit?: number;
}

export class InsightService {
  /**
   * Get user insights with filters and pagination
   */
  async getUserInsights(userId: string, filters?: InsightFilters): Promise<{
    data: AiInsight[];
    meta: { total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrev: boolean };
  }> {
    const where: any = {
      userId,
      isDismissed: false,
    };

    if (filters) {
      if (filters.type) where.insightType = filters.type;
      if (filters.isRead !== undefined) where.isRead = filters.isRead;
      if (filters.priority) where.priority = filters.priority;
      if (filters.isExpired === false) {
        where.OR = [{ expiresAt: null }, { expiresAt: { gt: new Date() } }];
      }
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.aiInsight.findMany({
        where,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.aiInsight.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: { total, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    };
  }

  /**
   * Get insight by ID
   */
  async getInsightById(userId: string, insightId: string): Promise<AiInsight> {
    const insight = await prisma.aiInsight.findFirst({
      where: { id: insightId, userId },
    });

    if (!insight) {
      throw { code: ErrorCodes.NOT_FOUND, message: 'النصيحة غير موجودة' };
    }

    return insight;
  }

  /**
   * Mark insight as read
   */
  async markAsRead(userId: string, insightId: string): Promise<AiInsight> {
    await this.getInsightById(userId, insightId);

    return prisma.aiInsight.update({
      where: { id: insightId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /**
   * Dismiss insight
   */
  async dismissInsight(userId: string, insightId: string): Promise<AiInsight> {
    await this.getInsightById(userId, insightId);

    return prisma.aiInsight.update({
      where: { id: insightId },
      data: { isDismissed: true, dismissedAt: new Date() },
    });
  }

  /**
   * Mark insight as acted on
   */
  async markAsActedOn(userId: string, insightId: string): Promise<AiInsight> {
    await this.getInsightById(userId, insightId);

    return prisma.aiInsight.update({
      where: { id: insightId },
      data: { isActedOn: true },
    });
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string): Promise<number> {
    return prisma.aiInsight.count({
      where: {
        userId,
        isRead: false,
        isDismissed: false,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
  }

  /**
   * Generate insights for user based on spending patterns
   */
  async generateInsights(userId: string): Promise<AiInsight[]> {
    const insights: AiInsight[] = [];

    // Get user data for analysis
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [expenses, goals, profile] = await Promise.all([
      prisma.expense.findMany({
        where: { userId, deletedAt: null, expenseDate: { gte: monthStart } },
        include: { category: true },
      }),
      prisma.financialGoal.findMany({ where: { userId, deletedAt: null, status: 'ACTIVE' } }),
      prisma.userProfile.findFirst({ where: { userId, isCurrent: true } }),
    ]);

    if (!profile) return insights;

    const monthlyIncome = Number(profile.monthlyIncome);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - totalExpenses) / monthlyIncome) * 100 : 0;

    // Spending pattern insight
    if (totalExpenses > monthlyIncome * 0.9) {
      const insight = await prisma.aiInsight.create({
        data: {
          userId,
          insightType: 'BUDGET_ALERT',
          title: 'High spending alert',
          titleAr: 'تنبيه إنفاق مرتفع',
          description: `You've spent ${Math.round((totalExpenses / monthlyIncome) * 100)}% of your monthly income`,
          descriptionAr: `لقد أنفقت ${Math.round((totalExpenses / monthlyIncome) * 100)}% من دخلك الشهري`,
          priority: 'HIGH',
          data: { totalExpenses, monthlyIncome, percentage: Math.round((totalExpenses / monthlyIncome) * 100) },
        },
      });
      insights.push(insight);
    }

    // Savings tip insight
    if (savingsRate < 20 && savingsRate > 0) {
      const insight = await prisma.aiInsight.create({
        data: {
          userId,
          insightType: 'SAVING_TIP',
          title: 'Boost your savings rate',
          titleAr: 'حسّن معدل الادخار',
          description: `Your current savings rate is ${Math.round(savingsRate)}%. Try to reach 20% for better financial health.`,
          descriptionAr: `معدل الادخار الحالي ${Math.round(savingsRate)}%. حاول الوصول إلى 20% لصحة مالية أفضل.`,
          priority: 'MEDIUM',
          data: { savingsRate: Math.round(savingsRate), targetRate: 20 },
        },
      });
      insights.push(insight);
    }

    // Goal recommendation
    if (goals.length === 0) {
      const insight = await prisma.aiInsight.create({
        data: {
          userId,
          insightType: 'GOAL_RECOMMENDATION',
          title: 'Start setting financial goals',
          titleAr: 'ابدأ بوضع أهداف مالية',
          description: 'Setting financial goals helps you save consistently and track progress.',
          descriptionAr: 'وضع أهداف مالية يساعدك على الادخار بانتظام وتتبع التقدم.',
          priority: 'MEDIUM',
        },
      });
      insights.push(insight);
    }

    logger.info('Insights generated', { userId, count: insights.length });
    return insights;
  }

  /**
   * Delete all expired insights
   */
  async cleanupExpiredInsights(): Promise<number> {
    const result = await prisma.aiInsight.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
        isRead: true,
      },
    });

    return result.count;
  }
}

export const insightService = new InsightService();
