// ============================================================
// KIPAN ADMIN — Mock Data untuk Dashboard
// ============================================================

export interface Provinsi {
  id: number;
  nama: string;
  kode: string;
  jumlahKabupaten: number;
  jumlahAnggota: number;
  jumlahPengurus: number;
  ketua: string;
  status: "Aktif" | "Pembentukan";
}

export interface Kabupaten {
  id: number;
  nama: string;
  provinsiId: number;
  provinsiNama: string;
  jumlahAnggota: number;
  jumlahPengurus: number;
  ketua: string;
  status: "Aktif" | "Pembentukan";
}

export interface Anggota {
  id: number;
  nia: string;
  nama: string;
  foto: string;
  jenisKelamin: "L" | "P";
  tempatLahir: string;
  tanggalLahir: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  alamat: string;
  email: string;
  hp: string;
  whatsapp: string;
  pendidikan: string;
  pekerjaan: string;
  status: "Aktif" | "Nonaktif" | "Mengundurkan Diri" | "Diberhentikan";
  tanggalDaftar: string;
  tanggalAngkat: string;
  angkatan: string;
}

export interface Pendaftaran {
  id: number;
  nama: string;
  foto: string;
  nik: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: "L" | "P";
  agama: string;
  pendidikan: string;
  pekerjaan: string;
  alamat: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  email: string;
  hp: string;
  whatsapp: string;
  motivasi: string;
  status: "Draft" | "Diajukan" | "Diverifikasi" | "Disetujui" | "Ditolak" | "Perbaikan";
  tanggalDaftar: string;
  dokumen: { nama: string; uploaded: boolean }[];
  persyaratan: boolean[];
  riwayat: { tanggal: string; aksi: string; oleh: string }[];
}

export interface Pengurus {
  id: number;
  nama: string;
  foto: string;
  jabatan: string;
  level: "Nasional" | "Provinsi" | "Kabupaten";
  wilayah: string;
  provinsiNama?: string;
  kabupatenNama?: string;
  email: string;
  hp: string;
  status: "Aktif" | "Nonaktif" | "Dibekukan";
  tanggalMulai: string;
  tanggalSelesai?: string;
  nomorSK: string;
  fileSK?: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  alamat?: string;
}

export interface Berita {
  id: number;
  judul: string;
  kategori: "Nasional" | "Provinsi" | "Kabupaten";
  penulis: string;
  tanggal: string;
  status: "Published" | "Draft";
  thumbnail: string;
  excerpt: string;
}

export interface ProgramKerja {
  id: number;
  nama: string;
  tingkat: "Nasional" | "Provinsi" | "Kabupaten";
  tanggalMulai: string;
  tanggalSelesai: string;
  status: "Berjalan" | "Selesai" | "Direncanakan";
  pic: string;
}

export interface Role {
  id: number;
  nama: string;
  deskripsi: string;
  jumlahUser: number;
  permissions: string[];
}

// ============================================================
// MOCK DATA
// ============================================================

export const PROVINSI_LIST: Provinsi[] = [
  { id: 1, nama: "DKI Jakarta", kode: "DKI", jumlahKabupaten: 6, jumlahAnggota: 1850, jumlahPengurus: 78, ketua: "Rina Marlina, S.Pd", status: "Aktif" },
  { id: 2, nama: "Jawa Barat", kode: "JBR", jumlahKabupaten: 27, jumlahAnggota: 2450, jumlahPengurus: 110, ketua: "Hendra Gunawan, S.Sos", status: "Aktif" },
  { id: 3, nama: "Jawa Tengah", kode: "JT", jumlahKabupaten: 35, jumlahAnggota: 1980, jumlahPengurus: 92, ketua: "Bambang Sutrisno", status: "Aktif" },
  { id: 4, nama: "Jawa Timur", kode: "JI", jumlahKabupaten: 38, jumlahAnggota: 2150, jumlahPengurus: 105, ketua: "Siti Aminah", status: "Aktif" },
  { id: 5, nama: "Banten", kode: "BT", jumlahKabupaten: 8, jumlahAnggota: 980, jumlahPengurus: 42, ketua: "Agus Setiawan, S.E", status: "Aktif" },
  { id: 6, nama: "Bali", kode: "BL", jumlahKabupaten: 9, jumlahAnggota: 520, jumlahPengurus: 28, ketua: "Dewi Lestari", status: "Aktif" },
  { id: 7, nama: "Sumatera Utara", kode: "SU", jumlahKabupaten: 33, jumlahAnggota: 1120, jumlahPengurus: 55, ketua: "Ir. Bambang Wijaya", status: "Aktif" },
  { id: 8, nama: "Sumatera Barat", kode: "SB", jumlahKabupaten: 19, jumlahAnggota: 680, jumlahPengurus: 32, ketua: "Hendra Pratama", status: "Pembentukan" },
];

