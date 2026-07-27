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

    // Validasi format email jika diubah
    if (body.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (body.email && !emailRegex.test(body.email)) {
        return NextResponse.json({ success: false, error: "Format email tidak valid. Contoh: nama@domain.com" }, { status: 400 });
      }
    }

    // Validasi format HP Indonesia jika diubah
    if (body.hp !== undefined) {
      const hpRegex = /^08\d{8,12}$/;
      if (body.hp && !hpRegex.test(String(body.hp).replace(/[\s-]/g, ""))) {
        return NextResponse.json({ success: false, error: "Format No. HP tidak valid. Gunakan format: 08xxxxxxxxxx (8-13 digit setelah 08)" }, { status: 400 });
      }
    }

    // Validasi NIK 16 digit numeric jika diubah
    if (body.nik !== undefined && body.nik) {
      if (String(body.nik).length !== 16 || !/^\d{16}$/.test(String(body.nik))) {
        return NextResponse.json({ success: false, error: "NIK harus tepat 16 digit angka." }, { status: 400 });
      }
    }

    // Validasi tanggalLahir tidak boleh future date jika diubah
    if (body.tanggalLahir !== undefined && body.tanggalLahir) {
      const lahir = new Date(body.tanggalLahir);
      if (lahir > new Date()) {
        return NextResponse.json({ success: false, error: "Tanggal lahir tidak boleh di masa depan." }, { status: 400 });
      }
    }

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
