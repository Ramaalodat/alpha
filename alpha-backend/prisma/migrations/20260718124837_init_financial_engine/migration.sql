-- CreateEnum
CREATE TYPE "allocation_source" AS ENUM ('SYSTEM_TIER', 'USER_ADJUSTED', 'TRANSITION_PLAN');

-- CreateEnum
CREATE TYPE "cycle_status" AS ENUM ('OPEN', 'SETTLEMENT_PENDING', 'CLOSED');

-- CreateEnum
CREATE TYPE "transaction_direction" AS ENUM ('INFLOW', 'OUTFLOW');

-- CreateEnum
CREATE TYPE "budget_bucket" AS ENUM ('NEEDS', 'WANTS', 'SAVINGS', 'CAPITAL_EXPENSE', 'TRANSFER');

-- CreateEnum
CREATE TYPE "transaction_status" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "commitment_flexibility" AS ENUM ('FIXED', 'VARIABLE');

-- CreateEnum
CREATE TYPE "commitment_status" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "occurrence_status" AS ENUM ('UPCOMING', 'DUE', 'PAID', 'OVERDUE', 'WAIVED');

-- CreateEnum
CREATE TYPE "goal_planning_mode" AS ENUM ('CONTRIBUTION_BASED', 'DEADLINE_BASED');

-- CreateEnum
CREATE TYPE "goal_stage" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'READY', 'EXECUTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "transition_plan_status" AS ENUM ('PROPOSED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "settlement_action_type" AS ENUM ('CARRY_FORWARD', 'EMERGENCY_FUND', 'GOAL_ALLOCATION', 'UNALLOCATED_SAVINGS', 'CUSTOM');

-- AlterTable
ALTER TABLE "financial_goals" ADD COLUMN     "planning_mode" "goal_planning_mode" NOT NULL DEFAULT 'DEADLINE_BASED',
ADD COLUMN     "stage" "goal_stage" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "goal_transactions" ADD COLUMN     "cycle_id" UUID,
ADD COLUMN     "related_goal_id" UUID,
ADD COLUMN     "source_transaction_id" UUID;

