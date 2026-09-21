// ============================================================
// KIPAN — Kader Inti Pemuda Anti Narkoba Indonesia
// Data Company Profile + Sistem Keanggotaan
// ============================================================

export const COMPANY = {
  name: "KIPAN",
  fullName: "Kader Inti Pemuda Anti Narkoba",
  tagline: "Pemuda Indonesia Bersih dari Narkoba",
  founder: "Pemerintah Republik Indonesia",
  establishedYear: 2020,
  establishedDate: "2020",
  establishedLocation: "Indonesia",
  currentAddress:
    "Sekretariat KIPAN Pusat, Jakarta, Indonesia",
  phone: "021-0000-0000",
  whatsapp: "6280000000000",
  email: "sekretariat@kipan.id",
  instagram: "@kipan.indonesia",
  instagramUrl: "https://instagram.com/kipan.indonesia",
  website: "kipan.id",
  websiteUrl: "https://kipan.id",
  partner: "BNN",
  partnerOrigin: "Badan Narkotika Nasional",
};

export const STATS = [
  { value: "38", label: "Provinsi" },
  { value: "514", label: "Kabupaten/Kota" },
  { value: "1.000+", label: "Pengurus" },
];

export const NAV_LINKS = [
  { label: "Beranda", href: "/" },
  { label: "Tentang", href: "/#tentang" },
  { label: "Struktur", href: "/#struktur" },
  { label: "Program", href: "/program" },
  { label: "Berita", href: "/berita" },
  { label: "Galeri", href: "/galeri" },
  { label: "Pengurus", href: "/#pengurus" },
  { label: "Daftar", href: "/pendaftaran" },
  { label: "Lacak", href: "/lacak-pendaftaran" },
  { label: "Cek Anggota", href: "/cek-anggota" },
  { label: "Kontak", href: "/kontak" },
];

// ============================================================
// HERO CONTENT
// ============================================================
export const HERO = {
  badge: "Bersama BNN • Gerakan Pemuda Anti Narkoba Indonesia",
  headlinePrefix: "Kader Inti Pemuda",
  headlineHighlight: "Anti Narkoba",
  subheadline:
    "Komunitas pemuda Indonesia yang berkomitmen mencegah penyalahgunaan narkoba, membentuk generasi muda yang bersih, sehat, dan peduli masa depan bangsa. Bergabunglah menjadi bagian dari gerakan nasional di 38 provinsi dan 514 kabupaten/kota.",
  backgroundImage:
    "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1920&q=80",
};

// ============================================================
// TENTANG KIPAN
// ============================================================
export const ABOUT = {
  image:
    "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80",
  paragraphs: [
    "KIPAN (Kader Inti Pemuda Anti Narkoba) adalah komunitas dan program pembinaan pemuda yang dibentuk untuk mencegah penyalahgunaan narkoba di Indonesia. KIPAN hadir sebagai penggerak utama pencegahan narkoba di lingkungan masyarakat dan mitra strategis pemerintah dalam memberikan edukasi bahaya narkotika kepada generasi muda.",
    "Organisasi ini tersebar di seluruh Indonesia dengan struktur berjenjang dari tingkat Nasional, Provinsi, Kabupaten/Kota, hingga Kecamatan. Dengan lebih dari 20.000 anggota aktif di 38 provinsi dan 514 kabupaten/kota, KIPAN menjadi kekuatan sosial yang nyata dalam membangun generasi muda yang bersih dan produktif.",
    "Bersama Badan Narkotika Nasional (BNN) dan stakeholder terkait, KIPAN menjalankan program-program edukasi, penyuluhan, dan pembinaan untuk menciptakan ekosistem preventif yang efektif. Setiap kader KIPAN adalah agen perubahan yang membawa pesan anti-narkoba ke pelosok negeri.",
  ],
  visi:
    "Menjadi pelopor dan kekuatan utama gerakan pencegahan narkoba di Indonesia yang mewujudkan generasi muda yang bersih, sehat, dan berkarakter.",
  misi: [
    "Mengedukasi masyarakat, khususnya generasi muda, tentang bahaya penyalahgunaan narkoba",
    "Membentuk kader pemuda yang kompeten sebagai agen pencegahan narkoba",
    "Membangun jaringan kerja sama dengan pemerintah, BNN, dan komunitas",
    "Menjalankan program-program preventif yang berdampak di seluruh wilayah Indonesia",
    "Mengembangkan ekosistem pendukung untuk pemulihan dan pemberdayaan korban narkoba",
  ],
  nilai: [
    { title: "Bersih", desc: "Bebas dari narkoba dan segala bentuk penyalahgunaan zat terlarang" },
    { title: "Peduli", desc: "Memperhatikan sesama dan lingkungan sekitar dari ancaman narkoba" },
    { title: "Berkarakter", desc: "Memiliki integritas, disiplin, dan tanggung jawab sebagai pemuda" },
    { title: "Bersatu", desc: "Bergotong royong dalam gerakan nasional pencegahan narkoba" },
  ],
  tujuan: [
    "Menjadi penggerak utama pencegahan narkoba di lingkungan masyarakat",
    "Menjadi mitra pemerintah dalam memberikan edukasi bahaya narkotika kepada generasi muda",
    "Membentuk pemuda yang bersih dan peduli terhadap masa depan bangsa yang sehat",
    "Membangun database keanggotaan nasional yang terintegrasi dari pusat hingga daerah",
  ],
};

