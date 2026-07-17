-- AlterEnum
ALTER TYPE "otp_purpose" ADD VALUE 'EMAIL_VERIFICATION';

-- AlterTable
ALTER TABLE "otp_codes" ADD COLUMN     "email" VARCHAR(255);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "contributes_to_expenses" BOOLEAN,
ADD COLUMN     "email_verification_expires" TIMESTAMP(3),
ADD COLUMN     "email_verification_token" VARCHAR(255);

-- CreateTable
CREATE TABLE "password_history" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "password_history_user_id_idx" ON "password_history"("user_id");

-- AddForeignKey
ALTER TABLE "password_history" ADD CONSTRAINT "password_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