-- CreateTable
CREATE TABLE "allocation_preferences" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "needs_bps" INTEGER NOT NULL,
    "wants_bps" INTEGER NOT NULL,
    "savings_bps" INTEGER NOT NULL,
    "source" "allocation_source" NOT NULL,
    "based_on_income" DECIMAL(12,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allocation_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allocation_tiers" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "label_ar" VARCHAR(100) NOT NULL,
    "label_en" VARCHAR(100) NOT NULL,
    "minimum_income" DECIMAL(12,2) NOT NULL,
    "maximum_income" DECIMAL(12,2),
    "needs_bps" INTEGER NOT NULL,
    "wants_bps" INTEGER NOT NULL,
    "savings_bps" INTEGER NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "allocation_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_cycles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "cycle_status" NOT NULL DEFAULT 'OPEN',
    "expected_income" DECIMAL(12,2) NOT NULL,
    "recorded_income" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "unexpected_income" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "policy_version" INTEGER NOT NULL DEFAULT 1,
    "settlement_started_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cycle_allocation_snapshots" (
    "id" UUID NOT NULL,
    "cycle_id" UUID NOT NULL,
    "allocation_base_income" DECIMAL(12,2) NOT NULL,
    "tier_code" VARCHAR(50),
    "tier_label" VARCHAR(100),
    "allocation_source" "allocation_source" NOT NULL,
    "needs_bps" INTEGER NOT NULL,
    "wants_bps" INTEGER NOT NULL,
    "savings_bps" INTEGER NOT NULL,
    "needs_target" DECIMAL(12,2) NOT NULL,
    "wants_target" DECIMAL(12,2) NOT NULL,
    "savings_target" DECIMAL(12,2) NOT NULL,
    "policy_version" VARCHAR(50) NOT NULL,
    "calculation_version" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cycle_allocation_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "cycle_id" UUID,
    "amount" DECIMAL(12,2) NOT NULL,
    "direction" "transaction_direction" NOT NULL,
    "transaction_type" "transaction_type" NOT NULL,
    "income_kind" "income_source_type",
    "budget_bucket" "budget_bucket",
    "category_id" UUID,
    "status" "transaction_status" NOT NULL DEFAULT 'CONFIRMED',
    "description" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_commitments" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "frequency" "expense_frequency" NOT NULL,
    "next_due_date" DATE NOT NULL,
    "budget_bucket" "budget_bucket" NOT NULL DEFAULT 'NEEDS',
    "flexibility" "commitment_flexibility" NOT NULL DEFAULT 'FIXED',
    "status" "commitment_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_commitments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commitment_occurrences" (
    "id" UUID NOT NULL,
    "commitment_id" UUID NOT NULL,
    "cycle_id" UUID,
    "due_date" DATE NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "occurrence_status" NOT NULL DEFAULT 'UPCOMING',
    "paid_transaction_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commitment_occurrences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savings_allocations" (
    "id" UUID NOT NULL,
    "cycle_id" UUID NOT NULL,
    "emergency_fund_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "goals_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "unallocated_savings_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "savings_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goal_cycle_allocations" (
    "id" UUID NOT NULL,
    "cycle_id" UUID NOT NULL,
    "goal_id" UUID NOT NULL,
    "planned_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "actual_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "priority_snapshot" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "goal_cycle_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allocation_transition_plans" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" "transition_plan_status" NOT NULL DEFAULT 'PROPOSED',
    "current_step" INTEGER NOT NULL DEFAULT 1,
    "step_bps" INTEGER NOT NULL,
    "start_needs_bps" INTEGER NOT NULL,
    "start_wants_bps" INTEGER NOT NULL,
    "start_savings_bps" INTEGER NOT NULL,
    "target_needs_bps" INTEGER NOT NULL,
    "target_wants_bps" INTEGER NOT NULL,
    "target_savings_bps" INTEGER NOT NULL,
    "funding_bucket" "budget_bucket" NOT NULL,
    "start_cycle_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_at" TIMESTAMP(3),
    "paused_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "allocation_transition_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cycle_settlements" (
    "id" UUID NOT NULL,
    "cycle_id" UUID NOT NULL,
    "expected_income" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "actual_recurring_income" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "unexpected_income" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "planned_needs" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "actual_needs" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "planned_wants" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "actual_wants" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "planned_savings" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "actual_savings" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "surplus" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "deficit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "cycle_status" NOT NULL DEFAULT 'SETTLEMENT_PENDING',
    "approved_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cycle_settlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settlement_actions" (
    "id" UUID NOT NULL,
    "settlement_id" UUID NOT NULL,
    "action_type" "settlement_action_type" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "target_goal_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settlement_actions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "allocation_preferences_user_id_key" ON "allocation_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "allocation_tiers_code_key" ON "allocation_tiers"("code");

-- CreateIndex
CREATE INDEX "financial_cycles_user_id_idx" ON "financial_cycles"("user_id");

-- CreateIndex
CREATE INDEX "financial_cycles_status_idx" ON "financial_cycles"("status");

-- CreateIndex
CREATE INDEX "financial_cycles_start_date_end_date_idx" ON "financial_cycles"("start_date", "end_date");

-- CreateIndex
CREATE UNIQUE INDEX "cycle_allocation_snapshots_cycle_id_key" ON "cycle_allocation_snapshots"("cycle_id");

-- CreateIndex
CREATE INDEX "transactions_cycle_id_status_occurred_at_idx" ON "transactions"("cycle_id", "status", "occurred_at");

-- CreateIndex
CREATE INDEX "transactions_user_id_occurred_at_idx" ON "transactions"("user_id", "occurred_at");

-- CreateIndex
CREATE INDEX "transactions_budget_bucket_status_idx" ON "transactions"("budget_bucket", "status");

-- CreateIndex
CREATE INDEX "financial_commitments_user_id_idx" ON "financial_commitments"("user_id");

-- CreateIndex
CREATE INDEX "financial_commitments_status_idx" ON "financial_commitments"("status");

-- CreateIndex
CREATE INDEX "financial_commitments_next_due_date_idx" ON "financial_commitments"("next_due_date");

-- CreateIndex
CREATE INDEX "commitment_occurrences_commitment_id_idx" ON "commitment_occurrences"("commitment_id");

-- CreateIndex
CREATE INDEX "commitment_occurrences_cycle_id_idx" ON "commitment_occurrences"("cycle_id");

-- CreateIndex
CREATE INDEX "commitment_occurrences_status_idx" ON "commitment_occurrences"("status");

-- CreateIndex
CREATE INDEX "savings_allocations_cycle_id_idx" ON "savings_allocations"("cycle_id");

-- CreateIndex
CREATE UNIQUE INDEX "goal_cycle_allocations_cycle_id_goal_id_key" ON "goal_cycle_allocations"("cycle_id", "goal_id");

-- CreateIndex
CREATE INDEX "allocation_transition_plans_user_id_idx" ON "allocation_transition_plans"("user_id");

-- CreateIndex
CREATE INDEX "allocation_transition_plans_status_idx" ON "allocation_transition_plans"("status");

-- CreateIndex
CREATE UNIQUE INDEX "cycle_settlements_cycle_id_key" ON "cycle_settlements"("cycle_id");

-- CreateIndex
CREATE INDEX "settlement_actions_settlement_id_idx" ON "settlement_actions"("settlement_id");

-- AddForeignKey
ALTER TABLE "allocation_preferences" ADD CONSTRAINT "allocation_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_cycles" ADD CONSTRAINT "financial_cycles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cycle_allocation_snapshots" ADD CONSTRAINT "cycle_allocation_snapshots_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "financial_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "financial_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_commitments" ADD CONSTRAINT "financial_commitments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commitment_occurrences" ADD CONSTRAINT "commitment_occurrences_commitment_id_fkey" FOREIGN KEY ("commitment_id") REFERENCES "financial_commitments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commitment_occurrences" ADD CONSTRAINT "commitment_occurrences_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "financial_cycles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_allocations" ADD CONSTRAINT "savings_allocations_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "financial_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_cycle_allocations" ADD CONSTRAINT "goal_cycle_allocations_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "financial_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_cycle_allocations" ADD CONSTRAINT "goal_cycle_allocations_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "financial_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation_transition_plans" ADD CONSTRAINT "allocation_transition_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cycle_settlements" ADD CONSTRAINT "cycle_settlements_cycle_id_fkey" FOREIGN KEY ("cycle_id") REFERENCES "financial_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settlement_actions" ADD CONSTRAINT "settlement_actions_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "cycle_settlements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
