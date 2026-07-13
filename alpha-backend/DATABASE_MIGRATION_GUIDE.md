# BASIRA Backend - Database Migration Guide 📊

Complete guide for managing database migrations, schema changes, and data management using Prisma.

---

## Table of Contents

1. [Overview](#overview)
2. [Prisma Basics](#prisma-basics)
3. [Creating Migrations](#creating-migrations)
4. [Running Migrations](#running-migrations)
5. [Migration Strategies](#migration-strategies)
6. [Data Migration](#data-migration)
7. [Rollback Procedures](#rollback-procedures)
8. [Production Migrations](#production-migrations)
9. [Common Scenarios](#common-scenarios)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### What are Migrations?

Migrations are version-controlled database schema changes that allow you to:

- Track database schema changes over time
- Apply changes consistently across environments
- Rollback changes if needed
- Collaborate with team members safely

### Prisma Migration Workflow

```
Schema Change → Migration File → Apply to DB → Update Prisma Client
```

---

## Prisma Basics

### Project Structure

```
basira-backend/
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   ├── migrations/            # Migration history
│   │   ├── migration_lock.toml
│   │   ├── 20240101000000_init/
│   │   │   └── migration.sql
│   │   ├── 20240102000000_add_goals/
│   │   │   └── migration.sql
│   │   └── ...
│   └── seed.ts               # Seed data script
└── .env                      # Database connection
```

### Key Commands

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Create and apply migration (development)
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status

# Push schema without migration (prototype only)
npx prisma db push

# Open database GUI
npx prisma studio

# Format schema file
npx prisma format

# Validate schema
npx prisma validate
```

---

## Creating Migrations

### Step 1: Modify Schema

Edit `prisma/schema.prisma`:

```prisma
// Example: Adding a new field
model User {
  id            String    @id @default(uuid())
  fullName      String
  phoneNumber   String    @unique
  email         String?   @unique
  // NEW FIELD
  profileImage  String?   // Add profile image URL
  password      String
  dateOfBirth   DateTime
  isPhoneVerified Boolean @default(false)
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@map("users")
}
```

### Step 2: Generate Migration

```bash
# Create migration with descriptive name
npx prisma migrate dev --name add_profile_image_to_users
```

This will:
1. Generate SQL migration file
2. Apply migration to your database
3. Update Prisma Client
4. Save migration in `prisma/migrations/`

### Generated Migration File

Location: `prisma/migrations/20240615123456_add_profile_image_to_users/migration.sql`

```sql
-- AlterTable
ALTER TABLE "users" ADD COLUMN "profileImage" TEXT;
```

### Step 3: Review Migration

Always review the generated SQL before applying to production:

```bash
# View the migration file
cat prisma/migrations/20240615123456_add_profile_image_to_users/migration.sql
```

---

## Running Migrations

### Development Environment

```bash
# Create and apply migration
npx prisma migrate dev --name migration_name

# This will:
# 1. Create migration file
# 2. Apply to development database
# 3. Generate Prisma Client
# 4. Run seed script (if configured)
```

### Staging/Production Environment

```bash
# Apply pending migrations
npx prisma migrate deploy

# This will:
# 1. Apply all pending migrations
# 2. Not create new migrations
# 3. Not run seed script
```

### Check Migration Status

```bash
# View applied and pending migrations
npx prisma migrate status

# Output example:
# Status: 2 migrations, 1 pending
# Applied migrations:
#   20240101000000_init
#   20240102000000_add_goals
# Pending migrations:
#   20240103000000_add_expenses
```

---

## Migration Strategies

### 1. Additive Changes (Safe)

Adding new optional fields or tables:

```prisma
model User {
  // ... existing fields
  profileImage  String?  // Optional - safe to add
  bio          String?  // Optional - safe to add
}
```

✅ **Safe for production** - no data loss risk

### 2. Breaking Changes (Requires Care)

Removing or renaming fields:

```prisma
model User {
  // ⚠️ BEFORE
  phoneNumber String

  // ⚠️ AFTER - renamed
  phone String
}
```

⚠️ **Requires data migration**

**Strategy:**
1. Add new field
2. Migrate data from old to new field
3. Update application code
4. Remove old field (after verification)

### 3. Multi-Step Migrations

For complex changes, use multiple migrations:

**Step 1: Add new field**
```prisma
model User {
  phoneNumber String  // Old field
  phone       String? // New field (optional)
}
```

**Step 2: Data migration script**
```typescript
// scripts/migrate-phone-data.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migratePhoneData() {
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: { phone: user.phoneNumber },
    });
  }
  
  console.log(`Migrated ${users.length} users`);
}

migratePhoneData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Step 3: Make new field required, remove old**
```prisma
model User {
  phone String  // New field (now required)
  // phoneNumber removed
}
```

### 4. Schema-Only vs Data Migrations

**Schema Migration** (Prisma handles):
- Add/remove tables
- Add/remove columns
- Change types
- Add/remove indexes

**Data Migration** (You handle):
- Transform existing data
- Populate new fields
- Clean up data
- Batch updates

---

## Data Migration

### Using Prisma Client Scripts

Create a data migration script:

```typescript
// prisma/data-migrations/001-populate-default-categories.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
  console.log('Starting data migration...');
  
  // Check if already migrated
  const count = await prisma.expenseCategory.count();
  if (count > 0) {
    console.log('Categories already exist, skipping...');
    return;
  }
  
  // Create default categories
  const categories = [
    { name: 'طعام وشراب', icon: 'utensils', color: '#FF6B6B' },
    { name: 'مواصلات', icon: 'car', color: '#4ECDC4' },
    { name: 'ترفيه', icon: 'gamepad', color: '#95E1D3' },
  ];
  
  for (const category of categories) {
    await prisma.expenseCategory.create({ data: category });
  }
  
  console.log(`Created ${categories.length} categories`);
}

migrate()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

**Run the script:**
```bash
npx tsx prisma/data-migrations/001-populate-default-categories.ts
```

### Using SQL Migrations

For complex data transformations, use SQL:

```sql
-- prisma/migrations/20240615000000_migrate_phone_format/migration.sql

-- Update phone number format
UPDATE users 
SET phone = CONCAT('+962', SUBSTRING(phone_number, 2))
WHERE phone_number LIKE '07%';

-- Add default values
UPDATE users 
SET profile_image = 'https://default-avatar.com/user.png'
WHERE profile_image IS NULL;
```

### Batch Processing

For large datasets, process in batches:

```typescript
async function migrateLargeDataset() {
  const batchSize = 1000;
  let skip = 0;
  let hasMore = true;
  
  while (hasMore) {
    const users = await prisma.user.findMany({
      take: batchSize,
      skip: skip,
      where: { phone: null },
    });
    
    if (users.length === 0) {
      hasMore = false;
      break;
    }
    
    // Process batch
    for (const user of users) {
      await prisma.user.update({
        where: { id: user.id },
        data: { phone: transformPhoneNumber(user.phoneNumber) },
      });
    }
    
    console.log(`Processed ${skip + users.length} users...`);
    skip += batchSize;
  }
}
```

---

## Rollback Procedures

### 1. Revert Last Migration (Development Only)

```bash
# ⚠️ WARNING: This deletes data!
# Reset to previous migration
npx prisma migrate reset
```

### 2. Manual Rollback (Production)

Prisma doesn't support automatic rollback. Manual steps:

**Option A: Database Backup Restore**
```bash
# Restore from backup
psql basira_db < backup_before_migration.sql
```

**Option B: Write Reverse Migration**

```sql
-- Original migration: Added column
ALTER TABLE users ADD COLUMN profile_image TEXT;

-- Reverse migration: Remove column
ALTER TABLE users DROP COLUMN profile_image;
```

Apply reverse migration:
```bash
psql -d basira_db -f reverse_migration.sql
```

**Option C: Deploy Previous Version**

1. Checkout previous commit
2. Run migrations
3. Deploy previous code

```bash
git checkout <previous-commit>
npx prisma migrate deploy
npm run build
pm2 restart basira-api
```

### Best Practices to Avoid Rollback

1. **Test migrations** in staging first
2. **Backup database** before migration
3. **Use additive changes** when possible
4. **Monitor** after deployment
5. **Have rollback plan** ready

---

## Production Migrations

### Pre-Migration Checklist

- [ ] Test migration in development
- [ ] Test migration in staging
- [ ] Review generated SQL
- [ ] Backup production database
- [ ] Plan maintenance window
- [ ] Prepare rollback procedure
- [ ] Notify stakeholders
- [ ] Monitor logs and metrics

### Production Migration Steps

#### Step 1: Backup Database

```bash
# PostgreSQL backup
pg_dump -U postgres -d basira_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Or using script
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backups/basira_db_${TIMESTAMP}.sql"
pg_dump -U postgres -d basira_db > $BACKUP_FILE
echo "Backup created: $BACKUP_FILE"
```

#### Step 2: Check Migration Status

```bash
# View pending migrations
npx prisma migrate status
```

#### Step 3: Deploy Migrations

```bash
# Apply all pending migrations
npx prisma migrate deploy

# Expected output:
# Applying migration `20240615000000_add_profile_image`
# Migration applied successfully
```

#### Step 4: Verify Migration

```bash
# Check database schema
psql -d basira_db -c "\d users"

# Verify data
psql -d basira_db -c "SELECT COUNT(*) FROM users;"
```

#### Step 5: Update Application

```bash
# Generate Prisma Client
npx prisma generate

# Rebuild application
npm run build

# Restart services
pm2 restart basira-api

# Monitor logs
pm2 logs basira-api
```

#### Step 6: Post-Migration Validation

```bash
# Health check
curl http://localhost:3000/health

# Test critical endpoints
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+962791234567","password":"test123"}'
```

### Zero-Downtime Migrations

For large-scale production systems:

**Strategy 1: Backward-Compatible Changes**
```
1. Deploy code that works with old AND new schema
2. Run migration
3. Deploy code that uses new schema only
```

**Strategy 2: Blue-Green Deployment**
```
1. Create new environment (Green)
2. Run migration on Green
3. Switch traffic to Green
4. Keep Blue as rollback option
```

**Strategy 3: Read Replicas**
```
1. Apply migration to replica first
2. Test on replica
3. Promote replica to primary
4. Apply to old primary (now replica)
```

---

## Common Scenarios

### Scenario 1: Adding a New Table

```prisma
// prisma/schema.prisma
model AiInsight {
  id          String   @id @default(uuid())
  userId      String
  type        String
  title       String
  description String
  priority    String   @default("MEDIUM")
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("ai_insights")
}
```

```bash
npx prisma migrate dev --name add_ai_insights_table
```

### Scenario 2: Adding an Index

```prisma
model Expense {
  // ... fields
  
  @@index([userId, expenseDate])
  @@index([categoryId])
  @@map("expenses")
}
```

```bash
npx prisma migrate dev --name add_expense_indexes
```

### Scenario 3: Adding Enum Type

```prisma
enum NotificationType {
  GOAL_MILESTONE
  SPENDING_ALERT
  SYSTEM
  ACHIEVEMENT
}

model Notification {
  type NotificationType
  // ... other fields
}
```

```bash
npx prisma migrate dev --name add_notification_type_enum
```

### Scenario 4: Renaming a Column

⚠️ **Requires custom SQL to avoid data loss**

```prisma
// Don't just rename in schema!
// Use custom migration SQL

model User {
  // phoneNumber String  // Old name
  phone String           // New name
}
```

**Custom migration:**
```sql
-- Do this instead of letting Prisma generate
-- prisma/migrations/xxx_rename_phone_number/migration.sql

ALTER TABLE users RENAME COLUMN "phoneNumber" TO "phone";
```

Then run:
```bash
npx prisma migrate dev --name rename_phone_number --create-only
# Edit the generated SQL to use RENAME instead of DROP/ADD
npx prisma migrate dev
```

### Scenario 5: Changing Column Type

```prisma
model FinancialGoal {
  // amount String  // Old: String
  amount Decimal   // New: Decimal
}
```

**Migration with data transformation:**
```sql
-- Cast existing data
ALTER TABLE financial_goals 
ALTER COLUMN amount TYPE DECIMAL USING amount::DECIMAL;
```

### Scenario 6: Adding Required Field to Existing Table

⚠️ **Cannot add required field to table with existing data**

**Solution: Two-step migration**

**Step 1: Add as optional**
```prisma
model User {
  // ... fields
  timezone String?  // Optional first
}
```

```bash
npx prisma migrate dev --name add_timezone_optional
```

**Step 2: Set default values**
```typescript
// Set default for existing users
await prisma.user.updateMany({
  where: { timezone: null },
  data: { timezone: 'Asia/Amman' },
});
```

**Step 3: Make required**
```prisma
model User {
  timezone String @default("Asia/Amman")  // Now required
}
```

```bash
npx prisma migrate dev --name make_timezone_required
```

---

## Troubleshooting

### Issue 1: Migration Failed

**Error:**
```
Migration failed with error:
ERROR: column "profile_image" of relation "users" already exists
```

**Solution:**
```bash
# Check current database schema
psql -d basira_db -c "\d users"

# If column exists, mark migration as applied
npx prisma migrate resolve --applied 20240615000000_add_profile_image

# Or reset and reapply
npx prisma migrate reset
```

### Issue 2: Schema Out of Sync

**Error:**
```
Error: Schema is out of sync with database
```

**Solution:**
```bash
# Push schema without migration (development only)
npx prisma db push

# Or create baseline migration
npx prisma migrate dev --name baseline
```

### Issue 3: Cannot Connect to Database

**Error:**
```
Can't reach database server at localhost:5432
```

**Solution:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Verify connection
psql -U postgres -l
```

### Issue 4: Migration Lock

**Error:**
```
Migration engine is locked by another process
```

**Solution:**
```bash
# Kill Prisma processes
pkill -9 prisma

# Remove lock file (if safe)
rm prisma/migrations/migration_lock.toml

# Retry migration
npx prisma migrate dev
```

### Issue 5: Foreign Key Constraint Violation

**Error:**
```
ERROR: insert or update on table violates foreign key constraint
```

**Solution:**

1. Check data consistency
2. Disable constraints temporarily (development only):
```sql
ALTER TABLE expenses DISABLE TRIGGER ALL;
-- Run migration
ALTER TABLE expenses ENABLE TRIGGER ALL;
```

3. Or clean orphaned data:
```sql
DELETE FROM expenses WHERE user_id NOT IN (SELECT id FROM users);
```

### Issue 6: Slow Migration on Large Tables

**Problem:** Migration takes hours on large table

**Solution:**

1. **Create index concurrently** (PostgreSQL):
```sql
CREATE INDEX CONCURRENTLY idx_expenses_user_id ON expenses(user_id);
```

2. **Add column with default** (avoid table rewrite):
```sql
-- Fast: doesn't rewrite table
ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active' NOT NULL;
```

3. **Use batch updates**:
```typescript
// Instead of updating all at once
const batches = Math.ceil(totalUsers / 10000);
for (let i = 0; i < batches; i++) {
  await prisma.user.updateMany({
    where: { /* condition */ },
    data: { /* update */ },
    take: 10000,
    skip: i * 10000,
  });
}
```

---

## Best Practices

### 1. Migration Naming

Use descriptive names:
```bash
# ✅ Good
npx prisma migrate dev --name add_profile_image_to_users
npx prisma migrate dev --name create_notifications_table
npx prisma migrate dev --name add_index_to_expenses

# ❌ Bad
npx prisma migrate dev --name update
npx prisma migrate dev --name fix
npx prisma migrate dev --name changes
```

### 2. Review Generated SQL

Always review before production:
```bash
# Create migration without applying
npx prisma migrate dev --create-only --name my_migration

# Review the SQL
cat prisma/migrations/*/migration.sql

# Apply if OK
npx prisma migrate dev
```

### 3. Test in Staging

```bash
# In staging environment
npx prisma migrate deploy

# Run tests
npm test

# Monitor for issues

# Then deploy to production
```

### 4. Backup Before Migration

```bash
#!/bin/bash
# pre-migration-backup.sh

BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATABASE="basira_db"

mkdir -p $BACKUP_DIR

echo "Creating backup..."
pg_dump -U postgres $DATABASE > $BACKUP_DIR/${DATABASE}_${TIMESTAMP}.sql

if [ $? -eq 0 ]; then
    echo "✅ Backup created: $BACKUP_DIR/${DATABASE}_${TIMESTAMP}.sql"
    echo "Running migrations..."
    npx prisma migrate deploy
else
    echo "❌ Backup failed! Aborting migration."
    exit 1
fi
```

### 5. Document Migrations

Add comments to migration files:
```sql
-- Migration: Add user profile images
-- Date: 2024-06-15
-- Author: Team Alpha
-- Purpose: Allow users to upload profile pictures
-- Risk Level: Low (additive change)

ALTER TABLE users ADD COLUMN profile_image TEXT;

-- No data migration needed - field is optional
```

---

## Migration Checklist

### Before Every Migration

- [ ] Review schema changes
- [ ] Test in development
- [ ] Test in staging
- [ ] Review generated SQL
- [ ] Backup database
- [ ] Check for breaking changes
- [ ] Update application code if needed
- [ ] Plan rollback procedure

### After Every Migration

- [ ] Verify migration applied successfully
- [ ] Check application logs
- [ ] Test critical endpoints
- [ ] Monitor error rates
- [ ] Verify data integrity
- [ ] Document changes
- [ ] Commit migration files to git

---

## Resources

- **Prisma Migrate Docs**: https://www.prisma.io/docs/concepts/components/prisma-migrate
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Migration Best Practices**: https://www.prisma.io/docs/guides/migrate

---

**Happy Migrating! 🚀**

Remember: Measure twice, migrate once!
