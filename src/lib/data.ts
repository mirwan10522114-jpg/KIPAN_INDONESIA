// ============================================================
// Dunia Pool & Pond — Company Data
// ============================================================

export const COMPANY = {
  name: "Dunia Pool & Pond",
  founder: "Agus Setiawan",
  establishedYear: 1997,
  establishedDate: "10 Agustus 1997",
  establishedLocation: "Cisarua, Kab. Bandung Barat",
  currentAddress:
    "Gg. Karya Bakti No. 24, RT.05/RW.22, Kertamulya, Kec. Padalarang, Kab. Bandung Barat, Jawa Barat 40553",
  phone: "0821-1807-5560",
  whatsapp: "6282118075560",
  email: "duniapoolandpond@gmail.com",
  instagram: "@duniapoolnpond",
  instagramUrl: "https://instagram.com/duniapoolnpond",
  website: "duniapoolnpond.co.id",
  websiteUrl: "https://duniapoolnpond.co.id",
  partner: "Astral Pool S.A.",
  partnerOrigin: "Barcelona, Spanyol",
  yearsExperience: 25,
  projectsCompleted: 1000,
  provincesServed: 34,
};

export const STATS = [
  { value: "25+", label: "Tahun Pengalaman" },
  { value: "1.000+", label: "Proyek Selesai" },
  { value: "34", label: "Provinsi Dilayani" },
  { value: "Astral Pool", label: "Mitra Internasional" },
];

export const NAV_LINKS = [
  { label: "Beranda", href: "#beranda" },
  { label: "Tentang", href: "#tentang" },
  { label: "Pimpinan", href: "#pimpinan" },
  { label: "Layanan", href: "#layanan" },
  { label: "Target Pasar", href: "#target-pasar" },
  { label: "Galeri", href: "#galeri" },
  { label: "Produk", href: "#produk" },
  { label: "Testimoni", href: "#testimoni" },
  { label: "Kontak", href: "#kontak" },
];

// ============================================================
// SERVICES — 4 Pilar Layanan
// ============================================================

export interface Service {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  icon: string; // lucide icon name
  image: string;
}

export const SERVICES: Service[] = [
  {
    id: "construction",
    number: "01",
    title: "Construction & Renovation",
    subtitle: "Pembangunan Kolam & Renovasi Struktur",
    description:
      "Kami merancang dan membangun kolam renang untuk berbagai skala dan fungsi: hunian pribadi, villa, hotel, resort, perumahan, sekolah, dan fasilitas umum. Untuk properti existing, kami menangani renovasi menyeluruh — mulai dari perbaikan struktur bocor, pembaruan lapisan finishing, hingga redesain estetika total yang mengangkat nilai properti Anda.",
    features: [
      "Kolam hunian pribadi & villa",
      "Hotel, resort & fasilitas umum",
      "Renovasi struktur bocor",
      "Pembaruan finishing & redesain estetika",
    ],
    icon: "HardHat",
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "maintenance",
    number: "02",
    title: "Maintenance & Water Treatment",
    subtitle: "Perawatan Berkala & Pengolahan Kualitas Air",
    description:
      "Kolam yang baik bukan hanya dibangun sekali, tetapi dijaga seumur hidup. Program perawatan berkala kami memastikan kualitas air selalu memenuhi standar kesehatan dan kenyamanan, struktur kolam terbebas dari kerusakan dini, dan seluruh sistem beroperasi optimal — sehingga kolam Anda selalu siap digunakan kapan pun dibutuhkan.",
    features: [
      "Perawatan berkala terjadwal",
      "Pengolahan kualitas air (water treatment)",
      "Pengaturan bahan kimia kolam",
      "Pencegahan kerusakan dini",
    ],
    icon: "Droplets",
    image:
      "https://images.unsplash.com/photo-1601823984263-b87b59798b70?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "system",
    number: "03",
    title: "System Engineering",
    subtitle: "Instalasi, Perbaikan & Optimasi Sistem Sirkulasi",
    description:
      "Keahlian inti kami. Kami merancang, menginstalasi, dan melakukan troubleshooting sistem sirkulasi kolam — termasuk pompa, pipa, dan kontrol aliran air — baik untuk proyek baru maupun optimasi sistem yang sudah ada. Sebuah sistem yang direkayasa dengan benar adalah investasi penghematan biaya yang terasa setiap bulan.",
    features: [
      "Desain sistem sirkulasi kustom",
      "Instalasi pompa, pipa & kontrol aliran",
      "Troubleshooting & perbaikan sistem",
      "Optimasi efisiensi energi",
    ],
    icon: "Settings2",
    image:
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "retail",
    number: "04",
    title: "Retail & Equipment Servicing",
    subtitle: "Penjualan Perlengkapan & Servis Peralatan",
    description:
      "Kami menyediakan kebutuhan lengkap perlengkapan kolam — pompa, filter, bahan kimia treatment, dan aksesoris pendukung — dengan kualitas yang terstandarisasi. Selain itu, tim teknisi kami siap memberikan layanan servis dan perbaikan peralatan teknis kolam Anda, memastikan tidak ada downtime yang mengganggu operasional.",
    features: [
      "Pompa, filter & lampu bawah air",
      "Bahan kimia treatment & aksesoris",
      "Servis peralatan teknis",
      "Spare part berkualitas terstandarisasi",
    ],
    icon: "Wrench",
    image:
      "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80",
  },
];

