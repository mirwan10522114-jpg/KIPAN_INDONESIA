// Import semua 38 provinsi dari master-wilayah.ts ke database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Master data 38 provinsi Indonesia (kode Kemendagri)
const MASTER_PROVINSI = [
  { kode: "AC", nama: "Aceh" },
  { kode: "SU", nama: "Sumatera Utara" },
  { kode: "SB", nama: "Sumatera Barat" },
  { kode: "RI", nama: "Riau" },
  { kode: "JA", nama: "Jambi" },
  { kode: "SS", nama: "Sumatera Selatan" },
  { kode: "BE", nama: "Bengkulu" },
  { kode: "LA", nama: "Lampung" },
  { kode: "BB", nama: "Kepulauan Bangka Belitung" },
  { kode: "KR", nama: "Kepulauan Riau" },
  { kode: "JK", nama: "DKI Jakarta" },
  { kode: "JB", nama: "Jawa Barat" },
  { kode: "BT", nama: "Banten" },
  { kode: "JT", nama: "Jawa Tengah" },
  { kode: "YO", nama: "DI Yogyakarta" },
  { kode: "JI", nama: "Jawa Timur" },
  { kode: "BA", nama: "Bali" },
  { kode: "NB", nama: "Nusa Tenggara Barat" },
  { kode: "NT", nama: "Nusa Tenggara Timur" },
  { kode: "KB", nama: "Kalimantan Barat" },
  { kode: "KT", nama: "Kalimantan Tengah" },
  { kode: "KS", nama: "Kalimantan Selatan" },
  { kode: "KI", nama: "Kalimantan Timur" },
  { kode: "KU", nama: "Kalimantan Utara" },
  { kode: "SA", nama: "Sulawesi Utara" },
  { kode: "ST", nama: "Sulawesi Tengah" },
  { kode: "SN", nama: "Sulawesi Selatan" },
  { kode: "SG", nama: "Sulawesi Tenggara" },
  { kode: "GO", nama: "Gorontalo" },
  { kode: "SR", nama: "Sulawesi Barat" },
  { kode: "MA", nama: "Maluku" },
  { kode: "MU", nama: "Maluku Utara" },
  { kode: "PA", nama: "Papua" },
  { kode: "PB", nama: "Papua Barat" },
  { kode: "PT", nama: "Papua Tengah" },
  { kode: "PS", nama: "Papua Selatan" },
  { kode: "PE", nama: "Papua Pegunungan" },
  { kode: "PD", nama: "Papua Barat Daya" },
];

(async () => {
  console.log("🌱 Import semua 38 provinsi ke database...");
  
  const existing = await prisma.provinsi.findMany();
  console.log(`Provinsi existing: ${existing.length}`);
  
  // Mapping kode lama → kode baru (untuk update yang sudah ada)
  const kodeMapping = {
    "DKI": "JK",  // DKI Jakarta
    "JBR": "JB",  // Jawa Barat
    "JT":  "JT",  // Jawa Tengah (sama)
    "JI":  "JI",  // Jawa Timur (sama)
    "BT":  "BT",  // Banten (sama)
    "BL":  "BA",  // Bali
    "SU":  "SU",  // Sumatera Utara (sama)
    "SB":  "SB",  // Sumatera Barat (sama)
  };
  
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  
  for (const p of MASTER_PROVINSI) {
    // Cek apakah sudah ada (by nama)
    const existingByName = existing.find(e => e.nama === p.nama);
    if (existingByName) {
      // Update kode jika perlu
      if (existingByName.kode !== p.kode) {
        // Cek apakah kode baru sudah dipakai
        const existingByKode = await prisma.provinsi.findUnique({ where: { kode: p.kode } });
        if (!existingByKode) {
          await prisma.provinsi.update({
            where: { id: existingByName.id },
            data: { kode: p.kode },
          });
          console.log(`  ✓ Update kode: ${existingByName.nama} (${existingByName.kode} → ${p.kode})`);
          updated++;
        } else {
          console.log(`  - Skip ${p.nama} (kode ${p.kode} sudah dipakai oleh provinsi lain)`);
          skipped++;
        }
      } else {
        skipped++;
      }
      continue;
    }
    
    // Cek apakah kode sudah dipakai
    const existingByKode = await prisma.provinsi.findUnique({ where: { kode: p.kode } });
    if (existingByKode) {
      // Sudah ada dengan kode ini, skip
      skipped++;
      continue;
    }
    
    // Insert baru
    await prisma.provinsi.create({
      data: {
        kode: p.kode,
        nama: p.nama,
        status: "Pembentukan", // default Pembentukan untuk provinsi baru
      },
    });
    inserted++;
  }
  
  console.log(`\n✓ Inserted: ${inserted} provinsi baru`);
  console.log(`✓ Updated: ${updated} provinsi (kode berubah)`);
  console.log(`✓ Skipped: ${skipped} provinsi (sudah ada)`);
  
  const total = await prisma.provinsi.count();
  console.log(`\n📊 Total provinsi sekarang: ${total}`);
  
  await prisma.$disconnect();
})();
