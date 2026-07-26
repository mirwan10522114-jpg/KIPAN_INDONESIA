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
        jabatan: { select: { nama: true, level: true, urutan: true } },
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
      return NextResponse.json({ success: false, error: "Anggota dan jabatan wajib diisi" }, { status: 400 });
    }

    // Rule 2: Check if anggota already has active jabatan at same level
    const existingActive = await db.pengurus.findFirst({
      where: {
        anggotaId: parseInt(body.anggotaId),
        status: "Aktif",
        level: body.level,
      },
    });

    if (existingActive) {
      return NextResponse.json({ success: false, error: "Anggota ini sudah memiliki jabatan aktif di level yang sama" }, { status: 400 });
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
        jabatan: { select: { nama: true, level: true } },
        provinsi: { select: { nama: true } },
        kabupaten: { select: { nama: true } },
      },
    });

    return NextResponse.json({ success: true, data: pengurus, message: "Pengurus berhasil ditambahkan" });
  } catch (error) {
    console.error("POST /api/pengurus error:", error);
    return NextResponse.json({ success: false, error: "Gagal menambahkan pengurus" }, { status: 500 });
  }
}
