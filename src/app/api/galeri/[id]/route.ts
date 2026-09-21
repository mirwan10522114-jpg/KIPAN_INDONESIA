import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// DELETE /api/galeri/[id]
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: "ID tidak valid" }, { status: 400 });
    }

    await db.galeri.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Foto berhasil dihapus dari galeri." });
  } catch (error) {
    console.error("DELETE /api/galeri/[id] error:", error);
    return NextResponse.json({ success: false, error: "Gagal menghapus foto galeri" }, { status: 500 });
  }
}
