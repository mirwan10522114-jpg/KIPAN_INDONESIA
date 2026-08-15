// ============================================================
// Helper: Generate NIA (Nomor Induk Anggota/Pengurus) KIPAN
// Format: KIPAN-{PROV_KODE}-{KAB_KODE}-{TAHUN}-{GLOBAL_SEQ}
//
// Contoh: KIPAN-JB-3204-2026-00001
//
// Aturan:
// - PROV_KODE: 2 huruf kode provinsi (JB, JK, BA, dll)
// - KAB_KODE: 4 digit kode Kemendagri/BPS (3204, 3171, 5171, dll)
// - TAHUN: tahun disetujui menjadi anggota
// - GLOBAL_SEQ: nomor urut global nasional (5 digit, padded)
//   TIDAK direset per tahun/kabupaten — pakai anggota.id (auto-increment DB)
//   Jadi 100% unik, tidak mungkin duplicate
// ============================================================

import { db } from "./db";

export interface NIAInput {
  provinsiId: number;
  kabupatenId?: number | null;
  tahun?: number; // default: current year
}

/**
 * Generate NIA baru untuk anggota/pengurus.
 *
 * Penting: Fungsi ini dipanggil SETELAH anggota dibuat di DB,
 * supaya kita bisa pakai anggota.id sebagai global sequence.
 *
 * @param anggotaId - ID anggota dari database (auto-increment, global unik)
 * @param input - Data wilayah & tahun
 * @returns NIA string, contoh: "KIPAN-JB-3204-2026-00001"
 */
export async function generateNIA(
  anggotaId: number,
  input: NIAInput
): Promise<string> {
  const { provinsiId, kabupatenId, tahun = new Date().getFullYear() } = input;

  // Get provinsi kode
  const provinsi = await db.provinsi.findUnique({
    where: { id: provinsiId },
    select: { kode: true, nama: true },
  });
  if (!provinsi) {
    throw new Error(`Provinsi dengan id ${provinsiId} tidak ditemukan`);
  }

  // Get kabupaten kode (4 digit Kemendagri)
  let kabKode = "0000";
  if (kabupatenId) {
    const kabupaten = await db.kabupaten.findUnique({
      where: { id: kabupatenId },
      select: { kode: true, nama: true },
    });
    if (kabupaten) {
      // Ambil 4 digit pertama (jika ada ekstra seperti "3204-BDG", ambil 3204)
      const match = kabupaten.kode.match(/^\d{4}/);
      kabKode = match ? match[0] : kabupaten.kode.slice(0, 4).padEnd(4, "0");
    }
  }

  // Global sequence: pakai anggota.id (auto-increment, tidak pernah reset)
  const seq = String(anggotaId).padStart(5, "0");

  return `KIPAN-${provinsi.kode}-${kabKode}-${tahun}-${seq}`;
}

/**
 * Versi sync (untuk backward compatibility / testing).
 * Tidak query DB — caller harus provide kode provinsi & kabupaten.
 */
export function generateNIAFromKode(
  anggotaId: number,
  provKode: string,
  kabKode: string,
  tahun: number = new Date().getFullYear()
): string {
  // Ambil 4 digit pertama kabKode
  const match = kabKode.match(/^\d{4}/);
  const kab4 = match ? match[0] : kabKode.slice(0, 4).padEnd(4, "0");
  const seq = String(anggotaId).padStart(5, "0");
  return `KIPAN-${provKode}-${kab4}-${tahun}-${seq}`;
}
