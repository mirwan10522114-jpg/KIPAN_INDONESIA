const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  // Delete test anggota
  const deleted = await prisma.anggota.deleteMany({
    where: { namaLengkap: { in: ["Test Dokumen Upload", "Test Admin Tambah Anggota"] } }
  });
  console.log("Deleted test anggota:", deleted.count);
  // Delete test pendaftaran
  const delPend = await prisma.pendaftaran.deleteMany({
    where: { namaLengkap: { in: ["Test Dokumen Upload", "Test Admin Tambah Anggota"] } }
  });
  console.log("Deleted test pendaftaran:", delPend.count);
  await prisma.$disconnect();
})();
