# Buku Panduan Penggunaan SIM KIPAN
Sistem Informasi Manajemen Keanggotaan Pemuda Anti Narkoba (SIM KIPAN)

Dokumen ini berisi panduan teknis dan Standar Operasional Prosedur (SOP) alur pendaftaran, verifikasi, hingga penerbitan Surat Keputusan (SK) dan Kartu Tanda Anggota (KTA).

---

## 1. Panduan untuk Pendaftar (Calon Anggota)

Pendaftar adalah pemuda yang ingin bergabung dengan KIPAN. Proses dilakukan sepenuhnya secara mandiri melalui website publik KIPAN.

### Alur Pendaftaran:
1. **Mengakses Formulir**: Buka website KIPAN, masuk ke menu **Pendaftaran** atau klik tombol **Daftar Anggota**.
2. **Mengisi Biodata**: Isi NIK, Nama Lengkap, Tempat & Tanggal Lahir, Jenis Kelamin, Agama, Pendidikan, Pekerjaan, Alamat Domisili, Provinsi, Kabupaten/Kota, Kecamatan, dan No. WhatsApp aktif.
3. **Mengunggah Dokumen**: Pendaftar wajib mengunggah Pas Foto resmi dan Foto KTP. Dokumen lain seperti CV, SK, Surat Pernyataan, dan Surat Keterangan Sehat bersifat opsional (kecuali disyaratkan khusus oleh daerah).
4. **Submit Formulir**: Pastikan mencentang persetujuan syarat dan ketentuan, lalu klik Submit.
5. **Cek Status Pendaftaran**: Gunakan menu **Cek Status Pendaftaran** dengan memasukkan NIK dan Tanggal Lahir untuk memantau apakah pendaftaran sedang *Diajukan, Diverifikasi, Diminta Perbaikan, Disetujui,* atau *Ditolak*.

### Alur Perbaikan Data (Jika Berkas Ditolak Sementara):
1. Jika statusnya adalah **"Perbaikan"**, pendaftar akan melihat catatan/alasan dari admin (misal: "Foto KTP buram").
2. Pendaftar menekan tombol **Perbaiki Data** dan akan diminta login sementara (memasukkan NIK dan Tanggal Lahir).
3. Pendaftar mengunggah ulang dokumen yang dipermasalahkan, lalu klik Submit kembali. Status akan kembali menjadi "Diajukan/Diverifikasi".

### Cetak KTA Digital (Kartu Tanda Anggota):
1. Apabila pendaftaran telah **Disetujui**, pendaftar resmi menjadi anggota dan otomatis mendapat **Nomor Induk Anggota (NIA)**.
2. Anggota dapat mencari namanya di halaman publik "Daftar Anggota" atau melalui menu Cek Status, lalu mengklik tombol **Cetak KTA** untuk mengunduh ID Card KIPAN digital.

---

## 2. Panduan untuk Admin Kabupaten/Kota

Admin Kabupaten/Kota bertindak sebagai pintu gerbang pertama dalam proses rekrutmen anggota di tingkat cabang (Kabupaten/Kota).

### Alur dan Wewenang:
1. **Login Dashboard**: Menggunakan *username* (email) dan *password* yang diberikan oleh Admin Provinsi/Nasional. Default tampilan hanya memperlihatkan data khusus di wilayah Kabupaten tersebut.
2. **Verifikasi Pendaftar (Tahap 1)**:
   - Masuk ke menu **Pendaftaran**.
   - Admin Kabupaten akan melihat daftar calon anggota yang berdomisili di Kabupatennya.
   - Klik **Verifikasi**. Admin harus mengecek kesesuaian antara isian biodata dengan file KTP/dokumen fisik.
   - Admin Kabupaten **tidak menyetujui secara final**, melainkan mengubah status menjadi **"Diajukan (Diteruskan ke Provinsi)"** jika berkas lolos.
   - Jika ada yang kurang, ubah status ke **"Perbaikan"** dan isi alasan agar pendaftar bisa membenahinya.
3. **Melihat Data Anggota**: Mengakses menu **Data Anggota** untuk memantau siapa saja warga kabupatennya yang sudah lolos menjadi anggota resmi KIPAN.
4. **Manajemen Pengurus Kabupaten**:
   - Di menu **Pengurus**, Admin Kabupaten otomatis disajikan daftar pengurus (Ketua, Sekretaris, dll) khusus untuk tingkat kabupatennya saja.
   - Admin Kabupaten **berhak** menonaktifkan pengurus di wilayahnya, tapi **tidak berhak** menyunting atau melihat data Pengurus Provinsi maupun Nasional.

