# BASIRA Database Documentation

## Overview
This directory contains the Prisma schema and database migrations for the BASIRA financial guidance application.

## Database Structure

### Core Entities

#### 1. **Users & Authentication**
- `User` - Core user information with soft delete support
- `UserProfile` - User financial profiles with full version history
- `Income` - Monthly income tracking
- `UserSettings` - User preferences and app settings
- `OtpCode` - OTP verification codes with expiration
- `UserSession` - JWT refresh token management

#### 2. **Financial Goals**
- `FinancialGoal` - User financial goals with progress tracking
- `GoalTransaction` - All transactions related to goals (deposits/withdrawals)

#### 3. **Expense Tracking**
- `ExpenseCategory` - Predefined and custom expense categories
- `Expense` - Individual expense records with AI processing support
- `Budget` - Budget tracking per category or overall

#### 4. **AI & Analytics**
- `AiInsight` - AI-generated financial insights and recommendations
- `Notification` - User notifications with multi-channel support
- `UserAchievement` - Gamification and achievement tracking

#### 5. **Audit & Compliance**
- `AuditLog` - Comprehensive audit trail for all user actions

## Database Features

### ✅ Normalization
- 3NF (Third Normal Form) compliance
- Proper foreign key relationships
- No data redundancy

### ✅ Version History
- User profiles maintain complete version history
- Every profile change creates a new version
- Current version flagged with `isCurrent` boolean

### ✅ Soft Delete
- Users, goals, expenses, and income support soft delete
- `deletedAt` timestamp instead of hard delete
- Data retention for compliance and analytics

### ✅ Audit Logging
- Every create, update, delete action logged
- Captures before/after values (JSON)
- IP address, user agent, and request context
- Separate audit log table for compliance

### ✅ Indexing Strategy
- Primary keys on all tables (UUID)
- Foreign key indexes for relationship queries
- Composite indexes for common query patterns
- Date indexes for time-based queries
- Status indexes for filtered queries

### ✅ Data Integrity
- Foreign key constraints with CASCADE/SET NULL
- Check constraints on amounts (positive values)
- Unique constraints on critical fields
- Default values for status and timestamps

### ✅ Timestamps
- `createdAt` - Record creation time
- `updatedAt` - Last modification time (auto-updated)
- `deletedAt` - Soft delete timestamp
- Additional timestamps: `completedAt`, `expiresAt`, etc.

### ✅ Security
- Password stored as bcrypt hash
- Refresh tokens stored as hash
- OTP codes with expiration and attempt tracking
- Session management with device binding

### ✅ Multi-language Support
- Arabic (`nameAr`, `titleAr`, `messageAr`) fields
- RTL (Right-to-Left) support ready
- Localized categories and notifications

## Database Commands

### Initial Setup
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Create migration (production)
npm run db:migrate

# Seed database with initial data
npm run db:seed

# Open Prisma Studio (Database GUI)
npm run db:studio
```

### Migrations

#### Create a new migration
```bash
npx prisma migrate dev --name descriptive_migration_name
```

#### Apply migrations to production
```bash
npx prisma migrate deploy
```

#### Reset database (⚠️ DESTRUCTIVE)
```bash
npx prisma migrate reset
```

### Prisma Studio
```bash
npx prisma studio
```
Opens a web-based database browser at http://localhost:5555

## Schema Design Principles

### 1. **UUID Primary Keys**
- All tables use UUID for primary keys
- Better for distributed systems
- No sequential ID leakage

### 2. **Enum Types**
- Type-safe status values
- Database-level constraints
- Easy to extend

### 3. **JSON Fields**
- Flexible data storage for metadata
- Device info, AI processing data
- Notification payload

### 4. **Relationships**
- One-to-Many: User → Goals, User → Expenses
- One-to-One: User → UserSettings
- Self-referencing: UserProfile versioning

### 5. **Cascading Behavior**
```typescript
onDelete: Cascade  // Delete related records
onDelete: SetNull  // Keep record, remove relation
onDelete: Restrict // Prevent deletion
```

## Common Queries

### Get User with Current Profile
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    profiles: {
      where: { isCurrent: true },
      take: 1,
    },
    settings: true,
  },
});
```

