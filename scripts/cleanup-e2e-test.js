// Cleanup test data created by e2e-test.sh
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up test data...");

  // 1. Find test anggota IDs first (yang akan di-delete)
  const testAnggota = await prisma.anggota.findMany({
    where: {
      OR: [
        { email: { startsWith: "e2e." } },
        { email: "testfix@example.com" },
        { email: "test.pengurus@example.com" },
        { email: "garut.test@example.com" },
        { namaLengkap: { startsWith: "Test Pengurus" } },
        { namaLengkap: { startsWith: "E2E Test" } },
        { namaLengkap: { startsWith: "Test E2E" } },
        { namaLengkap: "Test User Fix" },
      ]
    },
    select: { id: true }
  });
  const testAnggotaIds = testAnggota.map(a => a.id);
  console.log(`  Found ${testAnggotaIds.length} test anggota to delete`);

  // 2. Delete pengurus referencing those anggota first (FK constraint)
  if (testAnggotaIds.length > 0) {
    const deletedPengurus = await prisma.pengurus.deleteMany({
      where: { anggotaId: { in: testAnggotaIds } }
    });
    console.log(`  Deleted ${deletedPengurus.count} test pengurus`);
  }

  // 3. Now delete anggota test
  const deletedAnggota = await prisma.anggota.deleteMany({
    where: { id: { in: testAnggotaIds } }
  });
  console.log(`  Deleted ${deletedAnggota.count} test anggota`);

  // 4. Delete pendaftaran test
  const deletedPendaftaran = await prisma.pendaftaran.deleteMany({
    where: {
      OR: [
        { email: { startsWith: "e2e." } },
        { email: "testfix@example.com" },
        { email: "garut.test@example.com" },
        { namaLengkap: { startsWith: "Test E2E" } },
        { namaLengkap: "Test User Fix" },
      ]
    }
  });
  console.log(`  Deleted ${deletedPendaftaran.count} test pendaftaran`);

  // 5. Delete test kabupaten (yang dibuat auto)
  const deletedKab = await prisma.kabupaten.deleteMany({
    where: {
      OR: [
        { nama: { startsWith: "Test Kabupaten" } },
        { kode: { in: ["3208", "3211", "3276"] } },
      ]
    }
  });
  console.log(`  Deleted ${deletedKab.count} test kabupaten`);

  // 6. Delete test jabatan/bidang
  const deletedJabatan = await prisma.jabatan.deleteMany({
    where: {
      OR: [
        { bidang: "Bidang Test Audit" },
        { bidang: "Bidang Test E2E Unique" },
        { bidang: "Bidang Bulk E2E" },
        { bidang: { startsWith: "Bidang Test" } },
      ]
    }
  });
  console.log(`  Deleted ${deletedJabatan.count} test jabatan`);

  // 7. Delete activity log test
  const deletedLog = await prisma.activityLog.deleteMany({
    where: {
      OR: [
        { table: "wilayah", detail: { contains: "Test" } },
        { table: "jabatan", detail: { contains: "Bidang Test" } },
        { table: "jabatan", detail: { contains: "Bidang Bulk" } },
      ]
    }
  });
  console.log(`  Deleted ${deletedLog.count} test activity logs`);

  console.log("\n✅ Cleanup done!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
