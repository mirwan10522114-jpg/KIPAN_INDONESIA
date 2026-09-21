import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const user = await prisma.user.findFirst({ where: { email: { contains: 'kabbandungbarat' } } });
  console.log(user);
}
run();
