import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ============================================================
// GET /api/pendaftaran — List semua pendaftaran
// ============================================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where = status && status !== "Semua" ? { status } : {};

    const pendaftaran = await db.pendaftaran.findMany({
      where,
      include: {
        provinsi: { select: { id: true, nama: true, kode: true } },
        kabupaten: { select: { id: true, nama: true, kode: true } },
        riwayat: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: pendaftaran,
      total: pendaftaran.length,
    });
  } catch (error) {
    console.error("GET /api/pendaftaran error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data pendaftaran" },
      { status: 500 }
    );
  }
}

// ============================================================
// POST /api/pendaftaran — Submit pendaftaran baru
// ============================================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validasi field wajib
    const requiredFields = [
      "namaLengkap", "nik", "tempatLahir", "tanggalLahir",
      "jenisKelamin", "alamat", "provinsiId", "kabupatenId",
      "email", "hp",
    ];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Field ${field} wajib diisi` },
          { status: 400 }
        );
      }
    }

    // Validasi NIK 16 digit
    if (body.nik.length !== 16) {
      return NextResponse.json(
        { success: false, error: "NIK harus 16 digit" },
        { status: 400 }
      );
    }

    // Validasi umur 16-30 tahun
    const tanggalLahir = new Date(body.tanggalLahir);
    const umur = new Date().getFullYear() - tanggalLahir.getFullYear();
    if (umur < 16 || umur > 30) {
      return NextResponse.json(
        { success: false, error: "Umur harus antara 16-30 tahun" },
        { status: 400 }
      );
    }

    const pendaftaran = await db.pendaftaran.create({
      data: {
        namaLengkap: body.namaLengkap,
        nik: body.nik,
        tempatLahir: body.tempatLahir,
        tanggalLahir: tanggalLahir,
        jenisKelamin: body.jenisKelamin,
        agama: body.agama || null,
        pendidikan: body.pendidikan || null,
        pekerjaan: body.pekerjaan || null,
        statusPribadi: body.statusPribadi || null,
        alamat: body.alamat,
        provinsiId: parseInt(body.provinsiId),
        kabupatenId: parseInt(body.kabupatenId),
        kecamatan: body.kecamatan || null,
        desa: body.desa || null,
        kodePos: body.kodePos || null,
        email: body.email,
        hp: body.hp,
        whatsapp: body.whatsapp || body.hp,
        motivasi: body.motivasi || null,
        foto: body.foto || null,
        ktp: body.ktp || null,
        cv: body.cv || null,
        suratPernyataan: body.suratPernyataan || null,
        suratSehat: body.suratSehat || null,
        persyaratan: JSON.stringify(body.persyaratan || []),
        status: "DIAJUKAN",
      },
    });

    // Tambah riwayat
    await db.pendaftaranRiwayat.create({
      data: {
        pendaftaranId: pendaftaran.id,
        aksi: "Pendaftaran dikirim",
        oleh: "Calon Anggota",
      },
    });

    return NextResponse.json({
      success: true,
      data: pendaftaran,
      message: "Pendaftaran berhasil dikirim! Tim KIPAN akan memverifikasi dalam 3-5 hari kerja.",
    });
  } catch (error) {
    console.error("POST /api/pendaftaran error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal submit pendaftaran" },
      { status: 500 }
    );
  }
}
