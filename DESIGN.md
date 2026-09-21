# DESIGN SYSTEM & UI/UX GUIDELINES
## SIM-KIPAN (Sistem Informasi & Keanggotaan KIPAN Indonesia)

---

### 1. FILOSOFI DESAIN & IDENTITAS VISUAL

#### 1.1 Visi Desain
Sebagai organisasi nasional kepemudaan yang berdiri di garda terdepan pencegahan penyalahgunaan narkoba di bawah naungan kemitraan **Badan Narkotika Nasional (BNN)** dan **Kemenpora RI**, SIM-KIPAN harus merefleksikan karakter:
- **Kredibel & Berwibawa:** Memiliki standar visual instansi resmi berskala nasional.
- **Modern & Energik:** Dinamis, segar, dan ramah generasi muda (*youth-centric*).
- **Bersih & Sehat:** Mengusung filosofi hidup sehat bebas narkoba dengan visual yang jernih, rapi (*clean layout*), dan terstruktur.
- **Transparan & Terintegrasi:** Menghadirkan alur informasi yang mudah dipahami, mulai dari pendaftaran, verifikasi, hingga pelacakan mandiri.

#### 1.2 Prinsip Utama (Core Principles)
1. **Clarity First:** Informasi penting (Nomor Pendaftaran, NIP, Status Verifikasi, Call-to-Action) harus langsung terlihat tanpa membingungkan pengguna.
2. **Consistent Visual Language:** Penggunaan token warna, tipografi, radius sudut, dan bayangan yang seragam di seluruh portal publik dan panel admin.
3. **Delightful Micro-interactions:** Animasi halus (*smooth transitions*, *tilt cards*, *soft hover lift*) yang membuat antarmuka terasa hidup (*alive*) tanpa mengorbankan performa.
4. **Accessible & Responsive:** Nyaman dioperasikan di layar ponsel (Android/iOS) hingga monitor desktop layar lebar dengan kontras warna yang memenuhi standar WCAG AA.

---

### 2. PALET WARNA & SISTEM TOKEN (COLOR TOKENS)

SIM-KIPAN mengadopsi tema warna **Ocean & Sky Blue** yang melambangkan kejernihan, ketenangan, dan harapan pemuda Indonesia.

#### 2.1 Warna Utama (Brand Primary & Secondary)

| Token / Nama | Hex Code | Tailwind Class | Penggunaan Utama |
| :--- | :--- | :--- | :--- |
| **Deep Navy (Dark)** | `#0f172a` / `#1e3a8a` | `bg-blue-950` / `text-blue-950` | Warna teks utama, header dominan, latar hero background. |
| **KIPAN Blue (Primary)** | `#2563eb` | `bg-blue-600` / `text-blue-600` | Tombol CTA utama, status aktif, brand badge, border aktif. |
| **Sky Vibrant (Cyan)** | `#0ea5e9` | `bg-sky-500` / `text-sky-500` | Aksen gradien, link hover, highlight angka statistik. |
| **Light Ice Sky** | `#f0f9ff` | `bg-sky-50` / `border-sky-200` | Background container kartu, highlight box pendaftaran, baris tabel selang-seling. |

#### 2.2 Warna Status & Indikator (Feedback Colors)

| Status | Latar (Pill BG) | Teks & Ikon | Border | Penggunaan |
| :--- | :--- | :--- | :--- | :--- |
| **Success (Disetujui / Aktif)** | `bg-emerald-50` | `text-emerald-700` | `border-emerald-200` | Pendaftar disetujui, pengurus aktif, data tersimpan. |
| **Warning (Perlu Perbaikan)** | `bg-amber-50` | `text-amber-700` | `border-amber-200` | Permintaan revisi berkas pendaftar, data belum lengkap. |
| **Info (Diterima / Diajukan)** | `bg-blue-50` | `text-blue-700` | `border-blue-200` | Antrean verifikasi baru, pendaftaran diterima sistem. |
| **Danger (Ditolak / Nonaktif)** | `bg-rose-50` | `text-rose-700` | `border-rose-200` | Pendaftaran ditolak, pengurus dinonaktifkan, error validasi. |
| **Neutral / Draft** | `bg-slate-100` | `text-slate-700` | `border-slate-200` | Berita status draft, wilayah dalam pembentukan. |

#### 2.3 Gradien Khas (Signature Gradients)
- **Primary Button Gradient:** `bg-gradient-to-r from-sky-500 to-blue-600`
- **Text Gradient Highlight:** `bg-gradient-to-r from-sky-300 to-cyan-500 bg-clip-text text-transparent`
- **Hero Dark Overlay:** `bg-gradient-to-r from-blue-950/90 via-blue-900/75 to-blue-900/40`
- **Soft Section Background:** `bg-gradient-to-br from-sky-50 via-white to-cyan-50`

