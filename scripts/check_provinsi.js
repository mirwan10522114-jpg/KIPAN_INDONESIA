// Cek jumlah provinsi di database vs master data
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const dbProvinsi = await prisma.provinsi.findMany({ orderBy: { nama: "asc" } });
  console.log(`Provinsi di database: ${dbProvinsi.length}`);
  dbProvinsi.forEach(p => console.log(`  id=${p.id} kode=${p.kode} nama=${p.nama} status=${p.status}`));

  const dbKab = await prisma.kabupaten.count();
  console.log(`\nKabupaten di database: ${dbKab}`);

  await prisma.$disconnect();
})();
