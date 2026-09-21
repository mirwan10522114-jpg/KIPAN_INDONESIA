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

    // Validasi: level jabatan baru harus cocok dengan level pengurus
    const levelMap: Record<string, string> = {
      NASIONAL: "Nasional",
      PROVINSI: "Provinsi",
      KABUPATEN: "Kabupaten",
    };
    const pengurusLevelName = levelMap[currentPengurus.level] || currentPengurus.level;
    if (newJabatan.level !== pengurusLevelName) {
      return NextResponse.json(
        {
          success: false,
          error: `Level jabatan tidak sesuai. Pengurus ini berada di level ${pengurusLevelName}, jabatan yang dipilih berada di level ${newJabatan.level}.`,
        },
        { status: 400 }
      );
    }

    // Jika jabatan sama, tidak perlu perubahan
    if (currentPengurus.jabatanId === parseInt(jabatanId)) {
      return NextResponse.json({
        success: true,
        message: "Jabatan tidak berubah (sama dengan jabatan saat ini)",
      });
    }

    // OTOMATIS akhiri SEMUA jabatan aktif lain yang dimiliki anggota ini
    const otherActiveList = await db.pengurus.findMany({
      where: {
        anggotaId: currentPengurus.anggotaId,
        status: "Aktif",
      },
      include: { jabatan: true },
    });

    let endedInfo = "";
    if (otherActiveList.length > 0) {
      await db.pengurus.updateMany({
        where: {
          anggotaId: currentPengurus.anggotaId,
          status: "Aktif",
        },
        data: {
          status: "Selesai",
          tanggalSelesai: new Date(),
        },
      });
    const otherNames = otherActiveList
      .map(p => `"${p.jabatan?.nama}" level ${p.level}`)
      .join(", ");
    endedInfo = ` Jabatan lama (${otherNames}) otomatis diakhiri.`;
  }

  // Buat record pengurus baru dengan jabatan baru
  const newPengurus = await db.pengurus.create({
    data: {
      anggotaId: currentPengurus.anggotaId,
      suratKeputusanId: currentPengurus.suratKeputusanId,
      jabatanId: parseInt(jabatanId),
      level: currentPengurus.level,
      provinsiId: currentPengurus.provinsiId,
      kabupatenId: currentPengurus.kabupatenId,
      status: "Aktif",
      tanggalMulai: new Date(),
    },
    include: {
      anggota: {
        select: { id: true, namaLengkap: true, nia: true, foto: true, email: true,  },
      },
      jabatan: { select: { nama: true, level: true } },
      provinsi: { select: { nama: true } },
      kabupaten: { select: { nama: true } },
    },
  });

  await db.activityLog.create({
    data: {
      table: "pengurus",
      recordId: newPengurus.id,
      aksi: "ganti_jabatan",
      oleh: "Admin",
      detail: JSON.stringify({ oldPengurusId: id, newJabatan: newJabatan.nama, level: newPengurus.level }),
    },
  });

  return NextResponse.json({
    success: true,
    data: newPengurus,
    message: `Jabatan berhasil diganti ke "${newJabatan.nama}" (level: ${newPengurus.level}).${endedInfo}`,
  });
  } catch (error) {
    console.error("PATCH /api/pengurus/[id]/ganti-jabatan error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengganti jabatan pengurus" },
      { status: 500 }
    );
  }
}
