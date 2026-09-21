import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  await prisma.pengurus.updateMany({ where: { anggota: { namaLengkap: { contains: 'Mirwan' } } }, data: { kabupatenId: 24 } });
  console.log('Fixed Pengurus');
}
run();
