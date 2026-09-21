import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  await prisma.kabupaten.update({ where: { id: 11 }, data: { nama: 'Kab. Bandung' } });
  console.log('Fixed');
}
run();