---

## 3. Panduan untuk Admin Provinsi

Admin Provinsi memiliki wewenang lebih luas dan bertugas sebagai Verifikator Akhir (Tahap 2) yang menyetujui calon anggota untuk resmi mendapatkan NIA.

### Alur dan Wewenang:
1. **Verifikasi Akhir Pendaftar (Tahap 2)**:
   - Menerima lemparan data calon anggota yang sudah berstatus *"Diajukan"* oleh Admin Kabupaten.
   - Melakukan tinjauan ulang berkas.
   - Jika valid, Admin Provinsi menekan tombol **Setujui Final**. Saat disetujui, sistem otomatis men-*generate* **Nomor Induk Anggota (NIA)** yang unik dan KTA diterbitkan.
2. **Manajemen Surat Keputusan (SK)**:
   - Admin Provinsi dapat menerbitkan SK Kepengurusan tingkat Provinsi (dan menyetujui draf SK dari Kabupaten di bawahnya).
   - Memasukkan nama-nama anggota KIPAN yang ditunjuk ke dalam form SK untuk dijadikan **Pengurus**.
3. **Manajemen Pengurus**:
   - Secara default, menu **Pengurus** menampilkan para pengurus tingkat Provinsi.
   - Admin Provinsi dapat mengedit dan meng-update jabatan pengurus provinsinya.
   - Admin Provinsi dapat memonitor Pengurus Kabupaten di dalam cakupan provinsinya, tapi **dilarang/tidak berhak** menyunting apalagi melihat data Pengurus Nasional.

---

## 4. Panduan untuk Admin Nasional (Super Admin)

Admin Nasional adalah pemegang kendali penuh atas sistem dan seluruh aliran data di seluruh provinsi di Indonesia.

### Alur dan Wewenang:
1. **Akses Global (Semua Level)**:
   - Admin Nasional dapat melihat keseluruhan data se-Indonesia. Di menu Pengurus, filter default adalah **"Semua Level"**.
   - Berhak sepenuhnya *membypass* alur verifikasi (contoh: langsung menyetujui pendaftar dari Kabupaten X tanpa harus menunggu Provinsi/Kabupaten).
2. **Manajemen Akun (User Management)**:
   - Admin Nasional wajib mengelola dan membuatkan akun untuk Admin Provinsi dan Admin Kabupaten di menu **Pengaturan Akun**.
3. **Manajemen Surat Keputusan (SK) Nasional**:
   - Mengesahkan dan mengunci SK tingkat Nasional, serta menjadi verifikator tertinggi jika ada sengketa SK di daerah.
   - Mengangkat Ketua Umum dan Dewan Pengurus Nasional (DPN).
4. **Manajemen Konten Publik**:
   - Berhak memublikasikan **Berita & Artikel Umum** (yang akan tampil di *landing page* website), sedangkan Admin daerah biasanya hanya berhak mempublikasikan Berita Internal.
   - Mengelola Galeri Kegiatan skala nasional.
5. **Cetak Laporan**:
   - Menarik rekap data pendaftar, demografi (jenis kelamin/pendidikan), serta jumlah pengurus untuk kepentingan laporan tahunan/kelembagaan KIPAN Pusat.

---

## Ringkasan Alur Otomatisasi (System Flow)

> [!NOTE]
> **Alur Pendaftaran Reguler (Kabupaten tersedia)**:
> Calon Anggota Mendaftar -> Diverifikasi Admin Kabupaten -> Diteruskan ke Provinsi -> Disetujui Admin Provinsi -> NIA dan KTA Terbit Otomatis.

> [!TIP]
> **Perubahan Status Pengurus (Otomatis)**:
> Saat SK habis masa berlakunya atau saat SK baru ditebitkan untuk menggantikan yang lama, sistem akan menandai anggota bersangkutan sebagai **Demisioner** jika ia pernah menjabat, dan memperbarui riwayat kepengurusannya agar selaras dengan Cetak KTA. Pada tabel anggota, sistem selalu menampilkan data **Pengurus Aktif** terbaru.