export const KABUPATEN_LIST: Kabupaten[] = [
  { id: 1, nama: "Bandung Barat", provinsiId: 2, provinsiNama: "Jawa Barat", jumlahAnggota: 320, jumlahPengurus: 18, ketua: "Maya Sari, S.H", status: "Aktif" },
  { id: 2, nama: "Bandung", provinsiId: 2, provinsiNama: "Jawa Barat", jumlahAnggota: 450, jumlahPengurus: 22, ketua: "Rizal Mahendra, S.T", status: "Aktif" },
  { id: 3, nama: "Bogor", provinsiId: 2, provinsiNama: "Jawa Barat", jumlahAnggota: 380, jumlahPengurus: 20, ketua: "Diana Pratiwi, M.M", status: "Aktif" },
  { id: 4, nama: "Jakarta Pusat", provinsiId: 1, provinsiNama: "DKI Jakarta", jumlahAnggota: 280, jumlahPengurus: 15, ketua: "Andi Wijaya", status: "Aktif" },
  { id: 5, nama: "Jakarta Selatan", provinsiId: 1, provinsiNama: "DKI Jakarta", jumlahAnggota: 350, jumlahPengurus: 16, ketua: "Rina Anggraini", status: "Aktif" },
  { id: 6, nama: "Surabaya", provinsiId: 4, provinsiNama: "Jawa Timur", jumlahAnggota: 420, jumlahPengurus: 21, ketua: "Budi Santoso", status: "Aktif" },
  { id: 7, nama: "Semarang", provinsiId: 3, provinsiNama: "Jawa Tengah", jumlahAnggota: 310, jumlahPengurus: 17, ketua: "Cahyo Utomo", status: "Aktif" },
  { id: 8, nama: "Denpasar", provinsiId: 5, provinsiNama: "Bali", jumlahAnggota: 180, jumlahPengurus: 12, ketua: "Wayan Sudana", status: "Aktif" },
  { id: 9, nama: "Medan", provinsiId: 7, provinsiNama: "Sumatera Utara", jumlahAnggota: 250, jumlahPengurus: 14, ketua: "Jonas Simanjuntak", status: "Pembentukan" },
];

