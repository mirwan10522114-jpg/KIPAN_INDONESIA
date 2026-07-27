import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const level = searchParams.get("level");
    const where: any = {};
    if (level && level !== "Semua") where.level = level;

    const pengurus = await db.pengurus.findMany({
      where,
      include: {
        anggota: {
          include: {
            provinsi: { select: { nama: true, kode: true } },
            kabupaten: { select: { nama: true, kode: true } },
          },
        },
        jabatan: { select: { nama: true, bidang: true, level: true, urutan: true } },
        provinsi: { select: { nama: true, kode: true } },
        kabupaten: { select: { nama: true, kode: true } },
      },
      orderBy: [{ level: "asc" }, { jabatan: { urutan: "asc" } }],
    });

    return NextResponse.json({ success: true, data: pengurus, total: pengurus.length });
  } catch (error) {
    console.error("GET /api/pengurus error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data pengurus" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.anggotaId || !body.jabatanId) {
      return NextResponse.json({ success: false, error: "Pengurus wajib memiliki jabatan. Pilih anggota dan jabatan terlebih dahulu." }, { status: 400 });
    }

    // Validasi: jabatanId harus ada di database
    const jabatanExists = await db.jabatan.findUnique({ where: { id: parseInt(body.jabatanId) } });
    if (!jabatanExists) {
      return NextResponse.json({ success: false, error: "Jabatan tidak ditemukan. Pilih jabatan yang valid." }, { status: 400 });
    }

    // Rule 2: Check if anggota already has ANY active jabatan (di level mana pun)
    // Aturan: 1 orang hanya boleh pegang 1 jabatan aktif (tidak boleh double jabatan antar level)
    const existingActive = await db.pengurus.findFirst({
      where: {
        anggotaId: parseInt(body.anggotaId),
        status: "Aktif",
      },
      include: { jabatan: true },
    });

    if (existingActive) {
      return NextResponse.json({
        success: false,
        error: `Pengurus ini sudah memiliki jabatan aktif sebagai "${existingActive.jabatan?.nama}" (${existingActive.jabatan?.bidang}) di level ${existingActive.level}. Akhiri jabatan lama terlebih dahulu sebelum menunjuk jabatan baru. Aturan: 1 orang hanya boleh pegang 1 jabatan aktif.`,
      }, { status: 400 });
    }

    const data: any = {
      anggotaId: parseInt(body.anggotaId),
      jabatanId: parseInt(body.jabatanId),
      level: body.level,
      status: body.status || "Aktif",
      tanggalMulai: body.tanggalMulai ? new Date(body.tanggalMulai) : new Date(),
      tanggalSelesai: body.tanggalSelesai ? new Date(body.tanggalSelesai) : null,
      nomorSK: body.nomorSK || "",
      fileSK: body.fileSK || null,
    };
    if (body.provinsiId) data.provinsiId = parseInt(body.provinsiId);
    if (body.kabupatenId) data.kabupatenId = parseInt(body.kabupatenId);

    const pengurus = await db.pengurus.create({
      data,
      include: {
        anggota: { include: { provinsi: { select: { nama: true } }, kabupaten: { select: { nama: true } } } },
        jabatan: { select: { nama: true, bidang: true, level: true, urutan: true } },
        provinsi: { select: { nama: true } },
        kabupaten: { select: { nama: true } },
      },
    });

    return NextResponse.json({ success: true, data: pengurus, message: `Pengurus berhasil ditambahkan dengan jabatan "${jabatanExists.nama}" di bidang "${jabatanExists.bidang}"` });
  } catch (error) {
    console.error("POST /api/pengurus error:", error);
    return NextResponse.json({ success: false, error: "Gagal menambahkan pengurus" }, { status: 500 });
  }
}