// ============================================================
// STRUKTUR ORGANISASI (Hierarki)
// ============================================================
export const STRUKTUR_LEVELS = [
  {
    level: "Nasional",
    title: "Pengurus Pusat",
    desc: "Kepemimpinan nasional KIPAN Indonesia yang mengkoordinir seluruh kegiatan di 38 provinsi.",
    icon: "Landmark",
    color: "from-blue-600 to-blue-600",
    count: "1 Pusat",
  },
  {
    level: "Provinsi",
    title: "Pengurus Provinsi",
    desc: "Koordinator wilayah provinsi yang mengelola kabupaten/kota di bawahnya.",
    icon: "Map",
    color: "from-blue-600 to-cyan-600",
    count: "38 Provinsi",
  },
  {
    level: "Kabupaten/Kota",
    title: "Pengurus Kabupaten/Kota",
    desc: "Pelaksana utama program KIPAN di tingkat daerah, melakukan verifikasi & pembinaan pengurus.",
    icon: "Building2",
    color: "from-cyan-600 to-sky-600",
    count: "514 Kab/Kota",
  },
];

// ============================================================
// PROGRAM KIPAN
// ============================================================
export interface Program {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  icon: string;
  image: string;
}

export const PROGRAMS: Program[] = [
  {
    id: "penyuluhan",
    number: "01",
    title: "Penyuluhan Anti Narkoba",
    subtitle: "Edukasi langsung ke masyarakat",
    description:
      "Program penyuluhan langsung ke masyarakat, sekolah, komunitas, dan institusi tentang bahaya penyalahgunaan narkoba. Tim kader KIPAN melakukan kunjungan rutin dengan materi yang disesuaikan untuk berbagai kelompok usia dan latar belakang.",
    features: [
      "Penyuluhan sekolah SMP/SMA/SMK",
      "Penyuluhan komunitas & karang taruna",
      "Penyuluhan institusi & perusahaan",
      "Sosialisasi ibu-ibu PKK",
    ],
    icon: "Megaphone",
    image:
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "seminar",
    number: "02",
    title: "Seminar & Workshop",
    subtitle: "Diskusi mendalam dengan pakar",
    description:
      "Seminar dan workshop dengan menghadirkan pakar, mantan pengguna yang sembuh, dan aparat BNN. Memberikan pemahaman komprehensif tentang narkoba dari sisi medis, hukum, dan sosial.",
    features: [
      "Seminar nasional tahunan",
      "Seminar provinsi berkala",
      "Workshop kaderisasi pemuda",
      "Talkshow inspiratif",
    ],
    icon: "Presentation",
    image:
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "pelatihan",
    number: "03",
    title: "Pelatihan Kader",
    subtitle: "Pembentukan kader profesional",
    description:
      "Pelatihan wajib bagi calon anggota KIPAN sebelum diangkat menjadi anggota aktif. Materi meliputi pengetahuan narkoba, teknik penyuluhan, manajemen kegiatan, dan kepemimpinan pemuda.",
    features: [
      "Pelatihan dasar calon anggota",
      "Pelatihan lanjutan kader",
      "Pelatihan trainer (TOT)",
      "Sertifikasi kader KIPAN",
    ],
    icon: "GraduationCap",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "sosialisasi-sekolah",
    number: "04",
    title: "Sosialisasi Sekolah",
    subtitle: "Pencegahan dini di institusi pendidikan",
    description:
      "Program khusus sosialisasi sekolah dengan pendekatan interaktif dan atraktif untuk menjangkau pelajar. Pencegahan dini adalah kunci utama mengurangi pengguna narkoba di kalangan remaja.",
    features: [
      "Sosialisasi SMP/SMA/SMK",
      "Pembentukan klub anti narkoba",
      "Lomba kreativitas pelajar anti narkoba",
      "Konseling sebaya",
    ],
    icon: "School",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "kampanye",
    number: "05",
    title: "Kampanye Anti Narkoba",
    subtitle: "Gerakan massa & media",
    description:
      "Kampanye masif melalui media massa, media sosial, dan aksi jalanan untuk meningkatkan kesadaran publik. Menggunakan pendekatan kreatif dengan influencer, musisi, dan tokoh muda.",
    features: [
      "Kampanye media sosial nasional",
      "Aksi jalanan & car free day",
      "Konser amal anti narkoba",
      "Festival film pendek anti narkoba",
    ],
    icon: "Radio",
    image:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "pembinaan",
    number: "06",
    title: "Pembinaan Pengurus",
    subtitle: "Pengembangan kapasitas berkelanjutan",
    description:
      "Pembinaan rutin bagi pengurus KIPAN untuk terus mengembangkan kapasitas sebagai kader anti narkoba. Termasuk mentoring, kurikulum berkelanjutan, dan pengembangan karier di bidang pencegahan narkoba.",
    features: [
      "Mentoring bulanan",
      "Kurikulum pengembangan berkala",
      "Pertukaran antar wilayah",
      "Beasiswa pelatihan profesional",
    ],
    icon: "Users",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
  },
];