---

### 3. TIPOGRAFI & SKALA TEKS (TYPOGRAPHY SCALE)

- **Font Utama (Primary):** `Poppins` (Google Font) — Karakter geometris modern, bersahabat namun kokoh.
- **Font Aksen Judul (Secondary):** `Playfair Display` (Google Font) — Digunakan untuk sentuhan editorial dan kutipan pimpinan.
- **Font Kode / Identitas (Monospace):** `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas` — Untuk **Nomor Pendaftaran (`REG-YYYYMM-XXXX`)** dan **NIP (`KIPAN-JB-3204-2026-00001`)**.

#### Skala Hirarki Tipografi

| Kategori | Ukuran Font | Weight | Tracking / Line-height | Tailwind Class |
| :--- | :--- | :--- | :--- | :--- |
| **Display (Hero H1)** | `3rem – 4.5rem` (48–72px) | Extrabold (800) | Tight (`-0.02em`) | `text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight` |
| **Section Title (H2)** | `2rem – 3rem` (32–48px) | Extrabold (800) | Tight | `text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-950` |
| **Card Title (H3)** | `1.25rem – 1.5rem` (20–24px) | Bold (700) | Snug | `text-xl lg:text-2xl font-bold text-slate-900` |
| **Subheading / Badge** | `0.75rem – 0.875rem` (12–14px) | Semibold (600) | Uppercase (`0.05em`) | `text-xs uppercase tracking-wider font-semibold text-blue-700` |
| **Body Large** | `1.125rem` (18px) | Regular / Medium (400/500) | Relaxed (`1.6`) | `text-lg text-slate-600 leading-relaxed` |
| **Body Base** | `0.875rem – 1rem` (14–16px) | Regular (400) | Normal | `text-sm sm:text-base text-slate-600 leading-normal` |
| **Caption / Helper** | `0.75rem` (12px) | Regular / Medium (400/500) | Normal | `text-xs text-slate-500` |
| **Identity Number** | `1.25rem – 1.75rem` (20–28px) | Extrabold (800) | Monospace / Wide | `font-mono font-extrabold tracking-wider text-xl sm:text-2xl` |

---

### 4. SISTEM TATA LETAK & SPASIAL (SPACING & GRID)

#### 4.1 Skala Spasi (Spacing Scale)
Menggunakan basis **8-point grid system**:
- `4px` (`0.25rem`): Jarak mikro (antara ikon dan label inline).
- `8px` (`0.5rem`): Padding elemen kecil (badge, tombol tag).
- `16px` (`1rem`): Padding form input, gap antar elemen form.
- `24px` (`1.5rem`): Padding kartu internal (*card padding*).
- `32px` (`2rem`): Margin antar seksi form pendaftaran.
- `80px – 112px` (`py-20 lg:py-28`): Standar vertikal padding setiap seksi utama (*Section Padding*).

