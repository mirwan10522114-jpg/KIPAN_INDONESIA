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

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error, "POST /api/surat-keputusan/[id]/approve", "Gagal memperbarui status approval SK");
  }
}