// ============================================================
// ALUR PENDAFTARAN ANGGOTA
// ============================================================
export const PENDAFTARAN_FLOW = [
  {
    step: 1,
    title: "Pendaftaran Online",
    desc: "Calon anggota mengisi form pendaftaran online dan upload dokumen persyaratan.",
    icon: "FileText",
    status: "Draft → Dikirim",
  },
  {
    step: 2,
    title: "Verifikasi Kabupaten",
    desc: "Admin kabupaten/kota memverifikasi berkas dan kelengkapan persyaratan.",
    icon: "ClipboardCheck",
    status: "Menunggu Verifikasi → Lolos Adm.",
  },
  {
    step: 3,
    title: "Pelatihan Kader",
    desc: "Mengikuti pelatihan wajib yang diselenggarakan pengurus kabupaten/kota.",
    icon: "GraduationCap",
    status: "Pelatihan",
  },
  {
    step: 4,
    title: "Penilaian & Kelulusan",
    desc: "Penilaian akhir pelatihan dan penetapan kelulusan calon pengurus.",
    icon: "Award",
    status: "Lulus",
  },
  {
    step: 5,
    title: "Pengangkatan Pengurus",
    desc: "Penetapan nomor induk pengurus, pembuatan kartu pengurus digital dengan QR Code, dan penempatan jabatan di bidang/divisi.",
    icon: "BadgeCheck",
    status: "Menjadi Pengurus",
  },
];

