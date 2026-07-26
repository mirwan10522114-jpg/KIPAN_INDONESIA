import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/wilayah — List provinsi & kabupaten dengan statistik
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all"; // all | provinsi | kabupaten

    if (type === "provinsi" || type === "all") {
      const provinsi = await db.provinsi.findMany({
        include: {
          _count: {
            select: {
              kabupaten: true,
              anggota: true,
              pengurus: true,
            },
          },
        },
        orderBy: { nama: "asc" },
      });

      if (type === "provinsi") {
        return NextResponse.json({ success: true, data: provinsi });
      }

      const kabupaten = await db.kabupaten.findMany({
        include: {
          provinsi: { select: { nama: true, kode: true } },
          _count: {
            select: {
              anggota: true,
              pengurus: true,
            },
          },
        },
        orderBy: { nama: "asc" },
      });

      return NextResponse.json({
        success: true,
        data: { provinsi, kabupaten },
      });
    }

    if (type === "kabupaten") {
      const kabupaten = await db.kabupaten.findMany({
        include: {
          provinsi: { select: { nama: true, kode: true } },
          _count: { select: { anggota: true, pengurus: true } },
        },
        orderBy: { nama: "asc" },
      });
      return NextResponse.json({ success: true, data: kabupaten });
    }

    return NextResponse.json({ success: false, error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("GET /api/wilayah error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data wilayah" }, { status: 500 });
  }
}
