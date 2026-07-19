-- AlterTable
ALTER TABLE "financial_goals" ADD COLUMN     "executed_at" TIMESTAMP(3),
ADD COLUMN     "goal_type" VARCHAR(50);

-- AlterTable
ALTER TABLE "user_profiles" ADD COLUMN     "payment_day" SMALLINT;
