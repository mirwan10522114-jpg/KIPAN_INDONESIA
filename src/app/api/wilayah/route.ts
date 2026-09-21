import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, safeParseInt } from "@/lib/api-error";

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

    const provinsiIdFilter = searchParams.get("provinsiId");
    const kabupatenWhere: any = {};
    if (provinsiIdFilter) {
      kabupatenWhere.provinsiId = parseInt(provinsiIdFilter);
    }

    const kabupaten = await db.kabupaten.findMany({
      where: kabupatenWhere,
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
    return handleApiError(error, "GET /api/wilayah", "Gagal mengambil data wilayah");
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
        },
      });

      await db.activityLog.create({
        data: { table: "wilayah", recordId: provinsi.id, aksi: "create", oleh: "Admin", detail: JSON.stringify({ type: "provinsi", kode: provinsi.kode, nama: provinsi.nama }) },
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

      const provinsiIdNum = safeParseInt(body.provinsiId);
      if (provinsiIdNum === null) {
        return NextResponse.json({ success: false, error: "Provinsi tidak valid" }, { status: 400 });
      }

      const kabupaten = await db.kabupaten.create({
        data: {
          kode: body.kode,
          nama: body.nama,
          provinsiId: provinsiIdNum,
          status: body.status || "Aktif",
        },
        include: { provinsi: { select: { nama: true, kode: true } } },
      });

      await db.activityLog.create({
        data: { table: "wilayah", recordId: kabupaten.id, aksi: "create", oleh: "Admin", detail: JSON.stringify({ type: "kabupaten", kode: kabupaten.kode, nama: kabupaten.nama }) },
      });
      return NextResponse.json({ success: true, data: kabupaten, message: "Kabupaten/Kota berhasil ditambahkan" });
    }

    return NextResponse.json({ success: false, error: "Type tidak valid" }, { status: 400 });
  } catch (error) {
    return handleApiError(error, "POST /api/wilayah", "Gagal menambahkan wilayah");
  }
}

// PUT /api/wilayah — Update provinsi atau kabupaten
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.type === "provinsi") {
      const provId = safeParseInt(body.id);
      if (provId === null) {
        return NextResponse.json({ success: false, error: "ID tidak valid" }, { status: 400 });
      }
      const provinsi = await db.provinsi.update({
        where: { id: provId },
        data: {
          nama: body.nama,
          status: body.status,
        },
      });
      await db.activityLog.create({
        data: { table: "wilayah", recordId: provinsi.id, aksi: "update", oleh: "Admin", detail: JSON.stringify({ type: "provinsi", status: provinsi.status }) },
      });
      return NextResponse.json({ success: true, data: provinsi, message: "Provinsi berhasil diperbarui" });
    }

    if (body.type === "kabupaten") {
      const kabId = safeParseInt(body.id);
      const provIdNum = safeParseInt(body.provinsiId);
      if (kabId === null || provIdNum === null) {
        return NextResponse.json({ success: false, error: "ID atau provinsiId tidak valid" }, { status: 400 });
      }
      const kabupaten = await db.kabupaten.update({
        where: { id: kabId },
        data: {
          nama: body.nama,
          provinsiId: provIdNum,
          status: body.status,
        },
        include: { provinsi: { select: { nama: true, kode: true } } },
      });
      await db.activityLog.create({
        data: { table: "wilayah", recordId: kabupaten.id, aksi: "update", oleh: "Admin", detail: JSON.stringify({ type: "kabupaten", status: kabupaten.status }) },
      });
      return NextResponse.json({ success: true, data: kabupaten, message: "Kabupaten/Kota berhasil diperbarui" });
    }

    return NextResponse.json({ success: false, error: "Type tidak valid" }, { status: 400 });
  } catch (error) {
    return handleApiError(error, "PUT /api/wilayah", "Gagal memperbarui wilayah");
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
    return handleApiError(error, "DELETE /api/wilayah", "Gagal menghapus wilayah");
  }
}
