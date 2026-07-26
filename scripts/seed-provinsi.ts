// Seed all 38 provinsi to database
import { db } from "../src/lib/db";
import { MASTER_PROVINSI, MASTER_KABUPATEN } from "../src/lib/master-wilayah";

async function main() {
  console.log("🌱 Seeding all 38 provinsi...");

  for (const p of MASTER_PROVINSI) {
    await db.provinsi.upsert({
      where: { kode: p.kode },
      update: { nama: p.nama, status: "Aktif" },
      create: {
        kode: p.kode,
        nama: p.nama,
        status: "Aktif",
      },
    });
  }
  console.log(`✓ ${MASTER_PROVINSI.length} provinsi seeded`);

  // Count kabupaten per provinsi
  const kabPerProv = MASTER_KABUPATEN.reduce((acc, k) => {
    acc[k.provinsiKode] = (acc[k.provinsiKode] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log(`✓ ${MASTER_KABUPATEN.length} kabupaten/kota available in master data`);
  console.log("  Kabupaten per provinsi:", Object.entries(kabPerProv).map(([k, v]) => `${k}:${v}`).join(", "));

  // Verify counts
  const totalProv = await db.provinsi.count();
  const totalKab = await db.kabupaten.count();
  const totalAnggota = await db.anggota.count();
  const totalPengurus = await db.pengurus.count();

  console.log("\n📊 Database Summary:");
  console.log(`  Provinsi: ${totalProv}`);
  console.log(`  Kabupaten: ${totalKab}`);
  console.log(`  Anggota: ${totalAnggota}`);
  console.log(`  Pengurus: ${totalPengurus}`);

  console.log("\n✅ Done!");
}

main().catch(console.error).finally(() => db.$disconnect());
