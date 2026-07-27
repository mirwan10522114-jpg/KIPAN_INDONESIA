import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { MASTER_KABUPATEN } from "@/lib/master-wilayah";

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
      "jenisKelamin", "alamat", "provinsiNama", "kabupatenKode",
      "email", "hp",
    ];
    for (const field of requiredFields) {
      if (!body[field] || String(body[field]).trim() === "") {
        return NextResponse.json(
          { success: false, error: `Field ${field} wajib diisi` },
          { status: 400 }
        );
      }
    }

    // Validasi NIK 16 digit
    if (String(body.nik).length !== 16) {
      return NextResponse.json(
        { success: false, error: "NIK harus 16 digit" },
        { status: 400 }
      );
    }

    // Validasi umur 16-30 tahun
    const tanggalLahir = new Date(body.tanggalLahir);
    if (isNaN(tanggalLahir.getTime())) {
      return NextResponse.json(
        { success: false, error: "Tanggal lahir tidak valid" },
        { status: 400 }
      );
    }
    const umur = new Date().getFullYear() - tanggalLahir.getFullYear();
    if (umur < 16 || umur > 30) {
      return NextResponse.json(
        { success: false, error: "Umur harus antara 16-30 tahun" },
        { status: 400 }
      );
    }

    // Lookup Provinsi by nama (DB menggunakan kode 2-huruf yang berbeda dari master-wilayah,
    // jadi lookup by nama adalah yang paling reliable)
    const provinsi = await db.provinsi.findFirst({
      where: { nama: String(body.provinsiNama) },
    });
    if (!provinsi) {
      return NextResponse.json(
        {
          success: false,
          error: `Provinsi "${body.provinsiNama}" belum terdaftar di database. Jalankan seed-provinsi terlebih dahulu.`,
        },
        { status: 400 }
      );
    }

    // Lookup Kabupaten by kode Kemendagri (4-digit) — pastikan milik provinsi yg dipilih
    let kabupaten = await db.kabupaten.findFirst({
      where: {
        kode: String(body.kabupatenKode),
        provinsiId: provinsi.id,
      },
    });
    if (!kabupaten) {
      // Auto-create kabupaten dari master-wilayah jika belum ada di DB
      // ini memastikan user dari kabupaten manapun di Indonesia bisa mendaftar
      const masterKab = MASTER_KABUPATEN.find(
        (k) => k.kode === String(body.kabupatenKode)
      );
      if (!masterKab) {
        return NextResponse.json(
          {
            success: false,
            error: `Kabupaten dengan kode ${body.kabupatenKode} tidak ditemukan di master wilayah.`,
          },
          { status: 400 }
        );
      }
      kabupaten = await db.kabupaten.create({
        data: {
          kode: masterKab.kode,
          nama: masterKab.nama,
          provinsiId: provinsi.id,
          status: "Aktif",
        },
      });
      console.log(`[pendaftaran] Auto-created kabupaten: ${kabupaten.nama} (${kabupaten.kode})`);
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
        provinsiId: provinsi.id,
        kabupatenId: kabupaten.id,
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
    // Tangani Prisma error secara spesifik
    if (error instanceof Prisma.PrismaClientValidationError) {
      console.error("POST /api/pendaftaran validation error:", error.message);
      return NextResponse.json(
        { success: false, error: "Data pendaftaran tidak valid: " + error.message.split("\n").slice(0, 3).join(" ") },
        { status: 400 }
      );
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("POST /api/pendaftaran known error:", error.code, error.message);
      const msg =
        error.code === "P2003"
          ? "Referensi provinsi/kabupaten tidak valid (foreign key constraint failed)."
          : `Database error (${error.code}): ${error.message}`;
      return NextResponse.json(
        { success: false, error: msg },
        { status: 400 }
      );
    }
    console.error("POST /api/pendaftaran error:", error);
    const detail = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Gagal submit pendaftaran: ${detail}` },
      { status: 500 }
    );
  }
}
