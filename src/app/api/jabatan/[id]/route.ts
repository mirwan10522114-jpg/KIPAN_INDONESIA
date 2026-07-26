import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ============================================================
// PATCH /api/jabatan/[id] — Update jabatan (nama, bidang, urutan, status)
// ============================================================
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);
    const body = await req.json();

    const data: any = {};
    if (body.nama !== undefined) data.nama = body.nama;
    if (body.bidang !== undefined) data.bidang = body.bidang;
    if (body.urutan !== undefined) data.urutan = Number(body.urutan);
    if (body.status !== undefined) data.status = body.status;
    if (body.level !== undefined) {
      const validLevels = ["Nasional", "Provinsi", "Kabupaten"];
      if (!validLevels.includes(body.level)) {
        return NextResponse.json(
          { success: false, error: "Level harus Nasional, Provinsi, atau Kabupaten" },
          { status: 400 }
        );
      }
      data.level = body.level;
    }

    const updated = await db.jabatan.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Jabatan berhasil diperbarui",
    });
  } catch (error) {
    console.error("PATCH /api/jabatan/[id] error:", error);
    return NextResponse.json({ success: false, error: "Gagal memperbarui jabatan" }, { status: 500 });
  }
}

// ============================================================
// DELETE /api/jabatan/[id] — Hapus jabatan (jika tidak dipakai pengurus)
// ============================================================
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);

    // Cek apakah dipakai pengurus
    const pengurusCount = await db.pengurus.count({ where: { jabatanId: id } });
    if (pengurusCount > 0) {
      return NextResponse.json(
        { success: false, error: `Jabatan tidak bisa dihapus karena masih dipakai oleh ${pengurusCount} pengurus. Nonaktifkan saja.` },
        { status: 400 }
      );
    }

    await db.jabatan.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Jabatan berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE /api/jabatan/[id] error:", error);
    return NextResponse.json({ success: false, error: "Gagal menghapus jabatan" }, { status: 500 });
  }
}
