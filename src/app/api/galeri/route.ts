import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const kategori = searchParams.get("kategori");

    const where = kategori && kategori !== "Semua" ? { kategori } : {};

    const galeri = await db.galeri.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: galeri, total: galeri.length });
  } catch (error) {
    console.error("GET /api/galeri error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data galeri" }, { status: 500 });
  }
}
