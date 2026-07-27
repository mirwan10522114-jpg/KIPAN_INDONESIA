import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PATCH /api/pengurus/[id] — Update pengurus (status, nomorSK, tanggalMulai, tanggalSelesai, fileSK)
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);
    const body = await req.json();

    const data: any = {};
    if (body.status !== undefined) data.status = body.status;
    if (body.nomorSK !== undefined) data.nomorSK = body.nomorSK;
    if (body.tanggalMulai !== undefined) {
      data.tanggalMulai = body.tanggalMulai ? new Date(body.tanggalMulai) : undefined;
    }
    if (body.tanggalSelesai !== undefined) {
      data.tanggalSelesai = body.tanggalSelesai ? new Date(body.tanggalSelesai) : null;
    }
    if (body.fileSK !== undefined) data.fileSK = body.fileSK || null;

    const updated = await db.pengurus.update({
      where: { id },
      data,
      include: {
        anggota: { select: { namaLengkap: true } },
        jabatan: { select: { nama: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Data pengurus berhasil diperbarui",
    });
  } catch (error) {
    console.error("PATCH /api/pengurus/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui data pengurus" },
      { status: 500 }
    );
  }
}
