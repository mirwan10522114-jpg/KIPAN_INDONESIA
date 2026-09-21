import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role");
    const wilayah = searchParams.get("wilayah");
    const currentSkLevel = searchParams.get("skLevel"); // KABUPATEN | PROVINSI | NASIONAL

    // Base condition: get Pengurus, optionally filtered
    const where: any = {};

    if (search) {
      where.anggota = {
        namaLengkap: { contains: search }
      };
    }

    // Determine what they can see based on role
    if (role === "ADMIN_PROVINSI" && wilayah) {
      const w = wilayah.replace("Provinsi ", "").trim();
      const prov = await db.provinsi.findFirst({ where: { nama: w } });
      if (prov) {
        where.provinsiId = prov.id;
        // Provincial admin can only pull from Kabupaten within their province, or existing Provinsi members
      }
    } else if (role === "ADMIN_KABUPATEN" && wilayah) {
      const w = wilayah.replace("Kabupaten ", "Kab. ").trim();
      const kab = await db.kabupaten.findFirst({ where: { nama: w } });
      if (kab) {
        where.kabupatenId = kab.id;
      }
    }
    // SUPER_ADMIN / ADMIN_NASIONAL can see all

    // We only want to show recent Pengurus (e.g. limit to 50 for quick search)
    const pengurusList = await db.pengurus.findMany({
      where,
      include: {
        anggota: { select: { id: true, nia: true, namaLengkap: true, foto: true } },
        jabatan: { select: { id: true, nama: true } },
        provinsi: { select: { id: true, nama: true } },
        kabupaten: { select: { id: true, nama: true } },
        suratKeputusan: { select: { id: true, nomorSK: true, level: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // We should return unique members (if one person was pengurus multiple times, just return the most recent active/demisioner record)
    const uniqueMap = new Map();
    for (const p of pengurusList) {
      if (!uniqueMap.has(p.anggotaId)) {
        uniqueMap.set(p.anggotaId, p);
      }
    }

    return NextResponse.json({
      success: true,
      data: Array.from(uniqueMap.values()),
    });
  } catch (error) {
    console.error("GET /api/pengurus/list-promosi error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil daftar pengurus untuk promosi" },
      { status: 500 }
    );
  }
}
