import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/wilayah — List provinsi & kabupaten
// Penting: count pengurus HANYA untuk level yang sesuai:
//   - provinsi: count pengurus dengan level="PROVINSI" (bukan Nasional yang kebetulan provinsiId=ini)
//   - kabupaten: count pengurus dengan level="KABUPATEN"
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all";

    const provinsi = await db.provinsi.findMany({
      include: {
        _count: { select: { kabupaten: true } },
      },
      orderBy: { nama: "asc" },
    });

    const kabupaten = await db.kabupaten.findMany({
      include: {
        provinsi: { select: { nama: true, kode: true } },
      },
      orderBy: { nama: "asc" },
    });

    // Count pengurus level PROVINSI per provinsi (terpisah, agar tidak ikut count Nasional)
    const pengurusProvinsiCounts = await db.pengurus.groupBy({
      by: ["provinsiId"],
      where: { level: "PROVINSI" },
      _count: { _all: true },
    });
    const pengurusProvinsiMap: Record<number, number> = {};
    pengurusProvinsiCounts.forEach((c) => {
      if (c.provinsiId) pengurusProvinsiMap[c.provinsiId] = c._count._all;
    });

    // Count pengurus level KABUPATEN per kabupaten (terpisah)
    const pengurusKabupatenCounts = await db.pengurus.groupBy({
      by: ["kabupatenId"],
      where: { level: "KABUPATEN" },
      _count: { _all: true },
    });
    const pengurusKabupatenMap: Record<number, number> = {};
    pengurusKabupatenCounts.forEach((c) => {
      if (c.kabupatenId) pengurusKabupatenMap[c.kabupatenId] = c._count._all;
    });

    // Tambahkan count pengurus ke response provinsi
    const provinsiWithCount = provinsi.map((p) => ({
      ...p,
      _count: {
        kabupaten: p._count.kabupaten,
        pengurus: pengurusProvinsiMap[p.id] || 0,
      },
    }));

    // Tambahkan count pengurus ke response kabupaten
    const kabupatenWithCount = kabupaten.map((k) => ({
      ...k,
      _count: {
        pengurus: pengurusKabupatenMap[k.id] || 0,
      },
    }));

    if (type === "provinsi") {
      return NextResponse.json({ success: true, data: provinsiWithCount });
    }
    if (type === "kabupaten") {
      return NextResponse.json({ success: true, data: kabupatenWithCount });
    }

    return NextResponse.json({ success: true, data: { provinsi: provinsiWithCount, kabupaten: kabupatenWithCount } });
  } catch (error) {
    console.error("GET /api/wilayah error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data wilayah" }, { status: 500 });
  }
}

// POST /api/wilayah — Tambah provinsi atau kabupaten
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.type === "provinsi") {
      // Validasi
      if (!body.kode || !body.nama) {
        return NextResponse.json({ success: false, error: "Kode dan nama provinsi wajib diisi" }, { status: 400 });
      }

      // Cek duplikat
      const existing = await db.provinsi.findUnique({ where: { kode: body.kode } });
      if (existing) {
        return NextResponse.json({ success: false, error: "Kode provinsi sudah ada" }, { status: 400 });
      }

      const provinsi = await db.provinsi.create({
        data: {
          kode: body.kode.toUpperCase(),
          nama: body.nama,
          status: body.status || "Aktif",
          ketua: body.ketua || null,
        },
      });

      return NextResponse.json({ success: true, data: provinsi, message: "Provinsi berhasil ditambahkan" });
    }

    if (body.type === "kabupaten") {
      if (!body.kode || !body.nama || !body.provinsiId) {
        return NextResponse.json({ success: false, error: "Kode, nama, dan provinsi wajib diisi" }, { status: 400 });
      }

      const existing = await db.kabupaten.findUnique({ where: { kode: body.kode } });
      if (existing) {
        return NextResponse.json({ success: false, error: "Kode kabupaten sudah ada" }, { status: 400 });
      }

      const kabupaten = await db.kabupaten.create({
        data: {
          kode: body.kode,
          nama: body.nama,
          provinsiId: parseInt(body.provinsiId),
          status: body.status || "Aktif",
          ketua: body.ketua || null,
        },
        include: { provinsi: { select: { nama: true, kode: true } } },
      });

      return NextResponse.json({ success: true, data: kabupaten, message: "Kabupaten/Kota berhasil ditambahkan" });
    }

    return NextResponse.json({ success: false, error: "Type tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/wilayah error:", error);
    return NextResponse.json({ success: false, error: "Gagal menambahkan wilayah" }, { status: 500 });
  }
}

// PUT /api/wilayah — Update provinsi atau kabupaten
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.type === "provinsi") {
      const provinsi = await db.provinsi.update({
        where: { id: parseInt(body.id) },
        data: {
          nama: body.nama,
          status: body.status,
          ketua: body.ketua || null,
        },
      });
      return NextResponse.json({ success: true, data: provinsi, message: "Provinsi berhasil diperbarui" });
    }

    if (body.type === "kabupaten") {
      const kabupaten = await db.kabupaten.update({
        where: { id: parseInt(body.id) },
        data: {
          nama: body.nama,
          provinsiId: parseInt(body.provinsiId),
          status: body.status,
          ketua: body.ketua || null,
        },
        include: { provinsi: { select: { nama: true, kode: true } } },
      });
      return NextResponse.json({ success: true, data: kabupaten, message: "Kabupaten/Kota berhasil diperbarui" });
    }

    return NextResponse.json({ success: false, error: "Type tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("PUT /api/wilayah error:", error);
    return NextResponse.json({ success: false, error: "Gagal memperbarui wilayah" }, { status: 500 });
  }
}

// DELETE /api/wilayah — Hapus provinsi atau kabupaten
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const id = parseInt(searchParams.get("id") || "0");

    if (!id) {
      return NextResponse.json({ success: false, error: "ID wajib diisi" }, { status: 400 });
    }

    if (type === "provinsi") {
      await db.provinsi.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Provinsi berhasil dihapus" });
    }

    if (type === "kabupaten") {
      await db.kabupaten.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Kabupaten/Kota berhasil dihapus" });
    }

    return NextResponse.json({ success: false, error: "Type tidak valid" }, { status: 400 });
  } catch (error) {
    console.error("DELETE /api/wilayah error:", error);
    return NextResponse.json({ success: false, error: "Gagal menghapus wilayah" }, { status: 500 });
  }
}
