import { UserStatus } from '@prisma/client';

// User related types
export interface User {
  id: string;
  phoneNumber: string;
  fullName: string;
  birthDate: Date;
  status: UserStatus;
  isOnboarded: boolean;
  email?: string;
  username?: string;
  gender?: 'MALE' | 'FEMALE';
  maritalStatus?: 'SINGLE' | 'MARRIED' | 'OTHER';
  isHeadOfHousehold?: boolean;
  isStudent?: boolean;
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

// Onboarding types
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

// Financial Goal types
export interface FinancialGoal {
  id: string;
  userId: string;
  icon: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'READY' | 'EXECUTED' | 'CANCELLED';
  progressPercentage?: number;
  flexibility?: 'FIXED' | 'FLEXIBLE';
  goalCategory?: string;
  canBePostponed?: boolean;
  monthlyAllocation?: number;
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
  targetDate: string; // ISO date string
  flexibility?: 'FIXED' | 'FLEXIBLE';
  description?: string;
  category?: string;
  priority?: string;
  goalCategory?: string;
}

export interface UpdateGoalRequest {
  icon?: string;
  name?: string;
  targetAmount?: number;
  targetDate?: string;
  status?: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'READY' | 'EXECUTED' | 'CANCELLED';
}

export interface GoalTransactionRequest {
  amount: number;
  transactionType: 'DEPOSIT' | 'WITHDRAWAL';
  description?: string;
}

// Expense types
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
  expenseType?: 'FIXED' | 'VARIABLE';
  pinnedMonths?: number;
  pinnedUntil?: Date;
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
  expenseDate?: string; // ISO date string
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

// Analytics types
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

// AI Insights types
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

// Notification types
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

// Dashboard summary type
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
    safeDailySpend?: number;
    spendingVelocity?: number;
  };
  recentActivity: {
    recentExpenses: Expense[];
    recentGoalTransactions: GoalTransaction[];
    unreadNotifications: number;
    newInsights: number;
    recentIncomes?: Income[];
  };
  // Income summary
  incomes?: {
    monthlyIncomeTotal?: number;
  };
}

// Filter types for lists
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

// Income types
export interface Income {
  id: string;
  userId: string;
  amount: number;
  source: string;
  description?: string;
  frequency?: string;
  incomeDate: Date;
  isRecurring: boolean;
  startDate?: Date;
  endDate?: Date;
  sourceType?: 'REGULAR_SALARY' | 'TEMPORARY_JOB' | 'FAMILY_ALLOWANCE' | 'EXTERNAL_HELP' | 'RENTAL_INCOME' | 'OTHER_INCOME';
  pinnedMonths?: number;
  pinnedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateIncomeRequest {
  amount: number;
  source: string;
  description?: string;
  incomeDate?: string; // ISO
  isRecurring?: boolean;
  frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  startDate?: string;
  endDate?: string;
}

export interface UpdateIncomeRequest {
  amount?: number;
  source?: string;
  description?: string;
  incomeDate?: string;
  isRecurring?: boolean;
  frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  startDate?: string;
  endDate?: string;
}

export interface IncomeFilters {
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  source?: string;
}

export interface GoalFilters {
  status?: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'READY' | 'EXECUTED' | 'CANCELLED';
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

// Onboarding demographics and financial data request types
export interface RegisterDemographicsRequest {
  gender: 'MALE' | 'FEMALE';
  maritalStatus: 'SINGLE' | 'MARRIED' | 'OTHER';
  isHeadOfHousehold: boolean;
  isStudent: boolean;
}

export interface FinancialDataRequest {
  relationshipWithMoney: 'SAVING_CAREFULLY' | 'BALANCED_SPENDING' | 'EMOTIONAL_SPENDING' | 'OTHER';
  monthlyExtraSavingsGoal?: number;
  mainFinancialGoal12M: string;
  incomeSources: Array<{
    sourceType: 'REGULAR_SALARY' | 'TEMPORARY_JOB' | 'FAMILY_ALLOWANCE' | 'EXTERNAL_HELP' | 'RENTAL_INCOME' | 'OTHER_INCOME';
    amount: number;
    description?: string;
  }>;
  fixedExpenses: Array<{
    category: string;
    amount: number;
  }>;
  variableExpenses: Array<{
    category: string;
    amount: number;
  }>;
  pinnedMonths?: 3 | 6 | 12;
}

export interface FinancialGoalsRequest {
  goals: Array<{
    name: string;
    targetAmount: number;
    targetDate: string;
    flexibility: 'FIXED' | 'FLEXIBLE';
    goalCategory: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    monthlyAllocation?: number;
    icon?: string;
  }>;
}