// ============================================================
// TARGET MARKET — 4 Segmen
// ============================================================

export interface TargetSegment {
  id: string;
  title: string;
  description: string;
  tags: string[];
  icon: string;
  image: string;
}

export const TARGET_SEGMENTS: TargetSegment[] = [
  {
    id: "rumah-villa",
    title: "Pemilik Rumah & Villa",
    description:
      "Kolam renang adalah investasi properti jangka panjang, bukan sekadar fasilitas estetika. Setiap detail konstruksi dan sistem yang kami bangun dirancang untuk bertahan puluhan tahun — menjadikan kolam Anda sebagai oase impian yang terus menambah nilai hunian.",
    tags: ["Estetika Premium", "Tahan Lama", "Nilai Investasi"],
    icon: "Home",
    image:
      "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "hotel-resort",
    title: "Hotel & Resort",
    description:
      "Keandalan operasional adalah segalanya: kolam yang sering rusak atau memerlukan penutupan adalah kerugian langsung. Sistem sirkulasi presisi kami memastikan efisiensi energi dan kualitas air yang konsisten — menekan biaya operasional sambil menjaga standar kenyamanan tamu.",
    tags: ["Operasional 24/7", "Efisiensi Energi", "Standar Bintang Lima"],
    icon: "Building2",
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "sekolah-instansi",
    title: "Sekolah & Instansi Pemerintah",
    description:
      "Tuntutan keamanan, kepatuhan standar teknis, dan proses pengadaan yang transparan adalah prioritas. Pengalaman kami dalam proyek tender institusional menjadikan kami mitra yang memahami prosedur birokratis tanpa mengorbankan kualitas hasil.",
    tags: ["Keamanan Tinggi", "Proses Tender", "Transparan"],
    icon: "Landmark",
    image:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "developer",
    title: "Developer Properti",
    description:
      "Konsistensi kualitas pada skala multi-unit dan kecepatan pengerjaan adalah kunci. Rekam jejak 1.000+ proyek kami adalah jaminan bahwa timeline dan spesifikasi terpenuhi di setiap unit — menjadikan kerja sama jangka panjang lebih efisien.",
    tags: ["Multi-Unit", "Tepat Waktu", "Konsistensi"],
    icon: "Building",
    image:
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80",
  },
];

// ============================================================
// GALLERY — Project Photos
// ============================================================

export interface GalleryItem {
  id: number;
  title: string;
  category: "Konstruksi" | "Renovasi" | "Perawatan" | "Komersial" | "Hunian";
  image: string;
  location: string;
}

