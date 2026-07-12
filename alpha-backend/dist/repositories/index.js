"use strict";
/**
 * Repository Index
 * Central export point for all repositories
 * Implements Factory pattern for repository creation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = exports.UserRepository = exports.getPrisma = exports.getUserRepository = exports.RepositoryFactory = exports.getPrismaInstance = void 0;
const client_1 = require("@prisma/client");
const user_repository_1 = require("./user.repository");
// Singleton Prisma instance
let prismaInstance = null;
/**
 * Get or create Prisma instance
 */
const getPrismaInstance = () => {
    if (!prismaInstance) {
        prismaInstance = new client_1.PrismaClient({
            log: process.env.NODE_ENV === 'development'
                ? ['query', 'error', 'warn']
                : ['error'],
        });
    }
    return prismaInstance;
};
exports.getPrismaInstance = getPrismaInstance;
/**
 * Repository Factory
 * Creates and manages repository instances
 */
class RepositoryFactory {
    static prisma;
    static userRepository;
    /**
     * Initialize factory with Prisma instance
     */
    static initialize(prisma) {
        this.prisma = prisma || (0, exports.getPrismaInstance)();
    }
    /**
     * Get User Repository
     */
    static getUserRepository() {
        if (!this.prisma) {
            this.initialize();
        }
        if (!this.userRepository) {
            this.userRepository = new user_repository_1.UserRepository(this.prisma);
        }
        return this.userRepository;
    }
    /**
     * Get Prisma instance
     */
    static getPrisma() {
        if (!this.prisma) {
            this.initialize();
        }
        return this.prisma;
    }
    /**
     * Disconnect from database
     */
    static async disconnect() {
        if (this.prisma) {
            await this.prisma.$disconnect();
        }
    }
}
exports.RepositoryFactory = RepositoryFactory;
// Initialize on module load
RepositoryFactory.initialize();
// Export convenience methods
const getUserRepository = () => RepositoryFactory.getUserRepository();
exports.getUserRepository = getUserRepository;
const getPrisma = () => RepositoryFactory.getPrisma();
exports.getPrisma = getPrisma;
// Export repository classes
var user_repository_2 = require("./user.repository");
Object.defineProperty(exports, "UserRepository", { enumerable: true, get: function () { return user_repository_2.UserRepository; } });
var base_repository_1 = require("./base.repository");
Object.defineProperty(exports, "BaseRepository", { enumerable: true, get: function () { return base_repository_1.BaseRepository; } });
//# sourceMappingURL=index.js.map