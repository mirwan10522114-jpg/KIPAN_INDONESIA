import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  await prisma.anggota.updateMany({ where: { namaLengkap: { contains: 'Mirwan' } }, data: { kabupatenId: 24 } });
  console.log('Fixed Anggota');
}
run();
