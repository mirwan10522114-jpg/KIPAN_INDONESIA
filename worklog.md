
---
Task ID: FIX-PENDAFTARAN-SUBMIT
Agent: main (Super Z)
Task: Fix "Gagal submit pendaftaran" error saat user mendaftar anggota

Work Log:
- Investigasi root cause dari log dev.log: ditemukan PrismaClientValidationError dengan provinsiId: NaN, kabupatenId: NaN
- Root cause: Frontend (PendaftaranAnggota.tsx) mengirim form.provinsi (nama string "Jawa Barat") sebagai provinsiId, lalu API melakukan parseInt("Jawa Barat") = NaN
- Discovery tambahan: DB menggunakan kode 2-huruf untuk provinsi (JB, JK, JI) sedangkan master-wilayah.ts menggunakan kode 2-digit Kemendagri (32, 31). Lookup by kode akan gagal.
- Discovery tambahan: Hanya 10 kabupaten yang ter-seed di DB. User dari kabupaten lain akan tetap gagal.
- Fix Frontend (PendaftaranAnggota.tsx): tambahkan lookup MASTER_PROVINSI/MASTER_KABUPATEN untuk dapatkan kode Kemendagri, kirim provinsiKode, kabupatenKode, provinsiNama, kabupatenNama sebagai payload
- Fix API (pendaftaran/route.ts):
  * Lookup provinsi by NAMA (paling reliable, karena kode berbeda format antara DB & master-wilayah)
  * Lookup kabupaten by kode Kemendagri 4-digit + provinsiId
  * Auto-create kabupaten dari MASTER_KABUPATEN jika belum ada di DB (memastikan semua 514 kabupaten di Indonesia bisa daftar)
  * Tambahkan handling Prisma error spesifik (PrismaClientValidationError, PrismaClientKnownRequestError P2003 foreign key)
  * Surface error asli ke response (bukan generic "Gagal submit pendaftaran") untuk debugging lebih mudah
- Validasi: 
  * TypeScript typecheck pass (tidak ada error baru di file yang diubah)
  * Test curl dengan Bandung Barat (3204) → HTTP 200 sukses
  * Test curl dengan Garut (3211, belum ada di DB) → HTTP 200 sukses, kabupaten auto-created
  * Cleanup test data berhasil

Stage Summary:
- Bug utama: parseInt(nama_provinsi) menghasilkan NaN → Prisma create gagal
- Bug sekunder: kode provinsi tidak konsisten antara DB dan master-wilayah
- Bug tersier: hanya 10 kabupaten ter-seed di DB
- Files modified:
  * src/components/sections/PendaftaranAnggota.tsx (payload construction)
  * src/app/api/pendaftaran/route.ts (lookup + auto-create + error handling)
- Pendaftaran anggota sekarang berfungsi untuk semua 38 provinsi dan 514 kabupaten di Indonesia
