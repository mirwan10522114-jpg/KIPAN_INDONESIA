import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/anggota — List anggota dengan filter
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const provinsiId = searchParams.get("provinsiId");
    const search = searchParams.get("search");

    const where: any = {};
    if (status && status !== "Semua") where.status = status;
    if (provinsiId && provinsiId !== "Semua") where.provinsiId = parseInt(provinsiId);
    if (search) {
      where.OR = [
        { namaLengkap: { contains: search } },
        { nia: { contains: search } },
        { nik: { contains: search } },
      ];
    }

    const anggota = await db.anggota.findMany({
      where,
      include: {
        provinsi: { select: { nama: true, kode: true } },
        kabupaten: { select: { nama: true, kode: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: anggota,
      total: anggota.length,
    });
  } catch (error) {
    console.error("GET /api/anggota error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data anggota" },
      { status: 500 }
    );
  }
}
