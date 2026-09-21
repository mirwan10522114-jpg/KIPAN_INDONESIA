import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/galeri — List galeri dengan filter role & wilayah
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const kategori = searchParams.get("kategori");
    const level = searchParams.get("level");
    const role = searchParams.get("role");
    const provinsiId = searchParams.get("provinsiId");
    const kabupatenId = searchParams.get("kabupatenId");

    const where: any = {};

    if (kategori && kategori !== "Semua") where.kategori = kategori;
    if (level && level !== "Semua") where.level = level;

    // Filter berdasarkan role wilayah
    if (role === "ADMIN_PROVINSI" && provinsiId) {
      where.provinsiId = parseInt(provinsiId);
    } else if (role === "ADMIN_KABUPATEN" && kabupatenId) {
      where.kabupatenId = parseInt(kabupatenId);
    } else if (provinsiId && provinsiId !== "Semua") {
      where.provinsiId = parseInt(provinsiId);
    } else if (kabupatenId && kabupatenId !== "Semua") {
      where.kabupatenId = parseInt(kabupatenId);
    }

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

// POST /api/galeri — Tambah foto galeri baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.judul || !body.foto) {
      return NextResponse.json({ success: false, error: "Judul dan foto wajib diisi." }, { status: 400 });
    }

    // Validasi role — Admin Provinsi & Kabupaten tidak boleh upload galeri Nasional
    const role = body.role;
    let level = body.level || "Nasional";
    let provinsiId = body.provinsiId ? parseInt(body.provinsiId) : null;
    let kabupatenId = body.kabupatenId ? parseInt(body.kabupatenId) : null;

    // Paksa level sesuai role
    if (role === "ADMIN_PROVINSI") {
      level = "Provinsi";
      kabupatenId = null; // Admin Provinsi tidak bisa assign ke kabupaten
      if (!provinsiId) {
        return NextResponse.json({ success: false, error: "Admin Provinsi wajib menyertakan provinsiId." }, { status: 400 });
      }
    } else if (role === "ADMIN_KABUPATEN") {
      level = "Kabupaten";
      if (!kabupatenId) {
        return NextResponse.json({ success: false, error: "Admin Kabupaten wajib menyertakan kabupatenId." }, { status: 400 });
      }
      if (!provinsiId) {
        return NextResponse.json({ success: false, error: "Admin Kabupaten wajib menyertakan provinsiId." }, { status: 400 });
      }
    }

    const galeri = await db.galeri.create({
      data: {
        judul: body.judul,
        deskripsi: body.deskripsi || null,
        album: body.album || null,
        foto: body.foto,
        lokasi: body.lokasi || null,
        kategori: body.kategori || "Kegiatan",
        level,
        provinsiId,
        kabupatenId,
        penulis: body.penulis || "Admin",
      },
    });

    return NextResponse.json({ success: true, data: galeri });
  } catch (error) {
    console.error("POST /api/galeri error:", error);
    return NextResponse.json({ success: false, error: "Gagal menyimpan galeri" }, { status: 500 });
  }
}
