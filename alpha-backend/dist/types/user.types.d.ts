import { UserStatus } from '@prisma/client';
export interface User {
    id: string;
    phoneNumber: string;
    fullName: string;
    birthDate: Date;
    status: UserStatus;
    isOnboarded: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface UserProfile {
    id: string;
    userId: string;
    monthlyIncome: number;
    basicExpenses: number;
    financialGoal?: string;
    primarySpendingCategory: string;
    version: number;
    isCurrent: boolean;
    createdAt: Date;
    createdBy?: string;
}
export interface UserSettings {
    id: string;
    userId: string;
    notificationsEnabled: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    weeklySummary: boolean;
    spendingAlerts: boolean;
    language: string;
    currency: string;
    timezone: string;
    theme: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface OnboardingFinancialInfo {
    monthlyIncome: number;
    basicExpenses: number;
    financialGoal: string;
    primarySpendingCategory: string;
}
export interface OnboardingStatus {
    isCompleted: boolean;
    steps: {
        financialInfo: boolean;
        firstGoal: boolean;
    };
    nextStep?: 'financial_info' | 'first_goal' | null;
}
export interface FinancialGoal {
    id: string;
    userId: string;
    icon: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: Date;
    status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'DELETED';
    progressPercentage?: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface GoalTransaction {
    id: string;
    userId: string;
    goalId: string;
    amount: number;
    transactionType: 'DEPOSIT' | 'WITHDRAWAL';
    description?: string;
    transactionDate: Date;
    createdAt: Date;
}
export interface CreateGoalRequest {
    icon: string;
    name: string;
    targetAmount: number;
    targetDate: string;
}
export interface UpdateGoalRequest {
    icon?: string;
    name?: string;
    targetAmount?: number;
    targetDate?: string;
    status?: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
}
export interface GoalTransactionRequest {
    amount: number;
    transactionType: 'DEPOSIT' | 'WITHDRAWAL';
    description?: string;
}
export interface Expense {
    id: string;
    userId: string;
    categoryId: string;
    amount: number;
    description?: string;
    expenseDate: Date;
    paymentMethod?: string;
    location?: string;
    receiptUrl?: string;
    isRecurring: boolean;
    recurringFrequency?: string;
    tags: string[];
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ExpenseCategory {
    id: string;
    name: string;
    icon?: string;
    color: string;
    isDefault: boolean;
    createdBy?: string;
    createdAt: Date;
}
export interface CreateExpenseRequest {
    categoryId: string;
    amount: number;
    description?: string;
    expenseDate?: string;
    paymentMethod?: string;
    location?: string;
    receiptUrl?: string;
    isRecurring?: boolean;
    recurringFrequency?: 'weekly' | 'monthly' | 'yearly';
    tags?: string[];
    notes?: string;
}
export interface UpdateExpenseRequest {
    categoryId?: string;
    amount?: number;
    description?: string;
    expenseDate?: string;
    paymentMethod?: string;
    location?: string;
    receiptUrl?: string;
    isRecurring?: boolean;
    recurringFrequency?: string;
    tags?: string[];
    notes?: string;
}
export interface CreateExpenseCategoryRequest {
    name: string;
    icon?: string;
    color?: string;
}
export interface SpendingAnalytics {
    summary: {
        totalSpent: number;
        period: string;
        budgetLimit?: number;
        remainingBudget?: number;
        daysRemaining?: number;
    };
    byCategory: {
        category: string;
        amount: number;
        percentage: number;
        trend?: 'up' | 'down' | 'stable';
    }[];
    dailySpending: {
        date: string;
        amount: number;
    }[];
    trends: {
        comparedToLastPeriod: {
            changePercentage: number;
            changeAmount: number;
            trend: 'increase' | 'decrease' | 'stable';
        };
    };
}
export interface GoalAnalytics {
    summary: {
        totalGoals: number;
        activeGoals: number;
        completedGoals: number;
        totalSaved: number;
        totalTarget: number;
        overallProgress: number;
    };
    goalsProgress: {
        id: string;
        name: string;
        progressPercentage: number;
        onTrack: boolean;
        projectedCompletion?: string;
        monthlySavingsNeeded?: number;
    }[];
    savingsTimeline: {
        month: string;
        totalSaved: number;
        goalsContributed: number;
    }[];
}
export interface AiInsight {
    id: string;
    userId: string;
    insightType: 'SPENDING_PATTERN' | 'GOAL_RECOMMENDATION' | 'BUDGET_ALERT' | 'SAVING_TIP';
    title: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    isRead: boolean;
    isDismissed: boolean;
    data?: Record<string, any>;
    expiresAt?: Date;
    readAt?: Date;
    createdAt: Date;
}
export interface Notification {
    id: string;
    userId: string;
    type: 'GOAL_MILESTONE' | 'SPENDING_ALERT' | 'WEEKLY_SUMMARY' | 'EDUCATIONAL';
    title: string;
    message: string;
    isRead: boolean;
    isSent: boolean;
    scheduledAt?: Date;
    sentAt?: Date;
    readAt?: Date;
    data?: Record<string, any>;
    createdAt: Date;
}
export interface DashboardSummary {
    user: {
        fullName: string;
        monthlyIncome?: number;
        basicExpenses?: number;
    };
    goals: {
        totalGoals: number;
        activeGoals: number;
        completedGoals: number;
        totalSaved: number;
        totalTarget: number;
        overallProgress: number;
    };
    expenses: {
        monthlyExpenses: number;
        topCategory?: string;
        remainingBudget?: number;
    };
    recentActivity: {
        recentExpenses: Expense[];
        recentGoalTransactions: GoalTransaction[];
        unreadNotifications: number;
        newInsights: number;
    };
}
export interface ExpenseFilters {
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    minAmount?: number;
    maxAmount?: number;
    paymentMethod?: string;
    tags?: string[];
    isRecurring?: boolean;
}
export interface GoalFilters {
    status?: 'ACTIVE' | 'COMPLETED' | 'PAUSED';
    minAmount?: number;
    maxAmount?: number;
    dueBefore?: string;
    dueAfter?: string;
}
export interface NotificationFilters {
    type?: 'GOAL_MILESTONE' | 'SPENDING_ALERT' | 'WEEKLY_SUMMARY' | 'EDUCATIONAL';
    isRead?: boolean;
    startDate?: string;
    endDate?: string;
}
export interface InsightFilters {
    type?: 'SPENDING_PATTERN' | 'GOAL_RECOMMENDATION' | 'BUDGET_ALERT' | 'SAVING_TIP';
    isRead?: boolean;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    isExpired?: boolean;
}
//# sourceMappingURL=user.types.d.ts.map