#### 4.2 Container & Lebar Maksimum
- **Full Width Container:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` (untuk Navbar, Hero, Grid Berita & Galeri).
- **Narrow Reader Container:** `max-w-3xl mx-auto` (untuk Header Seksi, Lacak Pendaftaran).
- **Form Pendaftaran Container:** `max-w-4xl mx-auto` (Memberikan ruang nyaman untuk 2 kolom form data diri).
- **Dialog Modal:** `max-w-lg` (untuk dialog konfirmasi/tolak) atau `max-w-3xl` (untuk detail data verifikasi).

#### 4.3 Radius Sudut (Corner Radius)
- **Kancing / Pill Badge:** `rounded-full` (Badge kategori, tombol CTA utama).
- **Kartu Besar & Seksi Box:** `rounded-3xl` (24px) untuk kartu pendaftaran, hero box, dan container utama.
- **Kartu Standar & Panel:** `rounded-2xl` (16px) untuk card berita, galeri, form box.
- **Form Input & Tombol Tabel:** `rounded-xl` (12px) atau `rounded-lg` (8px).

---

### 5. KOMPONEN UI & ATURAN INTERAKSI

#### 5.1 Tombol (Button System)

1. **Primary Action (CTA):**
   - Tampilan: Gradien `from-sky-500 to-blue-600`, teks putih, `rounded-full`, padding `px-7 py-4`.
   - Shadow: `shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40`.
   - Interaksi: Hover bergerak naik `-translate-y-0.5`, active klik `scale-95`.
2. **Secondary / Outline Button:**
   - Tampilan: Border transparan `border border-white/30 text-white` atau `border-slate-200 text-slate-700 bg-white`.
   - Hover: `hover:bg-sky-50 hover:text-blue-700 hover:border-blue-200`.
3. **Copy to Clipboard Button:**
   - Bentuk padat dengan ikon `Copy`, berubah menjadi ikon `Check` hijau saat berhasil disalin dengan feedback visual seketika.

#### 5.2 Formulir & Input Data (Form Inputs)
- **Label:** `text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider`.
- **Field:** Background putih, border `border-slate-200`, padding `py-3 px-4`, radius `rounded-xl`.
- **State Focus:** `focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none`.
- **Error State:** Border `border-rose-300`, background `bg-rose-50/50`, pesan error kecil merah di bawah field dengan ikon `AlertCircle`.
- **Select Dropdown:** Ditandai chevron kustom, transisi mulus, dan dropdown menu yang terindeks rapi.

#### 5.3 Kartu & Elevasi (Cards & Shadows)
- Setiap kartu memiliki garis tepi sangat tipis yang elegan: `border border-slate-100` atau `border-sky-100`.
- Bayangan menggunakan sentuhan warna biru halus: `shadow-xl shadow-blue-900/5` agar tidak tampak kusam atau abu-abu mati.
- Efek Hover: Transformasi elevasi `hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-sky-500/15 transition-all duration-300`.

#### 5.4 Kartu Identitas & Hasil Pendaftaran (Identity Banner Card)
- Digunakan untuk menampilkan **Nomor Pendaftaran (`REG-YYYYMM-XXXX`)** dan **NIP Pengurus**.
- Background: Gradien royal `from-blue-600 to-sky-600`.
- Kontainer nomor: Box transparan berkabut (`bg-black/15 backdrop-blur-md border border-white/15`) dengan font monospace tebal.

---

### 6. ANIMASI & MIKRO-INTERAKSI (MOTION GUIDELINES)

Menggunakan **Framer Motion** untuk menjaga konsistensi pergerakan:
- **Scroll Reveal (While In View):**
  ```tsx
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-80px" }}
  transition={{ duration: 0.5, ease: "easeOut" }}
  ```
- **Modal Entry & Exit:**
  ```tsx
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.2 }}
  ```
- **Tilt-3D Effect (Services & Program Cards):** Perputaran sumbu X/Y ringan (max 8 derajat) saat kursor mouse bergerak di atas kartu program kerja untuk memberikan pengalaman taktil.

---

### 7. DESAIN BACK-OFFICE (ADMIN PANEL DASHBOARD)

Panel Admin SIM-KIPAN mengutamakan **kepadatan informasi yang bersih (Data Density & Legibility)**:
1. **Sidebar Navigasi:** Latar gelap `bg-slate-900` atau terang `bg-white border-r border-slate-200` dengan ikon Lucide yang seragam dan indikator badge jumlah antrean verifikasi.
2. **Status Table:** Baris tabel dengan hover effect lembut `hover:bg-slate-50/80`, tombol aksi vertikal/horizontal yang jelas, dan status badge warna standar (Hijau, Kuning, Merah, Biru).
3. **Split Screen Verification:** Kolom kiri menampilkan daftar pendaftar, kolom kanan menampilkan rincian berkas (KTP, pasfoto) dengan tombol aksi persetujuan yang tegas dan aman dari salah klik.

---

### 8. CHECKLIST EVALUASI DESAIN (UI QUALITY CHECKLIST)

Sebelum merilis halaman atau fitur baru di WEB KIPAN, pastikan lulus pengujian checklist berikut:
- [ ] **Warna & Kontras:** Tidak ada teks abu-abu terang yang sulit dibaca di atas background putih.
- [ ] **Mobile Touch Target:** Semua tombol dan link interaktif memiliki area sentuh minimal `44 x 44 px`.
- [ ] **Penomoran Unik:** Nomor pendaftaran atau NIP menggunakan font monospace dan format standar.
- [ ] **Feedback Aksi:** Semua proses submit menampilkan indikator loading (*spinner*), serta pesan sukses/gagal yang informatif.
- [ ] **Responsivitas:** Tabel data memiliki wrapper horizontal scroll di layar kecil agar layout tidak terpotong.
- [ ] **Akses Tersembunyi Admin:** Shortcut `Ctrl + Shift + A` dan URL `#admin` tetap berfungsi tanpa merusak navigasi halaman depan.
