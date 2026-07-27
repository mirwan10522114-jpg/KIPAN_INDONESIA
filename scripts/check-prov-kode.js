const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  // Cari provinsi dengan kode "32"
  const p32 = await prisma.provinsi.findUnique({ where: { kode: "32" } });
  console.log("Provinsi kode 32:", p32);
  // Cari semua provinsi dengan kode awalan "3"
  const p3x = await prisma.provinsi.findMany({ where: { kode: { startsWith: "3" } } });
  console.log("Provinsi kode startsWith 3:", p3x.map(p => `${p.kode}=${p.nama}`).join(", "));
}
main().catch(console.error).finally(() => prisma.$disconnect());
