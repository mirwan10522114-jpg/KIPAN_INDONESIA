import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

// POST /api/surat-keputusan/[id]/approve
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);
    const body = await req.json();

    const { action, role, catatan } = body;
    // action = "APPROVE" | "REJECT"

    const sk = await db.suratKeputusan.findUnique({ where: { id } });
    if (!sk) {
      return NextResponse.json({ success: false, error: "SK tidak ditemukan" }, { status: 404 });
    }

    let nextStatus = sk.approvalStatus;

    if (action === "REJECT") {
      nextStatus = "DITOLAK";
    } else if (action === "APPROVE") {
      if (role === "ADMIN_PROVINSI" && sk.approvalStatus === "MENUNGGU_PROVINSI") {
        nextStatus = "MENUNGGU_NASIONAL";
      } else if (
        (role === "ADMIN_NASIONAL" || role === "SUPER_ADMIN") &&
        sk.approvalStatus === "MENUNGGU_NASIONAL"
      ) {
        nextStatus = "DISETUJUI";
      } else {
        return NextResponse.json({ success: false, error: "Anda tidak memiliki wewenang untuk menyetujui SK ini pada tahap sekarang." }, { status: 403 });
      }
    }

    const updated = await db.suratKeputusan.update({
      where: { id },
      data: {
        approvalStatus: nextStatus,
        catatanPenolakan: catatan || null,
      },
    });

    // Otomatis menonaktifkan SK lama (Demisioner) jika SK ini Disetujui Final (Single Active SK Rule)
    if (nextStatus === "DISETUJUI") {
      // Find old active SKs in the same level and region
      const oldSks = await db.suratKeputusan.findMany({
        where: {
          id: { not: id }, // exclude this new SK
          status: "Aktif",
          level: sk.level,
          ...(sk.level === "PROVINSI" && { provinsiId: sk.provinsiId }),
          ...(sk.level === "KABUPATEN" && { provinsiId: sk.provinsiId, kabupatenId: sk.kabupatenId }),
        }
      });

      for (const oldSk of oldSks) {
        // Nonaktifkan SK lama
        await db.suratKeputusan.update({
          where: { id: oldSk.id },
          data: { status: "Tidak Aktif" }
        });
        
        // Demisionerkan semua pengurus di SK lama
        await db.pengurus.updateMany({
          where: { suratKeputusanId: oldSk.id, status: "Aktif" },
          data: { 
            status: "Demisioner",
            keteranganStatus: `Otomatis demisioner karena SK baru (${sk.nomorSK}) telah diterbitkan dan disetujui.`,
            tanggalSelesai: sk.tanggalTerbit || new Date()
          }
        });
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error, "POST /api/surat-keputusan/[id]/approve", "Gagal memperbarui status approval SK");
  }
}
