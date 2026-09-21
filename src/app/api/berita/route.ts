import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const kategori = searchParams.get("kategori");
    const status = searchParams.get("status");

    const where: any = {};
    if (kategori && kategori !== "Semua") where.kategori = kategori;
    if (status) where.status = status;

    const berita = await db.berita.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: berita, total: berita.length });
  } catch (error) {
    console.error("GET /api/berita error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data berita" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const slug = body.judul.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const berita = await db.berita.create({
      data: {
        judul: body.judul,
        slug,
        kategori: body.kategori,
        excerpt: body.excerpt || "",
        konten: body.konten || "",
        thumbnail: body.thumbnail || null,
        penulis: body.penulis || "Admin",
        status: body.status || "Draft",
        publishedAt: body.status === "Published" ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, data: berita });
  } catch (error) {
    console.error("POST /api/berita error:", error);
    return NextResponse.json({ success: false, error: "Gagal membuat berita" }, { status: 500 });
  }
}
