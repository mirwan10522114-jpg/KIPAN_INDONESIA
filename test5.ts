import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const p = await prisma.pengurus.findMany({ include: { anggota: { select: { namaLengkap: true } } } });
  console.log(p.filter(x => x.anggota?.namaLengkap.includes('Mirwan')));
}
run();
