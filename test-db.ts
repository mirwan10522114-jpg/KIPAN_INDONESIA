import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const kabs = await prisma.kabupaten.findMany({ where: { nama: { contains: 'Bandung' } } });
  console.log(kabs);
}
run();
