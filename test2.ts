import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const anggota = await prisma.anggota.findMany({ where: { namaLengkap: { contains: 'Mirwan' } }, select: { namaLengkap: true, kabupatenId: true } });
  console.log(anggota);
}
run();