// ============================================================
// PERSYARATAN PENDAFTARAN
// ============================================================
export const PERSYARATAN = [
  {
    title: "Warga Negara Indonesia",
    desc: "Ber-KTP Indonesia dan domisili di wilayah tempat mendaftar",
    icon: "IdCard",
  },
  {
    title: "Usia 16-30 Tahun",
    desc: "Calon anggota berusia antara 16 hingga 30 tahun pada saat pendaftaran",
    icon: "Calendar",
  },
  {
    title: "Sehat Jasmani & Rohani",
    desc: "Bebas dari pengaruh narkoba dan tidak sedang dalam masa pemulihan",
    icon: "HeartPulse",
  },
  {
    title: "Bersedia Mengikuti Pelatihan",
    desc: "Wajib mengikuti seluruh rangkaian pelatihan kader KIPAN",
    icon: "GraduationCap",
  },
  {
    title: "Mematuhi AD/ART",
    desc: "Bersedia mematuhi Anggaran Dasar dan Rumah Tangga organisasi",
    icon: "ScrollText",
  },
  {
    title: "Menjadi Relawan Aktif",
    desc: "Bersedia menjadi relawan dalam program-program KIPAN",
    icon: "HandHeart",
  },
];

export const DOKUMEN_WAJIB = [
  { name: "KTP/SIM", required: true, desc: "Foto KTP atau SIM yang masih berlaku" },
  { name: "Pas Foto", required: true, desc: "Pas foto terbaru ukuran 3x4 background merah" },
  { name: "CV/Resume", required: true, desc: "Daftar riwayat hidup singkat" },
  { name: "Surat Pernyataan", required: true, desc: "Surat pernyataan bebas narkoba (template disediakan)" },
  { name: "Surat Sehat", required: false, desc: "Surat keterangan sehat dari puskesmas/rumah sakit" },
  { name: "Ijazah", required: false, desc: "Foto ijazah terakhir (opsional)" },
];

// ============================================================
// BERITA
// ============================================================
export interface Berita {
  id: number;
  title: string;
  category: "Nasional" | "Provinsi" | "Kabupaten";
  image: string;
  excerpt: string;
  date: string;
  location: string;
}

export const BERITA: Berita[] = [
  {
    id: 1,
    title: "Rapat Koordinasi Nasional KIPAN 2026 di Jakarta",
    category: "Nasional",
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80",
    excerpt:
      "Pengurus pusat KIPAN menggelar rapat koordinasi nasional dengan pengurus provinsi untuk menyusun program kerja 2026.",
    date: "15 Januari 2026",
    location: "Jakarta",
  },
  {
    id: 2,
    title: "Pelatihan Kader KIPAN Jawa Barat Angkatan XII",
    category: "Provinsi",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80",
    excerpt:
      "Sebanyak 250 calon kader KIPAN Jawa Barat mengikuti pelatihan dasar selama 3 hari di Bandung.",
    date: "8 Januari 2026",
    location: "Bandung, Jawa Barat",
  },
  {
    id: 3,
    title: "Sosialisasi Anti Narkoba di 50 Sekolah Bandung Barat",
    category: "Kabupaten",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
    excerpt:
      "KIPAN Kabupaten Bandung Barat melaksanakan sosialisasi anti narkoba di 50 sekolah menengah.",
    date: "5 Januari 2026",
    location: "Bandung Barat",
  },
  {
    id: 4,
    title: "Konser Amal Anti Narkoba di Yogyakarta",
    category: "Provinsi",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80",
    excerpt:
      "Konser amal dengan menampilkan musisi lokal untuk kampanye anti narkoba di kalangan anak muda.",
    date: "20 Desember 2025",
    location: "Yogyakarta",
  },
  {
    id: 5,
    title: "Wisuda Kader KIPAN Angkatan XI Sepanjang 2025",
    category: "Nasional",
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80",
    excerpt:
      "Lebih dari 5.000 kader baru KIPAN diwisuda secara serentak di seluruh Indonesia.",
    date: "28 Desember 2025",
    location: "Seluruh Indonesia",
  },
  {
    id: 6,
    title: "Kerja Sama KIPAN dengan BNN RI untuk Program Preventif",
    category: "Nasional",
    image:
      "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=900&q=80",
    excerpt:
      "Penandatanganan MoU antara KIPAN dan BNN RI untuk program pencegahan narkoba terintegrasi.",
    date: "10 Desember 2025",
    location: "Jakarta",
  },
];

// ============================================================
// GALERI
// ============================================================
export interface GalleryItem {
  id: number;
  title: string;
  category: "Kegiatan" | "Pelatihan" | "Sosialisasi" | "Rapat" | "Kampanye";
  image: string;
  location: string;
}

