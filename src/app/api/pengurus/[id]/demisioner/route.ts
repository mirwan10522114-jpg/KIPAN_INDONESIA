import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "ID tidak valid" }, { status: 400 });
    }

    const pengurus = await db.pengurus.findUnique({
      where: { id },
    });

    if (!pengurus) {
      return NextResponse.json({ success: false, error: "Pengurus tidak ditemukan" }, { status: 404 });
    }

    const updated = await db.pengurus.update({
      where: { id },
      data: {
        status: "Demisioner",
        tanggalSelesai: new Date(),
      },
    });

    await db.activityLog.create({
      data: {
        table: "pengurus",
        recordId: id,
        aksi: "update",
        oleh: "Admin",
        detail: JSON.stringify({ status: "Demisioner" }),
      },
    });

    return NextResponse.json({ success: true, data: updated, message: "Pengurus berhasil ditandai Demisioner" });
  } catch (error) {
    console.error("PATCH /api/pengurus/[id]/demisioner error:", error);
    return NextResponse.json({ success: false, error: "Gagal update status pengurus" }, { status: 500 });
  }
}
