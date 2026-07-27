// ============================================================
// RESET & SEED PENGURUS — Hapus semua pengurus & anggota, isi ulang
// dengan sample data lengkap (Pengurus Harian + Divisi-divisi)
// Semua pengurus WAJIB punya jabatanId yang valid
// ============================================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Step 1: Hapus semua pengurus & anggota lama...");
  
  // Hapus semua pengurus dulu (karena ada foreign key ke anggota)
  const deletedPengurus = await prisma.pengurus.deleteMany({});
  console.log(`  ✓ Dihapus ${deletedPengurus.count} record pengurus`);
  
  // Hapus semua anggota (data person)
  const deletedAnggota = await prisma.anggota.deleteMany({});
  console.log(`  ✓ Dihapus ${deletedAnggota.count} record anggota (data person)`);
  
  // Reset ketua wilayah (karena pengurus lama sudah dihapus)
  await prisma.provinsi.updateMany({ data: { ketua: null } });
  await prisma.kabupaten.updateMany({ data: { ketua: null } });
  console.log(`  ✓ Reset ketua wilayah (provinsi & kabupaten)`);

  console.log("\n📋 Step 2: Ambil jabatan yang tersedia...");
  const jabatanList = await prisma.jabatan.findMany({
    orderBy: [{ level: "asc" }, { bidang: "asc" }, { urutan: "asc" }],
  });
  console.log(`  Total jabatan tersedia: ${jabatanList.length}`);
  
  // Group by level + bidang untuk akses mudah
  const findJabatan = (level, bidang, nama) => {
    return jabatanList.find(j => 
      j.level === level && j.bidang === bidang && j.nama === nama
    );
  };
  
  // Helper: buat anggota + pengurus sekaligus
  const createPengurus = async (data) => {
    const { 
      namaLengkap, nik, tempatLahir, tanggalLahir, jenisKelamin,
      alamat, provinsiId, kabupatenId, kecamatan, email, hp, foto,
      jabatanId, level, status, tanggalMulai, nomorSK
    } = data;
    
    if (!jabatanId) {
      console.error(`  ✗ TIDAK BISA BUAT: ${namaLengkap} - jabatanId kosong!`);
      return null;
    }
    
    // Generate NIA
    const prov = await prisma.provinsi.findUnique({ where: { id: provinsiId } });
    const kab = await prisma.kabupaten.findUnique({ where: { id: kabupatenId } });
    const tahun = new Date(tanggalMulai).getFullYear();
    const countThisYear = await prisma.anggota.count({
      where: {
        provinsiId, kabupatenId,
        tanggalAngkat: { gte: new Date(tahun, 0, 1) },
      },
    });
    const seq = String(countThisYear + 1).padStart(5, "0");
    const nia = `KIPAN-${prov?.kode}-${kab?.kode}-${tahun}-${seq}`;
    
    // Buat anggota (data person)
    const anggota = await prisma.anggota.create({
      data: {
        nia, namaLengkap, nik, tempatLahir, 
        tanggalLahir: new Date(tanggalLahir),
        jenisKelamin, alamat, provinsiId, kabupatenId, kecamatan,
        email, hp, whatsapp: hp, foto,
        status: "AKTIF", angkatan: "XII",
        tanggalAngkat: new Date(tanggalMulai),
      },
    });
    
    // Buat pengurus dengan jabatan
    const pengurus = await prisma.pengurus.create({
      data: {
        anggotaId: anggota.id,
        jabatanId,
        level,
        provinsiId,
        kabupatenId: level === "KABUPATEN" ? kabupatenId : null,
        status: status || "Aktif",
        tanggalMulai: new Date(tanggalMulai),
        nomorSK: nomorSK || `SK/${nia}/${tahun}`,
      },
    });
    
    return { anggota, pengurus };
  };

  console.log("\n🌱 Step 3: Isi sample data pengurus...");

  // Ambil provinsi & kabupaten yang ada
  const provinsiList = await prisma.provinsi.findMany({ orderBy: { nama: "asc" } });
  const kabupatenList = await prisma.kabupaten.findMany({ orderBy: { nama: "asc" } });
  
  console.log(`  Provinsi tersedia: ${provinsiList.length}`);
  console.log(`  Kabupaten tersedia: ${kabupatenList.length}`);

  // ============ LEVEL NASIONAL ============
  console.log("\n  📌 Level NASIONAL:");
  const provNasional = provinsiList[0]; // gunakan provinsi pertama sebagai reference
  
  const pengurusNasional = [
    // Pengurus Harian Nasional
    { nama: "Yusuf Hidayatulloh, S.H.", nik: "3171011506800001", jabatan: findJabatan("Nasional", "Pengurus Harian", "Ketua Umum"), level: "NASIONAL" },
    { nama: "Hardian Siswanto, S.E.", nik: "3171012002790002", jabatan: findJabatan("Nasional", "Pengurus Harian", "Wakil Ketua"), level: "NASIONAL" },
    { nama: "Videyan Pramudita", nik: "3171011503850003", jabatan: findJabatan("Nasional", "Pengurus Harian", "Sekretaris Umum"), level: "NASIONAL" },
    { nama: "Siti Rusmiati", nik: "3171010101900004", jabatan: findJabatan("Nasional", "Pengurus Harian", "Wakil Sekretaris"), level: "NASIONAL" },
    { nama: "Kirana Indah Melani, A.Md.Keb.", nik: "3171010502880005", jabatan: findJabatan("Nasional", "Pengurus Harian", "Bendahara Umum"), level: "NASIONAL" },
    { nama: "Ellen Ilais, S.E.", nik: "3171011806920006", jabatan: findJabatan("Nasional", "Pengurus Harian", "Wakil Bendahara"), level: "NASIONAL" },
    
    // Divisi Organisasi dan Keanggotaan
    { nama: "Euis Susilawati, S.Hum.", nik: "3171011503860007", jabatan: findJabatan("Nasional", "Divisi Organisasi dan Keanggotaan", "Ketua Divisi"), level: "NASIONAL" },
    { nama: "Asri Maulidina", nik: "3171012007940008", jabatan: findJabatan("Nasional", "Divisi Organisasi dan Keanggotaan", "Sekretaris Divisi"), level: "NASIONAL" },
    { nama: "Purnama Abdul Wahid", nik: "3171011010900009", jabatan: findJabatan("Nasional", "Divisi Organisasi dan Keanggotaan", "Anggota"), level: "NASIONAL" },
    { nama: "Wisnu Ramadhan", nik: "3171011505010010", jabatan: findJabatan("Nasional", "Divisi Organisasi dan Keanggotaan", "Anggota"), level: "NASIONAL" },
    { nama: "Fahira Rianti", nik: "3171012008030011", jabatan: findJabatan("Nasional", "Divisi Organisasi dan Keanggotaan", "Anggota"), level: "NASIONAL" },
    { nama: "Komalasari Aida Aulia", nik: "3171010509990012", jabatan: findJabatan("Nasional", "Divisi Organisasi dan Keanggotaan", "Anggota"), level: "NASIONAL" },
    { nama: "Azhari", nik: "3171011001970013", jabatan: findJabatan("Nasional", "Divisi Organisasi dan Keanggotaan", "Anggota"), level: "NASIONAL" },
    
    // Divisi Informasi dan Komunikasi
    { nama: "M. Faldi Setiawan", nik: "3171011506900014", jabatan: findJabatan("Nasional", "Divisi Informasi dan Komunikasi", "Ketua Divisi"), level: "NASIONAL" },
    { nama: "Wulan Rismawati", nik: "3171010503950015", jabatan: findJabatan("Nasional", "Divisi Informasi dan Komunikasi", "Sekretaris Divisi"), level: "NASIONAL" },
    { nama: "Dewi Afriana Wardiman", nik: "3171011008880016", jabatan: findJabatan("Nasional", "Divisi Informasi dan Komunikasi", "Anggota"), level: "NASIONAL" },
    { nama: "Irfan Nadzir Fauzi", nik: "3171011506970017", jabatan: findJabatan("Nasional", "Divisi Informasi dan Komunikasi", "Anggota"), level: "NASIONAL" },
    { nama: "M. Denis Mauludi", nik: "3171012001990018", jabatan: findJabatan("Nasional", "Divisi Informasi dan Komunikasi", "Anggota"), level: "NASIONAL" },
    { nama: "Vineyan Feraniha", nik: "3171010503030019", jabatan: findJabatan("Nasional", "Divisi Informasi dan Komunikasi", "Anggota"), level: "NASIONAL" },
    { nama: "Dasep Moch Sahroni", nik: "3171011010890020", jabatan: findJabatan("Nasional", "Divisi Informasi dan Komunikasi", "Anggota"), level: "NASIONAL" },
    { nama: "Rizqi Mubarok Hadadi", nik: "3171011505020021", jabatan: findJabatan("Nasional", "Divisi Informasi dan Komunikasi", "Anggota"), level: "NASIONAL" },
    
    // Divisi Keagamaan dan Kebudayaan
    { nama: "Ajmal Nazirul Mubin", nik: "3171011506980022", jabatan: findJabatan("Nasional", "Divisi Keagamaan dan Kebudayaan", "Ketua Divisi"), level: "NASIONAL" },
    { nama: "Ikbal Maulana Ramadan", nik: "3171012009010023", jabatan: findJabatan("Nasional", "Divisi Keagamaan dan Kebudayaan", "Sekretaris Divisi"), level: "NASIONAL" },
    { nama: "Muhamad Apila Sopian", nik: "3171010504970024", jabatan: findJabatan("Nasional", "Divisi Keagamaan dan Kebudayaan", "Anggota"), level: "NASIONAL" },
    { nama: "Fayza Alifya Musthafa", nik: "3171011010050025", jabatan: findJabatan("Nasional", "Divisi Keagamaan dan Kebudayaan", "Anggota"), level: "NASIONAL" },
    { nama: "Neng Dinda Aulia Rizki", nik: "3171011508030026", jabatan: findJabatan("Nasional", "Divisi Keagamaan dan Kebudayaan", "Anggota"), level: "NASIONAL" },
    { nama: "Pahrul Roji Burhanudin", nik: "3171012001970027", jabatan: findJabatan("Nasional", "Divisi Keagamaan dan Kebudayaan", "Anggota"), level: "NASIONAL" },
    
    // Divisi Hubungan Masyarakat dan Kemitraan Strategis
    { nama: "Rais Rouful Malik", nik: "3171010503960028", jabatan: findJabatan("Nasional", "Divisi Hubungan Masyarakat dan Kemitraan Strategis", "Ketua Divisi"), level: "NASIONAL" },
    { nama: "Irsan Pratama Kusumah", nik: "3171011509990029", jabatan: findJabatan("Nasional", "Divisi Hubungan Masyarakat dan Kemitraan Strategis", "Sekretaris Divisi"), level: "NASIONAL" },
    
    // Divisi Kewirausahaan dan Pengembangan Sumber Daya Lokal
    { nama: "Farida Hasna", nik: "3171012001040030", jabatan: findJabatan("Nasional", "Divisi Kewirausahaan dan Pengembangan Sumber Daya Lokal", "Ketua Divisi"), level: "NASIONAL" },
    { nama: "M Romli Al Amin", nik: "3171010506000031", jabatan: findJabatan("Nasional", "Divisi Kewirausahaan dan Pengembangan Sumber Daya Lokal", "Sekretaris Divisi"), level: "NASIONAL" },
    { nama: "Febrina Novianti Ginting", nik: "3171011010030032", jabatan: findJabatan("Nasional", "Divisi Kewirausahaan dan Pengembangan Sumber Daya Lokal", "Anggota"), level: "NASIONAL" },
    { nama: "Rike Adinda Permata", nik: "3171011508050033", jabatan: findJabatan("Nasional", "Divisi Kewirausahaan dan Pengembangan Sumber Daya Lokal", "Anggota"), level: "NASIONAL" },
    { nama: "M Yusuf Gilang Pratama", nik: "3171012001070034", jabatan: findJabatan("Nasional", "Divisi Kewirausahaan dan Pengembangan Sumber Daya Lokal", "Anggota"), level: "NASIONAL" },
    { nama: "Yandi Muhamad I", nik: "3171010505010035", jabatan: findJabatan("Nasional", "Divisi Kewirausahaan dan Pengembangan Sumber Daya Lokal", "Anggota"), level: "NASIONAL" },
    { nama: "Dede Wahyudin, S.Pd.I.", nik: "3171011506850036", jabatan: findJabatan("Nasional", "Divisi Kewirausahaan dan Pengembangan Sumber Daya Lokal", "Anggota"), level: "NASIONAL" },
    { nama: "Putri Mutia Handayani", nik: "3171010503000037", jabatan: findJabatan("Nasional", "Divisi Kewirausahaan dan Pengembangan Sumber Daya Lokal", "Anggota"), level: "NASIONAL" },
  ];

  const fotoNasional = "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80";
  
  let count = 0;
  for (const p of pengurusNasional) {
    if (!p.jabatan) {
      console.error(`  ✗ Jabatan tidak ditemukan untuk: ${p.nama} (${p.jabatan})`);
      continue;
    }
    const result = await createPengurus({
      namaLengkap: p.nama,
      nik: p.nik,
      tempatLahir: "Jakarta",
      tanggalLahir: "1990-01-15",
      jenisKelamin: "L",
      alamat: "Jl. Nasional No. 1, Jakarta",
      provinsiId: provNasional.id,
      kabupatenId: kabupatenList[0].id,
      kecamatan: "Pusat",
      email: p.nama.toLowerCase().replace(/[^a-z]/g, ".").replace(/\.+/g, ".") + "@kipan.id",
      hp: "08120000" + String(1000 + count).padStart(4, "0"),
      foto: fotoNasional,
      jabatanId: p.jabatan.id,
      level: p.level,
      status: "Aktif",
      tanggalMulai: "2024-01-15",
      nomorSK: `SK/PUSAT/2024/${String(count + 1).padStart(3, "0")}`,
    });
    if (result) {
      count++;
      console.log(`    ✓ ${count}. ${p.nama} → ${p.jabatan.nama} (${p.jabatan.bidang})`);
    }
  }
  
  // Set ketua nasional (Ketua Umum pertama)
  const ketumNasional = await prisma.pengurus.findFirst({
    where: { level: "NASIONAL", status: "Aktif" },
    include: { anggota: true, jabatan: true },
    orderBy: { id: "asc" },
  });
  console.log(`\n  ✓ Total pengurus Nasional: ${count}`);

  // ============ LEVEL PROVINSI (Jawa Barat) ============
  console.log("\n  📌 Level PROVINSI (Jawa Barat):");
  const provJabar = provinsiList.find(p => p.kode === "JBR") || provinsiList[1];
  if (!provJabar) {
    console.log("  ✗ Provinsi tidak ditemukan");
  } else {
    const pengurusProvinsi = [
      { nama: "Hendra Gunawan, S.Sos", jabatan: findJabatan("Provinsi", "Pengurus Harian", "Ketua Umum") },
      { nama: "Drs. Asep Sutisna, M.M.", jabatan: findJabatan("Provinsi", "Pengurus Harian", "Wakil Ketua") },
      { nama: "Rina Marlina, S.Pd", jabatan: findJabatan("Provinsi", "Pengurus Harian", "Sekretaris Umum") },
      { nama: "Dewi Sartika, S.Kom", jabatan: findJabatan("Provinsi", "Pengurus Harian", "Bendahara Umum") },
      { nama: "Budi Hartono, S.T", jabatan: findJabatan("Provinsi", "Divisi Organisasi dan Keanggotaan", "Ketua Divisi") },
      { nama: "Siti Aminah", jabatan: findJabatan("Provinsi", "Divisi Organisasi dan Keanggotaan", "Anggota") },
      { nama: "Ade Pratama", jabatan: findJabatan("Provinsi", "Divisi Informasi dan Komunikasi", "Ketua Divisi") },
      { nama: "Nia Ramadhani", jabatan: findJabatan("Provinsi", "Divisi Informasi dan Komunikasi", "Anggota") },
      { nama: "Eko Prasetyo", jabatan: findJabatan("Provinsi", "Divisi Keagamaan dan Kebudayaan", "Ketua Divisi") },
      { nama: "Maya Sari, S.H", jabatan: findJabatan("Provinsi", "Divisi Hubungan Masyarakat dan Kemitraan Strategis", "Ketua Divisi") },
      { nama: "Rizal Mahendra, S.T", jabatan: findJabatan("Provinsi", "Divisi Kewirausahaan dan Pengembangan Sumber Daya Lokal", "Ketua Divisi") },
    ];
    
    const fotoProvinsi = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80";
    
    let countProv = 0;
    for (const p of pengurusProvinsi) {
      if (!p.jabatan) {
        console.error(`  ✗ Jabatan tidak ditemukan untuk: ${p.nama}`);
        continue;
      }
      const result = await createPengurus({
        namaLengkap: p.nama,
        nik: "320101" + String(1506900000 + countProv + 100).padStart(10, "0"),
        tempatLahir: "Bandung",
        tanggalLahir: "1988-06-15",
        jenisKelamin: "L",
        alamat: "Jl. Provinsi No. 1, Bandung",
        provinsiId: provJabar.id,
        kabupatenId: kabupatenList.find(k => k.provinsiId === provJabar.id)?.id || kabupatenList[0].id,
        kecamatan: "Bandung",
        email: p.nama.toLowerCase().replace(/[^a-z]/g, ".").replace(/\.+/g, ".") + "@kipan.id",
        hp: "08130000" + String(2000 + countProv).padStart(4, "0"),
        foto: fotoProvinsi,
        jabatanId: p.jabatan.id,
        level: "PROVINSI",
        status: "Aktif",
        tanggalMulai: "2024-03-10",
        nomorSK: `SK/JBR/2024/${String(countProv + 1).padStart(3, "0")}`,
      });
      if (result) {
        countProv++;
        count++;
      }
    }
    
    // Set ketua provinsi
    const ketumProv = await prisma.pengurus.findFirst({
      where: { level: "PROVINSI", provinsiId: provJabar.id, status: "Aktif" },
      include: { anggota: true, jabatan: true },
    });
    if (ketumProv) {
      await prisma.provinsi.update({
        where: { id: provJabar.id },
        data: { ketua: ketumProv.anggota.namaLengkap },
      });
      console.log(`  ✓ Ketua Provinsi ${provJabar.nama}: ${ketumProv.anggota.namaLengkap}`);
    }
    console.log(`  ✓ Total pengurus Provinsi: ${countProv}`);
  }

  // ============ LEVEL KABUPATEN (Beberapa kabupaten) ============
  console.log("\n  📌 Level KABUPATEN:");
  const fotoKabupaten = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80";
  let countKab = 0;
  
  // Ambil 3 kabupaten pertama yang punya provinsiId
  const kabupatenForSample = kabupatenList.slice(0, Math.min(3, kabupatenList.length));
  
  for (const kab of kabupatenForSample) {
    const prov = provinsiList.find(p => p.id === kab.provinsiId);
    if (!prov) continue;
    
    const pengurusKabupaten = [
      { nama: `Ketua ${kab.nama}`, jabatan: findJabatan("Kabupaten", "Pengurus Harian", "Ketua Umum") },
      { nama: `Wakil Ketua ${kab.nama}`, jabatan: findJabatan("Kabupaten", "Pengurus Harian", "Wakil Ketua") },
      { nama: `Sekretaris ${kab.nama}`, jabatan: findJabatan("Kabupaten", "Pengurus Harian", "Sekretaris Umum") },
      { nama: `Bendahara ${kab.nama}`, jabatan: findJabatan("Kabupaten", "Pengurus Harian", "Bendahara Umum") },
      { nama: `Ketua Div Org ${kab.nama}`, jabatan: findJabatan("Kabupaten", "Divisi Organisasi dan Keanggotaan", "Ketua Divisi") },
      { nama: `Anggota Div Org ${kab.nama}`, jabatan: findJabatan("Kabupaten", "Divisi Organisasi dan Keanggotaan", "Anggota") },
      { nama: `Ketua Div Infokom ${kab.nama}`, jabatan: findJabatan("Kabupaten", "Divisi Informasi dan Komunikasi", "Ketua Divisi") },
      { nama: `Anggota Div Infokom ${kab.nama}`, jabatan: findJabatan("Kabupaten", "Divisi Informasi dan Komunikasi", "Anggota") },
      { nama: `Ketua Div Humas ${kab.nama}`, jabatan: findJabatan("Kabupaten", "Divisi Hubungan Masyarakat dan Kemitraan Strategis", "Ketua Divisi") },
      { nama: `Anggota Div Humas ${kab.nama}`, jabatan: findJabatan("Kabupaten", "Divisi Hubungan Masyarakat dan Kemitraan Strategis", "Anggota") },
    ];
    
    let countKabLocal = 0;
    for (const p of pengurusKabupaten) {
      if (!p.jabatan) {
        console.error(`  ✗ Jabatan tidak ditemukan untuk: ${p.nama}`);
        continue;
      }
      const result = await createPengurus({
        namaLengkap: p.nama,
        nik: "3201" + String(kab.id).padStart(2, "0") + String(1506900000 + countKab + 200).padStart(10, "0"),
        tempatLahir: kab.nama,
        tanggalLahir: "1995-03-20",
        jenisKelamin: "L",
        alamat: `Jl. ${kab.nama} No. 1`,
        provinsiId: prov.id,
        kabupatenId: kab.id,
        kecamatan: "Pusat",
        email: p.nama.toLowerCase().replace(/[^a-z]/g, ".").replace(/\.+/g, ".") + "@kipan.id",
        hp: "08140000" + String(3000 + countKab).padStart(4, "0"),
        foto: fotoKabupaten,
        jabatanId: p.jabatan.id,
        level: "KABUPATEN",
        status: "Aktif",
        tanggalMulai: "2024-05-20",
        nomorSK: `SK/${kab.kode}/2024/${String(countKabLocal + 1).padStart(3, "0")}`,
      });
      if (result) {
        countKab++;
        countKabLocal++;
        count++;
      }
    }
    
    // Set ketua kabupaten
    const ketumKab = await prisma.pengurus.findFirst({
      where: { level: "KABUPATEN", kabupatenId: kab.id, status: "Aktif" },
      include: { anggota: true, jabatan: true },
    });
    if (ketumKab) {
      await prisma.kabupaten.update({
        where: { id: kab.id },
        data: { ketua: ketumKab.anggota.namaLengkap },
      });
      console.log(`  ✓ Ketua ${kab.nama}: ${ketumKab.anggota.namaLengkap} (${countKabLocal} pengurus)`);
    }
  }

  console.log(`\n  ✓ Total pengurus Kabupaten: ${countKab}`);
  console.log(`\n📊 TOTAL PENGURUS BARU: ${count}`);

  // ============ VERIFIKASI ============
  console.log("\n🔍 Step 4: Verifikasi tidak ada pengurus dengan jabatan kosong...");
  const allPengurus = await prisma.pengurus.findMany({
    include: { jabatan: true, anggota: true },
  });
  
  const pengurusTanpaJabatan = allPengurus.filter(p => !p.jabatanId || !p.jabatan);
  if (pengurusTanpaJabatan.length === 0) {
    console.log(`  ✅ Semua ${allPengurus.length} pengurus memiliki jabatan yang valid!`);
  } else {
    console.log(`  ❌ Ditemukan ${pengurusTanpaJabatan.length} pengurus tanpa jabatan:`);
    pengurusTanpaJabatan.forEach(p => {
      console.log(`     - id=${p.id}, nama=${p.anggota?.namaLengkap}, jabatanId=${p.jabatanId}`);
    });
  }
  
  // Summary per level & bidang
  console.log("\n📊 Summary per Level:");
  for (const level of ["NASIONAL", "PROVINSI", "KABUPATEN"]) {
    const cnt = allPengurus.filter(p => p.level === level).length;
    console.log(`  ${level}: ${cnt} pengurus`);
  }
  
  console.log("\n📊 Summary per Bidang:");
  const bidangCounts = {};
  for (const p of allPengurus) {
    const bidang = p.jabatan?.bidang || "TIDAK ADA";
    if (!bidangCounts[bidang]) bidangCounts[bidang] = 0;
    bidangCounts[bidang]++;
  }
  for (const [bidang, cnt] of Object.entries(bidangCounts)) {
    console.log(`  ${bidang}: ${cnt}`);
  }

  console.log("\n✅ SELESAI! Semua data pengurus sudah diisi dengan jabatan yang valid.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ ERROR:", e);
  process.exit(1);
});
