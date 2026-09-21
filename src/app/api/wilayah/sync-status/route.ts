import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/wilayah/sync-status
// Sinkronkan status wilayah berdasarkan keberadaan pengurus:
// - Jika wilayah memiliki pengurus aktif -> status otomatis "Aktif"
// - Jika wilayah TIDAK memiliki pengurus aktif -> status otomatis "Pembentukan"
// Admin tetap dapat mengubah status ini secara manual kapan saja via form / tombol ubah status.
export async function POST() {
  try {
    // 1. Ambil ID provinsi yang memiliki pengurus aktif level PROVINSI
    const activeProvinsiIds = await db.pengurus.groupBy({
      by: ["provinsiId"],
      where: { level: "PROVINSI", status: "Aktif" },
    });
    const provIdsWithPengurus = new Set(
      activeProvinsiIds.map((p) => p.provinsiId).filter((id): id is number => id !== null)
    );

    // 2. Ambil ID kabupaten yang memiliki pengurus aktif level KABUPATEN
    const activeKabupatenIds = await db.pengurus.groupBy({
      by: ["kabupatenId"],
      where: { level: "KABUPATEN", status: "Aktif" },
    });
    const kabIdsWithPengurus = new Set(
      activeKabupatenIds.map((k) => k.kabupatenId).filter((id): id is number => id !== null)
    );

    // 3. Update Provinsi
    const allProv = await db.provinsi.findMany({ select: { id: true, status: true } });
    let updatedProv = 0;
    for (const prov of allProv) {
      const shouldBeAktif = provIdsWithPengurus.has(prov.id);
      const newStatus = shouldBeAktif ? "Aktif" : "Pembentukan";
      if (prov.status !== newStatus) {
        await db.provinsi.update({
          where: { id: prov.id },
          data: { status: newStatus },
        });
        updatedProv++;
      }
    }

    // 4. Update Kabupaten
    const allKab = await db.kabupaten.findMany({ select: { id: true, status: true } });
    let updatedKab = 0;
    for (const kab of allKab) {
      const shouldBeAktif = kabIdsWithPengurus.has(kab.id);
      const newStatus = shouldBeAktif ? "Aktif" : "Pembentukan";
      if (kab.status !== newStatus) {
        await db.kabupaten.update({
          where: { id: kab.id },
          data: { status: newStatus },
        });
        updatedKab++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sinkronisasi status wilayah selesai. ${updatedProv} provinsi & ${updatedKab} kabupaten disesuaikan.`,
      data: {
        provinsiDisinkronkan: updatedProv,
        kabupatenDisinkronkan: updatedKab,
        provinsiAktif: provIdsWithPengurus.size,
        kabupatenAktif: kabIdsWithPengurus.size,
      },
    });
  } catch (error) {
    console.error("POST /api/wilayah/sync-status error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menyinkronkan status wilayah" },
      { status: 500 }
    );
  }
}
