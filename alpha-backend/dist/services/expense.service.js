"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expenseService = exports.ExpenseService = void 0;
const client_1 = require("@prisma/client");
const api_types_1 = require("../types/api.types");
const constants_1 = require("../utils/constants");
const logger_1 = __importDefault(require("../utils/logger"));
const prisma = new client_1.PrismaClient();
class ExpenseService {
    /**
     * Create expense
     */
    async createExpense(userId, data) {
        const { categoryId, amount, description, expenseDate, paymentMethod, location, receiptUrl, isRecurring, recurringFrequency, tags, notes, } = data;
        // Validate amount
        if (amount <= 0) {
            throw {
                code: api_types_1.ErrorCodes.INVALID_AMOUNT,
                message: constants_1.ERROR_MESSAGES.INVALID_AMOUNT,
            };
        }
        // Check if category exists
        const category = await prisma.expenseCategory.findUnique({
            where: { id: categoryId },
        });
        if (!category) {
            throw {
                code: api_types_1.ErrorCodes.NOT_FOUND,
                message: 'فئة المصروف غير موجودة',
            };
        }
        // Create expense
        const expense = await prisma.expense.create({
            data: {
                userId,
                categoryId,
                amount,
                description,
                expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
                paymentMethod: paymentMethod,
                location,
                receiptUrl,
                isRecurring: isRecurring || false,
                recurringFrequency: recurringFrequency,
                tags: tags || [],
                notes,
            },
        });
        // Create audit log
        await this.createAuditLog({
            userId,
            action: 'CREATE',
            entityType: 'Expense',
            entityId: expense.id,
            newValues: expense,
        });
        logger_1.default.info('Expense created', { userId, expenseId: expense.id, amount });
        return expense;
    }
    /**
     * Get expense by ID
     */
    async getExpenseById(userId, expenseId) {
        const expense = await prisma.expense.findFirst({
            where: {
                id: expenseId,
                userId,
                deletedAt: null,
            },
            include: {
                category: true,
            },
        });
        if (!expense) {
            throw {
                code: api_types_1.ErrorCodes.NOT_FOUND,
                message: constants_1.ERROR_MESSAGES.EXPENSE_NOT_FOUND,
            };
        }
        return expense;
    }
    /**
     * Get user expenses with filters
     */
    async getUserExpenses(userId, filters) {
        const where = {
            userId,
            deletedAt: null,
        };
        if (filters) {
            if (filters.categoryId) {
                where.categoryId = filters.categoryId;
            }
            if (filters.startDate) {
                where.expenseDate = { gte: new Date(filters.startDate) };
            }
            if (filters.endDate) {
                where.expenseDate = { ...where.expenseDate, lte: new Date(filters.endDate) };
            }
            if (filters.minAmount) {
                where.amount = { gte: filters.minAmount };
            }
            if (filters.maxAmount) {
                where.amount = { ...where.amount, lte: filters.maxAmount };
            }
            if (filters.paymentMethod) {
                where.paymentMethod = filters.paymentMethod;
            }
            if (filters.tags && filters.tags.length > 0) {
                where.tags = { hasSome: filters.tags };
            }
            if (filters.isRecurring !== undefined) {
                where.isRecurring = filters.isRecurring;
            }
        }
        const expenses = await prisma.expense.findMany({
            where,
            include: {
                category: true,
            },
            orderBy: { expenseDate: 'desc' },
        });
        return expenses;
    }
    /**
     * Update expense
     */
    async updateExpense(userId, expenseId, data) {
        // Get existing expense
        const existingExpense = await this.getExpenseById(userId, expenseId);
        const updateData = {};
        if (data.categoryId) {
            // Check if category exists
            const category = await prisma.expenseCategory.findUnique({
                where: { id: data.categoryId },
            });
            if (!category) {
                throw {
                    code: api_types_1.ErrorCodes.NOT_FOUND,
                    message: 'فئة المصروف غير موجودة',
                };
            }
            updateData.categoryId = data.categoryId;
        }
        if (data.amount !== undefined) {
            if (data.amount <= 0) {
                throw {
                    code: api_types_1.ErrorCodes.INVALID_AMOUNT,
                    message: constants_1.ERROR_MESSAGES.INVALID_AMOUNT,
                };
            }
            updateData.amount = data.amount;
        }
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.expenseDate)
            updateData.expenseDate = new Date(data.expenseDate);
        if (data.paymentMethod)
            updateData.paymentMethod = data.paymentMethod;
        if (data.location !== undefined)
            updateData.location = data.location;
        if (data.receiptUrl !== undefined)
            updateData.receiptUrl = data.receiptUrl;
        if (data.isRecurring !== undefined)
            updateData.isRecurring = data.isRecurring;
        if (data.recurringFrequency)
            updateData.recurringFrequency = data.recurringFrequency;
        if (data.tags)
            updateData.tags = data.tags;
        if (data.notes !== undefined)
            updateData.notes = data.notes;
        // Update expense
        const updatedExpense = await prisma.expense.update({
            where: { id: expenseId },
            data: updateData,
            include: {
                category: true,
            },
        });
        // Create audit log
        await this.createAuditLog({
            userId,
            action: 'UPDATE',
            entityType: 'Expense',
            entityId: expenseId,
            oldValues: existingExpense,
            newValues: updatedExpense,
        });
        logger_1.default.info('Expense updated', { userId, expenseId });
        return updatedExpense;
    }
    /**
     * Delete expense (soft delete)
     */
    async deleteExpense(userId, expenseId) {
        // Check if expense exists
        await this.getExpenseById(userId, expenseId);
        // Soft delete
        await prisma.expense.update({
            where: { id: expenseId },
            data: { deletedAt: new Date() },
        });
        // Create audit log
        await this.createAuditLog({
            userId,
            action: 'DELETE',
            entityType: 'Expense',
            entityId: expenseId,
        });
        logger_1.default.info('Expense deleted', { userId, expenseId });
        return {
            message: constants_1.SUCCESS_MESSAGES.EXPENSE_DELETED,
        };
    }
    /**
     * Get expense categories
     */
    async getCategories(userId) {
        const where = {
            isActive: true,
        };
        // Get default categories and user's custom categories
        if (userId) {
            where.OR = [
                { isDefault: true },
                { createdBy: userId },
            ];
        }
        else {
            where.isDefault = true;
        }
        const categories = await prisma.expenseCategory.findMany({
            where,
            orderBy: [
                { displayOrder: 'asc' },
                { name: 'asc' },
            ],
        });
        return categories;
    }
    /**
     * Create custom expense category
     */
    async createCategory(userId, data) {
        const { name, icon, color } = data;
        const category = await prisma.expenseCategory.create({
            data: {
                name,
                icon,
                color: color || '#6B7280',
                isDefault: false,
                isEssential: false,
                createdBy: userId,
            },
        });
        logger_1.default.info('Custom expense category created', { userId, categoryId: category.id });
        return category;
    }
    /**
     * Get expense statistics
     */
    async getExpenseStats(userId, startDate, endDate) {
        const where = {
            userId,
            deletedAt: null,
        };
        if (startDate) {
            where.expenseDate = { gte: startDate };
        }
        if (endDate) {
            where.expenseDate = { ...where.expenseDate, lte: endDate };
        }
        // Get total expenses
        const [totals, expenses, categories] = await Promise.all([
            prisma.expense.aggregate({
                where,
                _sum: { amount: true },
                _count: true,
                _avg: { amount: true },
            }),
            prisma.expense.findMany({
                where,
                include: { category: true },
            }),
            this.getCategories(userId),
        ]);
        const totalAmount = Number(totals._sum.amount || 0);
        // Group by category
        const categoryMap = new Map();
        expenses.forEach((expense) => {
            const catId = expense.categoryId;
            const existing = categoryMap.get(catId) || { amount: 0, count: 0, name: expense.category.name };
            existing.amount += Number(expense.amount);
            existing.count += 1;
            categoryMap.set(catId, existing);
        });
        const byCategory = Array.from(categoryMap.entries()).map(([categoryId, data]) => ({
            categoryId,
            category: data.name,
            amount: data.amount,
            count: data.count,
            percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
        }));
        // Group by payment method
        const paymentMap = new Map();
        expenses.forEach((expense) => {
            const method = expense.paymentMethod || 'UNKNOWN';
            const existing = paymentMap.get(method) || { amount: 0, count: 0 };
            existing.amount += Number(expense.amount);
            existing.count += 1;
            paymentMap.set(method, existing);
        });
        const byPaymentMethod = Array.from(paymentMap.entries()).map(([method, data]) => ({
            method,
            amount: data.amount,
            count: data.count,
        }));
        // Calculate daily average
        let dailyAverage = 0;
        if (startDate && endDate) {
            const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            dailyAverage = days > 0 ? totalAmount / days : 0;
        }
        return {
            totalExpenses: totalAmount,
            expenseCount: totals._count || 0,
            averageExpense: Number(totals._avg.amount || 0),
            byCategory: byCategory.sort((a, b) => b.amount - a.amount),
            byPaymentMethod: byPaymentMethod.sort((a, b) => b.amount - a.amount),
            dailyAverage,
        };
    }
    /**
     * Get monthly expenses comparison
     */
    async getMonthlyComparison(userId) {
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        const [currentMonth, lastMonth] = await Promise.all([
            prisma.expense.aggregate({
                where: {
                    userId,
                    deletedAt: null,
                    expenseDate: { gte: currentMonthStart },
                },
                _sum: { amount: true },
            }),
            prisma.expense.aggregate({
                where: {
                    userId,
                    deletedAt: null,
                    expenseDate: {
                        gte: lastMonthStart,
                        lte: lastMonthEnd,
                    },
                },
                _sum: { amount: true },
            }),
        ]);
        const currentTotal = Number(currentMonth._sum.amount || 0);
        const lastTotal = Number(lastMonth._sum.amount || 0);
        let changePercentage = 0;
        let trend = 'stable';
        if (lastTotal > 0) {
            changePercentage = ((currentTotal - lastTotal) / lastTotal) * 100;
            if (changePercentage > 5)
                trend = 'increase';
            else if (changePercentage < -5)
                trend = 'decrease';
        }
        return {
            currentMonth: currentTotal,
            lastMonth: lastTotal,
            changePercentage: Math.round(changePercentage * 100) / 100,
            trend,
        };
    }
    /**
     * Seed default categories (for initial setup)
     */
    async seedDefaultCategories() {
        const existingCategories = await prisma.expenseCategory.count({
            where: { isDefault: true },
        });
        if (existingCategories > 0) {
            logger_1.default.info('Default categories already exist, skipping seed');
            return;
        }
        for (const [index, category] of constants_1.DEFAULT_EXPENSE_CATEGORIES.entries()) {
            await prisma.expenseCategory.create({
                data: {
                    name: category.name,
                    nameAr: category.name, // Same for Arabic
                    icon: category.icon,
                    color: category.color,
                    isDefault: true,
                    isEssential: ['Food & Dining', 'Transportation', 'Bills & Utilities', 'Healthcare'].includes(category.name),
                    displayOrder: index + 1,
                },
            });
        }
        logger_1.default.info('Default expense categories seeded');
    }
    /**
     * Create audit log entry
     */
    async createAuditLog(data) {
        try {
            await prisma.auditLog.create({
                data: {
                    userId: data.userId,
                    action: data.action,
                    entityType: data.entityType,
                    entityId: data.entityId,
                    oldValues: data.oldValues,
                    newValues: data.newValues,
                },
            });
        }
        catch (error) {
            logger_1.default.error('Failed to create audit log', { error });
        }
    }
}
exports.ExpenseService = ExpenseService;
exports.expenseService = new ExpenseService();
//# sourceMappingURL=expense.service.js.map