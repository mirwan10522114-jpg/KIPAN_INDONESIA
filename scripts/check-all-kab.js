const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const all = await prisma.kabupaten.findMany({ include: { provinsi: true }, orderBy: { kode: 'asc' } });
  console.log("Total kabupaten:", all.length);
  all.forEach(k => console.log(`  ${k.kode} = ${k.nama} (prov: ${k.provinsi.kode}=${k.provinsi.nama})`));
}
main().catch(console.error).finally(() => prisma.$disconnect());
