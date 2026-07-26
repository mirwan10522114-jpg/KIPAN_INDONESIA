// Seed pengurus from anggota (new schema: anggotaId + jabatanId)
import { db } from "../src/lib/db";

async function main() {
  console.log("🌱 Seeding pengurus from anggota...");

  const anggotaList = await db.anggota.findMany({ include: { provinsi: true, kabupaten: true } });
  console.log(`Found ${anggotaList.length} anggota`);

  // Map anggota to pengurus roles
  const pengurusMapping = [
    { anggotaIdx: 0, jabatanNama: "Ketua Kabupaten", level: "KABUPATEN" }, // Ahmad Fauzi
    { anggotaIdx: 1, jabatanNama: "Sekretaris Kabupaten", level: "KABUPATEN" }, // Siti Nurhaliza
    { anggotaIdx: 2, jabatanNama: "Ketua Kabupaten", level: "KABUPATEN" }, // Budi Santoso
    { anggotaIdx: 3, jabatanNama: "Bendahara Provinsi", level: "PROVINSI" }, // Dewi Lestari
    { anggotaIdx: 4, jabatanNama: "Sekretaris Provinsi", level: "PROVINSI" }, // Maya Sari
    { anggotaIdx: 5, jabatanNama: "Ketua Provinsi", level: "PROVINSI" }, // Rizal Mahendra
  ];

  for (const m of pengurusMapping) {
    const anggota = anggotaList[m.anggotaIdx];
    if (!anggota) continue;

    const jabatan = await db.jabatan.findUnique({ where: { nama: m.jabatanNama } });
    if (!jabatan) continue;

    await db.pengurus.create({
      data: {
        anggotaId: anggota.id,
        jabatanId: jabatan.id,
        level: m.level,
        provinsiId: anggota.provinsiId,
        kabupatenId: anggota.kabupatenId,
        status: "Aktif",
        tanggalMulai: anggota.tanggalAngkat || new Date("2024-01-01"),
        tanggalSelesai: new Date("2027-12-31"),
        nomorSK: `SK-${jabatan.nama.substring(0, 3).toUpperCase()}/${anggota.provinsi?.kode || "XX"}/${new Date().getFullYear()}`,
      },
    });
    console.log(`  ✓ ${anggota.namaLengkap} → ${m.jabatanNama} (${m.level})`);
  }

  const totalPengurus = await db.pengurus.count();
  console.log(`\n📊 Total pengurus: ${totalPengurus}`);
  console.log("✅ Done!");
}

main().catch(console.error).finally(() => db.$disconnect());
