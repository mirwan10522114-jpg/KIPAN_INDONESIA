import type { ProductItem } from "@/lib/content-store";

// ============================================================
// DEFAULT PRODUCTS — 20 kategori perlengkapan kolam renang
// ============================================================

const IMG = {
  pump: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=900&q=80",
  filter: "https://images.unsplash.com/photo-1565711561500-49678a10a63f?auto=format&fit=crop&w=900&q=80",
  media: "https://images.unsplash.com/photo-1582735689369-4fe9db3a9ac9?auto=format&fit=crop&w=900&q=80",
  led: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?auto=format&fit=crop&w=900&q=80",
  ladder: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=900&q=80",
  vacuum: "https://images.unsplash.com/photo-1582719508461-5c4c2c3e3d3a?auto=format&fit=crop&w=900&q=80",
  hose: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=900&q=80",
  leafRake: "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=900&q=80",
  pole: "https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&w=900&q=80",
  testKit: "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=900&q=80",
  chlorinator: "https://images.unsplash.com/photo-1565711561500-49678a10a63f?auto=format&fit=crop&w=900&q=80",
  cleaner: "https://images.unsplash.com/photo-1572177815024-5c8e8e8e8e8e?auto=format&fit=crop&w=900&q=80",
  heatPump: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=900&q=80",
  waterFeature: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=80",
  inlet: "https://images.unsplash.com/photo-1582719508461-5c4c2c3e3d3a?auto=format&fit=crop&w=900&q=80",
  skimmer: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=900&q=80",
  grating: "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=900&q=80",
  return: "https://images.unsplash.com/photo-1582719508461-5c4c2c3e3d3a?auto=format&fit=crop&w=900&q=80",
  chemical: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=900&q=80",
  accessories: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=80",
};

