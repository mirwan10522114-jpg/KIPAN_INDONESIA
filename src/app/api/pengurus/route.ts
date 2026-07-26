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
        provinsi: { select: { nama: true, kode: true } },
        kabupaten: { select: { nama: true, kode: true } },
      },
      orderBy: [{ level: "asc" }, { namaLengkap: "asc" }],
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

    if (!body.namaLengkap || !body.jabatan || !body.level || !body.email) {
      return NextResponse.json({ success: false, error: "Nama, jabatan, level, dan email wajib diisi" }, { status: 400 });
    }

    const data: any = {
      namaLengkap: body.namaLengkap,
      jabatan: body.jabatan,
      level: body.level,
      foto: body.foto || null,
      email: body.email,
      hp: body.hp || null,
      status: body.status || "Aktif",
      tanggalMulai: body.tanggalMulai ? new Date(body.tanggalMulai) : new Date(),
      tanggalSelesai: body.tanggalSelesai ? new Date(body.tanggalSelesai) : null,
      nomorSK: body.nomorSK || "",
    };
    if (body.provinsiId) data.provinsiId = parseInt(body.provinsiId);
    if (body.kabupatenId) data.kabupatenId = parseInt(body.kabupatenId);

    const pengurus = await db.pengurus.create({
      data,
      include: {
        provinsi: { select: { nama: true, kode: true } },
        kabupaten: { select: { nama: true, kode: true } },
      },
    });

    return NextResponse.json({ success: true, data: pengurus, message: "Pengurus berhasil ditambahkan" });
  } catch (error) {
    console.error("POST /api/pengurus error:", error);
    return NextResponse.json({ success: false, error: "Gagal menambahkan pengurus" }, { status: 500 });
  }
}
