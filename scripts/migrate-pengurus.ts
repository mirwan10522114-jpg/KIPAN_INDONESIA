// Migrate old pengurus data to new schema
import { db } from "../src/lib/db";

async function main() {
  console.log("🔄 Migrating pengurus data...");

  // Step 1: Create Jabatan master data
  const jabatanList = [
    { nama: "Ketua Umum Pusat", level: "Nasional", urutan: 1 },
    { nama: "Wakil Ketua Umum", level: "Nasional", urutan: 2 },
    { nama: "Sekretaris Jenderal", level: "Nasional", urutan: 3 },
    { nama: "Bendahara Umum", level: "Nasional", urutan: 4 },
    { nama: "Ketua Provinsi", level: "Provinsi", urutan: 1 },
    { nama: "Wakil Ketua Provinsi", level: "Provinsi", urutan: 2 },
    { nama: "Sekretaris Provinsi", level: "Provinsi", urutan: 3 },
    { nama: "Bendahara Provinsi", level: "Provinsi", urutan: 4 },
    { nama: "Ketua Kabupaten", level: "Kabupaten", urutan: 1 },
    { nama: "Wakil Ketua Kabupaten", level: "Kabupaten", urutan: 2 },
    { nama: "Sekretaris Kabupaten", level: "Kabupaten", urutan: 3 },
    { nama: "Bendahara Kabupaten", level: "Kabupaten", urutan: 4 },
    { nama: "Pengurus", level: "Kabupaten", urutan: 99 },
  ];

  for (const j of jabatanList) {
    await db.jabatan.upsert({
      where: { nama: j.nama },
      update: {},
      create: j,
    });
  }
  console.log(`✓ ${jabatanList.length} jabatan created`);

  // Step 2: Get old pengurus data (before schema change, read from raw)
  // Since we can't use Prisma with old schema, we'll use raw SQL
  const oldPengurus = await db.$queryRaw`SELECT * FROM pengurus` as any[];
  console.log(`Found ${oldPengurus.length} old pengurus records`);

  // Step 3: For each old pengurus, find or create an Anggota
  for (const p of oldPengurus) {
    // Try to find existing anggota by email or NIK
    let anggota = await db.anggota.findFirst({
      where: {
        OR: [
          { email: p.email },
          { nik: p.nomorSK || "0000000000000000" },
        ],
      },
    });

    if (!anggota) {
      // Create anggota from old pengurus data
      const provinsi = p.provinsiId ? await db.provinsi.findUnique({ where: { id: p.provinsiId } }) : null;
      const kabupaten = p.kabupatenId ? await db.kabupaten.findUnique({ where: { id: p.kabupatenId } }) : null;

      if (!provinsi) {
        // Use first provinsi as default
        const firstProv = await db.provinsi.findFirst();
        if (!firstProv) continue;
        const firstKab = await db.kabupaten.findFirst({ where: { provinsiId: firstProv.id } });
        
        anggota = await db.anggota.create({
          data: {
            nia: `KIPAN-MIGRATED-${p.id}-${Date.now()}`,
            namaLengkap: p.namaLengkap,
            nik: `000000000000000${p.id}`,
            tempatLahir: p.tempatLahir || "-",
            tanggalLahir: p.tanggalLahir || new Date("1990-01-01"),
            jenisKelamin: "L",
            alamat: p.alamat || "-",
            provinsiId: firstProv.id,
            kabupatenId: firstKab?.id || 1,
            email: p.email,
            hp: p.hp || "",
            foto: p.foto,
            status: "AKTIF",
            angkatan: "Migrated",
            tanggalAngkat: p.tanggalMulai,
          },
        });
      }
      console.log(`  ✓ Created anggota for ${p.namaLengkap} (NIA: ${anggota.nia})`);
    } else {
      console.log(`  ✓ Found existing anggota for ${p.namaLengkap} (NIA: ${anggota.nia})`);
    }

    // Step 4: Match jabatan
    let jabatanNama = "Pengurus";
    if (p.jabatan?.toLowerCase().includes("ketua umum")) jabatanNama = "Ketua Umum Pusat";
    else if (p.jabatan?.toLowerCase().includes("ketua") && p.level === "NASIONAL") jabatanNama = "Ketua Umum Pusat";
    else if (p.jabatan?.toLowerCase().includes("sekretaris") && p.level === "NASIONAL") jabatanNama = "Sekretaris Jenderal";
    else if (p.jabatan?.toLowerCase().includes("bendahara") && p.level === "NASIONAL") jabatanNama = "Bendahara Umum";
    else if (p.jabatan?.toLowerCase().includes("ketua") && p.level === "PROVINSI") jabatanNama = "Ketua Provinsi";
    else if (p.jabatan?.toLowerCase().includes("ketua") && p.level === "KABUPATEN") jabatanNama = "Ketua Kabupaten";
    else if (p.jabatan?.toLowerCase().includes("sekretaris") && p.level === "PROVINSI") jabatanNama = "Sekretaris Provinsi";
    else if (p.jabatan?.toLowerCase().includes("sekretaris") && p.level === "KABUPATEN") jabatanNama = "Sekretaris Kabupaten";
    else if (p.jabatan?.toLowerCase().includes("bendahara") && p.level === "PROVINSI") jabatanNama = "Bendahara Provinsi";
    else if (p.jabatan?.toLowerCase().includes("bendahara") && p.level === "KABUPATEN") jabatanNama = "Bendahara Kabupaten";

    const jabatan = await db.jabatan.findUnique({ where: { nama: jabatanNama } });

    // Step 5: We can't update old pengurus with new schema via Prisma
    // We need to delete old and create new
    // But first, save the old data we need
  }

  // Step 6: Drop old pengurus table and recreate with new schema
  // Use raw SQL to delete all old pengurus
  await db.$executeRaw`DELETE FROM pengurus`;
  console.log("✓ Cleared old pengurus data");

  // Step 7: Recreate pengurus with new schema using anggota data
  for (const p of oldPengurus) {
    // Find the anggota we created/found
    let anggota = await db.anggota.findFirst({
      where: {
        OR: [
          { email: p.email },
          { namaLengkap: p.namaLengkap },
        ],
      },
    });

    if (!anggota) continue;

    // Match jabatan
    let jabatanNama = "Pengurus";
    if (p.jabatan?.toLowerCase().includes("ketua umum")) jabatanNama = "Ketua Umum Pusat";
    else if (p.jabatan?.toLowerCase().includes("ketua") && p.level === "NASIONAL") jabatanNama = "Ketua Umum Pusat";
    else if (p.jabatan?.toLowerCase().includes("sekretaris") && p.level === "NASIONAL") jabatanNama = "Sekretaris Jenderal";
    else if (p.jabatan?.toLowerCase().includes("bendahara") && p.level === "NASIONAL") jabatanNama = "Bendahara Umum";
    else if (p.jabatan?.toLowerCase().includes("ketua") && p.level === "PROVINSI") jabatanNama = "Ketua Provinsi";
    else if (p.jabatan?.toLowerCase().includes("ketua") && p.level === "KABUPATEN") jabatanNama = "Ketua Kabupaten";
    else if (p.jabatan?.toLowerCase().includes("sekretaris") && p.level === "PROVINSI") jabatanNama = "Sekretaris Provinsi";
    else if (p.jabatan?.toLowerCase().includes("sekretaris") && p.level === "KABUPATEN") jabatanNama = "Sekretaris Kabupaten";
    else if (p.jabatan?.toLowerCase().includes("bendahara") && p.level === "PROVINSI") jabatanNama = "Bendahara Provinsi";
    else if (p.jabatan?.toLowerCase().includes("bendahara") && p.level === "KABUPATEN") jabatanNama = "Bendahara Kabupaten";

    const jabatan = await db.jabatan.findUnique({ where: { nama: jabatanNama } });
    if (!jabatan) continue;

    // Normalize level
    const levelUpper = (p.level || "KABUPATEN").toUpperCase();

    await db.pengurus.create({
      data: {
        anggotaId: anggota.id,
        jabatanId: jabatan.id,
        level: levelUpper,
        provinsiId: p.provinsiId || null,
        kabupatenId: p.kabupatenId || null,
        status: p.status === "Aktif" ? "Aktif" : p.status === "Nonaktif" ? "Selesai" : p.status || "Aktif",
        tanggalMulai: p.tanggalMulai || new Date(),
        tanggalSelesai: p.tanggalSelesai || null,
        nomorSK: p.nomorSK || "",
        fileSK: p.fileSK || null,
      },
    });
    console.log(`  ✓ Created pengurus: ${anggota.namaLengkap} as ${jabatanNama}`);
  }

  // Verify
  const totalAnggota = await db.anggota.count();
  const totalPengurus = await db.pengurus.count();
  const totalJabatan = await db.jabatan.count();

  console.log("\n📊 Migration Summary:");
  console.log(`  Jabatan: ${totalJabatan}`);
  console.log(`  Anggota: ${totalAnggota}`);
  console.log(`  Pengurus: ${totalPengurus}`);
  console.log("✅ Migration done!");
}

main().catch(console.error).finally(() => db.$disconnect());
