import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const level = searchParams.get("level") || "";

    const where: any = {};
    if (level && level !== "Semua") {
      where.level = level;
    }

    const jabatan = await db.jabatan.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: jabatan,
    });
  } catch (error) {
    return handleApiError(error, "GET /api/jabatan", "Gagal mengambil data jabatan");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.nama || !body.level) {
      return NextResponse.json({ success: false, error: "Nama dan Level jabatan wajib diisi." }, { status: 400 });
    }

    const newJabatan = await db.jabatan.create({
      data: {
        nama: body.nama,
        level: body.level,
      },
    });

    return NextResponse.json({
      success: true,
      data: newJabatan,
      message: "Jabatan berhasil ditambahkan",
    });
  } catch (error) {
    return handleApiError(error, "POST /api/jabatan", "Gagal menambahkan jabatan");
  }
}
