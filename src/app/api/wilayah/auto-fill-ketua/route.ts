import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/wilayah/auto-fill-ketua
// Auto-fill kolom ketua untuk semua provinsi & kabupaten berdasarkan pengurus
// dengan jabatan "Ketua Umum" yang aktif di level & wilayah yang sesuai.
// - Jika Ketua Umum aktif ditemukan → set ketua = nama anggota
// - Jika tidak ada Ketua Umum aktif → set ketua = null (clear stale)
// - Pick Ketua Umum terbaru (orderBy tanggalMulai desc) jika multiple
// - Semua update dalam db.$transaction (atomic — semua atau tidak sama sekali)
export async function POST() {
  try {
    // Fetch semua provinsi & kabupaten di luar transaction (read-only)
    const allProvinsi = await db.provinsi.findMany();
    const allKabupaten = await db.kabupaten.findMany();

    // Fetch semua Ketua Umum aktif untuk provinsi & kabupaten
    const provinsiKetuas = await db.pengurus.findMany({
      where: {
        level: "PROVINSI",
        status: "Aktif",
        jabatan: { nama: "Ketua Umum" },
      },
      include: { anggota: { select: { namaLengkap: true } } },
      orderBy: { tanggalMulai: "desc" },
    });

    const kabupatenKetuas = await db.pengurus.findMany({
      where: {
        level: "KABUPATEN",
        status: "Aktif",
        jabatan: { nama: "Ketua Umum" },
      },
      include: { anggota: { select: { namaLengkap: true } } },
      orderBy: { tanggalMulai: "desc" },
    });

    // Build map: provinsiId → ketuaName (pick terbaru, sudah sorted desc)
    const provinsiKetuaMap: Record<number, string> = {};
    for (const p of provinsiKetuas) {
      if (p.provinsiId && !provinsiKetuaMap[p.provinsiId]) {
        provinsiKetuaMap[p.provinsiId] = p.anggota?.namaLengkap || "";
      }
    }

    // Build map: kabupatenId → ketuaName (pick terbaru, sudah sorted desc)
    const kabupatenKetuaMap: Record<number, string> = {};
    for (const p of kabupatenKetuas) {
      if (p.kabupatenId && !kabupatenKetuaMap[p.kabupatenId]) {
        kabupatenKetuaMap[p.kabupatenId] = p.anggota?.namaLengkap || "";
      }
    }

    // Transaction: update semua provinsi & kabupaten secara atomik
    const result = await db.$transaction(async (tx) => {
      let updatedProvinsi = 0;
      let updatedKabupaten = 0;

      // Update provinsi: set ketua jika ada, clear (null) jika tidak ada
      for (const prov of allProvinsi) {
        const newKetua = provinsiKetuaMap[prov.id] || null;
        if (prov.ketua !== newKetua) {
          await tx.provinsi.update({
            where: { id: prov.id },
            data: { ketua: newKetua },
          });
          updatedProvinsi++;
        }
      }

      // Update kabupaten: set ketua jika ada, clear (null) jika tidak ada
      for (const kab of allKabupaten) {
        const newKetua = kabupatenKetuaMap[kab.id] || null;
        if (kab.ketua !== newKetua) {
          await tx.kabupaten.update({
            where: { id: kab.id },
            data: { ketua: newKetua },
          });
          updatedKabupaten++;
        }
      }

      return { updatedProvinsi, updatedKabupaten };
    });

    return NextResponse.json({
      success: true,
      message: `Auto-fill ketua selesai. ${result.updatedProvinsi} provinsi & ${result.updatedKabupaten} kabupaten diperbarui.`,
      data: result,
    });
  } catch (error) {
    console.error("POST /api/wilayah/auto-fill-ketua error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal auto-fill ketua" },
      { status: 500 }
    );
  }
}
