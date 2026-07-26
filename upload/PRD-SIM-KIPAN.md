# Product Requirements Document (PRD)
## Sistem Informasi Manajemen Keanggotaan KIPAN Indonesia (SIM KIPAN)

| | |
|---|---|
| **Versi** | 1.0 |
| **Status** | Draft Arsitektur Data |
| **Frontend** | React + TypeScript + TailwindCSS + Shadcn UI |
| **Backend** | REST API (Laravel / Node / NestJS — menyesuaikan) |
| **Database** | PostgreSQL / MySQL |

---

## Daftar Isi

1. [Tujuan](#1-tujuan)
2. [Konsep Organisasi](#2-konsep-organisasi)
3. [Struktur Organisasi](#3-struktur-organisasi)
4. [Struktur Data (Master)](#4-struktur-data-master)
5. [Modul Wilayah](#5-modul-wilayah)
6. [Modul Anggota](#6-modul-anggota)
7. [Modul Jabatan](#7-modul-jabatan)
8. [Modul Pengurus](#8-modul-pengurus)
9. [Relasi Data](#9-relasi-data)
10. [Contoh Kasus](#10-contoh-kasus)
11. [Rule Sistem](#11-rule-sistem)
12. [Kesimpulan Arsitektur](#12-kesimpulan-arsitektur)

---

## 1. Tujuan

SIM KIPAN adalah sistem untuk mengelola seluruh organisasi KIPAN Indonesia, mulai dari tingkat **Nasional**, **Provinsi**, hingga **Kabupaten/Kota**.

Tujuan utama sistem:

- Mengelola struktur organisasi
- Mengelola data anggota
- Mengelola data pengurus
- Mengelola wilayah organisasi
- Menjadi sumber data tunggal (*Single Source of Truth*)

> **Catatan:** Sistem **bukan** hanya website pendaftaran, melainkan Sistem Informasi Manajemen Organisasi secara utuh.

---

## 2. Konsep Organisasi

Ini adalah konsep paling penting dalam sistem:

> **Semua Pengurus adalah Anggota, tetapi tidak semua Anggota adalah Pengurus.**

```
Anggota
 ├── Ahmad
 ├── Budi
 ├── Hendra
 └── Maya
        │
        │  (sebagian mendapat SK)
        ▼
    Pengurus
```

**Implikasi:** Pengurus bukan data orang baru — Pengurus hanyalah *anggota yang sedang memiliki jabatan*.

---

## 3. Struktur Organisasi

```
Nasional
   │
   ▼
Provinsi
   │
   ▼
Kabupaten/Kota
```

**Contoh:**

```
Indonesia
   │
   ▼
Jawa Barat
   │
   ▼
Bandung Barat
```

---

## 4. Struktur Data (Master)

Terdapat 4 entitas master:

1. **Wilayah**
2. **Anggota**
3. **Jabatan**
4. **Pengurus**

---

## 5. Modul Wilayah

Wilayah adalah representasi struktur organisasi (Nasional → Provinsi → Kabupaten/Kota).

### 5.1 Data Wilayah

| Field | Keterangan |
|---|---|
| ID | Identitas unik |
| Kode | Kode wilayah |
| Nama | Nama wilayah |
| Level | Nasional / Provinsi / Kabupaten |
| Parent | Wilayah induk |
| Alamat Sekretariat | — |
| Telepon | — |
| Email | — |
| Website | — |
| Logo | — |
| Status | Aktif / Nonaktif |
| Tanggal Dibentuk | — |

**Contoh hierarki data:**

| Nama | Level | Parent |
|---|---|---|
| Indonesia | Nasional | — |
| Jawa Barat | Provinsi | Indonesia |
| Bandung Barat | Kabupaten | Jawa Barat |

### 5.2 Relasi Wilayah

Satu Wilayah memiliki:
- Banyak **anggota**
- Banyak **pengurus**
- Banyak **child wilayah**

### 5.3 Halaman Wilayah

```
List Wilayah → Detail Wilayah
```

### 5.4 Tab pada Detail Wilayah

| Tab | Isi |
|---|---|
| **Informasi** | Kode, Nama, Level, Alamat, Email, Website, Status, Tanggal Dibentuk |
| **Sub Wilayah** | Daftar wilayah anak (hanya muncul jika level = Provinsi, tidak muncul untuk level Kabupaten). Contoh untuk Provinsi: Bandung, Bekasi, Bogor, Garut, dll |
| **Pengurus** | Daftar pengurus (Ketua, Sekretaris, Bendahara, Wakil, dll) → klik untuk Detail Pengurus |
| **Anggota** | Seluruh anggota di wilayah tersebut → klik untuk Detail Anggota |
| **Statistik** | Jumlah Pengurus, Jumlah Anggota, Anggota Aktif, Anggota Nonaktif, Sub Wilayah, Pertumbuhan |
| **Riwayat** | Log historis: wilayah dibuat, ketua diganti, kabupaten ditambah, dll |

---

## 6. Modul Anggota

Semua orang — baik pengurus maupun bukan — masuk ke dalam tabel **Anggota**.

### 6.1 Data Anggota

| Field | Keterangan |
|---|---|
| ID | Identitas unik |
| NIA | Nomor Induk Anggota |
| NIK | Nomor Induk Kependudukan |
| Nama | — |
| Tempat Lahir | — |
| Tanggal Lahir | — |
| Jenis Kelamin | — |
| Alamat | — |
| Provinsi | — |
| Kabupaten | — |
| Email | — |
| HP | — |
| Pendidikan | — |
| Pekerjaan | — |
| Foto | — |
| Status Anggota | Aktif / Nonaktif / Mengundurkan Diri / Diberhentikan / Meninggal |
| Tanggal Bergabung | — |

### 6.2 Relasi

Satu anggota bisa memiliki **0 atau lebih jabatan** (riwayat jabatan tersimpan seluruhnya).

**Contoh riwayat jabatan seorang anggota:**

| Tahun | Jabatan |
|---|---|
| 2024 | Ketua Kabupaten |
| 2026 | Ketua Provinsi |
| 2029 | Ketua Nasional |

### 6.3 Halaman Anggota

```
List Anggota → Detail Anggota
```

### 6.4 Tab pada Detail Anggota

| Tab | Isi |
|---|---|
| **Profil** | Foto, Nama, NIK, TTL, Alamat, HP, Email, Pendidikan, Pekerjaan |
| **Keanggotaan** | NIA, Tanggal Bergabung, Wilayah, Status, Angkatan |
| **Jabatan** | Riwayat jabatan (contoh: Ketua Kabupaten 2024–2026 → Ketua Provinsi 2026–2029) |
| **Dokumen** | KTP, CV, Pas Foto, Surat Pernyataan |
| **Activity** | Login, Update, Verifikasi, dll |

---

## 7. Modul Jabatan

**Jabatan** adalah data master (bukan nama orang). Contoh: Ketua, Sekretaris, Bendahara, Wakil Ketua, Humas, dll.

### Data Jabatan

| Field | Keterangan |
|---|---|
| ID | Identitas unik |
| Nama Jabatan | — |
| Level | Nasional / Provinsi / Kabupaten |
| Urutan | Urutan hierarki jabatan |
| Status | Aktif / Nonaktif |

---

## 8. Modul Pengurus

> **Poin krusial yang sering salah dipahami: Pengurus BUKAN orang.**

**Pengurus** adalah kombinasi dari:

```
Anggota + Jabatan + Wilayah + Periode
```

**Contoh:**

Anggota *Hendra Gunawan* ditunjuk menjadi **Ketua Provinsi Jawa Barat periode 2026–2029** → maka dibuat record Pengurus:

| Field | Nilai |
|---|---|
| Anggota | Hendra |
| Jabatan | Ketua |
| Wilayah | Jawa Barat |
| Mulai | 2026 |
| Selesai | 2029 |

Jika kelak Hendra menjadi Ketua Nasional, **data anggota tidak berubah** — sistem cukup menambah riwayat jabatan baru.

### 8.1 Data Pengurus

| Field | Keterangan |
|---|---|
| ID | Identitas unik |
| Anggota | Referensi ke data anggota |
| Wilayah | Referensi ke wilayah |
| Jabatan | Referensi ke jabatan |
| SK | Nomor SK |
| Tanggal SK | — |
| Mulai | — |
| Selesai | — |
| Status | Aktif / Selesai / Diberhentikan |

### 8.2 Halaman Pengurus

```
List Pengurus → Detail Pengurus
```

### 8.3 Tab pada Detail Pengurus

| Tab | Isi |
|---|---|
| **Profil** | Diambil dari data anggota (tidak disimpan ulang) |
| **Jabatan** | Ketua, Sekretaris, Bendahara, dll |
| **Wilayah** | Provinsi / Kabupaten |
| **Dokumen** | SK, Surat Keputusan, Lampiran |
| **Riwayat Jabatan** | Contoh: 2022 Sekretaris → 2024 Ketua Kabupaten → 2026 Ketua Provinsi |
| **Activity** | SK dibuat, SK berakhir, Edit, dll |

---

## 9. Relasi Data

```
                    WILAYAH
                       │
           ┌───────────┴───────────┐
           │                       │
           ▼                       ▼
        ANGGOTA               SUB WILAYAH
           │
           ▼
        PENGURUS
           │
           ▼
        JABATAN
```

---

## 10. Contoh Kasus

| Kasus | Status Anggota | Status Pengurus |
|---|---|---|
| **Ahmad** — masuk sebagai anggota, status Aktif, belum punya jabatan | ✔ Anggota | ✖ Pengurus |
| **Hendra** — masuk anggota, kemudian dipilih menjadi Ketua Provinsi | ✔ Anggota | ✔ Pengurus |
| **Hendra (2029)** — menjadi Ketua Nasional | Tidak membuat anggota baru | Cukup tambah record Pengurus baru |

---

## 11. Rule Sistem

**Rule 1**
Semua pengurus wajib merupakan anggota. Tidak boleh membuat data pengurus tanpa data anggota.

**Rule 2**
Satu anggota boleh memiliki banyak riwayat jabatan, tetapi hanya boleh memiliki **satu jabatan aktif** pada level wilayah yang sama — kecuali AD/ART KIPAN mengizinkan rangkap jabatan.

**Rule 3**
Menghapus anggota yang masih memiliki jabatan aktif **tidak diperbolehkan**. Jabatan harus diakhiri terlebih dahulu.

**Rule 4**
Statistik wilayah dihitung otomatis dari relasi data. Contoh untuk **Provinsi Jawa Barat**:
- **Anggota**: akumulasi seluruh anggota di kabupaten/kota di bawah Jawa Barat (ditambah anggota yang terdaftar langsung di provinsi, jika ada)
- **Pengurus Provinsi**: hanya pengurus yang bertugas di tingkat provinsi
- **Total Pengurus Wilayah**: seluruh pengurus provinsi + seluruh pengurus kabupaten/kota di bawahnya (opsional, ditampilkan sebagai metrik terpisah)

---

## 12. Kesimpulan Arsitektur

```
ANGGOTA
 ├── menyimpan data orang
 ├── memiliki NIA
 ├── memiliki profil
 ├── memiliki dokumen
 └── dapat memiliki 0..n jabatan

PENGURUS
 ├── referensi ke anggota
 ├── referensi ke jabatan
 ├── referensi ke wilayah
 ├── memiliki periode
 ├── memiliki SK
 └── menyimpan riwayat jabatan

JABATAN
 ├── master nama jabatan
 └── menentukan level organisasi

WILAYAH
 ├── struktur nasional
 ├── provinsi
 ├── kabupaten/kota
 └── menjadi induk relasi anggota dan pengurus
```

Dengan arsitektur ini, data tidak akan ganda, riwayat kepengurusan tetap terjaga, dan sistem dapat berkembang untuk kebutuhan organisasi KIPAN dalam jangka panjang.
