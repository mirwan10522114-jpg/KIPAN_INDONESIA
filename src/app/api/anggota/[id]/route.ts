import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PUT /api/anggota/[id] — Update biodata anggota (data person)
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);
    const body = await req.json();

    const updated = await db.anggota.update({
      where: { id },
      data: {
        namaLengkap: body.namaLengkap,
        tempatLahir: body.tempatLahir,
        tanggalLahir: body.tanggalLahir ? new Date(body.tanggalLahir) : undefined,
        alamat: body.alamat,
        email: body.email,
        hp: body.hp,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Biodata pengurus berhasil diperbarui",
    });
  } catch (error) {
    console.error("PUT /api/anggota/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui biodata" },
      { status: 500 }
    );
  }
}
