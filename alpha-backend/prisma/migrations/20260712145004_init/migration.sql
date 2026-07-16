-- CreateEnum
CREATE TYPE "user_status" AS ENUM ('PENDING_VERIFICATION', 'VERIFIED', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "goal_status" AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED', 'DELETED');

-- CreateEnum
CREATE TYPE "transaction_type" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "otp_purpose" AS ENUM ('REGISTRATION', 'LOGIN', 'PASSWORD_RESET', 'PHONE_VERIFICATION', 'ACCOUNT_RECOVERY');

-- CreateEnum
CREATE TYPE "insight_type" AS ENUM ('SPENDING_PATTERN', 'GOAL_RECOMMENDATION', 'BUDGET_ALERT', 'SAVING_TIP', 'FINANCIAL_HEALTH', 'BEHAVIORAL_ANALYSIS');

-- CreateEnum
CREATE TYPE "priority_level" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('GOAL_MILESTONE', 'SPENDING_ALERT', 'WEEKLY_SUMMARY', 'MONTHLY_SUMMARY', 'EDUCATIONAL', 'SYSTEM', 'PROMOTIONAL');

-- CreateEnum
CREATE TYPE "expense_frequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "payment_method" AS ENUM ('CASH', 'CARD', 'BANK_TRANSFER', 'MOBILE_PAYMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "audit_action" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VERIFY', 'RESET_PASSWORD', 'CHANGE_STATUS');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "phone_number" VARCHAR(15) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "birth_date" DATE NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "status" "user_status" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "is_onboarded" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMP(3),
    "email_verified_at" TIMESTAMP(3),
    "phone_verified_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "monthly_income" DECIMAL(12,2) NOT NULL,
    "basic_expenses" DECIMAL(12,2) NOT NULL,
    "financial_goal" TEXT,
    "primary_spending_category" VARCHAR(100) NOT NULL,
    "occupation" VARCHAR(100),
    "education_level" VARCHAR(50),
    "family_size" INTEGER DEFAULT 1,
    "has_emergency_fund" BOOLEAN NOT NULL DEFAULT false,
    "risk_tolerance" VARCHAR(20),
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "change_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "income" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "source" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "frequency" "expense_frequency" NOT NULL DEFAULT 'MONTHLY',
    "income_date" DATE NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "income_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "notifications_enabled" BOOLEAN NOT NULL DEFAULT true,
    "email_notifications" BOOLEAN NOT NULL DEFAULT false,
    "push_notifications" BOOLEAN NOT NULL DEFAULT true,
    "sms_notifications" BOOLEAN NOT NULL DEFAULT true,
    "weekly_summary" BOOLEAN NOT NULL DEFAULT true,
    "monthly_summary" BOOLEAN NOT NULL DEFAULT true,
    "spending_alerts" BOOLEAN NOT NULL DEFAULT true,
    "goal_reminders" BOOLEAN NOT NULL DEFAULT true,
    "language" VARCHAR(5) NOT NULL DEFAULT 'ar',
    "currency" VARCHAR(3) NOT NULL DEFAULT 'JOD',
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'Asia/Amman',
    "theme" VARCHAR(20) NOT NULL DEFAULT 'light',
    "date_format" VARCHAR(20) NOT NULL DEFAULT 'DD/MM/YYYY',
    "data_sharing" BOOLEAN NOT NULL DEFAULT false,
    "analytics_opt_in" BOOLEAN NOT NULL DEFAULT true,
    "marketing_opt_in" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "session_timeout" INTEGER NOT NULL DEFAULT 30,
    "default_budget_period" VARCHAR(20) NOT NULL DEFAULT 'MONTHLY',
    "budget_alert_threshold" INTEGER NOT NULL DEFAULT 80,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_codes" (
    "id" UUID NOT NULL,
    "phone_number" VARCHAR(15) NOT NULL,
    "code" VARCHAR(6) NOT NULL,
    "purpose" "otp_purpose" NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "used_at" TIMESTAMP(3),
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID,

    CONSTRAINT "otp_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "refresh_token_hash" VARCHAR(255) NOT NULL,
    "device_info" JSONB,
    "device_id" VARCHAR(255),
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "revoked_at" TIMESTAMP(3),
    "revoke_reason" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "last_used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_goals" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "icon" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "target_amount" DECIMAL(12,2) NOT NULL,
    "current_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "target_date" DATE NOT NULL,
    "status" "goal_status" NOT NULL DEFAULT 'ACTIVE',
    "priority" "priority_level" NOT NULL DEFAULT 'MEDIUM',
    "progress_percentage" DECIMAL(5,2),
    "completed_at" TIMESTAMP(3),
    "milestone_25" BOOLEAN NOT NULL DEFAULT false,
    "milestone_50" BOOLEAN NOT NULL DEFAULT false,
    "milestone_75" BOOLEAN NOT NULL DEFAULT false,
    "milestone_100" BOOLEAN NOT NULL DEFAULT false,
    "category" VARCHAR(50),
    "tags" TEXT[],
    "notes" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goal_transactions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "goal_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "transaction_type" "transaction_type" NOT NULL,
    "description" TEXT,
    "balance_before" DECIMAL(12,2) NOT NULL,
    "balance_after" DECIMAL(12,2) NOT NULL,
    "transaction_date" DATE NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "goal_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "name_ar" VARCHAR(100),
    "icon" VARCHAR(100),
    "color" VARCHAR(7) NOT NULL DEFAULT '#6B7280',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_essential" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER,
    "parent_id" UUID,
    "created_by" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "payment_method" "payment_method",
    "location" VARCHAR(255),
    "merchant_name" VARCHAR(255),
    "receipt_url" VARCHAR(500),
    "receipt_data" JSONB,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurring_frequency" "expense_frequency",
    "recurring_end_date" DATE,
    "parent_expense_id" UUID,
    "expense_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tags" TEXT[],
    "notes" TEXT,
    "is_ai_processed" BOOLEAN NOT NULL DEFAULT false,
    "ai_category" VARCHAR(100),
    "ai_confidence" DECIMAL(3,2),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "category_id" UUID,
    "name" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "period" VARCHAR(20) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "spent" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "remaining" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "alert_at" INTEGER NOT NULL DEFAULT 80,
    "alerted" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_insights" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "insight_type" "insight_type" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "title_ar" VARCHAR(255),
    "description" TEXT NOT NULL,
    "description_ar" TEXT,
    "priority" "priority_level" NOT NULL DEFAULT 'MEDIUM',
    "score" DECIMAL(3,2),
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_dismissed" BOOLEAN NOT NULL DEFAULT false,
    "is_acted_on" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB,
    "action_url" VARCHAR(500),
    "expires_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "dismissed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "notification_type" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "title_ar" VARCHAR(255),
    "message" TEXT NOT NULL,
    "message_ar" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_sent" BOOLEAN NOT NULL DEFAULT false,
    "channels" TEXT[],
    "priority" "priority_level" NOT NULL DEFAULT 'MEDIUM',
    "scheduled_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "data" JSONB,
    "action_url" VARCHAR(500),
    "image_url" VARCHAR(500),
    "delivery_status" VARCHAR(50),
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "achievement_key" VARCHAR(100) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "title_ar" VARCHAR(255),
    "description" TEXT NOT NULL,
    "description_ar" TEXT,
    "icon" VARCHAR(100) NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "target" INTEGER NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "points_earned" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "action" "audit_action" NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" UUID,
    "old_values" JSONB,
    "new_values" JSONB,
    "changes" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "request_id" UUID,
    "endpoint" VARCHAR(255),
    "method" VARCHAR(10),
    "metadata" JSONB,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");

-- CreateIndex
CREATE INDEX "users_phone_number_idx" ON "users"("phone_number");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_is_onboarded_idx" ON "users"("is_onboarded");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE INDEX "user_profiles_user_id_idx" ON "user_profiles"("user_id");

-- CreateIndex
CREATE INDEX "user_profiles_user_id_is_current_idx" ON "user_profiles"("user_id", "is_current");

-- CreateIndex
CREATE INDEX "user_profiles_version_idx" ON "user_profiles"("version");

-- CreateIndex
CREATE INDEX "user_profiles_created_at_idx" ON "user_profiles"("created_at");

-- CreateIndex
CREATE INDEX "income_user_id_idx" ON "income"("user_id");

-- CreateIndex
CREATE INDEX "income_income_date_idx" ON "income"("income_date");

-- CreateIndex
CREATE INDEX "income_is_active_idx" ON "income"("is_active");

-- CreateIndex
CREATE INDEX "income_deleted_at_idx" ON "income"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_user_id_key" ON "user_settings"("user_id");

-- CreateIndex
CREATE INDEX "otp_codes_phone_number_idx" ON "otp_codes"("phone_number");

-- CreateIndex
CREATE INDEX "otp_codes_code_purpose_is_used_idx" ON "otp_codes"("code", "purpose", "is_used");

-- CreateIndex
CREATE INDEX "otp_codes_expires_at_idx" ON "otp_codes"("expires_at");

-- CreateIndex
CREATE INDEX "otp_codes_created_at_idx" ON "otp_codes"("created_at");

-- CreateIndex
CREATE INDEX "user_sessions_user_id_idx" ON "user_sessions"("user_id");

-- CreateIndex
CREATE INDEX "user_sessions_refresh_token_hash_idx" ON "user_sessions"("refresh_token_hash");

-- CreateIndex
CREATE INDEX "user_sessions_is_active_idx" ON "user_sessions"("is_active");

-- CreateIndex
CREATE INDEX "user_sessions_expires_at_idx" ON "user_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "user_sessions_device_id_idx" ON "user_sessions"("device_id");

-- CreateIndex
CREATE INDEX "financial_goals_user_id_idx" ON "financial_goals"("user_id");

-- CreateIndex
CREATE INDEX "financial_goals_user_id_status_idx" ON "financial_goals"("user_id", "status");

-- CreateIndex
CREATE INDEX "financial_goals_status_idx" ON "financial_goals"("status");

-- CreateIndex
CREATE INDEX "financial_goals_target_date_idx" ON "financial_goals"("target_date");

-- CreateIndex
CREATE INDEX "financial_goals_deleted_at_idx" ON "financial_goals"("deleted_at");

-- CreateIndex
CREATE INDEX "goal_transactions_user_id_idx" ON "goal_transactions"("user_id");

-- CreateIndex
CREATE INDEX "goal_transactions_goal_id_idx" ON "goal_transactions"("goal_id");

-- CreateIndex
CREATE INDEX "goal_transactions_transaction_date_idx" ON "goal_transactions"("transaction_date");

-- CreateIndex
CREATE INDEX "goal_transactions_created_at_idx" ON "goal_transactions"("created_at");

-- CreateIndex
CREATE INDEX "expense_categories_is_default_idx" ON "expense_categories"("is_default");

-- CreateIndex
CREATE INDEX "expense_categories_is_essential_idx" ON "expense_categories"("is_essential");

-- CreateIndex
CREATE INDEX "expense_categories_created_by_idx" ON "expense_categories"("created_by");

-- CreateIndex
CREATE INDEX "expense_categories_parent_id_idx" ON "expense_categories"("parent_id");

-- CreateIndex
CREATE INDEX "expenses_user_id_idx" ON "expenses"("user_id");

-- CreateIndex
CREATE INDEX "expenses_category_id_idx" ON "expenses"("category_id");

-- CreateIndex
CREATE INDEX "expenses_user_id_expense_date_idx" ON "expenses"("user_id", "expense_date");

-- CreateIndex
CREATE INDEX "expenses_expense_date_idx" ON "expenses"("expense_date");

-- CreateIndex
CREATE INDEX "expenses_is_recurring_idx" ON "expenses"("is_recurring");

-- CreateIndex
CREATE INDEX "expenses_deleted_at_idx" ON "expenses"("deleted_at");

-- CreateIndex
CREATE INDEX "budgets_user_id_idx" ON "budgets"("user_id");

-- CreateIndex
CREATE INDEX "budgets_category_id_idx" ON "budgets"("category_id");

-- CreateIndex
CREATE INDEX "budgets_start_date_end_date_idx" ON "budgets"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "budgets_is_active_idx" ON "budgets"("is_active");

-- CreateIndex
CREATE INDEX "ai_insights_user_id_idx" ON "ai_insights"("user_id");

-- CreateIndex
CREATE INDEX "ai_insights_user_id_is_read_idx" ON "ai_insights"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "ai_insights_insight_type_idx" ON "ai_insights"("insight_type");

-- CreateIndex
CREATE INDEX "ai_insights_priority_idx" ON "ai_insights"("priority");

-- CreateIndex
CREATE INDEX "ai_insights_expires_at_idx" ON "ai_insights"("expires_at");

-- CreateIndex
CREATE INDEX "ai_insights_created_at_idx" ON "ai_insights"("created_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_is_sent_idx" ON "notifications"("is_sent");

-- CreateIndex
CREATE INDEX "notifications_scheduled_at_idx" ON "notifications"("scheduled_at");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "user_achievements_user_id_idx" ON "user_achievements"("user_id");

-- CreateIndex
CREATE INDEX "user_achievements_is_completed_idx" ON "user_achievements"("is_completed");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_user_id_achievement_key_key" ON "user_achievements"("user_id", "achievement_key");

-- CreateIndex
CREATE INDEX "audit_log_user_id_idx" ON "audit_log"("user_id");

-- CreateIndex
CREATE INDEX "audit_log_entity_type_entity_id_idx" ON "audit_log"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_log_action_idx" ON "audit_log"("action");

-- CreateIndex
CREATE INDEX "audit_log_created_at_idx" ON "audit_log"("created_at");

-- CreateIndex
CREATE INDEX "audit_log_request_id_idx" ON "audit_log"("request_id");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "income" ADD CONSTRAINT "income_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp_codes" ADD CONSTRAINT "otp_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_goals" ADD CONSTRAINT "financial_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_transactions" ADD CONSTRAINT "goal_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_transactions" ADD CONSTRAINT "goal_transactions_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "financial_goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_categories" ADD CONSTRAINT "expense_categories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "expense_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "expense_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_insights" ADD CONSTRAINT "ai_insights_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
