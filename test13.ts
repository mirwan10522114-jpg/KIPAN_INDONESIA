import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const userByEmail = await prisma.user.findFirst({
    where: { email: { contains: 'bandungbarat' } },
    include: { kabupaten: true }
  });
  console.log("User by email:", JSON.stringify(userByEmail, null, 2));
  await prisma.$disconnect();
}
run();
