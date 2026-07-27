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

    // Build update data — hanya field yang diberikan (undefined = tidak diubah)
    const data: any = {};
    if (body.namaLengkap !== undefined) data.namaLengkap = body.namaLengkap;
    if (body.nik !== undefined) data.nik = body.nik;
    if (body.tempatLahir !== undefined) data.tempatLahir = body.tempatLahir;
    if (body.tanggalLahir !== undefined) data.tanggalLahir = body.tanggalLahir ? new Date(body.tanggalLahir) : undefined;
    if (body.jenisKelamin !== undefined) data.jenisKelamin = body.jenisKelamin;
    if (body.agama !== undefined) data.agama = body.agama || null;
    if (body.pendidikan !== undefined) data.pendidikan = body.pendidikan || null;
    if (body.pekerjaan !== undefined) data.pekerjaan = body.pekerjaan || null;
    if (body.alamat !== undefined) data.alamat = body.alamat;
    if (body.kecamatan !== undefined) data.kecamatan = body.kecamatan || null;
    if (body.desa !== undefined) data.desa = body.desa || null;
    if (body.kodePos !== undefined) data.kodePos = body.kodePos || null;
    if (body.email !== undefined) data.email = body.email;
    if (body.hp !== undefined) data.hp = body.hp;
    if (body.whatsapp !== undefined) data.whatsapp = body.whatsapp || null;
    if (body.foto !== undefined) data.foto = body.foto || null;
    if (body.ktp !== undefined) data.ktp = body.ktp || null;
    if (body.cv !== undefined) data.cv = body.cv || null;
    if (body.suratPernyataan !== undefined) data.suratPernyataan = body.suratPernyataan || null;
    if (body.suratSehat !== undefined) data.suratSehat = body.suratSehat || null;
    if (body.angkatan !== undefined) data.angkatan = body.angkatan || null;

    const updated = await db.anggota.update({
      where: { id },
      data,
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
