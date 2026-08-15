import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

// ============================================================
// GET /api/pendaftaran/track?nomor=REG-YYYYMM-XXXX
// Public endpoint — untuk tracking status pendaftaran di landing page
// Hanya return info minimal: nomor, nama, status, catatan, timeline, createdAt
// TIDAK return data sensitif (NIK, alamat lengkap, dokumen, dll)
// ============================================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const nomor = searchParams.get("nomor");

    if (!nomor || !nomor.trim()) {
      return NextResponse.json(
        { success: false, error: "Nomor pendaftaran wajib diisi" },
        { status: 400 }
      );
    }

    // Normalize: trim & uppercase
    const nomorNormalized = nomor.trim().toUpperCase();

    // Validasi format dasar: REG-YYYYMM-XXXX
    if (!/^REG-\d{6}-\d{4}$/.test(nomorNormalized)) {
      return NextResponse.json(
        {
          success: false,
          error: "Format nomor pendaftaran tidak valid. Format yang benar: REG-YYYYMM-XXXX (contoh: REG-202607-0001)",
        },
        { status: 400 }
      );
    }

    const pendaftaran = await db.pendaftaran.findUnique({
      where: { nomorPendaftaran: nomorNormalized },
      select: {
        nomorPendaftaran: true,
        namaLengkap: true,
        status: true,
        catatan: true,
        createdAt: true,
        updatedAt: true,
        provinsi: { select: { nama: true } },
        kabupaten: { select: { nama: true } },
        riwayat: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            aksi: true,
            oleh: true,
            catatan: true,
            createdAt: true,
          },
        },
      },
    });

    if (!pendaftaran) {
      // Jika tidak ditemukan, kemungkinan sudah disetujui & dihapus
      return NextResponse.json(
        {
          success: false,
          error: "Nomor pendaftaran tidak ditemukan. Jika pendaftaran Anda sudah disetujui, data pendaftar dihapus dari sistem dan Anda kini terdaftar sebagai Pengurus. Silakan cek di menu Pengurus.",
          notFound: true,
        },
        { status: 404 }
      );
    }

    // Map status ke label & warna untuk UI
    const statusMap: Record<string, { label: string; color: string; desc: string }> = {
      DIAJUKAN: {
        label: "Pendaftaran Diterima",
        color: "blue",
        desc: "Pendaftaran Anda sudah diterima dan menunggu verifikasi admin. Proses verifikasi biasanya 3-5 hari kerja.",
      },
      DIVERIFIKASI: {
        label: "Sedang Diverifikasi",
        color: "amber",
        desc: "Admin sedang memverifikasi dokumen dan data Anda. Mohon tunggu hasil verifikasi.",
      },
      PERBAIKAN: {
        label: "Perlu Perbaikan",
        color: "orange",
        desc: "Ada dokumen atau data yang perlu diperbaiki. Silakan periksa catatan admin dan hubungi pengurus wilayah Anda.",
      },
      DITOLAK: {
        label: "Pendaftaran Ditolak",
        color: "red",
        desc: "Mohon maaf, pendaftaran Anda ditolak. Silakan lihat catatan admin untuk detail.",
      },
      DISETUJUI: {
        label: "Disetujui — Menjadi Pengurus",
        color: "green",
        desc: "Selamat! Pendaftaran Anda disetujui. Anda kini terdaftar sebagai Pengurus KIPAN. Silakan login ke dashboard atau hubungi pengurus wilayah untuk informasi selanjutnya.",
      },
    };

    const statusInfo = statusMap[pendaftaran.status] || {
      label: pendaftaran.status,
      color: "gray",
      desc: "Status tidak dikenali.",
    };

    return NextResponse.json({
      success: true,
      data: {
        nomorPendaftaran: pendaftaran.nomorPendaftaran,
        namaLengkap: pendaftaran.namaLengkap,
        status: pendaftaran.status,
        statusInfo,
        catatan: pendaftaran.catatan,
        provinsiNama: pendaftaran.provinsi?.nama || null,
        kabupatenNama: pendaftaran.kabupaten?.nama || null,
        createdAt: pendaftaran.createdAt,
        updatedAt: pendaftaran.updatedAt,
        timeline: pendaftaran.riwayat,
      },
    });
  } catch (error) {
    return handleApiError(error, "GET /api/pendaftaran/track", "Gagal tracking pendaftaran");
  }
}
