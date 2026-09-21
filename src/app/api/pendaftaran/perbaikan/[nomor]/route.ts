import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ nomor: string }> }
) {
  try {
    const { nomor } = await context.params;
    const nomorNormalized = nomor.trim().toUpperCase();

    const pendaftaran = await db.pendaftaran.findUnique({
      where: { nomorPendaftaran: nomorNormalized },
      include: {
        provinsi: true,
        kabupaten: true
      }
    });

    if (!pendaftaran) {
      return NextResponse.json(
        { success: false, error: "Pendaftaran tidak ditemukan" },
        { status: 404 }
      );
    }

    if (pendaftaran.status !== "PERBAIKAN") {
      return NextResponse.json(
        { success: false, error: "Pendaftaran ini tidak dalam status PERBAIKAN." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: pendaftaran });
  } catch (error) {
    return handleApiError(error, "GET /api/pendaftaran/perbaikan/[nomor]", "Gagal mengambil data perbaikan");
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ nomor: string }> }
) {
  try {
    const { nomor } = await context.params;
    const nomorNormalized = nomor.trim().toUpperCase();
    const body = await req.json();

    const existing = await db.pendaftaran.findUnique({
      where: { nomorPendaftaran: nomorNormalized },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Pendaftaran tidak ditemukan" },
        { status: 404 }
      );
    }

    if (existing.status !== "PERBAIKAN") {
      return NextResponse.json(
        { success: false, error: "Pendaftaran ini tidak dalam status PERBAIKAN." },
        { status: 400 }
      );
    }

    // Update the record, setting status back to DIAJUKAN
    const updated = await db.pendaftaran.update({
      where: { id: existing.id },
      data: {
        namaLengkap: body.namaLengkap,
        nik: body.nik,
        tempatLahir: body.tempatLahir,
        tanggalLahir: new Date(body.tanggalLahir),
        jenisKelamin: body.jenisKelamin,
        agama: body.agama,
        pendidikan: body.pendidikan,
        pekerjaan: body.pekerjaan,
        statusPribadi: body.statusPribadi,
        alamat: body.alamat,
        provinsiId: parseInt(body.provinsiId),
        kabupatenId: parseInt(body.kabupatenId),
        kecamatan: body.kecamatan,
        desa: body.desa,
        kodePos: body.kodePos,
        email: body.email,
        whatsapp: body.whatsapp,
        motivasi: body.motivasi,
        persyaratan: body.persyaratan,

        // Only update files if they are provided, otherwise keep existing
        foto: body.foto || existing.foto,
        ktp: body.ktp || existing.ktp,
        cv: body.cv || existing.cv,
        suratPernyataan: body.suratPernyataan || existing.suratPernyataan,
        suratSehat: body.suratSehat || existing.suratSehat,

        status: "DIAJUKAN",
      },
    });

    // Log to history
    await db.pendaftaranRiwayat.create({
      data: {
        pendaftaranId: existing.id,
        aksi: "Pendaftar mengirimkan perbaikan data dan dokumen.",
        oleh: "Pendaftar",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Perbaikan data berhasil disimpan. Silakan lacak kembali status pendaftaran Anda secara berkala.",
      data: updated,
    });
  } catch (error) {
    return handleApiError(error, "PUT /api/pendaftaran/perbaikan/[nomor]", "Gagal menyimpan perbaikan data");
  }
}
