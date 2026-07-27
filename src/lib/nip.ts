// ============================================================
// Helper: Generate NIP (Nomor Induk Pengurus) KIPAN
//
// Format: KIPAN-{PROV_KODE}-{KAB_KODE_4_DIGIT}-{TAHUN}-{GLOBAL_SEQ}
//
// Contoh: KIPAN-JB-3204-2026-00001
//
// Aturan:
// - KIPAN: konstanta organisasi
// - PROV_KODE: 2 huruf kode provinsi dari master data (JB, JK, BA, dll)
// - KAB_KODE: 4 digit kode Kemendagri/BPS dari master data (3204, 3171, 5171)
// - TAHUN: tahun pengurus diangkat
// - GLOBAL_SEQ: nomor urut global nasional (5 digit, padded)
//   TIDAK direset per tahun/kabupaten — pakai anggota.id (auto-increment DB)
//   Jadi 100% unik, tidak mungkin duplicate
//
// Catatan: Field di database tetap "nia" (untuk backward compat),
// tapi label user-facing sekarang "NIP" (Nomor Induk Pengurus)
// ============================================================

import { db } from "./db";

export interface NIPInput {
  provinsiId: number;
  kabupatenId?: number | null;
  tahun?: number; // default: current year
}

/**
 * Generate NIP baru untuk pengurus.
 *
 * Penting: Fungsi ini dipanggil SETELAH anggota dibuat di DB,
 * supaya kita bisa pakai anggota.id sebagai global sequence.
 *
 * @param anggotaId - ID anggota dari database (auto-increment, global unik)
 * @param input - Data wilayah & tahun
 * @returns NIP string, contoh: "KIPAN-JB-3204-2026-00001"
 */
export async function generateNIP(
  anggotaId: number,
  input: NIPInput
): Promise<string> {
  const { provinsiId, kabupatenId, tahun = new Date().getFullYear() } = input;

  // Get provinsi kode dari master data
  const provinsi = await db.provinsi.findUnique({
    where: { id: provinsiId },
    select: { kode: true, nama: true },
  });
  if (!provinsi) {
    throw new Error(`Provinsi dengan id ${provinsiId} tidak ditemukan`);
  }

  // Get kabupaten kode (4 digit Kemendagri) dari master data
  let kabKode = "0000";
  if (kabupatenId) {
    const kabupaten = await db.kabupaten.findUnique({
      where: { id: kabupatenId },
      select: { kode: true, nama: true },
    });
    if (kabupaten) {
      // Ambil 4 digit pertama (jika ada ekstra, ambil 4 digit depan)
      const match = kabupaten.kode.match(/^\d{4}/);
      kabKode = match ? match[0] : kabupaten.kode.slice(0, 4).padEnd(4, "0");
    }
  }

  // Global sequence: pakai anggota.id (auto-increment, tidak pernah reset)
  const seq = String(anggotaId).padStart(5, "0");

  return `KIPAN-${provinsi.kode}-${kabKode}-${tahun}-${seq}`;
}

// Backward compat alias
export const generateNIA = generateNIP;
