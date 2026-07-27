import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ============================================================
// GET /api/jabatan — List semua jabatan, optional grouped by bidang
// Query: ?grouped=true → return { bidang: [...jabatan] }
//        ?level=Nasional → filter by level
// ============================================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const grouped = searchParams.get("grouped") === "true";
    const level = searchParams.get("level");

    const where = level && level !== "Semua" ? { level } : {};
    const jabatan = await db.jabatan.findMany({
      where,
      orderBy: [
        { bidang: "asc" },
        { urutan: "asc" },
      ],
      include: {
        _count: { select: { pengurus: true } },
      },
    });

    if (grouped) {
      // Group by bidang
      const groupedData: Record<string, any[]> = {};
      for (const j of jabatan) {
        if (!groupedData[j.bidang]) groupedData[j.bidang] = [];
        groupedData[j.bidang].push(j);
      }
      return NextResponse.json({ success: true, data: groupedData });
    }

    return NextResponse.json({ success: true, data: jabatan });
  } catch (error) {
    console.error("GET /api/jabatan error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil jabatan" }, { status: 500 });
  }
}

// ============================================================
// POST /api/jabatan — Tambah jabatan baru (atau bidang baru)
// Body: { nama, bidang, level, urutan? }
// ============================================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.nama || !body.bidang || !body.level) {
      return NextResponse.json(
        { success: false, error: "Nama, bidang, dan level wajib diisi" },
        { status: 400 }
      );
    }

    // Validasi level
    const validLevels = ["Nasional", "Provinsi", "Kabupaten"];
    if (!validLevels.includes(body.level)) {
      return NextResponse.json(
        { success: false, error: "Level harus Nasional, Provinsi, atau Kabupaten" },
        { status: 400 }
      );
    }

    // Cek duplikat (nama + bidang + level)
    const existing = await db.jabatan.findFirst({
      where: { nama: body.nama, bidang: body.bidang, level: body.level },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Jabatan dengan bidang & level ini sudah ada" },
        { status: 400 }
      );
    }

    // Ambil urutan terakhir di bidang+level ini, jika tidak diberikan
    let urutan = body.urutan;
    if (urutan === undefined || urutan === null) {
      const lastInBidang = await db.jabatan.findFirst({
        where: { bidang: body.bidang, level: body.level },
        orderBy: { urutan: "desc" },
      });
      urutan = (lastInBidang?.urutan || 0) + 1;
    }

    const jabatan = await db.jabatan.create({
      data: {
        nama: body.nama,
        bidang: body.bidang,
        level: body.level,
        urutan: Number(urutan),
        status: "Aktif",
      },
    });

    await db.activityLog.create({
      data: { table: "jabatan", recordId: jabatan.id, aksi: "create", oleh: "Admin", detail: JSON.stringify({ nama: jabatan.nama, bidang: jabatan.bidang, level: jabatan.level }) },
    });

    return NextResponse.json({
      success: true,
      data: jabatan,
      message: `Jabatan "${body.nama}" di bidang "${body.bidang}" (${body.level}) berhasil ditambahkan`,
    });
  } catch (error) {
    console.error("POST /api/jabatan error:", error);
    return NextResponse.json({ success: false, error: "Gagal menambahkan jabatan" }, { status: 500 });
  }
}
