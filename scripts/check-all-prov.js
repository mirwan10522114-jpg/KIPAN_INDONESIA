const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const all = await prisma.provinsi.findMany({ orderBy: { kode: 'asc' } });
  console.log("Total:", all.length);
  all.forEach(p => console.log(`  ${p.kode} = ${p.nama}`));
}
main().catch(console.error).finally(() => prisma.$disconnect());