export const ANGGOTA_LIST: Anggota[] = [
  {
    id: 1, nia: "KIPAN-JBR-3204-2024-00012",
    nama: "Ahmad Fauzi", foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    jenisKelamin: "L", tempatLahir: "Bandung", tanggalLahir: "1995-04-15",
    provinsi: "Jawa Barat", kabupaten: "Bandung Barat", kecamatan: "Ngamprah", alamat: "Jl. Karya Bakti No. 24",
    email: "ahmad.fauzi@email.com", hp: "081234567890", whatsapp: "081234567890",
    pendidikan: "S1", pekerjaan: "Wiraswasta",
    status: "Aktif", tanggalDaftar: "2024-01-15", tanggalAngkat: "2024-02-20", angkatan: "XII",
  },
  {
    id: 2, nia: "KIPAN-DKI-0101-2024-00045",
    nama: "Siti Nurhaliza", foto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    jenisKelamin: "P", tempatLahir: "Jakarta", tanggalLahir: "1998-08-22",
    provinsi: "DKI Jakarta", kabupaten: "Jakarta Selatan", kecamatan: "Kebayoran", alamat: "Jl. Mawar No. 5",
    email: "siti.nurhaliza@email.com", hp: "082134567891", whatsapp: "082134567891",
    pendidikan: "S1", pekerjaan: "PNS",
    status: "Aktif", tanggalDaftar: "2024-02-10", tanggalAngkat: "2024-03-15", angkatan: "XII",
  },
  {
    id: 3, nia: "KIPAN-JBR-3204-2024-00089",
    nama: "Budi Santoso", foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    jenisKelamin: "L", tempatLahir: "Cimahi", tanggalLahir: "1993-12-03",
    provinsi: "Jawa Barat", kabupaten: "Bandung", kecamatan: "Coblong", alamat: "Jl. Asia Afrika No. 88",
    email: "budi.santoso@email.com", hp: "081345678902", whatsapp: "081345678902",
    pendidikan: "D3", pekerjaan: "Karyawan Swasta",
    status: "Aktif", tanggalDaftar: "2024-01-20", tanggalAngkat: "2024-02-25", angkatan: "XII",
  },
  {
    id: 4, nia: "KIPAN-JI-3501-2023-00156",
    nama: "Dewi Lestari", foto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    jenisKelamin: "P", tempatLahir: "Surabaya", tanggalLahir: "1996-06-18",
    provinsi: "Jawa Timur", kabupaten: "Surabaya", kecamatan: "Gubeng", alamat: "Jl. Pemuda No. 12",
    email: "dewi.lestari@email.com", hp: "081456789013", whatsapp: "081456789013",
    pendidikan: "S2", pekerjaan: "Dosen",
    status: "Aktif", tanggalDaftar: "2023-11-05", tanggalAngkat: "2023-12-10", angkatan: "XI",
  },
  {
    id: 5, nia: "KIPAN-BT-3201-2024-00034",
    nama: "Rizal Mahendra", foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    jenisKelamin: "L", tempatLahir: "Serang", tanggalLahir: "1994-03-25",
    provinsi: "Banten", kabupaten: "Serang", kecamatan: "Serang", alamat: "Jl. Veteran No. 7",
    email: "rizal.mahendra@email.com", hp: "081567890124", whatsapp: "081567890124",
    pendidikan: "S1", pekerjaan: "Wiraswasta",
    status: "Nonaktif", tanggalDaftar: "2024-03-01", tanggalAngkat: "2024-04-05", angkatan: "XII",
  },
  {
    id: 6, nia: "KIPAN-JT-3301-2024-00067",
    nama: "Maya Sari", foto: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    jenisKelamin: "P", tempatLahir: "Semarang", tanggalLahir: "1997-09-12",
    provinsi: "Jawa Tengah", kabupaten: "Semarang", kecamatan: "Gajahmungkur", alamat: "Jl. Pahlawan No. 45",
    email: "maya.sari@email.com", hp: "081678901235", whatsapp: "081678901235",
    pendidikan: "S1", pekerjaan: "Guru",
    status: "Aktif", tanggalDaftar: "2024-02-15", tanggalAngkat: "2024-03-20", angkatan: "XII",
  },
];

