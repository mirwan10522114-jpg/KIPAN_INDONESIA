import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { encryptNIK } from "@/lib/encryption";

// --- Rate Limiting Setup ---
// Menggunakan in-memory Map untuk membatasi jumlah request (anti-scraping)
// Standar UU PDP mengharuskan perlindungan terhadap brute-force data
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 menit
const MAX_REQUESTS_PER_WINDOW = 5; // Max 5 pencarian per IP per menit

// Menyimpan cache di global object agar tidak hilang saat hot-reload di dev
const globalAny = global as any;
const rateLimitCache = globalAny.rateLimitCache || new Map<string, { count: number; resetTime: number }>();
if (process.env.NODE_ENV !== "production") globalAny.rateLimitCache = rateLimitCache;
// -----------------------------

// GET /api/anggota/cek?q=NIK_ATAU_NIA
export async function GET(req: NextRequest) {
  try {
    // 1. Eksekusi Rate Limiting berdasarkan IP
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown-ip";
    const now = Date.now();
    const record = rateLimitCache.get(ip);

    if (record) {
      if (now > record.resetTime) {
        rateLimitCache.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
      } else {
        if (record.count >= MAX_REQUESTS_PER_WINDOW) {
          return NextResponse.json(
            { success: false, error: "Terlalu banyak pencarian. Silakan coba lagi dalam 1 menit (Anti-Scraping aktif)." },
            { status: 429 }
          );
        }
        record.count += 1;
        rateLimitCache.set(ip, record);
      }
    } else {
      rateLimitCache.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    }

    // Auto cleanup cache (10% chance per request) untuk mencegah memory leak
    if (Math.random() < 0.1) {
      for (const [key, val] of rateLimitCache.entries()) {
        if (now > val.resetTime) rateLimitCache.delete(key);
      }
    }

    // 2. Lanjut ke proses validasi & enkripsi
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q || !q.trim()) {
      return NextResponse.json(
        { success: false, error: "Nomor identitas wajib diisi" },
        { status: 400 }
      );
    }

    const query = q.trim();
    const isNIK = query.length === 16 && /^\d+$/.test(query);

    let anggota: any = null;

    if (isNIK) {
      // Jika NIK, kita enkripsi dulu sebelum mencari di database
      const encryptedNIK = encryptNIK(query);
      anggota = await db.anggota.findFirst({
        where: { nik: encryptedNIK },
        include: {
          provinsi: { select: { nama: true } },
          kabupaten: { select: { nama: true } },
          pengurus: { 
            include: { suratKeputusan: true },
            orderBy: { id: "desc" },
            take: 1
          }
        }
      });
    } else {
      // Jika NIA (Nomor Anggota)
      anggota = await db.anggota.findUnique({
        where: { nia: query },
        include: {
          provinsi: { select: { nama: true } },
          kabupaten: { select: { nama: true } },
          pengurus: { 
            include: { suratKeputusan: true },
            orderBy: { id: "desc" },
            take: 1
          }
        }
      });
    }

    if (!anggota) {
      return NextResponse.json(
        { success: false, error: "Data keanggotaan tidak ditemukan." },
        { status: 404 }
      );
    }

    // Kembalikan data yang dibutuhkan (termasuk untuk render KTA)
    return NextResponse.json({
      success: true,
      data: {
        nia: anggota.nia,
        namaLengkap: anggota.namaLengkap,
        foto: anggota.foto,
        tempatLahir: anggota.tempatLahir,
        tanggalLahir: anggota.tanggalLahir,
        jenisKelamin: anggota.jenisKelamin,
        agama: anggota.agama,
        alamat: anggota.alamat,
        provinsi: anggota.provinsi.nama,
        kabupaten: anggota.kabupaten.nama,
        status: anggota.status,
        jabatan: anggota.pengurus.length > 0 && anggota.pengurus[0].suratKeputusan ? (anggota.pengurus[0].level === "NASIONAL" ? "Pengurus Nasional" : anggota.pengurus[0].level === "PROVINSI" ? "Pengurus Provinsi" : "Pengurus Kabupaten/Kota") : "Anggota",
        tanggalAngkat: anggota.tanggalAngkat,
      }
    });

  } catch (error) {
    console.error("GET /api/anggota/cek error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