export const PRODUCTS: ProductItem[] = [
  {
    id: 1,
    name: "Pompa Kolam Renang",
    shortDesc: "Pompa sirkulasi untuk menjaga kualitas air tetap jernih.",
    longDesc:
      "Pompa kolam renang adalah jantung dari sistem sirkulasi — bertugas mengalirkan air dari kolam melalui sistem filterasi lalu mengembalikannya dalam kondisi bersih. Kami menyediakan beragam merek ternama dengan kapasitas mulai dari 0.5 HP hingga 3 HP, cocok untuk kolam hunian hingga kolam komersial berskala besar. Setiap unit dipilih berdasarkan standar efisiensi energi, keandalan operasional 24/7, dan ketersediaan spare part.",
    image: IMG.pump,
    category: "Sirkulasi",
    brands: ["Hayward", "Emaux", "Pentair", "AstralPool", "Kripsol"],
    specs: [
      { label: "Kapasitas", options: ["0.5 HP", "0.75 HP", "1 HP", "1.5 HP", "2 HP", "3 HP"] },
    ],
  },
  {
    id: 2,
    name: "Sand Filter",
    shortDesc: "Filter pasir silica untuk menyaring kotoran pada air kolam.",
    longDesc:
      "Sand filter adalah komponen utama sistem filterasi kolam renang yang bekerja dengan menahan partikel kotoran pada lapisan media pasir silika. Tersedia dalam berbagai ukuran mulai 16\" hingga 32\", dengan material fiberglass atau polyethylene yang tahan korosi dan bertahan puluhan tahun. Pilihan ukuran tergantung volume kolam dan laju sirkulasi yang dibutuhkan.",
    image: IMG.filter,
    category: "Sirkulasi",
    specs: [
      { label: "Ukuran", options: ['16"', '19"', '21"', '24"', '28"', '32"'] },
      { label: "Material", options: ["Fiberglass", "Polyethylene"] },
    ],
  },
  {
    id: 3,
    name: "Media Filter",
    shortDesc: "Beragam media filterasi: pasir silika, gravel, zeolite, glass media.",
    longDesc:
      "Media filter adalah material yang mengisi sand filter dan berperan penting dalam kualitas filterasi air. Pasir silika menjadi standar industri dengan efektivitas tinggi. Gravel berfungsi sebagai lapisan dasar pendukung drainase. Zeolite menawarkan kemampuan filterasi yang lebih halus dan anti-amonia. Glass media adalah pilihan premium dengan daya tahan dan efisiensi filterasi terbaik serta ramah lingkungan.",
    image: IMG.media,
    category: "Sirkulasi",
    specs: [
      { label: "Jenis Media", options: ["Pasir Silika", "Gravel", "Zeolite", "Glass Media"] },
    ],
  },
  {
    id: 4,
    name: "Lampu Kolam LED",
    shortDesc: "Lampu bawah air LED hemat energi dengan pilihan warna.",
    longDesc:
      "Lampu kolam LED modern menghadirkan efisiensi energi tinggi dengan umur pemakaian hingga 50.000 jam. Tersedia dalam berbagai pilihan warna — Warm White untuk nuansa klasik, Cool White untuk kesan modern, dan RGB Color Changing untuk efek dinamis. Tersedia beragam watt mulai 12W hingga 35W untuk kolam dengan kedalaman dan ukuran berbeda. Lengkap dengan housing tahan air IP68.",
    image: IMG.led,
    category: "Pencahayaan",
    specs: [
      { label: "Warna", options: ["Warm White", "Cool White", "RGB Color Changing"] },
      { label: "Power", options: ["12 Watt", "18 Watt", "24 Watt", "35 Watt"] },
    ],
  },
  {
    id: 5,
    name: "Tangga Kolam Stainless",
    shortDesc: "Tangga stainless SUS304 & SUS316 anti karat.",
    longDesc:
      "Tangga kolam stainless berkualitas tinggi dengan material SUS304 untuk kolam standar dan SUS316 untuk kolam dengan kandungan garam atau kimia tinggi (saltwater pool). Desain ergonomis dengan finishing halus anti-slip, tahan karat bertahun-tahun, dan mudah dibersihkan. Tersedia mulai 2 step untuk kolam dangkal hingga 5 step untuk kolam dalam.",
    image: IMG.ladder,
    category: "Aksesoris",
    specs: [
      { label: "Material", options: ["SUS304", "SUS316"] },
      { label: "Model", options: ["2 Step", "3 Step", "4 Step", "5 Step"] },
    ],
  },
  {
    id: 6,
    name: "Vacuum Head",
    shortDesc: "Kepala vacuum pembersih dasar kolam.",
    longDesc:
      "Vacuum head adalah alat pembersih dasar kolam yang dihubungkan dengan telescopic pole dan vacuum hose. Flexible Vacuum cocok untuk lantai kolam dengan kontur melengkung. Weighted Vacuum tetap stabil di dasar kolam berkat bobot yang seimbang. Vacuum Brush ideal untuk kolam dengan lantai vinyl atau liner yang sensitif. Semua model didesain untuk pembersihan menyeluruh tanpa merusak lantai kolam.",
    image: IMG.vacuum,
    category: "Pembersih",
    specs: [
      { label: "Jenis", options: ["Flexible Vacuum", "Weighted Vacuum", "Vacuum Brush"] },
    ],
  },
  {
    id: 7,
    name: "Vacuum Hose",
    shortDesc: "Selang vacuum fleksibel untuk menyedot kotoran.",
    longDesc:
      "Vacuum hose berkualitas tinggi dengan material PVC fleksibel yang tahan sobek dan kimia kolam. Tersedia dalam panjang 8 hingga 15 meter untuk berbagai ukuran kolam. Permukaan halus mencegah penyumbatan, sambungan swivel memudahkan penggunaan tanpa kink. Tahan terhadap paparan UV dan bahan kimia kolam untuk umur pakai panjang.",
    image: IMG.hose,
    category: "Pembersih",
    specs: [
      { label: "Ukuran", options: ["8 Meter", "10 Meter", "12 Meter", "15 Meter"] },
    ],
  },
  {
    id: 8,
    name: "Leaf Rake",
    shortDesc: "Jaring pembersih daun dan sampah di permukaan kolam.",
    longDesc:
      "Leaf rake adalah jaring berkualitas tinggi untuk membersihkan daun, serangga, dan sampah di permukaan dan dasar kolam. Bingkai aluminum ringan namun kokoh, jaring mesh nylon tahan sobek dengan ukuran mesh yang optimal. Deep bag memungkinkan menampung lebih banyak kotoran dalam satu sapuan. Mudah dipasang pada telescopic pole standar.",
    image: IMG.leafRake,
    category: "Pembersih",
    specs: [],
  },
  {
    id: 9,
    name: "Telescopic Pole",
    shortDesc: "Batang teleskopik untuk berbagai alat pembersih kolam.",
    longDesc:
      "Telescopic pole adalah batang teleskopik universal yang menjadi dasar berbagai alat pembersih kolam — vacuum head, leaf rake, brush. Material aluminum ringan dengan locking system yang kuat. Dapat diperpanjang dari 2.4m hingga 4.8m untuk berbagai ukuran kolam. Grip empuk anti-slip memudahkan penggunaan jangka panjang.",
    image: IMG.pole,
    category: "Pembersih",
    specs: [
      { label: "Ukuran", options: ["2.4 Meter", "3.6 Meter", "4.8 Meter"] },
    ],
  },
  {
    id: 10,
    name: "Test Kit Air Kolam",
    shortDesc: "Alat ukur pH, chlorine, dan alkalinity air kolam.",
    longDesc:
      "Test kit akurat untuk memantau keseimbangan kimia air kolam. Penting untuk menjaga air tetap aman, jernih, dan nyaman. Pengukuran pH memastikan air tidak terlalu asam/basa. Chlorine test untuk memastikan desinfektan cukup. Alkalinity test untuk stabilitas pH. Reagen berkualitas dengan akurasi tinggi, hasil pengukuran cepat dalam 1 menit.",
    image: IMG.testKit,
    category: "Kimia",
    specs: [
      { label: "Mengukur", options: ["pH", "Chlorine", "Alkalinity"] },
    ],
  },
  {
    id: 11,
    name: "Chlorinator",
    shortDesc: "Alat dispenser chlorine otomatis untuk air tetap bersih.",
    longDesc:
      "Chlorinator adalah alat yang secara perlahan melepaskan chlorine ke air kolam untuk menjaga desinfektan tetap konsisten. Floating Chlorinator melayang di permukaan kolam, mudah dipasang tanpa modifikasi sistem. Inline Chlorinator terintegrasi pada jalur pipa return untuk kontrol presisi. Offline Chlorinator untuk sistem yang sudah ada tanpa mengganggu jalur utama. Semua model tahan korosi dan aman digunakan.",
    image: IMG.chlorinator,
    category: "Kimia",
    specs: [
      { label: "Jenis", options: ["Floating Chlorinator", "Inline Chlorinator", "Offline Chlorinator"] },
    ],
  },
  {
    id: 12,
    name: "Automatic Pool Cleaner",
    shortDesc: "Robot pembersih kolam otomatis merek ternama.",
    longDesc:
      "Automatic pool cleaner adalah solusi pembersihan kolam otomatis yang menghemat waktu dan tenaga. Tersedia merek-mek ternama dunia — Dolphin dengan teknologi scanning pintar, Zodiac dengan sistem sirkulasi efisien, dan Hayward dengan keandalan operasional. Robot ini membersihkan lantai, dinding, dan garis air secara mandiri. Beberapa model dilengkapi remote control dan timer.",
    image: IMG.cleaner,
    category: "Pembersih",
    brands: ["Dolphin", "Zodiac", "Hayward"],
    specs: [],
  },
  {
    id: 13,
    name: "Heat Pump Kolam",
    shortDesc: "Pemanas air kolam hemat energi untuk kenyamanan 24/7.",
    longDesc:
      "Heat pump kolam adalah solusi pemanas air paling efisien dengan teknologi inverter yang memanfaatkan panas udara lingkungan. Hemat hingga 70% dibanding pemanas listrik konvensional. Tersedia mulai 5 kW untuk kolam hunian hingga 21 kW untuk kolam komersial. Bekerja optimal pada suhu udara 10°C ke atas. Body tahan cuaca dengan kompresor low-noise.",
    image: IMG.heatPump,
    category: "Pemanas",
    specs: [
      { label: "Ukuran", options: ["5 kW", "9 kW", "12 kW", "17 kW", "21 kW"] },
    ],
  },
  {
    id: 14,
    name: "Water Feature",
    shortDesc: "Beragam fitur air dekoratif: air mancur, curtain, jet, cascade.",
    longDesc:
      "Water feature menghadirkan elemen estetika dan suara air yang menenangkan ke kolam Anda. Air Mancur klasik untuk tampilan elegan. Water Curtain menghadirkan tirai air dramatis. Deck Jet menembakkan air dari lantai deck. Bubble Jet untuk efek gelembung menenangkan. Cascade untuk aliran air bertingkat yang natural. Semua model dapat dikombinasikan dengan LED untuk efek malam hari yang memukau.",
    image: IMG.waterFeature,
    category: "Dekorasi",
    specs: [
      { label: "Jenis", options: ["Air Mancur", "Water Curtain", "Deck Jet", "Bubble Jet", "Cascade"] },
    ],
  },
  {
    id: 15,
    name: "Inlet & Main Drain",
    shortDesc: "Komponen sirkulasi air berkualitas tinggi material ABS.",
    longDesc:
      "Inlet dan main drain adalah komponen kritis sistem sirkulasi kolam. Main Drain di dasar kolam menyedot air kotor, sementara Inlet mengembalikan air bersih ke kolam. Material ABS berkualitas tinggi tahan korosi dan retak. Desain anti-vortex untuk main drain menjaga keamanan pengguna. Tersedia berbagai model untuk kolam beton, vinyl, dan fiberglass.",
    image: IMG.inlet,
    category: "Sirkulasi",
    specs: [
      { label: "Material", options: ["ABS"] },
    ],
  },
  {
    id: 16,
    name: "Skimmer Box",
    shortDesc: "Skimmer penyedot kotoran permukaan air kolam.",
    longDesc:
      "Skimmer box adalah komponen penting yang menyedot kotoran permukaan kolam (daun, serangga, minyak) sebelum masuk ke sistem filterasi. Concrete Pool Skimmer dirancang khusus untuk kolam beton dengan instalasi ditanam. Vinyl Pool Skimmer untuk kolam dengan liner vinyl dengan flange kedap. Lengkap dengan basket strainer yang mudah dibersihkan dan weir door otomatis.",
    image: IMG.skimmer,
    category: "Sirkulasi",
    specs: [
      { label: "Tipe", options: ["Concrete Pool", "Vinyl Pool"] },
    ],
  },
  {
    id: 17,
    name: "Overflow Grating",
    shortDesc: "Penutup saluran overflow kolam dengan berbagai warna.",
    longDesc:
      "Overflow grating menutupi saluran overflow pada kolam renang tipe overflow — memungkinkan air mengalir masuk sambil mencegah benda asing masuk. Material PVC ekonomis atau ABS premium yang tahan UV dan kimia. Tersedia dalam warna putih, abu-abu, dan hitam untuk menyesuaikan desain kolam. Desain slip-resistant untuk keamanan pengguna.",
    image: IMG.grating,
    category: "Aksesoris",
    specs: [
      { label: "Material", options: ["PVC", "ABS"] },
      { label: "Warna", options: ["Putih", "Abu", "Hitam"] },
    ],
  },
  {
    id: 18,
    name: "Return Fitting",
    shortDesc: "Fitting return air bersih ke kolam, ukuran 1.5\" dan 2\".",
    longDesc:
      "Return fitting adalah komponen yang mengembalikan air bersih dari sistem filterasi kembali ke kolam. Dirancang dengan eyeball adjustable untuk mengarahkan aliran air sesuai kebutuhan sirkulasi. Ukuran standar 1.5\" untuk kolam hunian dan 2\" untuk kolam komersial. Material berkualitas tahan kimia dan UV, lengkap dengan ring kedap untuk mencegah kebocoran.",
    image: IMG.return,
    category: "Sirkulasi",
    specs: [
      { label: "Ukuran", options: ['1.5"', '2"'] },
    ],
  },
  {
    id: 19,
    name: "Pool Chemical",
    shortDesc: "Beragam bahan kimia perawatan air kolam berkualitas.",
    longDesc:
      "Pool chemical lengkap untuk perawatan kualitas air kolam renang. Chlorine Tablet untuk desinfektan jangka panjang. Chlorine Granular untuk shock treatment cepat. Soda Ash untuk menaikkan pH. PAC sebagai coagulant pengendap kotoran halus. HCl untuk menurunkan pH. Algaecide mencegah pertumbuhan alga. Clarifier menjaga air tetap jernih. pH Minus dan pH Plus untuk penyesuaian. Cyanuric Acid sebagai stabilizer chlorine.",
    image: IMG.chemical,
    category: "Kimia",
    specs: [
      { label: "Jenis", options: ["Chlorine Tablet", "Chlorine Granular", "Soda Ash", "PAC", "HCl", "Algaecide", "Clarifier", "pH Minus", "pH Plus", "Cyanuric Acid"] },
    ],
  },
  {
    id: 20,
    name: "Aksesoris Kolam",
    shortDesc: "Beragam aksesoris pelengkap kolam renang.",
    longDesc:
      "Aksesoris kolam lengkap untuk melengkapi fungsionalitas dan keamanan kolam Anda. Thermometer untuk memantau suhu air. Floating Dispenser untuk distribusi kimia. Life Ring wajib untuk kolam komersial. Life Hook untuk situasi darurat. Pool Cover melindungi kolam dari kotoran saat tidak digunakan. Pool Fence untuk keamanan anak-anak. Shower Stainless untuk area bilas. Diving Board untuk kolam dalam yang memenuhi standar keselamatan.",
    image: IMG.accessories,
    category: "Aksesoris",
    specs: [
      { label: "Jenis", options: ["Thermometer", "Floating Dispenser", "Life Ring", "Life Hook", "Pool Cover", "Pool Fence", "Shower Stainless", "Diving Board"] },
    ],
  },
];

export const PRODUCT_CATEGORIES = [
  "Semua",
  "Sirkulasi",
  "Pembersih",
  "Pencahayaan",
  "Kimia",
  "Pemanas",
  "Dekorasi",
  "Aksesoris",
] as const;
