// Reset NIP sequence — hapus semua data test anggota/pengurus/pendaftaran & reset autoincrement
// User ingin pendaftar pertama yang asli mendapat NIP berakhiran 00001
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Cleaning ALL test data + reset NIP sequence...\n");

  // 1. Cek dulu apa yang ada
  const beforeCounts = {
    anggota: await prisma.anggota.count(),
    pengurus: await prisma.pengurus.count(),
    pendaftaran: await prisma.pendaftaran.count(),
    pendaftaranRiwayat: await prisma.pendaftaranRiwayat.count(),
    activityLog: await prisma.activityLog.count(),
  };
  console.log("📊 Before cleanup:");
  Object.entries(beforeCounts).forEach(([k, v]) => console.log(`  ${k}: ${v}`));

  // 2. Delete semua data dalam urutan yang benar (FK constraint)
  console.log("\n🗑️  Deleting data...");

  const del1 = await prisma.activityLog.deleteMany({});
  console.log(`  activityLog: ${del1.count} deleted`);

  const del2 = await prisma.pendaftaranRiwayat.deleteMany({});
  console.log(`  pendaftaranRiwayat: ${del2.count} deleted`);

  const del3 = await prisma.pendaftaran.deleteMany({});
  console.log(`  pendaftaran: ${del3.count} deleted`);

  const del4 = await prisma.pengurus.deleteMany({});
  console.log(`  pengurus: ${del4.count} deleted`);

  const del5 = await prisma.anggota.deleteMany({});
  console.log(`  anggota: ${del5.count} deleted`);

  // 3. Reset SQLite autoincrement sequences
  console.log("\n🔄 Resetting autoincrement sequences...");
  try {
    await prisma.$executeRawUnsafe('DELETE FROM sqlite_sequence WHERE name IN ("anggota", "pengurus", "pendaftaran", "pendaftaran_riwayat", "activity_log");');
    console.log("  ✓ sqlite_sequence reset for: anggota, pengurus, pendaftaran, pendaftaran_riwayat, activity_log");
  } catch (e) {
    console.log(`  ⚠️  Could not reset sqlite_sequence: ${e.message}`);
  }

  // 4. Verify
  const afterCounts = {
    anggota: await prisma.anggota.count(),
    pengurus: await prisma.pengurus.count(),
    pendaftaran: await prisma.pendaftaran.count(),
    pendaftaranRiwayat: await prisma.pendaftaranRiwayat.count(),
    activityLog: await prisma.activityLog.count(),
  };
  console.log("\n📊 After cleanup:");
  Object.entries(afterCounts).forEach(([k, v]) => console.log(`  ${k}: ${v}`));

  // 5. Verify wilayah tetap utuh (tidak boleh hilang)
  const provCount = await prisma.provinsi.count();
  const kabCount = await prisma.kabupaten.count();
  const jabCount = await prisma.jabatan.count();
  console.log(`\n✅ Master data tetap utuh:`);
  console.log(`  provinsi: ${provCount}`);
  console.log(`  kabupaten: ${kabCount}`);
  console.log(`  jabatan: ${jabCount}`);

  console.log("\n✅ Done! NIP sequence sekarang akan mulai dari 00001 untuk anggota pertama yang asli.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
