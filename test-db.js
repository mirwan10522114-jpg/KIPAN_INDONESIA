const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const kabs = await prisma.kabupaten.findMany({ where: { nama: { contains: 'Bandung' } } });
  console.log("KABUPATEN:", kabs);
  
  const pend = await prisma.pendaftaran.findMany({ include: { kabupaten: true } });
  console.log("PENDAFTARAN:", pend.map(p => ({ nama: p.namaLengkap, kab: p.kabupaten?.nama })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
