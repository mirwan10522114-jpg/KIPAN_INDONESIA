// ============================================================
// SEED SCRIPT — Isi data awal SIM-KIPAN
// Run: bun run scripts/seed.ts
// ============================================================

import { db } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding database...");

  // 1. PROVINSI
  const provinsiData = [
    { kode: "DKI", nama: "DKI Jakarta", status: "Aktif", ketua: "Rina Marlina, S.Pd" },
    { kode: "JBR", nama: "Jawa Barat", status: "Aktif", ketua: "Hendra Gunawan, S.Sos" },
    { kode: "JT", nama: "Jawa Tengah", status: "Aktif", ketua: "Bambang Sutrisno" },
    { kode: "JI", nama: "Jawa Timur", status: "Aktif", ketua: "Siti Aminah" },
    { kode: "BT", nama: "Banten", status: "Aktif", ketua: "Agus Setiawan, S.E" },
    { kode: "BL", nama: "Bali", status: "Aktif", ketua: "Dewi Lestari" },
    { kode: "SU", nama: "Sumatera Utara", status: "Aktif", ketua: "Ir. Bambang Wijaya" },
    { kode: "SB", nama: "Sumatera Barat", status: "Pembentukan", ketua: "Hendra Pratama" },
  ];

  const provinsi = [];
  for (const p of provinsiData) {
    const created = await db.provinsi.upsert({
      where: { kode: p.kode },
      update: p,
      create: p,
    });
    provinsi.push(created);
  }
  console.log(`✓ ${provinsi.length} provinsi`);

  // 2. KABUPATEN
  const kabupatenData = [
    { kode: "3204", nama: "Bandung Barat", provinsiKode: "JBR", ketua: "Maya Sari, S.H", status: "Aktif" },
    { kode: "3204-BDG", nama: "Bandung", provinsiKode: "JBR", ketua: "Rizal Mahendra, S.T", status: "Aktif" },
    { kode: "3201", nama: "Bogor", provinsiKode: "JBR", ketua: "Diana Pratiwi, M.M", status: "Aktif" },
    { kode: "3171", nama: "Jakarta Pusat", provinsiKode: "DKI", ketua: "Andi Wijaya", status: "Aktif" },
    { kode: "3174", nama: "Jakarta Selatan", provinsiKode: "DKI", ketua: "Rina Anggraini", status: "Aktif" },
    { kode: "3578", nama: "Surabaya", provinsiKode: "JI", ketua: "Budi Santoso", status: "Aktif" },
    { kode: "3573", nama: "Semarang", provinsiKode: "JT", ketua: "Cahyo Utomo", status: "Aktif" },
    { kode: "5171", nama: "Denpasar", provinsiKode: "BL", ketua: "Wayan Sudana", status: "Aktif" },
    { kode: "3471", nama: "Medan", provinsiKode: "SU", ketua: "Jonas Simanjuntak", status: "Pembentukan" },
  ];

  const kabupaten = [];
  for (const k of kabupatenData) {
    const prov = provinsi.find((p) => p.kode === k.provinsiKode)!;
    const created = await db.kabupaten.upsert({
      where: { kode: k.kode },
      update: { nama: k.nama, provinsiId: prov.id, ketua: k.ketua, status: k.status },
      create: { kode: k.kode, nama: k.nama, provinsiId: prov.id, ketua: k.ketua, status: k.status },
    });
    kabupaten.push(created);
  }
  console.log(`✓ ${kabupaten.length} kabupaten`);

  // 3. USERS
  const passwordHash = bcrypt.hashSync("admin123", 10);
  const userData = [
    { email: "superadmin@kipan.id", name: "Super Admin", role: "SUPER_ADMIN", passwordHash },
    { email: "admin.nasional@kipan.id", name: "Admin Nasional", role: "ADMIN_NASIONAL", passwordHash },
    { email: "admin.jabar@kipan.id", name: "Admin Jawa Barat", role: "ADMIN_PROVINSI", passwordHash },
    { email: "admin.bandungbarat@kipan.id", name: "Admin Bandung Barat", role: "ADMIN_KABUPATEN", passwordHash },
    { email: "admin.jakarta@kipan.id", name: "Admin DKI Jakarta", role: "ADMIN_PROVINSI", passwordHash },
  ];
  for (const u of userData) {
    await db.user.upsert({
      where: { email: u.email },
      update: u,
      create: u,
    });
  }
  console.log(`✓ ${userData.length} users`);

  // 4. PENGURUS
  const pengurusData = [
    { namaLengkap: "Drs. H. Sutrisno, M.Si", jabatan: "Ketua Umum Pusat", level: "NASIONAL", email: "ketum@kipan.id", hp: "081234500001", foto: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80", status: "Aktif", tanggalMulai: new Date("2020-01-15") },
    { namaLengkap: "Dr. Siti Aminah, M.Kes", jabatan: "Sekretaris Jenderal", level: "NASIONAL", email: "sekjen@kipan.id", hp: "081234500002", foto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80", status: "Aktif", tanggalMulai: new Date("2020-01-15") },
    { namaLengkap: "Ir. Bambang Wijaya", jabatan: "Bendahara Umum", level: "NASIONAL", email: "bendahara@kipan.id", hp: "081234500003", foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80", status: "Aktif", tanggalMulai: new Date("2020-01-15") },
    { namaLengkap: "Hendra Gunawan, S.Sos", jabatan: "Ketua KIPAN Provinsi Jawa Barat", level: "PROVINSI", provinsiKode: "JBR", email: "jabar@kipan.id", hp: "081234500004", foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80", status: "Aktif", tanggalMulai: new Date("2020-03-10") },
    { namaLengkap: "Rina Marlina, S.Pd", jabatan: "Ketua KIPAN Provinsi DKI Jakarta", level: "PROVINSI", provinsiKode: "DKI", email: "jakarta@kipan.id", hp: "081234500005", foto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80", status: "Aktif", tanggalMulai: new Date("2020-03-15") },
    { namaLengkap: "Maya Sari, S.H", jabatan: "Ketua KIPAN Kab. Bandung Barat", level: "KABUPATEN", provinsiKode: "JBR", kabupatenKode: "3204", email: "bandungbarat@kipan.id", hp: "081234500006", foto: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80", status: "Aktif", tanggalMulai: new Date("2020-05-20") },
    { namaLengkap: "Rizal Mahendra, S.T", jabatan: "Ketua KIPAN Kab. Bandung", level: "KABUPATEN", provinsiKode: "JBR", kabupatenKode: "3204-BDG", email: "bandung@kipan.id", hp: "081234500007", foto: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80", status: "Aktif", tanggalMulai: new Date("2020-05-22") },
  ];

  for (const p of pengurusData) {
    const prov = p.provinsiKode ? provinsi.find((x) => x.kode === p.provinsiKode) : null;
    const kab = p.kabupatenKode ? kabupaten.find((x) => x.kode === p.kabupatenKode) : null;
    try {
      await db.pengurus.create({
        data: {
          namaLengkap: p.namaLengkap,
          jabatan: p.jabatan,
          level: p.level,
          email: p.email,
          hp: p.hp || null,
          foto: p.foto,
          status: p.status,
          tanggalMulai: p.tanggalMulai,
          provinsiId: prov?.id || null,
          kabupatenId: kab?.id || null,
        },
      });
    } catch (e) {}
  }
  console.log(`✓ Pengurus`);

  // 5. ANGGOTA
  const anggotaData = [
    { nia: "KIPAN-JBR-3204-2024-00012", namaLengkap: "Ahmad Fauzi", nik: "3273251506950001", tempatLahir: "Bandung", tanggalLahir: new Date("1995-04-15"), jenisKelamin: "L", pendidikan: "S1", pekerjaan: "Wiraswasta", alamat: "Jl. Karya Bakti No. 24", provinsiKode: "JBR", kabupatenKode: "3204", kecamatan: "Ngamprah", email: "ahmad.fauzi@email.com", hp: "081234567890", whatsapp: "081234567890", foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80", status: "AKTIF", angkatan: "XII", tanggalAngkat: new Date("2024-02-20") },
    { nia: "KIPAN-DKI-3174-2024-00045", namaLengkap: "Siti Nurhaliza", nik: "3174072208980002", tempatLahir: "Jakarta", tanggalLahir: new Date("1998-08-22"), jenisKelamin: "P", pendidikan: "S1", pekerjaan: "PNS", alamat: "Jl. Mawar No. 5", provinsiKode: "DKI", kabupatenKode: "3174", kecamatan: "Kebayoran", email: "siti.nurhaliza@email.com", hp: "082134567891", whatsapp: "082134567891", foto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80", status: "AKTIF", angkatan: "XII", tanggalAngkat: new Date("2024-03-15") },
    { nia: "KIPAN-JBR-3204-2024-00089", namaLengkap: "Budi Santoso", nik: "3273014403930003", tempatLahir: "Cimahi", tanggalLahir: new Date("1993-12-03"), jenisKelamin: "L", pendidikan: "D3", pekerjaan: "Karyawan Swasta", alamat: "Jl. Asia Afrika No. 88", provinsiKode: "JBR", kabupatenKode: "3204-BDG", kecamatan: "Coblong", email: "budi.santoso@email.com", hp: "081345678902", whatsapp: "081345678902", foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80", status: "AKTIF", angkatan: "XII", tanggalAngkat: new Date("2024-02-25") },
    { nia: "KIPAN-JI-3578-2023-00156", namaLengkap: "Dewi Lestari", nik: "3578030503940005", tempatLahir: "Surabaya", tanggalLahir: new Date("1996-06-18"), jenisKelamin: "P", pendidikan: "S2", pekerjaan: "Dosen", alamat: "Jl. Pemuda No. 12", provinsiKode: "JI", kabupatenKode: "3578", kecamatan: "Gubeng", email: "dewi.lestari@email.com", hp: "081456789013", whatsapp: "081456789013", foto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80", status: "AKTIF", angkatan: "XI", tanggalAngkat: new Date("2023-12-10") },
    { nia: "KIPAN-JT-3573-2024-00067", namaLengkap: "Maya Sari", nik: "3573104512970006", tempatLahir: "Semarang", tanggalLahir: new Date("1997-09-12"), jenisKelamin: "P", pendidikan: "S1", pekerjaan: "Guru", alamat: "Jl. Pahlawan No. 45", provinsiKode: "JT", kabupatenKode: "3573", kecamatan: "Gajahmungkur", email: "maya.sari@email.com", hp: "081678901235", whatsapp: "081678901235", foto: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80", status: "AKTIF", angkatan: "XII", tanggalAngkat: new Date("2024-03-20") },
    { nia: "KIPAN-BT-3201-2024-00034", namaLengkap: "Rizal Mahendra", nik: "3601012503940007", tempatLahir: "Serang", tanggalLahir: new Date("1994-03-25"), jenisKelamin: "L", pendidikan: "S1", pekerjaan: "Wiraswasta", alamat: "Jl. Veteran No. 7", provinsiKode: "BT", kabupatenKode: "3201", kecamatan: "Serang", email: "rizal.mahendra@email.com", hp: "081567890124", whatsapp: "081567890124", foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80", status: "NONAKTIF", angkatan: "XII", tanggalAngkat: new Date("2024-04-05") },
  ];

  for (const a of anggotaData) {
    const prov = provinsi.find((x) => x.kode === a.provinsiKode)!;
    const kab = kabupaten.find((x) => x.kode === a.kabupatenKode)!;
    try {
      await db.anggota.create({
        data: {
          nia: a.nia,
          namaLengkap: a.namaLengkap,
          nik: a.nik,
          tempatLahir: a.tempatLahir,
          tanggalLahir: a.tanggalLahir,
          jenisKelamin: a.jenisKelamin,
          pendidikan: a.pendidikan,
          pekerjaan: a.pekerjaan,
          alamat: a.alamat,
          provinsiId: prov.id,
          kabupatenId: kab.id,
          kecamatan: a.kecamatan,
          email: a.email,
          hp: a.hp,
          whatsapp: a.whatsapp,
          foto: a.foto,
          status: a.status,
          angkatan: a.angkatan,
          tanggalAngkat: a.tanggalAngkat,
          tanggalDaftar: new Date(a.tanggalAngkat.getTime() - 30 * 24 * 60 * 60 * 1000),
        },
      });
    } catch (e) {}
  }
  console.log(`✓ ${anggotaData.length} anggota`);

  // 6. PENDAFTARAN
  const pendaftaranData = [
    { namaLengkap: "Indra Kusuma", nik: "3273251506950008", tempatLahir: "Bandung", tanggalLahir: new Date("1995-06-15"), jenisKelamin: "L", agama: "Islam", pendidikan: "S1", pekerjaan: "Karyawan Swasta", alamat: "Jl. Cibadak No. 10", provinsiKode: "JBR", kabupatenKode: "3204-BDG", kecamatan: "Coblong", email: "indra.kusuma@email.com", hp: "081789012346", whatsapp: "081789012346", motivasi: "Saya ingin berkontribusi aktif dalam pencegahan narkoba di komunitas saya.", status: "DIAJUKAN", persyaratan: JSON.stringify([true, true, true, true, true, true]) },
    { namaLengkap: "Putri Maharani", nik: "3174072208980009", tempatLahir: "Jakarta", tanggalLahir: new Date("1998-08-22"), jenisKelamin: "P", agama: "Islam", pendidikan: "S1", pekerjaan: "Mahasiswa", alamat: "Jl. Senayan No. 5", provinsiKode: "DKI", kabupatenKode: "3174", kecamatan: "Kebayoran", email: "putri.maharani@email.com", hp: "081890123457", whatsapp: "081890123457", motivasi: "Sebagai mahasiswa, saya ingin menjadi agent of change di kampus.", status: "DIVERIFIKASI", persyaratan: JSON.stringify([true, true, true, true, true, true]) },
    { namaLengkap: "Doni Pratama", nik: "3578030503940010", tempatLahir: "Surabaya", tanggalLahir: new Date("1994-03-05"), jenisKelamin: "L", agama: "Kristen", pendidikan: "D3", pekerjaan: "Wiraswasta", alamat: "Jl. Pemuda No. 12", provinsiKode: "JI", kabupatenKode: "3578", kecamatan: "Gubeng", email: "doni.pratama@email.com", hp: "081901234568", whatsapp: "081901234568", motivasi: "Ingin membantu pencegahan narkoba di lingkungan tempat tinggal.", status: "PERBAIKAN", persyaratan: JSON.stringify([true, true, true, true, false, true]), catatan: "Lengkapi upload Pas Foto dan Surat Pernyataan" },
    { namaLengkap: "Ratna Sari", nik: "5171024512970011", tempatLahir: "Denpasar", tanggalLahir: new Date("1997-12-05"), jenisKelamin: "P", agama: "Hindu", pendidikan: "S1", pekerjaan: "Pegawai Swasta", alamat: "Jl. Diponegoro No. 8", provinsiKode: "BL", kabupatenKode: "5171", kecamatan: "Denpasar Selatan", email: "ratna.sari@email.com", hp: "08101234569", whatsapp: "08101234569", motivasi: "Bergabung dengan komunitas yang peduli masa depan generasi muda Bali.", status: "DISETUJUI", persyaratan: JSON.stringify([true, true, true, true, true, true]) },
    { namaLengkap: "Eko Wijaya", nik: "3273014403890012", tempatLahir: "Cimahi", tanggalLahir: new Date("1989-03-04"), jenisKelamin: "L", agama: "Islam", pendidikan: "SMA", pekerjaan: "Buruh", alamat: "Jl. Baros No. 22", provinsiKode: "JBR", kabupatenKode: "3204", kecamatan: "Ngamprah", email: "eko.wijaya@email.com", hp: "08112345670", whatsapp: "08112345670", motivasi: "Ingin berkontribusi untuk lingkungan yang lebih sehat.", status: "DITOLAK", persyaratan: JSON.stringify([true, false, true, true, true, true]), catatan: "Umur melebihi batas maksimal 30 tahun" },
  ];

  for (const p of pendaftaranData) {
    const prov = provinsi.find((x) => x.kode === p.provinsiKode)!;
    const kab = kabupaten.find((x) => x.kode === p.kabupatenKode)!;
    const created = await db.pendaftaran.create({
      data: {
        namaLengkap: p.namaLengkap,
        nik: p.nik,
        tempatLahir: p.tempatLahir,
        tanggalLahir: p.tanggalLahir,
        jenisKelamin: p.jenisKelamin,
        agama: p.agama,
        pendidikan: p.pendidikan,
        pekerjaan: p.pekerjaan,
        alamat: p.alamat,
        provinsiId: prov.id,
        kabupatenId: kab.id,
        kecamatan: p.kecamatan,
        email: p.email,
        hp: p.hp,
        whatsapp: p.whatsapp,
        motivasi: p.motivasi,
        status: p.status,
        persyaratan: p.persyaratan,
        catatan: p.catatan,
      },
    });
    await db.pendaftaranRiwayat.create({
      data: {
        pendaftaranId: created.id,
        aksi: "Pendaftaran dikirim",
        oleh: "Calon Anggota",
      },
    });
    if (p.status !== "DIAJUKAN") {
      await db.pendaftaranRiwayat.create({
        data: {
          pendaftaranId: created.id,
          aksi: p.status === "DITOLAK" ? "Pendaftaran ditolak" :
                p.status === "PERBAIKAN" ? "Diminta perbaikan dokumen" :
                p.status === "DIVERIFIKASI" ? "Verifikasi berkas dimulai" :
                "Disetujui, menunggu jadwal pelatihan",
          oleh: "Admin Kabupaten",
          catatan: p.catatan,
        },
      });
    }
  }
  console.log(`✓ ${pendaftaranData.length} pendaftaran`);

  // 7. BERITA
  const beritaData = [
    { judul: "Rapat Koordinasi Nasional KIPAN 2026 di Jakarta", kategori: "Nasional", excerpt: "Pengurus pusat KIPAN menggelar rapat koordinasi nasional...", konten: "Rapat koordinasi nasional KIPAN 2026 diselenggarakan di Jakarta.", thumbnail: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80", penulis: "Tim Media", status: "Published", publishedAt: new Date("2025-01-15") },
    { judul: "Pelatihan Kader KIPAN Jawa Barat Angkatan XII", kategori: "Provinsi", excerpt: "250 calon kader KIPAN Jawa Barat mengikuti pelatihan dasar...", konten: "Pelatihan kader KIPAN Jawa Barat Angkatan XII diselenggarakan di Bandung.", thumbnail: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80", penulis: "Hendra Gunawan", status: "Published", publishedAt: new Date("2025-01-08") },
    { judul: "Sosialisasi Anti Narkoba di 50 Sekolah Bandung Barat", kategori: "Kabupaten", excerpt: "KIPAN Kab. Bandung Barat melaksanakan sosialisasi anti narkoba...", konten: "KIPAN Kabupaten Bandung Barat melaksanakan sosialisasi anti narkoba di 50 sekolah menengah.", thumbnail: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80", penulis: "Maya Sari", status: "Published", publishedAt: new Date("2025-01-05") },
    { judul: "Konser Amal Anti Narkoba di Yogyakarta", kategori: "Provinsi", excerpt: "Konser amal dengan menampilkan musisi lokal...", konten: "Konser amal anti narkoba di Yogyakarta dengan menampilkan musisi lokal.", thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80", penulis: "Tim Media", status: "Published", publishedAt: new Date("2024-12-20") },
    { judul: "Draft: Kerja Sama KIPAN dengan Kementerian Pemuda", kategori: "Nasional", excerpt: "Rencana kerja sama dengan Kementerian...", konten: "Rencana kerja sama KIPAN dengan Kementerian Pemuda dan Olahraga.", thumbnail: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=900&q=80", penulis: "Sekretariat", status: "Draft" },
  ];
  for (const b of beritaData) {
    const slug = b.judul.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    try {
      await db.berita.create({ data: { ...b, slug } });
    } catch (e) {}
  }
  console.log(`✓ ${beritaData.length} berita`);

  // 8. GALERI
  const galeriData = [
    { judul: "Upacara Hari Anti Narkoba Internasional", kategori: "Kampanye", foto: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=900&q=80", lokasi: "Jakarta" },
    { judul: "Pelatihan Kader Angkatan XII", kategori: "Pelatihan", foto: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80", lokasi: "Bandung" },
    { judul: "Sosialisasi Sekolah SMKN 5", kategori: "Sosialisasi", foto: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80", lokasi: "Bandung Barat" },
    { judul: "Rapat Koordinasi Nasional", kategori: "Rapat", foto: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80", lokasi: "Jakarta" },
    { judul: "Aksi Kampanye Car Free Day", kategori: "Kampanye", foto: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80", lokasi: "Surabaya" },
    { judul: "Workshop Penyuluhan Komunitas", kategori: "Kegiatan", foto: "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=900&q=80", lokasi: "Yogyakarta" },
  ];
  for (const g of galeriData) {
    try {
      await db.galeri.create({ data: g });
    } catch (e) {}
  }
  console.log(`✓ ${galeriData.length} galeri`);

  // 9. PROGRAM KERJA
  const programData = [
    { nama: "Sosialisasi Anti Narkoba 50 Sekolah", deskripsi: "Sosialisasi ke 50 sekolah di Bandung Barat", tingkat: "Kabupaten", pic: "Maya Sari", tanggalMulai: new Date("2025-01-01"), tanggalSelesai: new Date("2025-03-31"), status: "Berjalan" },
    { nama: "Pelatihan Kader Angkatan XII", deskripsi: "Pelatihan dasar calon anggota", tingkat: "Provinsi", pic: "Hendra Gunawan", tanggalMulai: new Date("2025-01-08"), tanggalSelesai: new Date("2025-01-10"), status: "Selesai" },
    { nama: "Rapat Koordinasi Nasional 2026", deskripsi: "Rapat koordinasi pengurus pusat dan provinsi", tingkat: "Nasional", pic: "Sutrisno", tanggalMulai: new Date("2025-01-15"), tanggalSelesai: new Date("2025-01-16"), status: "Selesai" },
    { nama: "Konser Amal Anti Narkoba Nasional", deskripsi: "Konser amal untuk kampanye anti narkoba", tingkat: "Nasional", pic: "Tim Media", tanggalMulai: new Date("2025-03-01"), tanggalSelesai: new Date("2025-03-01"), status: "Direncanakan" },
    { nama: "Workshop Trainer (TOT)", deskripsi: "Pelatihan trainer kader KIPAN", tingkat: "Provinsi", pic: "Hendra Gunawan", tanggalMulai: new Date("2025-02-15"), tanggalSelesai: new Date("2025-02-17"), status: "Direncanakan" },
  ];
  for (const p of programData) {
    try {
      await db.programKerja.create({ data: p });
    } catch (e) {}
  }
  console.log(`✓ ${programData.length} program kerja`);

  // 10. PROFIL ORGANISASI
  await db.profilOrganisasi.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nama: "KIPAN",
      namaLengkap: "Kader Inti Pemuda Anti Narkoba",
      tagline: "Pemuda Indonesia Bersih dari Narkoba",
      email: "sekretariat@kipan.id",
      telepon: "021-0000-0000",
      alamat: "Sekretariat KIPAN Pusat, Jakarta, Indonesia",
      instagram: "@kipan.indonesia",
      website: "kipan.id",
      deskripsi: "KIPAN (Kader Inti Pemuda Anti Narkoba) adalah komunitas dan program pembinaan pemuda yang dibentuk untuk mencegah penyalahgunaan narkoba di Indonesia.",
    },
  });
  console.log(`✓ Profil organisasi`);

  console.log("\n🎉 Seed selesai!");
  console.log("\n📋 Akun login admin:");
  console.log("   Email: superadmin@kipan.id | Password: admin123");
  console.log("   Email: admin.nasional@kipan.id | Password: admin123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
