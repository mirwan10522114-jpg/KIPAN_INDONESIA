const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log("=== SEEDING MASTER DATA KOTA & KABUPATEN INDONESIA ===");

  // 1. Ambil seluruh provinsi dari database
  const dbProvinsi = await prisma.provinsi.findMany();
  console.log(`Ditemukan ${dbProvinsi.length} provinsi di database.`);

  // Baca file master-wilayah.ts
  const masterFilePath = path.join(__dirname, '..', 'src', 'lib', 'master-wilayah.ts');
  const masterContent = fs.readFileSync(masterFilePath, 'utf8');

  // Ekstrak MASTER_PROVINSI
  const provMatches = [...masterContent.matchAll(/\{\s*kode:\s*"([^"]+)",\s*nama:\s*"([^"]+)",\s*jenis:\s*"Provinsi",\s*pulau:\s*"([^"]+)"\s*\}/g)];
  console.log(`Ditemukan ${provMatches.length} provinsi master di master-wilayah.ts.`);

  // Buat mapping: provKode (misal "32") -> dbProvinsi.id
  const provKodeToDbId = {};
  for (const m of provMatches) {
    const pKode = m[1];
    const pNama = m[2];
    const foundInDb = dbProvinsi.find(
      (p) => p.nama.toLowerCase().trim() === pNama.toLowerCase().trim()
    );
    if (foundInDb) {
      provKodeToDbId[pKode] = foundInDb.id;
    } else {
      console.warn(`[WARN] Provinsi ${pNama} (${pKode}) tidak cocok dengan database.`);
    }
  }

  console.log(`Mapping provinsi terpetakan: ${Object.keys(provKodeToDbId).length} dari ${provMatches.length}`);

  // Ekstrak MASTER_KABUPATEN
  // Format regex: { kode: "3171", nama: "Jakarta Pusat", provinsiKode: "31", jenis: "Kota" }
  const kabMatches = [...masterContent.matchAll(/\{\s*kode:\s*"([^"]+)",\s*nama:\s*"([^"]+)",\s*provinsiKode:\s*"([^"]+)",\s*jenis:\s*"([^"]+)"\s*\}/g)];
  console.log(`Ditemukan ${kabMatches.length} kabupaten/kota master di master-wilayah.ts.`);

  let insertedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  // Batch / loop upsert
  for (const m of kabMatches) {
    const kode = m[1];
    const rawNama = m[2];
    const provKode = m[3];
    const jenis = m[4];

    const provinsiId = provKodeToDbId[provKode];
    if (!provinsiId) {
      console.warn(`[SKIP] Kabupaten ${rawNama} (${kode}) memiliki provinsiKode ${provKode} yang tidak ditemukan.`);
      errorCount++;
      continue;
    }

    // Format nama: "Kota Bandung", "Kab. Bogor", dll agar rapi dan membedakan Kota & Kab bernama sama
    let namaFormatted = rawNama;
    if (jenis === "Kota") {
      if (!namaFormatted.startsWith("Kota")) {
        namaFormatted = `Kota ${namaFormatted}`;
      }
    } else if (jenis === "Kabupaten") {
      if (!namaFormatted.startsWith("Kabupaten") && !namaFormatted.startsWith("Kab.")) {
        namaFormatted = `Kab. ${namaFormatted}`;
      }
    }

    try {
      const result = await prisma.kabupaten.upsert({
        where: { kode },
        update: {
          nama: namaFormatted,
          provinsiId,
          status: "Aktif",
        },
        create: {
          kode,
          nama: namaFormatted,
          provinsiId,
          status: "Aktif",
        },
      });
      insertedCount++;
    } catch (err) {
      console.error(`[ERROR] Gagal upsert kabupaten ${kode} ${namaFormatted}:`, err.message);
      errorCount++;
    }
  }

  console.log(`\n=== SEED SELESAI ===`);
  console.log(`Total Kabupaten/Kota berhasil di-seed: ${insertedCount}`);
  console.log(`Error: ${errorCount}`);

  // Hitung total di database saat ini
  const finalCount = await prisma.kabupaten.count();
  console.log(`Total kabupaten di database sekarang: ${finalCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
