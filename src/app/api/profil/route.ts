import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/profil — Profil organisasi
export async function GET() {
  try {
    const profil = await db.profilOrganisasi.findFirst({
      where: { id: 1 },
    });
    return NextResponse.json({ success: true, data: profil });
  } catch (error) {
    console.error("GET /api/profil error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil profil" }, { status: 500 });
  }
}

// PUT /api/profil — Update profil organisasi
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const profil = await db.profilOrganisasi.upsert({
      where: { id: 1 },
      update: {
        nama: body.nama,
        namaLengkap: body.namaLengkap,
        tagline: body.tagline,
        logo: body.logo,
        email: body.email,
        telepon: body.telepon,
        alamat: body.alamat,
        instagram: body.instagram,
        website: body.website,
        deskripsi: body.deskripsi,
      },
      create: {
        id: 1,
        nama: body.nama,
        namaLengkap: body.namaLengkap,
        tagline: body.tagline,
        email: body.email,
        telepon: body.telepon,
        alamat: body.alamat,
        instagram: body.instagram,
        website: body.website,
        deskripsi: body.deskripsi,
      },
    });
    return NextResponse.json({ success: true, data: profil });
  } catch (error) {
    console.error("PUT /api/profil error:", error);
    return NextResponse.json({ success: false, error: "Gagal update profil" }, { status: 500 });
  }
}