export const GALLERY_CATEGORIES = [
  "Semua",
  "Konstruksi",
  "Renovasi",
  "Komersial",
  "Hunian",
  "Perawatan",
] as const;

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 1,
    title: "Kolam Renang Villa Bukit",
    category: "Hunian",
    image:
      "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=900&q=80",
    location: "Lembang, Bandung",
  },
  {
    id: 2,
    title: "Infinity Pool Resort",
    category: "Komersial",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
    location: "Bali",
  },
  {
    id: 3,
    title: "Kolam Renang Modern",
    category: "Konstruksi",
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80",
    location: "Bandung",
  },
  {
    id: 4,
    title: "Renovasi Kolam Hotel",
    category: "Renovasi",
    image:
      "https://images.unsplash.com/photo-1568625365131-079e026a927d?auto=format&fit=crop&w=900&q=80",
    location: "Jakarta",
  },
  {
    id: 5,
    title: "Kolam Tropis Pribadi",
    category: "Hunian",
    image:
      "https://images.unsplash.com/photo-1565711561500-49678a10a63f?auto=format&fit=crop&w=900&q=80",
    location: "Bogor",
  },
  {
    id: 6,
    title: "Pool Deck Resort",
    category: "Komersial",
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=900&q=80",
    location: "Yogyakarta",
  },
  {
    id: 7,
    title: "Kolam Renang Sekolah",
    category: "Konstruksi",
    image:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80",
    location: "Bandung Barat",
  },
  {
    id: 8,
    title: "Kolam Minimalis Hunian",
    category: "Hunian",
    image:
      "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=900&q=80",
    location: "Jakarta Selatan",
  },
  {
    id: 9,
    title: "Renovasi Kolam Villa",
    category: "Renovasi",
    image:
      "https://images.unsplash.com/photo-1606768666853-403c90a981ad?auto=format&fit=crop&w=900&q=80",
    location: "Cisarua",
  },
  {
    id: 10,
    title: "Perawatan Berkala Kolam",
    category: "Perawatan",
    image:
      "https://images.unsplash.com/photo-1601823984263-b87b59798b70?auto=format&fit=crop&w=900&q=80",
    location: "Bandung",
  },
  {
    id: 11,
    title: "Kolam Hotel Bintang Lima",
    category: "Komersial",
    image:
      "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=900&q=80",
    location: "Surabaya",
  },
  {
    id: 12,
    title: "Kolam Renang Keluarga",
    category: "Hunian",
    image:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=80",
    location: "Depok",
  },
];

// ============================================================
// LEADER MESSAGE
// ============================================================

export const LEADER = {
  name: "Agus Setiawan",
  role: "Founder & Direktur Utama",
  photo:
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=80",
  signature: "Agus Setiawan",
  message:
    "Saya memulai Dunia Pool & Pond pada tahun 1997 dengan satu tekad sederhana: menghadirkan kolam renang yang benar-benar berkualitas di tengah pasar yang saat itu masih minim standar. Lebih dari 25 tahun kemudian, tekad itu tidak pernah berubah — hanya saja sekarang kami melayani seluruh Indonesia, dari Sabang sampai Merauke. Bagi kami, kolam renang bukan sekadar struktur beton dan air. Ia adalah investasi jangka panjang, oase keluarga, dan cerminan standar kualitas sebuah properti. Itulah sebabnya setiap proyek — sekecil apa pun — kami treat dengan keahlian engineering yang sama, mulai dari desain sistem sirkulasi hingga layanan purna jual. Kemitraan kami dengan Astral Pool S.A. Spanyol adalah jembatan untuk membawa standar internasional langsung ke setiap pekerjaan kami. Terima kasih kepada lebih dari 1.000 klien yang telah mempercayakan kolam impian mereka kepada kami. Ini baru permulaan.",
  highlights: [
    "Lebih dari 25 tahun pengalaman industri",
    "1.000+ proyek di 34 provinsi",
    "Mitra resmi Astral Pool S.A. Spanyol",
  ],
};

