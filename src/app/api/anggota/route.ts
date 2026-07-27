import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateNIA } from "@/lib/nia";

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

    // Validasi provinsi & kabupaten
    const prov = await db.provinsi.findUnique({ where: { id: parseInt(body.provinsiId) } });
    const kab = await db.kabupaten.findUnique({ where: { id: parseInt(body.kabupatenId) } });

    if (!prov || !kab) {
      return NextResponse.json({ success: false, error: "Provinsi atau kabupaten tidak ditemukan" }, { status: 400 });
    }

    // Create anggota dulu TANPA nia (placeholder), lalu generate NIA pakai anggota.id
    const anggota = await db.anggota.create({
      data: {
        nia: "TEMP-" + Date.now(), // placeholder, akan di-update
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
        ktp: body.ktp || null,
        cv: body.cv || null,
        suratPernyataan: body.suratPernyataan || null,
        suratSehat: body.suratSehat || null,
        status: "AKTIF",
        angkatan: body.angkatan || "XIII",
        tanggalAngkat: new Date(),
      },
      include: {
        provinsi: { select: { nama: true, kode: true } },
        kabupaten: { select: { nama: true, kode: true } },
      },
    });

    // Generate NIA dengan global sequence (pakai anggota.id)
    const tahun = new Date().getFullYear();
    const nia = await generateNIA(anggota.id, {
      provinsiId: parseInt(body.provinsiId),
      kabupatenId: parseInt(body.kabupatenId),
      tahun,
    });

    // Update anggota dengan NIA yang benar
    const updated = await db.anggota.update({
      where: { id: anggota.id },
      data: { nia },
      include: {
        provinsi: { select: { nama: true, kode: true } },
        kabupaten: { select: { nama: true, kode: true } },
      },
    });

    return NextResponse.json({ success: true, data: updated, message: `Anggota berhasil ditambahkan dengan NIA: ${nia}` });
  } catch (error) {
    console.error("POST /api/anggota error:", error);
    return NextResponse.json({ success: false, error: "Gagal menambahkan anggota" }, { status: 500 });
  }
}
