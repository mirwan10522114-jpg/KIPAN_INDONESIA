const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  // Hapus semua pendaftaran test berdasarkan email test
  const deleted = await prisma.pendaftaran.deleteMany({
    where: {
      email: { in: ["testfix@example.com", "garut.test@example.com"] }
    }
  });
  console.log(`Deleted ${deleted.count} test pendaftaran`);

  // Hapus kabupaten auto-created Garut (3211) supaya DB kembali kondisi semula
  const deletedKab = await prisma.kabupaten.deleteMany({
    where: { kode: "3211" }
  });
  console.log(`Deleted ${deletedKab.count} test kabupaten`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
