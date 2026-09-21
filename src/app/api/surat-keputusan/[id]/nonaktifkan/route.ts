import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

// POST /api/surat-keputusan/[id]/nonaktifkan — Nonaktifkan SK + cascade semua pengurus
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);

    const sk = await db.suratKeputusan.findUnique({ where: { id } });
    if (!sk) {
      return NextResponse.json({ success: false, error: "SK tidak ditemukan." }, { status: 404 });
    }
    if (sk.status === "TidakAktif") {
      return NextResponse.json(
        { success: false, error: "SK sudah dinonaktifkan sebelumnya." },
        { status: 400 }
      );
    }

    let body = { keterangan: "", statusPengurus: "Demisioner", role: "SUPER_ADMIN" };
    try {
      body = await req.json();
    } catch (e) {
      // ignore if no body
    }

    const { keterangan, statusPengurus, role } = body;
    const finalStatus = statusPengurus || "Demisioner";

    // Validasi Hak Akses berdasar Tingkat SK
    const canNonaktifkan = () => {
      if (role === "SUPER_ADMIN" || role === "ADMIN_NASIONAL") return true;
      if (role === "ADMIN_PROVINSI" && (sk.level === "PROVINSI" || sk.level === "KABUPATEN")) return true;
      if (role === "ADMIN_KABUPATEN" && sk.level === "KABUPATEN") return true;
      return false;
    };

    if (!canNonaktifkan()) {
      return NextResponse.json({ success: false, error: "Akses ditolak: Anda tidak memiliki hak untuk menonaktifkan SK ini." }, { status: 403 });
    }

    // Transaction: nonaktifkan SK + semua pengurus terkait
    const result = await db.$transaction(async (tx) => {
      // 1. Nonaktifkan SK
      await tx.suratKeputusan.update({
        where: { id },
        data: { status: "TidakAktif" },
      });

      // 2. Update semua pengurus aktif di SK ini
      const updated = await tx.pengurus.updateMany({
        where: {
          suratKeputusanId: id,
          status: "Aktif",
        },
        data: {
          status: finalStatus,
          keteranganStatus: keterangan || null,
          tanggalSelesai: new Date(),
        },
      });

      return updated.count;
    });

    await db.activityLog.create({
      data: {
        table: "surat_keputusan",
        recordId: id,
        aksi: "nonaktifkan_sk",
        oleh: "Admin",
        detail: JSON.stringify({
          nomorSK: sk.nomorSK,
          pengurusSelesai: result,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `SK "${sk.nomorSK}" berhasil dinonaktifkan. ${result} pengurus otomatis berstatus "Demisioner".`,
    });
  } catch (error) {
    return handleApiError(error, "POST /api/surat-keputusan/[id]/nonaktifkan", "Gagal menonaktifkan SK");
  }
}
