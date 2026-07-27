import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/wilayah/auto-fill-ketua
// Auto-fill kolom ketua untuk semua provinsi & kabupaten berdasarkan pengurus
// dengan jabatan "Ketua Umum" yang aktif di level & wilayah yang sesuai.
// - Untuk provinsi: cari pengurus level PROVINSI dengan jabatan "Ketua Umum" di provinsi tsb
// - Untuk kabupaten: cari pengurus level KABUPATEN dengan jabatan "Ketua Umum" di kabupaten tsb
export async function POST() {
  try {
    let updatedProvinsi = 0;
    let updatedKabupaten = 0;

    // === AUTO-FILL KETUA PROVINSI ===
    const allProvinsi = await db.provinsi.findMany();
    for (const prov of allProvinsi) {
      // Cari pengurus dengan jabatan "Ketua Umum", level PROVINSI, di provinsi ini, status Aktif
      const ketua = await db.pengurus.findFirst({
        where: {
          provinsiId: prov.id,
          level: "PROVINSI",
          status: "Aktif",
          jabatan: { nama: "Ketua Umum" },
        },
        include: { anggota: { select: { namaLengkap: true } } },
      });
      if (ketua && ketua.anggota) {
        const ketuaName = ketua.anggota.namaLengkap;
        if (prov.ketua !== ketuaName) {
          await db.provinsi.update({
            where: { id: prov.id },
            data: { ketua: ketuaName },
          });
          updatedProvinsi++;
        }
      }
    }

    // === AUTO-FILL KETUA KABUPATEN ===
    const allKabupaten = await db.kabupaten.findMany();
    for (const kab of allKabupaten) {
      // Cari pengurus dengan jabatan "Ketua Umum", level KABUPATEN, di kabupaten ini, status Aktif
      const ketua = await db.pengurus.findFirst({
        where: {
          kabupatenId: kab.id,
          level: "KABUPATEN",
          status: "Aktif",
          jabatan: { nama: "Ketua Umum" },
        },
        include: { anggota: { select: { namaLengkap: true } } },
      });
      if (ketua && ketua.anggota) {
        const ketuaName = ketua.anggota.namaLengkap;
        if (kab.ketua !== ketuaName) {
          await db.kabupaten.update({
            where: { id: kab.id },
            data: { ketua: ketuaName },
          });
          updatedKabupaten++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Auto-fill ketua selesai. ${updatedProvinsi} provinsi & ${updatedKabupaten} kabupaten diperbarui.`,
      data: { updatedProvinsi, updatedKabupaten },
    });
  } catch (error) {
    console.error("POST /api/wilayah/auto-fill-ketua error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal auto-fill ketua" },
      { status: 500 }
    );
  }
}
