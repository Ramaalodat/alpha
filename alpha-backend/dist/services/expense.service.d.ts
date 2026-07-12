import { Expense, ExpenseCategory } from '@prisma/client';
import { CreateExpenseRequest, UpdateExpenseRequest, CreateExpenseCategoryRequest, ExpenseFilters } from '../types/user.types';
export declare class ExpenseService {
    /**
     * Create expense
     */
    createExpense(userId: string, data: CreateExpenseRequest): Promise<Expense>;
    /**
     * Get expense by ID
     */
    getExpenseById(userId: string, expenseId: string): Promise<Expense>;
    /**
     * Get user expenses with filters
     */
    getUserExpenses(userId: string, filters?: ExpenseFilters): Promise<Expense[]>;
    /**
     * Update expense
     */
    updateExpense(userId: string, expenseId: string, data: UpdateExpenseRequest): Promise<Expense>;
    /**
     * Delete expense (soft delete)
     */
    deleteExpense(userId: string, expenseId: string): Promise<{
        message: string;
    }>;
    /**
     * Get expense categories
     */
    getCategories(userId?: string): Promise<ExpenseCategory[]>;
    /**
     * Create custom expense category
     */
    createCategory(userId: string, data: CreateExpenseCategoryRequest): Promise<ExpenseCategory>;
    /**
     * Get expense statistics
     */
    getExpenseStats(userId: string, startDate?: Date, endDate?: Date): Promise<{
        totalExpenses: number;
        expenseCount: number;
        averageExpense: number;
        byCategory: Array<{
            category: string;
            categoryId: string;
            amount: number;
            count: number;
            percentage: number;
        }>;
        byPaymentMethod: Array<{
            method: string;
            amount: number;
            count: number;
        }>;
        dailyAverage: number;
    }>;
    /**
     * Get monthly expenses comparison
     */
    getMonthlyComparison(userId: string): Promise<{
        currentMonth: number;
        lastMonth: number;
        changePercentage: number;
        trend: 'increase' | 'decrease' | 'stable';
    }>;
    /**
     * Seed default categories (for initial setup)
     */
    seedDefaultCategories(): Promise<void>;
    /**
     * Create audit log entry
     */
    private createAuditLog;
}
export declare const expenseService: ExpenseService;
//# sourceMappingURL=expense.service.d.ts.map