export const GALLERY_CATEGORIES = [
  "Semua",
  "Kegiatan",
  "Pelatihan",
  "Sosialisasi",
  "Rapat",
  "Kampanye",
] as const;

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    title: "Upacara Hari Anti Narkoba Internasional",
    category: "Kampanye",
    image:
      "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=900&q=80",
    location: "Jakarta",
  },
  {
    id: 2,
    title: "Pelatihan Kader Angkatan XII",
    category: "Pelatihan",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80",
    location: "Bandung",
  },
  {
    id: 3,
    title: "Sosialisasi Sekolah SMKN 5",
    category: "Sosialisasi",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
    location: "Bandung Barat",
  },
  {
    id: 4,
    title: "Rapat Koordinasi Nasional",
    category: "Rapat",
    image:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80",
    location: "Jakarta",
  },
  {
    id: 5,
    title: "Aksi Kampanye Car Free Day",
    category: "Kampanye",
    image:
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80",
    location: "Surabaya",
  },
  {
    id: 6,
    title: "Workshop Penyuluhan Komunitas",
    category: "Kegiatan",
    image:
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=900&q=80",
    location: "Yogyakarta",
  },
  {
    id: 7,
    title: "Wisuda Kader Baru",
    category: "Kegiatan",
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80",
    location: "Bali",
  },
  {
    id: 8,
    title: "Penyuluhan Karang Taruna",
    category: "Sosialisasi",
    image:
      "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=900&q=80",
    location: "Bogor",
  },
  {
    id: 9,
    title: "Seminar Nasional Pemuda Anti Narkoba",
    category: "Kegiatan",
    image:
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=900&q=80",
    location: "Jakarta",
  },
  {
    id: 10,
    title: "Pelatihan Trainer (TOT) KIPAN",
    category: "Pelatihan",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80",
    location: "Bandung",
  },
  {
    id: 11,
    title: "Rapat Pengurus Provinsi Jawa Barat",
    category: "Rapat",
    image:
      "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=900&q=80",
    location: "Bandung",
  },
  {
    id: 12,
    title: "Konser Amal Anti Narkoba",
    category: "Kampanye",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80",
    location: "Yogyakarta",
  },
];

// ============================================================
// PENGURUS (Showcase dengan filter level)
// ============================================================
export interface Pengurus {
  id: number;
  name: string;
  role: string;
  level: "Nasional" | "Provinsi" | "Kabupaten";
  wilayah: string;
  photo: string;
  kontak: string;
}

export const PENGURUS: Pengurus[] = [
  {
    id: 1,
    name: "Drs. H. Sutrisno, M.Si",
    role: "Ketua Umum Pusat",
    level: "Nasional",
    wilayah: "Indonesia",
    photo:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
    kontak: "ketum@kipan.id",
  },
  {
    id: 2,
    name: "Dr. Siti Aminah, M.Kes",
    role: "Sekretaris Jenderal",
    level: "Nasional",
    wilayah: "Indonesia",
    photo:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    kontak: "sekjen@kipan.id",
  },
  {
    id: 3,
    name: "Ir. Bambang Wijaya",
    role: "Bendahara Umum",
    level: "Nasional",
    wilayah: "Indonesia",
    photo:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    kontak: "bendahara@kipan.id",
  },
  {
    id: 4,
    name: "Hendra Gunawan, S.Sos",
    role: "Ketua KIPAN Provinsi Jawa Barat",
    level: "Provinsi",
    wilayah: "Jawa Barat",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    kontak: "jabar@kipan.id",
  },
  {
    id: 5,
    name: "Rina Marlina, S.Pd",
    role: "Ketua KIPAN Provinsi DKI Jakarta",
    level: "Provinsi",
    wilayah: "DKI Jakarta",
    photo:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    kontak: "jakarta@kipan.id",
  },
  {
    id: 6,
    name: "Agus Setiawan, S.E",
    role: "Ketua KIPAN Provinsi Banten",
    level: "Provinsi",
    wilayah: "Banten",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    kontak: "banten@kipan.id",
  },
  {
    id: 7,
    name: "Maya Sari, S.H",
    role: "Ketua KIPAN Kab. Bandung Barat",
    level: "Kabupaten",
    wilayah: "Bandung Barat",
    photo:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    kontak: "bandungbarat@kipan.id",
  },
  {
    id: 8,
    name: "Rizal Mahendra, S.T",
    role: "Ketua KIPAN Kab. Bandung",
    level: "Kabupaten",
    wilayah: "Bandung",
    photo:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
    kontak: "bandung@kipan.id",
  },
  {
    id: 9,
    name: "Diana Pratiwi, M.M",
    role: "Ketua KIPAN Kota Bogor",
    level: "Kabupaten",
    wilayah: "Kota Bogor",
    photo:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80",
    kontak: "bogor@kipan.id",
  },
];

