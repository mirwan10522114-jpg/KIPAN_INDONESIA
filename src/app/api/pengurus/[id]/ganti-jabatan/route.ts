import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PATCH /api/pengurus/[id]/ganti-jabatan
// Body: { jabatanId: number }
// Ganti jabatan pengurus yang aktif. Mengakhiri jabatan lama & buat jabatan baru.
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);
    const body = await req.json();
    const { jabatanId } = body;

    if (!jabatanId) {
      return NextResponse.json(
        { success: false, error: "jabatanId wajib diisi" },
        { status: 400 }
      );
    }

    // Get current pengurus
    const currentPengurus = await db.pengurus.findUnique({
      where: { id },
      include: { jabatan: true },
    });
    if (!currentPengurus) {
      return NextResponse.json(
        { success: false, error: "Pengurus tidak ditemukan" },
        { status: 404 }
      );
    }

    // Get new jabatan
    const newJabatan = await db.jabatan.findUnique({
      where: { id: parseInt(jabatanId) },
    });
    if (!newJabatan) {
      return NextResponse.json(
        { success: false, error: "Jabatan baru tidak ditemukan" },
        { status: 404 }
      );
    }

    // Jika jabatan sama, tidak perlu perubahan
    if (currentPengurus.jabatanId === parseInt(jabatanId)) {
      return NextResponse.json({
        success: true,
        message: "Jabatan tidak berubah (sama dengan jabatan saat ini)",
      });
    }

    // 1. Tutup jabatan lama: set status=Selesai & tanggalSelesai=now
    await db.pengurus.update({
      where: { id },
      data: {
        status: "Selesai",
        tanggalSelesai: new Date(),
      },
    });

    // 2. Buat record pengurus baru dengan jabatan baru
    const newPengurus = await db.pengurus.create({
      data: {
        anggotaId: currentPengurus.anggotaId,
        jabatanId: parseInt(jabatanId),
        level: currentPengurus.level,
        provinsiId: currentPengurus.provinsiId,
        kabupatenId: currentPengurus.kabupatenId,
        status: "Aktif",
        tanggalMulai: new Date(),
        nomorSK: `SK-GANTI/${currentPengurus.nomorSK || "NOSK"}/${new Date().getFullYear()}`,
      },
      include: {
        anggota: {
          select: { id: true, namaLengkap: true, nia: true, foto: true, email: true, hp: true },
        },
        jabatan: { select: { nama: true, bidang: true, level: true, urutan: true } },
        provinsi: { select: { nama: true } },
        kabupaten: { select: { nama: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: newPengurus,
      message: `Jabatan berhasil diganti dari "${currentPengurus.jabatan?.nama}" ke "${newJabatan.nama}" (bidang: ${newJabatan.bidang})`,
    });
  } catch (error) {
    console.error("PATCH /api/pengurus/[id]/ganti-jabatan error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengganti jabatan pengurus" },
      { status: 500 }
    );
  }
}
