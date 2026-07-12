"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.incomeService = exports.IncomeService = void 0;
const client_1 = require("@prisma/client");
const api_types_1 = require("../types/api.types");
const logger_1 = __importDefault(require("../utils/logger"));
const prisma = new client_1.PrismaClient();
class IncomeService {
    /**
     * Create income
     */
    async createIncome(userId, data) {
        const { amount, source, description, incomeDate, isRecurring, frequency, startDate, endDate } = data;
        if (amount <= 0) {
            throw {
                code: api_types_1.ErrorCodes.INVALID_AMOUNT,
                message: 'المبلغ غير صالح',
            };
        }
        const income = await prisma.income.create({
            data: {
                userId,
                amount,
                source,
                description,
                incomeDate: incomeDate ? new Date(incomeDate) : new Date(),
                isRecurring: isRecurring || false,
                frequency: frequency,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
            },
        });
        // Audit log
        await prisma.auditLog.create({
            data: {
                userId,
                action: 'CREATE',
                entityType: 'Income',
                entityId: income.id,
                newValues: income,
            },
        });
        logger_1.default.info('Income created', { userId, incomeId: income.id, amount });
        return income;
    }
    /**
     * Get income by ID
     */
    async getIncomeById(userId, incomeId) {
        const income = await prisma.income.findFirst({
            where: { id: incomeId, userId, deletedAt: null },
        });
        if (!income) {
            throw { code: api_types_1.ErrorCodes.NOT_FOUND, message: 'دخل الدخل غير موجود' };
        }
        return income;
    }
    /**
     * Get user incomes with optional filters
     */
    async getUserIncomes(userId, filters) {
        const where = { userId, deletedAt: null };
        if (filters) {
            if (filters.startDate)
                where.incomeDate = { gte: new Date(filters.startDate) };
            if (filters.endDate)
                where.incomeDate = { ...where.incomeDate, lte: new Date(filters.endDate) };
            if (filters.minAmount)
                where.amount = { gte: filters.minAmount };
            if (filters.maxAmount)
                where.amount = { ...where.amount, lte: filters.maxAmount };
            if (filters.source)
                where.source = { contains: filters.source, mode: 'insensitive' };
        }
        const incomes = await prisma.income.findMany({
            where,
            orderBy: { incomeDate: 'desc' },
        });
        return incomes;
    }
    /**
     * Update income
     */
    async updateIncome(userId, incomeId, data) {
        const existing = await this.getIncomeById(userId, incomeId);
        const updateData = {};
        if (data.amount !== undefined) {
            if (data.amount <= 0)
                throw { code: api_types_1.ErrorCodes.INVALID_AMOUNT, message: 'المبلغ غير صالح' };
            updateData.amount = data.amount;
        }
        if (data.source !== undefined)
            updateData.source = data.source;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.incomeDate)
            updateData.incomeDate = new Date(data.incomeDate);
        if (data.isRecurring !== undefined)
            updateData.isRecurring = data.isRecurring;
        if (data.frequency)
            updateData.frequency = data.frequency;
        if (data.startDate)
            updateData.startDate = new Date(data.startDate);
        if (data.endDate)
            updateData.endDate = new Date(data.endDate);
        const updated = await prisma.income.update({ where: { id: incomeId }, data: updateData });
        await prisma.auditLog.create({
            data: {
                userId,
                action: 'UPDATE',
                entityType: 'Income',
                entityId: incomeId,
                oldValues: existing,
                newValues: updated,
            },
        });
        logger_1.default.info('Income updated', { userId, incomeId });
        return updated;
    }
    /**
     * Delete income (soft delete)
     */
    async deleteIncome(userId, incomeId) {
        await this.getIncomeById(userId, incomeId);
        await prisma.income.update({ where: { id: incomeId }, data: { deletedAt: new Date() } });
        await prisma.auditLog.create({
            data: {
                userId,
                action: 'DELETE',
                entityType: 'Income',
                entityId: incomeId,
            },
        });
        logger_1.default.info('Income deleted', { userId, incomeId });
        return { message: 'تم حذف الدخل بنجاح' };
    }
    /**
     * Get income statistics (total for range)
     */
    async getIncomeStats(userId, startDate, endDate) {
        const where = { userId, deletedAt: null };
        if (startDate)
            where.incomeDate = { gte: startDate };
        if (endDate)
            where.incomeDate = { ...where.incomeDate, lte: endDate };
        const totals = await prisma.income.aggregate({ where, _sum: { amount: true }, _count: true, _avg: { amount: true } });
        return {
            totalIncome: Number(totals._sum.amount || 0),
            incomeCount: totals._count || 0,
            averageIncome: Number(totals._avg.amount || 0),
        };
    }
}
exports.IncomeService = IncomeService;
exports.incomeService = new IncomeService();
//# sourceMappingURL=income.service.js.map