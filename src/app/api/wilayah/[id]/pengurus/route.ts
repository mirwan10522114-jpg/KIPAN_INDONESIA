import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ============================================================
// GET /api/wilayah/[id]/pengurus?type=provinsi|kabupaten
// Returns: list of pengurus in this wilayah (active only by default)
// Used for: dropdown ketua wilayah di WilayahFormDialog
// ============================================================
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "provinsi";
    const includeAll = searchParams.get("all") === "true";

    const where: any = {};
    if (type === "provinsi") {
      where.provinsiId = id;
    } else if (type === "kabupaten") {
      where.kabupatenId = id;
    }
    if (!includeAll) where.status = "Aktif";

    const pengurus = await db.pengurus.findMany({
      where,
      include: {
        anggota: {
          select: {
            id: true,
            namaLengkap: true,
            nia: true,
            foto: true,
            email: true,
            hp: true,
          },
        },
        jabatan: { select: { nama: true, bidang: true, urutan: true } },
      },
      orderBy: [
        { jabatan: { urutan: "asc" } },
        { anggota: { namaLengkap: "asc" } },
      ],
    });

    const result = pengurus.map((p) => ({
      id: p.id,
      anggotaId: p.anggota?.id,
      namaLengkap: p.anggota?.namaLengkap || "-",
      nia: p.anggota?.nia,
      foto: p.anggota?.foto,
      jabatan: p.jabatan?.nama,
      bidang: p.jabatan?.bidang,
      level: p.level,
      status: p.status,
    }));

    return NextResponse.json({ success: true, data: result, total: result.length });
  } catch (error) {
    console.error("GET /api/wilayah/[id]/pengurus error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil pengurus wilayah" }, { status: 500 });
  }
}
