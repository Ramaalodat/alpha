import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  try {
    // We update the data to remove the old enum values
    await prisma.$executeRawUnsafe(`UPDATE financial_goals SET status = 'CANCELLED' WHERE status::text = 'DELETED'`);
    await prisma.$executeRawUnsafe(`UPDATE financial_goals SET status = 'ACTIVE' WHERE status::text = 'COMPLETED'`);
    console.log("Successfully updated financial_goals");
  } catch (e) {
    console.error("Error updating database:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
