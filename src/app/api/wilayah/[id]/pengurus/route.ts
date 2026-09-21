import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ============================================================
// GET /api/wilayah/[id]/pengurus?type=provinsi|kabupaten
// Returns: list of pengurus in this wilayah (active only by default)
// Aturan: HANYA tampilkan pengurus yang level-nya sesuai dengan wilayah:
//   - type=provinsi → hanya pengurus dengan level="PROVINSI" & provinsiId=id
//   - type=kabupaten → hanya pengurus dengan level="KABUPATEN" & kabupatenId=id
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
      where.level = "PROVINSI";
    } else if (type === "kabupaten") {
      where.kabupatenId = id;
      where.level = "KABUPATEN";
    }
    if (!includeAll) {
      where.status = "Aktif";
      where.suratKeputusan = { status: "Aktif" };
    }

    const pengurus = await db.pengurus.findMany({
      where,
      include: {
        anggota: {
          select: {
            id: true,
            namaLengkap: true,
            nia: true,
            email: true,
            whatsapp: true,
            foto: true,
          },
        },
        suratKeputusan: { select: { nomorSK: true, judul: true } },
      },
      orderBy: [
        { anggota: { namaLengkap: "asc" } },
      ],
    });

    const result = pengurus.map((p) => ({
      id: p.id,
      anggotaId: p.anggota?.id,
      namaLengkap: p.anggota?.namaLengkap || "-",
      nia: p.anggota?.nia,
      foto: p.anggota?.foto,
      nomorSK: p.suratKeputusan?.nomorSK,
      judulSK: p.suratKeputusan?.judul,
      level: p.level,
      status: p.status,
    }));

    return NextResponse.json({ success: true, data: result, total: result.length });
  } catch (error) {
    console.error("GET /api/wilayah/[id]/pengurus error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil pengurus wilayah" }, { status: 500 });
  }
}
