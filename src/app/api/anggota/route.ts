import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const provinsiId = searchParams.get("provinsiId");
    const search = searchParams.get("search");

    const where: any = {};
    if (status && status !== "Semua") where.status = status;
    if (provinsiId && provinsiId !== "Semua") where.provinsiId = parseInt(provinsiId);
    if (search) {
      where.OR = [
        { namaLengkap: { contains: search } },
        { nia: { contains: search } },
        { nik: { contains: search } },
      ];
    }

    const anggota = await db.anggota.findMany({
      where,
      include: {
        provinsi: { select: { nama: true, kode: true } },
        kabupaten: { select: { nama: true, kode: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: anggota, total: anggota.length });
  } catch (error) {
    console.error("GET /api/anggota error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data anggota" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.namaLengkap || !body.nik || !body.provinsiId || !body.kabupatenId) {
      return NextResponse.json({ success: false, error: "Nama, NIK, provinsi, dan kabupaten wajib diisi" }, { status: 400 });
    }

    // Generate NIA: KIPAN-PROVKODE-KABKODE-YEAR-SEQ
    const tahun = new Date().getFullYear();
    const prov = await db.provinsi.findUnique({ where: { id: parseInt(body.provinsiId) } });
    const kab = await db.kabupaten.findUnique({ where: { id: parseInt(body.kabupatenId) } });

    if (!prov || !kab) {
      return NextResponse.json({ success: false, error: "Provinsi atau kabupaten tidak ditemukan" }, { status: 400 });
    }

    const countThisYear = await db.anggota.count({
      where: {
        provinsiId: parseInt(body.provinsiId),
        kabupatenId: parseInt(body.kabupatenId),
        tanggalAngkat: { gte: new Date(tahun, 0, 1) },
      },
    });

    const seq = String(countThisYear + 1).padStart(5, "0");
    const nia = `KIPAN-${prov.kode}-${kab.kode}-${tahun}-${seq}`;

    const anggota = await db.anggota.create({
      data: {
        nia,
        namaLengkap: body.namaLengkap,
        nik: body.nik,
        tempatLahir: body.tempatLahir || "",
        tanggalLahir: body.tanggalLahir ? new Date(body.tanggalLahir) : new Date("2000-01-01"),
        jenisKelamin: body.jenisKelamin || "L",
        agama: body.agama || null,
        pendidikan: body.pendidikan || null,
        pekerjaan: body.pekerjaan || null,
        alamat: body.alamat || "",
        provinsiId: parseInt(body.provinsiId),
        kabupatenId: parseInt(body.kabupatenId),
        kecamatan: body.kecamatan || null,
        email: body.email || "",
        hp: body.hp || "",
        whatsapp: body.whatsapp || null,
        foto: body.foto || null,
        status: "AKTIF",
        angkatan: body.angkatan || "XIII",
        tanggalAngkat: new Date(),
      },
      include: {
        provinsi: { select: { nama: true, kode: true } },
        kabupaten: { select: { nama: true, kode: true } },
      },
    });

    return NextResponse.json({ success: true, data: anggota, message: `Anggota berhasil ditambahkan dengan NIA: ${nia}` });
  } catch (error) {
    console.error("POST /api/anggota error:", error);
    return NextResponse.json({ success: false, error: "Gagal menambahkan anggota" }, { status: 500 });
  }
}
