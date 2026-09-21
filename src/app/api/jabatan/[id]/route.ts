import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);
    const body = await req.json();

    if (!body.nama || !body.level) {
      return NextResponse.json({ success: false, error: "Nama dan Level jabatan wajib diisi." }, { status: 400 });
    }

    const updatedJabatan = await db.jabatan.update({
      where: { id },
      data: {
        nama: body.nama,
        level: body.level,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedJabatan,
      message: "Jabatan berhasil diperbarui",
    });
  } catch (error) {
    return handleApiError(error, "PUT /api/jabatan/[id]", "Gagal memperbarui jabatan");
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);

    // Pastikan tidak ada pengurus yang masih menggunakan jabatan ini
    const count = await db.pengurus.count({ where: { jabatanId: id } });
    if (count > 0) {
      return NextResponse.json(
        { success: false, error: "Jabatan tidak dapat dihapus karena masih digunakan oleh pengurus." },
        { status: 400 }
      );
    }

    await db.jabatan.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Jabatan berhasil dihapus",
    });
  } catch (error) {
    return handleApiError(error, "DELETE /api/jabatan/[id]", "Gagal menghapus jabatan");
  }
}
