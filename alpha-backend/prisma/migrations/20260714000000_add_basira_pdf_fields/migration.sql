-- CreateEnum
CREATE TYPE "gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "marital_status" AS ENUM ('SINGLE', 'MARRIED', 'OTHER');

-- CreateEnum
CREATE TYPE "money_relationship" AS ENUM ('SAVING_CAREFULLY', 'BALANCED_SPENDING', 'EMOTIONAL_SPENDING', 'OTHER');

-- CreateEnum
CREATE TYPE "income_source_type" AS ENUM ('REGULAR_SALARY', 'TEMPORARY_JOB', 'FAMILY_ALLOWANCE', 'EXTERNAL_HELP', 'RENTAL_INCOME', 'OTHER_INCOME');

-- CreateEnum
CREATE TYPE "expense_type" AS ENUM ('FIXED', 'VARIABLE');

-- CreateEnum
CREATE TYPE "goal_flexibility" AS ENUM ('FIXED', 'FLEXIBLE');

-- AlterTable: User - Extended personal data
ALTER TABLE "users" ADD COLUMN "email" VARCHAR(255);
ALTER TABLE "users" ADD COLUMN "username" VARCHAR(100);
ALTER TABLE "users" ADD COLUMN "gender" "gender";
ALTER TABLE "users" ADD COLUMN "marital_status" "marital_status";
ALTER TABLE "users" ADD COLUMN "is_head_of_household" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "is_student" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex: Unique constraints
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AlterTable: UserProfile - Financial profile data
ALTER TABLE "user_profiles" ADD COLUMN "relationship_with_money" "money_relationship";
ALTER TABLE "user_profiles" ADD COLUMN "monthly_extra_savings_goal" DECIMAL(12,2);
ALTER TABLE "user_profiles" ADD COLUMN "main_financial_goal_12m" VARCHAR(100);
ALTER TABLE "user_profiles" ADD COLUMN "fixed_expenses_total" DECIMAL(12,2);
ALTER TABLE "user_profiles" ADD COLUMN "variable_expenses_total" DECIMAL(12,2);

-- AlterTable: Income - Typed income source with pinning
ALTER TABLE "income" ADD COLUMN "source_type" "income_source_type";
ALTER TABLE "income" ADD COLUMN "pinned_months" SMALLINT;
ALTER TABLE "income" ADD COLUMN "pinned_until" DATE;

-- CreateIndex
CREATE INDEX "income_userId_source_type_idx" ON "income"("user_id", "source_type");

-- AlterTable: FinancialGoal - Fixed/Flexible goal type
ALTER TABLE "financial_goals" ADD COLUMN "flexibility" "goal_flexibility" DEFAULT 'FLEXIBLE';
ALTER TABLE "financial_goals" ADD COLUMN "goal_category" VARCHAR(100);
ALTER TABLE "financial_goals" ADD COLUMN "can_be_postponed" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "financial_goals" ADD COLUMN "monthly_allocation" DECIMAL(12,2);

-- CreateIndex
CREATE INDEX "financial_goals_userId_flexibility_idx" ON "financial_goals"("user_id", "flexibility");

-- AlterTable: Expense - Fixed/Variable classification with pinning
ALTER TABLE "expenses" ADD COLUMN "expense_type" "expense_type";
ALTER TABLE "expenses" ADD COLUMN "pinned_months" SMALLINT;
ALTER TABLE "expenses" ADD COLUMN "pinned_until" DATE;

-- CreateIndex
CREATE INDEX "expenses_userId_expense_type_idx" ON "expenses"("user_id", "expense_type");
