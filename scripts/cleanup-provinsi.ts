// Cleanup: migrate old provinsi codes to Kemendagri codes, then delete old entries
import { db } from "../src/lib/db";

const OLD_TO_NEW: Record<string, string> = {
  "DKI": "31", "JBR": "32", "JT": "33", "JI": "35", "BT": "36",
  "BL": "51", "SU": "12", "SB": "13", "TEST": "91", // map test to Papua
};

async function main() {
  console.log("🧹 Cleaning up duplicate provinsi...");

  for (const [oldKode, newKode] of Object.entries(OLD_TO_NEW)) {
    const oldProv = await db.provinsi.findUnique({ where: { kode: oldKode } });
    const newProv = await db.provinsi.findUnique({ where: { kode: newKode } });
    if (!oldProv || !newProv) {
      console.log(`  Skip ${oldKode}→${newKode}: old=${!!oldProv} new=${!!newProv}`);
      continue;
    }

    // Migrate kabupaten
    await db.kabupaten.updateMany({
      where: { provinsiId: oldProv.id },
      data: { provinsiId: newProv.id },
    });

    // Migrate anggota
    await db.anggota.updateMany({
      where: { provinsiId: oldProv.id },
      data: { provinsiId: newProv.id },
    });

    // Migrate pengurus
    await db.pengurus.updateMany({
      where: { provinsiId: oldProv.id },
      data: { provinsiId: newProv.id },
    });

    // Migrate pendaftaran
    await db.pendaftaran.updateMany({
      where: { provinsiId: oldProv.id },
      data: { provinsiId: newProv.id },
    });

    // Delete old provinsi
    await db.provinsi.delete({ where: { id: oldProv.id } });
    console.log(`  ✓ ${oldKode} → ${newKode} (migrated & deleted)`);
  }

  // Also clean up "Provinsi Test API" if exists
  const testProv = await db.provinsi.findFirst({ where: { nama: "Provinsi Test API" } });
  if (testProv) {
    await db.provinsi.delete({ where: { id: testProv.id } });
    console.log("  ✓ Deleted 'Provinsi Test API'");
  }

  const totalProv = await db.provinsi.count();
  const totalKab = await db.kabupaten.count();
  const totalAnggota = await db.anggota.count();
  const totalPengurus = await db.pengurus.count();

  console.log("\n📊 Final Database Summary:");
  console.log(`  Provinsi: ${totalProv}`);
  console.log(`  Kabupaten: ${totalKab}`);
  console.log(`  Anggota: ${totalAnggota}`);
  console.log(`  Pengurus: ${totalPengurus}`);
  console.log("✅ Cleanup done!");
}

main().catch(console.error).finally(() => db.$disconnect());
