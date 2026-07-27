// Check DB for provinsi/kabupaten records
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const totalProv = await prisma.provinsi.count();
  const totalKab = await prisma.kabupaten.count();
  console.log("Provinsi di DB:", totalProv);
  console.log("Kabupaten di DB:", totalKab);
  if (totalKab > 0) {
    const sample = await prisma.kabupaten.findMany({ take: 5, include: { provinsi: true } });
    console.log("Sample kabupaten:");
    sample.forEach(k => console.log(`  - ${k.nama} (kode: ${k.kode}) - ${k.provinsi.nama}`));
  } else {
    console.log("⚠️  Belum ada kabupaten di DB! Pendaftaran akan gagal.");
    console.log("   Jalankan: bun run scripts/seed-provinsi.ts (atau script seed kabupaten)");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