### Get Profile Version History
```typescript
const history = await prisma.userProfile.findMany({
  where: { userId },
  orderBy: { version: 'desc' },
});
```

### Get Active Goals with Progress
```typescript
const goals = await prisma.financialGoal.findMany({
  where: {
    userId,
    status: 'ACTIVE',
    deletedAt: null,
  },
  include: {
    transactions: {
      orderBy: { createdAt: 'desc' },
      take: 5,
    },
  },
});
```

### Get Monthly Expenses by Category
```typescript
const expenses = await prisma.expense.groupBy({
  by: ['categoryId'],
  where: {
    userId,
    expenseDate: {
      gte: startOfMonth,
      lte: endOfMonth,
    },
    deletedAt: null,
  },
  _sum: {
    amount: true,
  },
});
```

### Create Audit Log
```typescript
await prisma.auditLog.create({
  data: {
    userId,
    action: 'UPDATE',
    entityType: 'financial_goal',
    entityId: goalId,
    oldValues: previousGoal,
    newValues: updatedGoal,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    requestId: req.id,
  },
});
```

## Performance Optimization

### Indexes
All frequently queried fields have indexes:
- User phone number (unique)
- Goal status + user combinations
- Expense date ranges
- Notification read status
- Audit log date ranges

### Query Optimization
```typescript
// ❌ BAD - N+1 query problem
const users = await prisma.user.findMany();
for (const user of users) {
  const profile = await prisma.userProfile.findFirst({ 
    where: { userId: user.id, isCurrent: true } 
  });
}

// ✅ GOOD - Single query with include
const users = await prisma.user.findMany({
  include: {
    profiles: {
      where: { isCurrent: true },
      take: 1,
    },
  },
});
```

### Pagination
```typescript
const expenses = await prisma.expense.findMany({
  where: { userId },
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { expenseDate: 'desc' },
});
```

## Backup Strategy

### Daily Backups
```bash
# PostgreSQL dump
pg_dump -U postgres basira_db > backup_$(date +%Y%m%d).sql

# Compressed backup
pg_dump -U postgres basira_db | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Restore from Backup
```bash
# Restore from SQL file
psql -U postgres basira_db < backup_20240115.sql

# Restore from compressed
gunzip -c backup_20240115.sql.gz | psql -U postgres basira_db
```

## Environment Variables

Required environment variables for database:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/basira_db?schema=public"
```

For production, use connection pooling:
```bash
DATABASE_URL="postgresql://user:password@host:5432/basira_db?schema=public&connection_limit=10&pool_timeout=20"
```

## Troubleshooting

### Reset Migrations
```bash
# Delete migrations folder
rm -rf prisma/migrations

# Reset database
npx prisma migrate reset

# Create initial migration
npx prisma migrate dev --name init
```

### Fix Out-of-Sync Schema
```bash
# Generate client
npx prisma generate

# Push schema changes
npx prisma db push
```

### Check Migration Status
```bash
npx prisma migrate status
```

## Security Considerations

1. **Never commit** `.env` files with database credentials
2. **Always use** environment variables for connection strings
3. **Enable** SSL for production database connections
4. **Rotate** database credentials regularly
5. **Limit** database user permissions (no DROP/TRUNCATE in production)
6. **Monitor** slow queries and optimize indexes
7. **Backup** database regularly with retention policy

## Support

For database-related issues:
1. Check Prisma logs
2. Review migration history
3. Verify environment variables
4. Check database connection
5. Review indexes and query performance

---

**Last Updated:** July 11, 2026
**Database Version:** 1.0.0
**Prisma Version:** 5.7.1