// ============================================================
// TESTIMONIALS — Klien & Proyek Mereka
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
    clientName: "Budi Hartono",
    clientRole: "Pemilik Villa",
    clientPhoto:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    projectTitle: "Villa Lembang dengan Infinity Pool",
    projectLocation: "Lembang, Bandung",
    projectType: "Kolam Hunian",
    projectImage:
      "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=900&q=80",
    rating: 5,
    testimonial:
      "Tim Dunia Pool & Pond mengubah villa saya menjadi destinasi liburan keluarga impian. Sistem sirkulasinya sangat efisien — biaya listrik dan perawatan jauh lebih rendah dari ekspektasi. Yang paling saya hargai adalah konsultasi desain sirkulasi yang gratis di awal; ternyata benar-benar membuat perbedaan besar dalam jangka panjang. Setelah 3 tahun, kolam masih sebersih hari pertama.",
    completionYear: "2022",
  },
  {
    id: 2,
    clientName: "Siti Rahmawati",
    clientRole: "General Manager, Grand Resort Bali",
    clientPhoto:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    projectTitle: "Pool Resort Bintang Lima",
    projectLocation: "Ubud, Bali",
    projectType: "Komersial",
    projectImage:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
    rating: 5,
    testimonial:
      "Sebagai resort bintang lima, kami tidak bisa kompromi pada kualitas. Dunia Pool & Pond memahami betul standar operasional 24/7 yang kami butuhkan. Sistem sirkulasi presisi yang mereka rancang menekan biaya energi hampir 30% dibanding kolam lama kami. Tamu selalu memuji kejernihan air. Pekerjaan mereka benar-benar berkelas internasional.",
    completionYear: "2023",
  },
  {
    id: 3,
    clientName: "Ir. Hendra Wijaya, MT",
    clientRole: "Kepala Sekolah SMKN 5",
    clientPhoto:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    projectTitle: "Kolam Renang Sekolah Standar Kompetisi",
    projectLocation: "Bandung Barat",
    projectType: "Institusi",
    projectImage:
      "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80",
    rating: 5,
    testimonial:
      "Proyek tender sekolah ini menuntut transparansi penuh dan kepatuhan standar teknis. Dunia Pool & Pond melalui seluruh proses dengan sangat profesional — dokumen lengkap, timeline tepat, dan hasil melampaui spesifikasi. Kolam kami kini digunakan untuk latihan renang kompetisi tingkat provinsi. Investasi yang sangat berharga bagi siswa-siswi kami.",
    completionYear: "2021",
  },
  {
    id: 4,
    clientName: "Diana Pratiwi",
    clientRole: "Marketing Director, Permata Property",
    clientPhoto:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    projectTitle: "Cluster Pool Perumahan Permata Residen",
    projectLocation: "Depok, Jawa Barat",
    projectType: "Developer",
    projectImage:
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=900&q=80",
    rating: 5,
    testimonial:
      "Sebagai developer multi-unit, konsistensi kualitas adalah segalanya. Dunia Pool & Pond menyelesaikan 12 unit kolam dalam satu cluster kami dengan timeline yang sangat ketat — semua tepat waktu dengan spesifikasi identik. Reaksinya pembeli luar biasa: cluster kami sold out dalam 3 bulan. Kami sudah menjadwalkan kerja sama jangka panjang untuk project berikutnya.",
    completionYear: "2023",
  },
  {
    id: 5,
    clientName: "Rizal Mahendra",
    clientRole: "Owner, The Peak Villa",
    clientPhoto:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    projectTitle: "Renovasi Total Kolam Villa",
    projectLocation: "Cisarua, Bandung Barat",
    projectType: "Renovasi",
    projectImage:
      "https://images.unsplash.com/photo-1568625365131-079e026a927d?auto=format&fit=crop&w=900&q=80",
    rating: 5,
    testimonial:
      "Kolam villa saya sebelumnya bocor dan sistem sirkulasi kacau. Sudah 2 kontraktor sebelumnya gagal memperbaiki. Dunia Pool & Pond datang, diagnosa akar masalah dengan teliti, dan melakukan renovasi total dalam 6 minggu. Hasilnya? Kolam seperti baru kembali — bahkan lebih baik dari kondisi awal. Profesionalitas mereka luar biasa.",
    completionYear: "2022",
  },
  {
    id: 6,
    clientName: "Maya Anggraini",
    clientRole: "Hotel Operations Manager",
    clientPhoto:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    projectTitle: "Rooftop Pool Hotel Bintang Lima",
    projectLocation: "Surabaya",
    projectType: "Komersial",
    projectImage:
      "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?auto=format&fit=crop&w=900&q=80",
    rating: 5,
    testimonial:
      "Membangun kolam di rooftop dengan keterbatasan struktur bukan pekerjaan mudah, tapi tim Dunia Pool & Pond menyelesaikannya dengan brilian. Desain sistem sirkulasi mereka membuat kolam tetap bersih dengan maintenance minimal. Tamu kami memberikan rating 4.9/5 untuk fasilitas pool. Investasi yang mengangkat reputasi hotel kami.",
    completionYear: "2023",
  },
];

export const TESTIMONIAL_STATS = [
  { value: "98%", label: "Klien Kembali / Refer", icon: "RefreshCw" },
  { value: "4.9/5", label: "Rata-rata Kepuasan", icon: "Star" },
  { value: "1.000+", label: "Klien Terlayani", icon: "Users" },
  { value: "34", label: "Provinsi Tersebar", icon: "MapPin" },
];
