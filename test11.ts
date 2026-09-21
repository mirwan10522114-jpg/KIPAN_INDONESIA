import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  await prisma.user.updateMany({ 
    where: { email: { contains: 'kabbandungbarat' } },
    data: { kabupatenId: 24 }
  });
  console.log('Fixed User');
  await prisma.$disconnect();
}
run();
