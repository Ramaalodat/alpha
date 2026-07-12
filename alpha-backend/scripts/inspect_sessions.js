const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const userId = '8b3306cd-e77e-4f27-9926-f7721fb4693e';
    const sessions = await prisma.userSession.findMany({ where: { userId } });
    console.log(JSON.stringify(sessions, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
})();
