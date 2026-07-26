import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tingkat = searchParams.get("tingkat");

    const where = tingkat && tingkat !== "Semua" ? { tingkat } : {};

    const program = await db.programKerja.findMany({
      where,
      orderBy: { tanggalMulai: "desc" },
    });

    return NextResponse.json({ success: true, data: program, total: program.length });
  } catch (error) {
    console.error("GET /api/program error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data program" }, { status: 500 });
  }
}