// ============================================================
// TESTIMONI / KATA ANGGOTA
// ============================================================
export interface Testimonial {
  id: number;
  clientName: string;
  clientRole: string;
  clientPhoto: string;
  projectTitle: string;
  projectLocation: string;
  projectType: string;
  projectImage: string;
  rating: number;
  testimonial: string;
  completionYear: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    clientName: "Ahmad Fauzi",
    clientRole: "Pengurus KIPAN Jawa Barat",
    clientPhoto:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    projectTitle: "Program Sosialisasi 50 Sekolah",
    projectLocation: "Bandung Barat",
    projectType: "Sosialisasi",
    projectImage:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
    rating: 5,
    testimonial:
      "Bergabung dengan KIPAN mengubah hidup saya. Saya bisa menjadi agen perubahan di komunitas saya, menyelamatkan teman-teman saya dari jerat narkoba. Pelatihan kader sangat berkualitas dan sistem keanggotaan yang terstruktur membuat saya merasa bagian dari gerakan nasional yang nyata.",
    completionYear: "2024",
  },
  {
    id: 2,
    clientName: "Siti Nurhaliza",
    clientRole: "Pengurus KIPAN Kab. Bandung Barat",
    clientPhoto:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    projectTitle: "Verifikasi 200 Calon Pengurus",
    projectLocation: "Bandung Barat",
    projectType: "Verifikasi",
    projectImage:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80",
    rating: 5,
    testimonial:
      "Sebagai pengurus kabupaten, sistem informasi keanggotaan KIPAN sangat membantu pekerjaan saya. Verifikasi calon anggota jadi lebih cepat, pelatihan terjadwal dengan baik, dan kartu anggota digital yang langsung tergenerate. Sistem ini benar-benar modern.",
    completionYear: "2024",
  },
  {
    id: 3,
    clientName: "Budi Santoso",
    clientRole: "Kepala Sekolah SMKN 5",
    clientPhoto:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    projectTitle: "Kerja Sama Sosialisasi Sekolah",
    projectLocation: "Bandung Barat",
    projectType: "Sosialisasi",
    projectImage:
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=900&q=80",
    rating: 5,
    testimonial:
      "KIPAN adalah mitra terbaik untuk sosialisasi anti narkoba di sekolah. Materinya relevan, penyampainya atraktif, dan siswa-siswa saya benar-benar teredukasi. Sejak kerja sama dengan KIPAN, kasus penyalahgunaan di sekolah kami menurun drastis. Terima kasih KIPAN!",
    completionYear: "2024",
  },
  {
    id: 4,
    clientName: "Dewi Lestari",
    clientRole: "Pengurus KIPAN DKI Jakarta",
    clientPhoto:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    projectTitle: "Konser Amal Anti Narkoba",
    projectLocation: "Jakarta",
    projectType: "Kampanye",
    projectImage:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80",
    rating: 5,
    testimonial:
      "Menjadi relawan di konser amal KIPAN adalah pengalaman luar biasa. Ribuan anak muda datang dan teredukasi tentang bahaya narkoba dengan cara yang fun. KIPAN berhasil membuat kampanye anti narkoba jadi keren dan tidak membosankan. Bangga jadi bagian dari gerakan ini!",
    completionYear: "2024",
  },
];

export const TESTIMONIAL_STATS = [
  { value: "98%", label: "Pengurus Aktif", icon: "Users" },
  { value: "1.000+", label: "Pengurus Nasional", icon: "Award" },
  { value: "38", label: "Provinsi Tersebar", icon: "MapPin" },
];
