"use strict";
/**
 * Base Repository
 * Provides common database operations following Repository pattern
 * Implements generic CRUD operations with soft delete support
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
class BaseRepository {
    prisma;
    modelName;
    constructor(prisma, modelName) {
        this.prisma = prisma;
        this.modelName = modelName;
    }
    /**
     * Get model delegate from Prisma client
     */
    getModel() {
        return this.prisma[this.modelName];
    }
    /**
     * Find entity by ID
     */
    async findById(id) {
        try {
            return await this.getModel().findUnique({
                where: { id },
            });
        }
        catch (error) {
            logger_1.default.error(`${this.modelName}.findById failed`, { id, error });
            throw error;
        }
    }
    /**
     * Find entity by unique field
     */
    async findUnique(where) {
        try {
            return await this.getModel().findUnique({ where });
        }
        catch (error) {
            logger_1.default.error(`${this.modelName}.findUnique failed`, { where, error });
            throw error;
        }
    }
    /**
     * Find first matching entity
     */
    async findFirst(args) {
        try {
            return await this.getModel().findFirst(args);
        }
        catch (error) {
            logger_1.default.error(`${this.modelName}.findFirst failed`, { args, error });
            throw error;
        }
    }
    /**
     * Find many entities
     */
    async findMany(args) {
        try {
            return await this.getModel().findMany(args);
        }
        catch (error) {
            logger_1.default.error(`${this.modelName}.findMany failed`, { args, error });
            throw error;
        }
    }
    /**
     * Create new entity
     */
    async create(data) {
        try {
            return await this.getModel().create({ data });
        }
        catch (error) {
            logger_1.default.error(`${this.modelName}.create failed`, { data, error });
            throw error;
        }
    }
    /**
     * Update entity
     */
    async update(id, data) {
        try {
            return await this.getModel().update({
                where: { id },
                data,
            });
        }
        catch (error) {
            logger_1.default.error(`${this.modelName}.update failed`, { id, data, error });
            throw error;
        }
    }
    /**
     * Update many entities
     */
    async updateMany(args) {
        try {
            return await this.getModel().updateMany(args);
        }
        catch (error) {
            logger_1.default.error(`${this.modelName}.updateMany failed`, { args, error });
            throw error;
        }
    }
    /**
     * Delete entity (hard delete)
     */
    async delete(id) {
        try {
            return await this.getModel().delete({
                where: { id },
            });
        }
        catch (error) {
            logger_1.default.error(`${this.modelName}.delete failed`, { id, error });
            throw error;
        }
    }
    /**
     * Soft delete entity
     */
    async softDelete(id) {
        try {
            return await this.getModel().update({
                where: { id },
                data: {
                    deletedAt: new Date(),
                    isDeleted: true,
                },
            });
        }
        catch (error) {
            logger_1.default.error(`${this.modelName}.softDelete failed`, { id, error });
            throw error;
        }
    }
    /**
     * Count entities
     */
    async count(args) {
        try {
            return await this.getModel().count(args);
        }
        catch (error) {
            logger_1.default.error(`${this.modelName}.count failed`, { args, error });
            throw error;
        }
    }
    /**
     * Check if entity exists
     */
    async exists(where) {
        try {
            const count = await this.getModel().count({ where });
            return count > 0;
        }
        catch (error) {
            logger_1.default.error(`${this.modelName}.exists failed`, { where, error });
            throw error;
        }
    }
    /**
     * Execute transaction
     */
    async transaction(fn) {
        try {
            return await this.prisma.$transaction(fn);
        }
        catch (error) {
            logger_1.default.error(`${this.modelName}.transaction failed`, { error });
            throw error;
        }
    }
    /**
     * Paginate results
     */
    async paginate(args) {
        try {
            const { where, orderBy, page, limit, select, include } = args;
            const skip = (page - 1) * limit;
            const [data, total] = await Promise.all([
                this.getModel().findMany({
                    where,
                    orderBy,
                    skip,
                    take: limit,
                    select,
                    include,
                }),
                this.getModel().count({ where }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                data,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                },
            };
        }
        catch (error) {
            logger_1.default.error(`${this.modelName}.paginate failed`, { args, error });
            throw error;
        }
    }
}
exports.BaseRepository = BaseRepository;
//# sourceMappingURL=base.repository.js.map