export const PENDAFTARAN_LIST: Pendaftaran[] = [
  {
    id: 1, nama: "Indra Kusuma", foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    nik: "3273251506950001", tempatLahir: "Bandung", tanggalLahir: "1995-06-15", jenisKelamin: "L",
    agama: "Islam", pendidikan: "S1", pekerjaan: "Karyawan Swasta",
    alamat: "Jl. Cibadak No. 10", provinsi: "Jawa Barat", kabupaten: "Bandung", kecamatan: "Coblong",
    email: "indra.kusuma@email.com", hp: "081789012346", whatsapp: "081789012346",
    motivasi: "Saya ingin berkontribusi aktif dalam pencegahan narkoba di komunitas saya.",
    status: "Diajukan", tanggalDaftar: "2025-01-10",
    dokumen: [
      { nama: "KTP", uploaded: true },
      { nama: "Pas Foto", uploaded: true },
      { nama: "CV", uploaded: true },
      { nama: "Surat Pernyataan", uploaded: true },
      { nama: "Surat Sehat", uploaded: false },
    ],
    persyaratan: [true, true, true, true, true, true],
    riwayat: [
      { tanggal: "2025-01-10 14:30", aksi: "Pendaftaran dikirim", oleh: "Calon Anggota" },
    ],
  },
  {
    id: 2, nama: "Putri Maharani", foto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    nik: "3174072208980002", tempatLahir: "Jakarta", tanggalLahir: "1998-08-22", jenisKelamin: "P",
    agama: "Islam", pendidikan: "S1", pekerjaan: "Mahasiswa",
    alamat: "Jl. Senayan No. 5", provinsi: "DKI Jakarta", kabupaten: "Jakarta Selatan", kecamatan: "Kebayoran",
    email: "putri.maharani@email.com", hp: "081890123457", whatsapp: "081890123457",
    motivasi: "Sebagai mahasiswa, saya ingin menjadi agent of change di kampus.",
    status: "Diverifikasi", tanggalDaftar: "2025-01-08",
    dokumen: [
      { nama: "KTP", uploaded: true },
      { nama: "Pas Foto", uploaded: true },
      { nama: "CV", uploaded: true },
      { nama: "Surat Pernyataan", uploaded: true },
      { nama: "Surat Sehat", uploaded: true },
    ],
    persyaratan: [true, true, true, true, true, true],
    riwayat: [
      { tanggal: "2025-01-08 10:15", aksi: "Pendaftaran dikirim", oleh: "Calon Anggota" },
      { tanggal: "2025-01-09 09:30", aksi: "Verifikasi berkas dimulai", oleh: "Admin Kabupaten" },
    ],
  },
  {
    id: 3, nama: "Doni Pratama", foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    nik: "3578030503940003", tempatLahir: "Surabaya", tanggalLahir: "1994-03-05", jenisKelamin: "L",
    agama: "Kristen", pendidikan: "D3", pekerjaan: "Wiraswasta",
    alamat: "Jl. Pemuda No. 12", provinsi: "Jawa Timur", kabupaten: "Surabaya", kecamatan: "Gubeng",
    email: "doni.pratama@email.com", hp: "081901234568", whatsapp: "081901234568",
    motivasi: "Ingin membantu pencegahan narkoba di lingkungan tempat tinggal.",
    status: "Perbaikan", tanggalDaftar: "2025-01-05",
    dokumen: [
      { nama: "KTP", uploaded: true },
      { nama: "Pas Foto", uploaded: false },
      { nama: "CV", uploaded: true },
      { nama: "Surat Pernyataan", uploaded: false },
      { nama: "Surat Sehat", uploaded: false },
    ],
    persyaratan: [true, true, true, true, false, true],
    riwayat: [
      { tanggal: "2025-01-05 11:00", aksi: "Pendaftaran dikirim", oleh: "Calon Anggota" },
      { tanggal: "2025-01-07 14:20", aksi: "Diminta perbaikan dokumen", oleh: "Admin Kabupaten" },
    ],
  },
  {
    id: 4, nama: "Ratna Sari", foto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    nik: "5171024512970004", tempatLahir: "Denpasar", tanggalLahir: "1997-12-05", jenisKelamin: "P",
    agama: "Hindu", pendidikan: "S1", pekerjaan: "Pegawai Swasta",
    alamat: "Jl. Diponegoro No. 8", provinsi: "Bali", kabupaten: "Denpasar", kecamatan: "Denpasar Selatan",
    email: "ratna.sari@email.com", hp: "08101234569", whatsapp: "08101234569",
    motivasi: "Bergabung dengan komunitas yang peduli masa depan generasi muda Bali.",
    status: "Disetujui", tanggalDaftar: "2024-12-20",
    dokumen: [
      { nama: "KTP", uploaded: true },
      { nama: "Pas Foto", uploaded: true },
      { nama: "CV", uploaded: true },
      { nama: "Surat Pernyataan", uploaded: true },
      { nama: "Surat Sehat", uploaded: true },
    ],
    persyaratan: [true, true, true, true, true, true],
    riwayat: [
      { tanggal: "2024-12-20 09:00", aksi: "Pendaftaran dikirim", oleh: "Calon Anggota" },
      { tanggal: "2024-12-22 10:30", aksi: "Verifikasi berkas lengkap", oleh: "Admin Kabupaten" },
      { tanggal: "2024-12-25 14:00", aksi: "Disetujui, menunggu jadwal pelatihan", oleh: "Admin Kabupaten" },
    ],
  },
  {
    id: 5, nama: "Eko Wijaya", foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    nik: "3273014403890005", tempatLahir: "Cimahi", tanggalLahir: "1989-03-04", jenisKelamin: "L",
    agama: "Islam", pendidikan: "SMA", pekerjaan: "Buruh",
    alamat: "Jl. Baros No. 22", provinsi: "Jawa Barat", kabupaten: "Bandung Barat", kecamatan: "Ngamprah",
    email: "eko.wijaya@email.com", hp: "08112345670", whatsapp: "08112345670",
    motivasi: "Ingin berkontribusi untuk lingkungan yang lebih sehat.",
    status: "Ditolak", tanggalDaftar: "2024-12-15",
    dokumen: [
      { nama: "KTP", uploaded: true },
      { nama: "Pas Foto", uploaded: true },
      { nama: "CV", uploaded: false },
      { nama: "Surat Pernyataan", uploaded: true },
      { nama: "Surat Sehat", uploaded: false },
    ],
    persyaratan: [true, false, true, true, true, true],
    riwayat: [
      { tanggal: "2024-12-15 13:00", aksi: "Pendaftaran dikirim", oleh: "Calon Anggota" },
      { tanggal: "2024-12-17 11:00", aksi: "Verifikasi - umur melebihi batas (35 tahun)", oleh: "Admin Kabupaten" },
      { tanggal: "2024-12-18 09:00", aksi: "Pendaftaran ditolak", oleh: "Admin Kabupaten" },
    ],
  },
];

