import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const kategori = searchParams.get("kategori");
    const status = searchParams.get("status");
    const jenis = searchParams.get("jenis");
    const provinsiId = searchParams.get("provinsiId");
    const kabupatenId = searchParams.get("kabupatenId");
    const role = searchParams.get("role");

    const where: any = {};
    if (kategori && kategori !== "Semua") where.kategori = kategori;
    if (status && status !== "Semua") where.status = status;
    if (jenis) where.jenis = jenis;
    if (provinsiId) where.provinsiId = parseInt(provinsiId);
    if (kabupatenId) where.kabupatenId = parseInt(kabupatenId);

    // Filter per role wilayah — Admin Provinsi/Kabupaten hanya melihat berita mereka
    if (role === "ADMIN_PROVINSI" && provinsiId) {
      where.provinsiId = parseInt(provinsiId);
    } else if (role === "ADMIN_KABUPATEN" && kabupatenId) {
      where.kabupatenId = parseInt(kabupatenId);
    }

    const berita = await db.berita.findMany({
      where,
      include: {
        provinsi: { select: { nama: true } },
        kabupaten: { select: { nama: true } },
      },
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

    // ================================================================
    // VALIDASI BACKEND RBAC — Sesuai PRD §3.2, §3.3, §3.4
    // Admin Provinsi & Kabupaten DILARANG membuat Berita UMUM
    // ================================================================
    const creatorRole = body.role || "SUPER_ADMIN";
    const isRegionalAdmin = creatorRole === "ADMIN_PROVINSI" || creatorRole === "ADMIN_KABUPATEN";

    if (isRegionalAdmin && body.jenis === "UMUM") {
      return NextResponse.json(
        {
          success: false,
          error: "Akses Ditolak: Admin Provinsi dan Admin Kabupaten/Kota tidak diizinkan membuat Berita Umum. Hanya Admin Nasional yang berhak menerbitkan Berita Umum.",
        },
        { status: 403 }
      );
    }

    // Paksa kategori dan wilayah sesuai role
    let finalKategori = body.kategori || "Nasional";
    let finalProvinsiId = body.provinsiId ? parseInt(body.provinsiId) : null;
    let finalKabupatenId = body.kabupatenId ? parseInt(body.kabupatenId) : null;

    if (creatorRole === "ADMIN_PROVINSI") {
      finalKategori = "Provinsi";
      finalKabupatenId = null; // Provinsi tidak bisa assign ke kabupaten spesifik
      if (!finalProvinsiId) {
        return NextResponse.json({ success: false, error: "Admin Provinsi wajib menyertakan provinsiId." }, { status: 400 });
      }
    } else if (creatorRole === "ADMIN_KABUPATEN") {
      finalKategori = "Kabupaten";
      if (!finalKabupatenId || !finalProvinsiId) {
        return NextResponse.json({ success: false, error: "Admin Kabupaten wajib menyertakan kabupatenId dan provinsiId." }, { status: 400 });
      }
    }

    // Generate slug unik
    const baseSlug = body.judul
      .toLowerCase()
      .replace(/[^a-z0-9\s]+/g, "")
      .trim()
      .replace(/\s+/g, "-");
    const timestamp = Date.now();
    const slug = `${baseSlug}-${timestamp}`;

    const berita = await db.berita.create({
      data: {
        judul: body.judul,
        slug,
        jenis: body.jenis || "INTERNAL",
        kategori: finalKategori,
        provinsiId: finalProvinsiId,
        kabupatenId: finalKabupatenId,
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
