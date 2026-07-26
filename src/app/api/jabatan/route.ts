import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const jabatan = await db.jabatan.findMany({
      orderBy: [{ level: "asc" }, { urutan: "asc" }],
    });
    return NextResponse.json({ success: true, data: jabatan });
  } catch (error) {
    console.error("GET /api/jabatan error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil jabatan" }, { status: 500 });
  }
}
