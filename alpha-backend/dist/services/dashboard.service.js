"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = exports.DashboardService = void 0;
const client_1 = require("@prisma/client");
const api_types_1 = require("../types/api.types");
const logger_1 = __importDefault(require("../utils/logger"));
const helpers_1 = require("../utils/helpers");
const prisma = new client_1.PrismaClient();
class DashboardService {
    /**
     * Get dashboard summary for user
     */
    async getDashboardSummary(userId) {
        // Get user with current profile
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                profiles: {
                    where: { isCurrent: true },
                    take: 1,
                },
            },
        });
        if (!user) {
            throw {
                code: api_types_1.ErrorCodes.NOT_FOUND,
                message: 'المستخدم غير موجود',
            };
        }
        const currentProfile = user.profiles[0];
        // Get current month date range
        const now = new Date();
        const { start: monthStart, end: monthEnd } = helpers_1.dateUtils.getMonthRange(now);
        // Fetch all data in parallel
        const [goalsData, monthlyExpenses, topCategoryExpense, recentExpenses, recentGoalTransactions, unreadNotifications, newInsights, monthlyIncomeTotals, recentIncomes,] = await Promise.all([
            // Goals summary
            prisma.financialGoal.findMany({
                where: { userId, deletedAt: null },
            }),
            // Monthly expenses
            prisma.expense.aggregate({
                where: {
                    userId,
                    deletedAt: null,
                    expenseDate: {
                        gte: monthStart,
                        lte: monthEnd,
                    },
                },
                _sum: { amount: true },
            }),
            // Top spending category this month
            prisma.expense.groupBy({
                by: ['categoryId'],
                where: {
                    userId,
                    deletedAt: null,
                    expenseDate: {
                        gte: monthStart,
                        lte: monthEnd,
                    },
                },
                _sum: { amount: true },
                orderBy: {
                    _sum: {
                        amount: 'desc',
                    },
                },
                take: 1,
            }),
            // Recent expenses
            prisma.expense.findMany({
                where: {
                    userId,
                    deletedAt: null,
                },
                include: {
                    category: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
            // Recent goal transactions
            prisma.goalTransaction.findMany({
                where: { userId },
                include: {
                    goal: true,
                },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
            // Unread notifications count
            prisma.notification.count({
                where: {
                    userId,
                    isRead: false,
                },
            }),
            // New insights count
            prisma.aiInsight.count({
                where: {
                    userId,
                    isRead: false,
                    isDismissed: false,
                    OR: [
                        { expiresAt: null },
                        { expiresAt: { gt: now } },
                    ],
                },
            }),
            // Monthly income totals for current month
            prisma.income.aggregate({
                where: {
                    userId,
                    deletedAt: null,
                    incomeDate: {
                        gte: monthStart,
                        lte: monthEnd,
                    },
                },
                _sum: { amount: true },
            }),
            // Recent incomes
            prisma.income.findMany({
                where: {
                    userId,
                    deletedAt: null,
                },
                orderBy: { incomeDate: 'desc' },
                take: 5,
            }),
        ]);
        // Process goals data
        const totalGoals = goalsData.length;
        const activeGoals = goalsData.filter(g => g.status === 'ACTIVE').length;
        const completedGoals = goalsData.filter(g => g.status === 'COMPLETED').length;
        const totalSaved = goalsData.reduce((sum, g) => sum + Number(g.currentAmount), 0);
        const totalTarget = goalsData.reduce((sum, g) => sum + Number(g.targetAmount), 0);
        const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
        // Get top category name
        let topCategory = undefined;
        if (topCategoryExpense.length > 0) {
            const category = await prisma.expenseCategory.findUnique({
                where: { id: topCategoryExpense[0].categoryId },
            });
            topCategory = category?.name;
        }
        // Calculate remaining budget
        const monthlyIncome = currentProfile ? Number(currentProfile.monthlyIncome) : 0;
        const basicExpenses = currentProfile ? Number(currentProfile.basicExpenses) : 0;
        const monthlyExpensesTotal = Number(monthlyExpenses._sum.amount || 0);
        const remainingBudget = monthlyIncome - basicExpenses - monthlyExpensesTotal;
        const summary = {
            user: {
                fullName: user.fullName,
                monthlyIncome: monthlyIncome,
                basicExpenses: basicExpenses,
            },
            goals: {
                totalGoals,
                activeGoals,
                completedGoals,
                totalSaved,
                totalTarget,
                overallProgress: Math.round(overallProgress * 100) / 100,
            },
            expenses: {
                monthlyExpenses: monthlyExpensesTotal,
                topCategory,
                remainingBudget,
            },
            recentActivity: {
                recentExpenses: recentExpenses,
                recentGoalTransactions: recentGoalTransactions,
                unreadNotifications,
                newInsights,
                recentIncomes: recentIncomes,
            },
            incomes: {
                monthlyIncomeTotal: Number(monthlyIncomeTotals._sum.amount || 0),
            },
        };
        logger_1.default.info('Dashboard summary generated', { userId });
        return summary;
    }
    /**
     * Get financial health score
     */
    async getFinancialHealthScore(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                profiles: {
                    where: { isCurrent: true },
                    take: 1,
                },
            },
        });
        if (!user || !user.profiles[0]) {
            throw {
                code: api_types_1.ErrorCodes.NOT_FOUND,
                message: 'الملف الشخصي غير موجود',
            };
        }
        const profile = user.profiles[0];
        const monthlyIncome = Number(profile.monthlyIncome);
        const basicExpenses = Number(profile.basicExpenses);
        // Get current month expenses
        const now = new Date();
        const { start: monthStart } = helpers_1.dateUtils.getMonthRange(now);
        const [expenses, goals, totalSavings] = await Promise.all([
            prisma.expense.aggregate({
                where: {
                    userId,
                    deletedAt: null,
                    expenseDate: { gte: monthStart },
                },
                _sum: { amount: true },
            }),
            prisma.financialGoal.findMany({
                where: { userId, deletedAt: null },
            }),
            prisma.goalTransaction.aggregate({
                where: { userId, transactionType: 'DEPOSIT' },
                _sum: { amount: true },
            }),
        ]);
        const monthlyExpenses = Number(expenses._sum.amount || 0);
        const totalExpenses = basicExpenses + monthlyExpenses;
        const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - totalExpenses) / monthlyIncome) * 100 : 0;
        // Calculate scores (0-100)
        const savingsScore = Math.min(savingsRate * 5, 100); // 20% savings = 100 score
        const budgetAdherence = totalExpenses <= monthlyIncome ? 100 : Math.max(0, 100 - ((totalExpenses - monthlyIncome) / monthlyIncome * 100));
        const activeGoals = goals.filter(g => g.status === 'ACTIVE');
        const avgGoalProgress = activeGoals.length > 0
            ? activeGoals.reduce((sum, g) => sum + Number(g.progressPercentage || 0), 0) / activeGoals.length
            : 0;
        const emergencyFundScore = profile.hasEmergencyFund ? 100 : 0;
        // Overall score (weighted average)
        const overallScore = (savingsScore * 0.3 +
            budgetAdherence * 0.3 +
            avgGoalProgress * 0.25 +
            emergencyFundScore * 0.15);
        // Generate recommendations
        const recommendations = [];
        if (savingsScore < 50)
            recommendations.push('حاول زيادة معدل الادخار الشهري');
        if (budgetAdherence < 80)
            recommendations.push('تحكم في مصروفاتك الشهرية');
        if (avgGoalProgress < 50)
            recommendations.push('ركز على تحقيق أهدافك المالية');
        if (!profile.hasEmergencyFund)
            recommendations.push('أنشئ صندوق طوارئ يغطي 6 أشهر من المصاريف');
        return {
            score: Math.round(overallScore),
            breakdown: {
                savings: Math.round(savingsScore),
                budgetAdherence: Math.round(budgetAdherence),
                goalProgress: Math.round(avgGoalProgress),
                emergencyFund: emergencyFundScore,
            },
            recommendations,
        };
    }
}
exports.DashboardService = DashboardService;
exports.dashboardService = new DashboardService();
//# sourceMappingURL=dashboard.service.js.map