export const PENGURUS_LIST: Pengurus[] = [
  { id: 1, nama: "Drs. H. Sutrisno, M.Si", foto: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80", jabatan: "Ketua Umum Pusat", level: "Nasional", wilayah: "Indonesia", email: "ketum@kipan.id", hp: "081234500001", status: "Aktif", tanggalMulai: "2020-01-15", tanggalSelesai: "2027-01-15", nomorSK: "SK-001/KIPAN/PUSAT/2020", fileSK: "#", tempatLahir: "Jakarta", tanggalLahir: "1965-03-10", alamat: "Jl. Sudirman No. 1, Jakarta" },
  { id: 2, nama: "Dr. Siti Aminah, M.Kes", foto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80", jabatan: "Sekretaris Jenderal", level: "Nasional", wilayah: "Indonesia", email: "sekjen@kipan.id", hp: "081234500002", status: "Aktif", tanggalMulai: "2020-01-15", tanggalSelesai: "2027-01-15", nomorSK: "SK-002/KIPAN/PUSAT/2020", fileSK: "#", tempatLahir: "Surabaya", tanggalLahir: "1970-06-20", alamat: "Jl. Gatot Subroto No. 5, Jakarta" },
  { id: 3, nama: "Ir. Bambang Wijaya", foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80", jabatan: "Bendahara Umum", level: "Nasional", wilayah: "Indonesia", email: "bendahara@kipan.id", hp: "081234500003", status: "Aktif", tanggalMulai: "2020-01-15", tanggalSelesai: "2026-12-31", nomorSK: "SK-003/KIPAN/PUSAT/2020", fileSK: "#", tempatLahir: "Bandung", tanggalLahir: "1968-09-15", alamat: "Jl. Asia Afrika No. 20, Bandung" },
  { id: 4, nama: "Hendra Gunawan, S.Sos", foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80", jabatan: "Ketua KIPAN Provinsi Jawa Barat", level: "Provinsi", wilayah: "Jawa Barat", provinsiNama: "Jawa Barat", email: "jabar@kipan.id", hp: "081234500004", status: "Aktif", tanggalMulai: "2020-03-10", tanggalSelesai: "2027-03-10", nomorSK: "SK-004/KIPAN/JBR/2020", fileSK: "#", tempatLahir: "Bandung", tanggalLahir: "1980-04-12", alamat: "Jl. Diponegoro No. 15, Bandung" },
  { id: 5, nama: "Rina Marlina, S.Pd", foto: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80", jabatan: "Ketua KIPAN Provinsi DKI Jakarta", level: "Provinsi", wilayah: "DKI Jakarta", provinsiNama: "DKI Jakarta", email: "jakarta@kipan.id", hp: "081234500005", status: "Aktif", tanggalMulai: "2020-03-15", tanggalSelesai: "2026-08-15", nomorSK: "SK-005/KIPAN/DKI/2020", fileSK: "#", tempatLahir: "Jakarta", tanggalLahir: "1982-07-25", alamat: "Jl. Thamrin No. 8, Jakarta" },
  { id: 6, nama: "Agus Setiawan, S.E", foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80", jabatan: "Ketua KIPAN Provinsi Banten", level: "Provinsi", wilayah: "Banten", provinsiNama: "Banten", email: "banten@kipan.id", hp: "081234500008", status: "Nonaktif", tanggalMulai: "2020-05-01", tanggalSelesai: "2025-05-01", nomorSK: "SK-008/KIPAN/BT/2020", fileSK: "#", tempatLahir: "Serang", tanggalLahir: "1978-11-30", alamat: "Jl. Veteran No. 3, Serang" },
  { id: 7, nama: "Maya Sari, S.H", foto: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80", jabatan: "Ketua KIPAN Kab. Bandung Barat", level: "Kabupaten", wilayah: "Bandung Barat", provinsiNama: "Jawa Barat", kabupatenNama: "Bandung Barat", email: "bandungbarat@kipan.id", hp: "081234500006", status: "Aktif", tanggalMulai: "2020-05-20", tanggalSelesai: "2026-11-20", nomorSK: "SK-006/KIPAN/JBR/BB/2020", fileSK: "#", tempatLahir: "Bandung", tanggalLahir: "1985-02-14", alamat: "Jl. Karya Bakti No. 24, Padalarang" },
  { id: 8, nama: "Rizal Mahendra, S.T", foto: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80", jabatan: "Ketua KIPAN Kab. Bandung", level: "Kabupaten", wilayah: "Bandung", provinsiNama: "Jawa Barat", kabupatenNama: "Bandung", email: "bandung@kipan.id", hp: "081234500007", status: "Aktif", tanggalMulai: "2020-05-22", tanggalSelesai: "2026-05-22", nomorSK: "SK-007/KIPAN/JBR/BDG/2020", fileSK: "#", tempatLahir: "Cimahi", tanggalLahir: "1983-08-18", alamat: "Jl. Asia Afrika No. 88, Bandung" },
  { id: 9, nama: "Andi Wijaya", foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80", jabatan: "Ketua KIPAN Kab. Jakarta Pusat", level: "Kabupaten", wilayah: "Jakarta Pusat", provinsiNama: "DKI Jakarta", kabupatenNama: "Jakarta Pusat", email: "jakpus@kipan.id", hp: "081234500009", status: "Aktif", tanggalMulai: "2021-01-10", tanggalSelesai: "2026-01-10", nomorSK: "SK-009/KIPAN/DKI/JP/2021", fileSK: "#", tempatLahir: "Jakarta", tanggalLahir: "1986-05-03", alamat: "Jl. Medan Merdeka No. 2, Jakarta" },
  { id: 10, nama: "Diana Pratiwi, M.M", foto: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80", jabatan: "Ketua KIPAN Kab. Bogor", level: "Kabupaten", wilayah: "Bogor", provinsiNama: "Jawa Barat", kabupatenNama: "Bogor", email: "bogor@kipan.id", hp: "081234500010", status: "Dibekukan", tanggalMulai: "2021-02-15", tanggalSelesai: "2025-12-15", nomorSK: "SK-010/KIPAN/JBR/BGR/2021", fileSK: "#", tempatLahir: "Bogor", tanggalLahir: "1984-10-22", alamat: "Jl. Raya Bogor No. 15, Bogor" },
];

export const BERITA_ADMIN_LIST: Berita[] = [
  { id: 1, judul: "Rapat Koordinasi Nasional KIPAN 2026 di Jakarta", kategori: "Nasional", penulis: "Tim Media", tanggal: "2025-01-15", status: "Published", thumbnail: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=400&q=80", excerpt: "Pengurus pusat KIPAN menggelar rapat koordinasi nasional..." },
  { id: 2, judul: "Pelatihan Kader KIPAN Jawa Barat Angkatan XII", kategori: "Provinsi", penulis: "Hendra Gunawan", tanggal: "2025-01-08", status: "Published", thumbnail: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80", excerpt: "250 calon kader KIPAN Jawa Barat mengikuti pelatihan dasar..." },
  { id: 3, judul: "Sosialisasi Anti Narkoba di 50 Sekolah Bandung Barat", kategori: "Kabupaten", penulis: "Maya Sari", tanggal: "2025-01-05", status: "Published", thumbnail: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80", excerpt: "KIPAN Kab. Bandung Barat melaksanakan sosialisasi..." },
  { id: 4, judul: "Konser Amal Anti Narkoba di Yogyakarta", kategori: "Provinsi", penulis: "Tim Media", tanggal: "2024-12-20", status: "Published", thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80", excerpt: "Konser amal dengan menampilkan musisi lokal..." },
  { id: 5, judul: "Draft: Kerja Sama KIPAN dengan Kementerian Pemuda", kategori: "Nasional", penulis: "Sekretariat", tanggal: "2025-01-18", status: "Draft", thumbnail: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=400&q=80", excerpt: "Rencana kerja sama dengan Kementerian..." },
];

export const PROGRAM_KERJA_LIST: ProgramKerja[] = [
  { id: 1, nama: "Sosialisasi Anti Narkoba 50 Sekolah", tingkat: "Kabupaten", tanggalMulai: "2025-01-01", tanggalSelesai: "2025-03-31", status: "Berjalan", pic: "Maya Sari" },
  { id: 2, nama: "Pelatihan Kader Angkatan XII", tingkat: "Provinsi", tanggalMulai: "2025-01-08", tanggalSelesai: "2025-01-10", status: "Selesai", pic: "Hendra Gunawan" },
  { id: 3, nama: "Rapat Koordinasi Nasional 2026", tingkat: "Nasional", tanggalMulai: "2025-01-15", tanggalSelesai: "2025-01-16", status: "Selesai", pic: "Sutrisno" },
  { id: 4, nama: "Konser Amal Anti Narkoba Nasional", tingkat: "Nasional", tanggalMulai: "2025-03-01", tanggalSelesai: "2025-03-01", status: "Direncanakan", pic: "Tim Media" },
  { id: 5, nama: "Workshop Trainer (TOT)", tingkat: "Provinsi", tanggalMulai: "2025-02-15", tanggalSelesai: "2025-02-17", status: "Direncanakan", pic: "Hendra Gunawan" },
];

export const ROLE_LIST: Role[] = [
  { id: 1, nama: "Super Admin", deskripsi: "Akses penuh ke seluruh sistem dan konfigurasi", jumlahUser: 2, permissions: ["Semua hak akses"] },
  { id: 2, nama: "Admin Nasional", deskripsi: "Kelola data nasional, provinsi, dan laporan", jumlahUser: 5, permissions: ["Dashboard", "Wilayah", "Pengurus", "Anggota", "Berita", "Galeri", "Program", "Laporan", "Pengaturan (sebagian)"] },
  { id: 3, nama: "Admin Provinsi", deskripsi: "Kelola kabupaten di provinsinya (read-only wilayah)", jumlahUser: 38, permissions: ["Dashboard", "Pengurus (provinsi)", "Anggota (provinsi)", "Verifikasi", "Berita", "Galeri", "Program", "Laporan (provinsi)"] },
  { id: 4, nama: "Admin Kabupaten/Kota", deskripsi: "Verifikasi anggota dan kegiatan wilayah sendiri", jumlahUser: 514, permissions: ["Dashboard", "Pengurus (kabupaten)", "Anggota (kabupaten)", "Verifikasi", "Berita", "Galeri", "Program", "Laporan (kabupaten)"] },
];

// Statistik untuk Dashboard
export const DASHBOARD_STATS = {
  totalAnggota: 12580,
  anggotaBaru: 120,
  menungguVerifikasi: 45,
  totalPengurus: 540,
  totalProvinsi: 38,
  totalKabupaten: 514,
};

export const AKTIVITAS_TERBARU = [
  { id: 1, jenis: "pendaftaran", teks: "Indra Kusuma mendaftar sebagai calon anggota", waktu: "5 menit lalu", icon: "UserPlus" },
  { id: 2, jenis: "verifikasi", teks: "Putri Maharani diterima sebagai anggota", waktu: "1 jam lalu", icon: "CheckCircle" },
  { id: 3, jenis: "pengurus", teks: "Pengurus baru ditambahkan di Kab. Bogor", waktu: "3 jam lalu", icon: "UserCog" },
  { id: 4, jenis: "berita", teks: "Berita 'Rapat Koordinasi Nasional' dipublikasikan", waktu: "5 jam lalu", icon: "Newspaper" },
  { id: 5, jenis: "pelatihan", teks: "Pelatihan Kader Angkatan XII dimulai di Jawa Barat", waktu: "1 hari lalu", icon: "GraduationCap" },
  { id: 6, jenis: "kegiatan", teks: "Sosialisasi di SMKN 5 Bandung Barat", waktu: "1 hari lalu", icon: "School" },
];

export const STATISTIK_BULANAN = [
  { bulan: "Jul", anggotaBaru: 45 },
  { bulan: "Agu", anggotaBaru: 62 },
  { bulan: "Sep", anggotaBaru: 78 },
  { bulan: "Okt", anggotaBaru: 95 },
  { bulan: "Nov", anggotaBaru: 110 },
  { bulan: "Des", anggotaBaru: 120 },
  { bulan: "Jan", anggotaBaru: 85 },
];

export const STATUS_PENDAFTARAN_FLOW = [
  { status: "Draft", color: "bg-slate-100 text-slate-600", desc: "Calon anggota mengisi form" },
  { status: "Diajukan", color: "bg-amber-100 text-amber-700", desc: "Form dikirim, menunggu verifikasi" },
  { status: "Diverifikasi", color: "bg-blue-100 text-blue-700", desc: "Admin memverifikasi berkas" },
  { status: "Disetujui", color: "bg-emerald-100 text-emerald-700", desc: "Lolos, menunggu pelatihan" },
  { status: "Ditolak", color: "bg-rose-100 text-rose-700", desc: "Tidak memenuhi syarat" },
];
