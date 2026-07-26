// ============================================================
// SEED JABATAN — Struktur Pengurus Harian + Divisi-divisi
// Berdasarkan struktur KIPAN Nasional yang diberikan user
// Dibuat untuk 3 level: Nasional, Provinsi, Kabupaten
// Run: npx tsx scripts/seed-jabatan.ts
// ============================================================

import { db } from "../src/lib/db";

// Struktur bidang & jabatan (urutan menentukan posisi tampil)
const BIDANG_STRUCTURE: Array<{
  bidang: string;
  jabatan: Array<{ nama: string; urutan: number }>;
}> = [
  {
    bidang: "Pengurus Harian",
    jabatan: [
      { nama: "Ketua Umum", urutan: 1 },
      { nama: "Wakil Ketua", urutan: 2 },
      { nama: "Sekretaris Umum", urutan: 3 },
      { nama: "Wakil Sekretaris", urutan: 4 },
      { nama: "Bendahara Umum", urutan: 5 },
      { nama: "Wakil Bendahara", urutan: 6 },
    ],
  },
  {
    bidang: "Divisi Organisasi dan Keanggotaan",
    jabatan: [
      { nama: "Ketua Divisi", urutan: 1 },
      { nama: "Sekretaris Divisi", urutan: 2 },
      { nama: "Anggota", urutan: 3 },
    ],
  },
  {
    bidang: "Divisi Informasi dan Komunikasi",
    jabatan: [
      { nama: "Ketua Divisi", urutan: 1 },
      { nama: "Sekretaris Divisi", urutan: 2 },
      { nama: "Anggota", urutan: 3 },
    ],
  },
  {
    bidang: "Divisi Keagamaan dan Kebudayaan",
    jabatan: [
      { nama: "Ketua Divisi", urutan: 1 },
      { nama: "Sekretaris Divisi", urutan: 2 },
      { nama: "Anggota", urutan: 3 },
    ],
  },
  {
    bidang: "Divisi Hubungan Masyarakat dan Kemitraan Strategis",
    jabatan: [
      { nama: "Ketua Divisi", urutan: 1 },
      { nama: "Sekretaris Divisi", urutan: 2 },
      { nama: "Anggota", urutan: 3 },
    ],
  },
  {
    bidang: "Divisi Kewirausahaan dan Pengembangan Sumber Daya Lokal",
    jabatan: [
      { nama: "Ketua Divisi", urutan: 1 },
      { nama: "Sekretaris Divisi", urutan: 2 },
      { nama: "Anggota", urutan: 3 },
    ],
  },
];

const LEVELS = ["Nasional", "Provinsi", "Kabupaten"] as const;

async function main() {
  console.log("🌱 Seeding Jabatan dengan struktur bidang...");

  // Cek jabatan yang sudah ada (yang sudah dipakai pengurus) supaya tidak dihapus
  const existingJabatan = await db.jabatan.findMany({
    include: { _count: { select: { pengurus: true } } },
  });
  console.log(`📊 Existing jabatan: ${existingJabatan.length}`);

  // Update jabatan existing yang belum punya bidang → set ke "Pengurus Harian"
  for (const j of existingJabatan) {
    if ((j as any).bidang === null || (j as any).bidang === undefined) {
      await db.jabatan.update({
        where: { id: j.id },
        data: { bidang: "Pengurus Harian" },
      });
      console.log(`  Updated jabatan id=${j.id} "${j.nama}" → bidang="Pengurus Harian"`);
    }
  }

  let insertedCount = 0;
  let skippedCount = 0;

  for (const level of LEVELS) {
    for (const bidang of BIDANG_STRUCTURE) {
      for (const jab of bidang.jabatan) {
        // Cek apakah sudah ada (nama + bidang + level)
        const existing = await db.jabatan.findFirst({
          where: { nama: jab.nama, bidang: bidang.bidang, level },
        });
        if (existing) {
          // Update urutan saja
          await db.jabatan.update({
            where: { id: existing.id },
            data: { urutan: jab.urutan },
          });
          skippedCount++;
          continue;
        }
        await db.jabatan.create({
          data: {
            nama: jab.nama,
            bidang: bidang.bidang,
            level,
            urutan: jab.urutan,
            status: "Aktif",
          },
        });
        insertedCount++;
      }
    }
  }

  console.log(`✓ Inserted: ${insertedCount} jabatan baru`);
  console.log(`✓ Skipped/Updated: ${skippedCount} jabatan existing`);

  // Summary per level
  const allJabatan = await db.jabatan.findMany();
  const grouped: Record<string, Record<string, number>> = {};
  for (const j of allJabatan) {
    if (!grouped[j.level]) grouped[j.level] = {};
    if (!grouped[j.level][j.bidang]) grouped[j.level][j.bidang] = 0;
    grouped[j.level][j.bidang]++;
  }
  console.log("\n📋 Struktur Jabatan per Level:");
  for (const level of LEVELS) {
    console.log(`  ${level}:`);
    for (const bidang of BIDANG_STRUCTURE) {
      const count = grouped[level]?.[bidang.bidang] || 0;
      console.log(`    • ${bidang.bidang}: ${count} jabatan`);
    }
  }

  console.log(`\n Total: ${allJabatan.length} jabatan`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
