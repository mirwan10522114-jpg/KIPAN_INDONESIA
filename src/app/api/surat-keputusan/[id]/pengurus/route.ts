import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, safeParseInt } from "@/lib/api-error";

// POST /api/surat-keputusan/[id]/pengurus — Tambah anggota ke SK (promosi Anggota → Pengurus)
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const skId = parseInt(idStr);
    const body = await req.json();

    const anggotaId = safeParseInt(body.anggotaId);
    if (anggotaId === null) {
      return NextResponse.json(
        { success: false, error: "anggotaId wajib diisi." },
        { status: 400 }
      );
    }
    const jabatanId = safeParseInt(body.jabatanId);
    if (jabatanId === null) {
      return NextResponse.json(
        { success: false, error: "jabatanId wajib diisi. Silakan pilih jabatan terlebih dahulu." },
        { status: 400 }
      );
    }

    // Validasi SK exists dan aktif
    const sk = await db.suratKeputusan.findUnique({ where: { id: skId } });
    if (!sk) {
      return NextResponse.json({ success: false, error: "SK tidak ditemukan." }, { status: 404 });
    }
    if (sk.status !== "Aktif") {
      return NextResponse.json(
        { success: false, error: "SK tidak aktif. Tidak bisa menambahkan pengurus ke SK yang sudah dinonaktifkan." },
        { status: 400 }
      );
    }
    if (sk.approvalStatus === "DISETUJUI") {
      return NextResponse.json(
        { success: false, error: "SK sudah disetujui secara final. Tidak dapat menambah pengurus lagi. Harap buat SK baru jika ada perubahan." },
        { status: 403 }
      );
    }

    // Validasi Anggota exists
    const anggota = await db.anggota.findUnique({
      where: { id: anggotaId },
      select: { id: true, namaLengkap: true, nia: true },
    });
    if (!anggota) {
      return NextResponse.json({ success: false, error: "Anggota tidak ditemukan." }, { status: 404 });
    }

    // Cek apakah anggota sudah ada di SK ini
    const alreadyInSK = await db.pengurus.findFirst({
      where: { anggotaId, suratKeputusanId: skId },
    });
    if (alreadyInSK) {
      return NextResponse.json(
        { success: false, error: `${anggota.namaLengkap} sudah tercantum di SK ini.` },
        { status: 400 }
      );
    }

    // Cek apakah jabatan ini adalah jabatan tunggal yang sudah diisi (mencegah Ketua ganda dsb)
    if (jabatanId) {
      const jabatanInfo = await db.jabatan.findUnique({ where: { id: jabatanId } });
      if (jabatanInfo) {
        const uniqueRoles = ["Ketua Umum", "Ketua", "Sekretaris Jenderal", "Sekretaris", "Bendahara Umum", "Bendahara"];
        // Jika jabatan tersebut termasuk jabatan inti yang tidak boleh ganda
        if (uniqueRoles.includes(jabatanInfo.nama)) {
          const roleTaken = await db.pengurus.findFirst({
            where: { suratKeputusanId: skId, jabatanId: jabatanInfo.id }
          });
          if (roleTaken) {
            return NextResponse.json(
              { success: false, error: `Jabatan '${jabatanInfo.nama}' sudah diisi oleh orang lain di SK ini. Jabatan inti tidak boleh ganda.` },
              { status: 400 }
            );
          }
        }
      }
    }

    // Demisionerkan pengurus lama untuk anggota ini jika ada
    await db.pengurus.updateMany({
      where: {
        anggotaId,
        status: "Aktif",
      },
      data: {
        status: "Demisioner",
        keteranganStatus: `Demisioner otomatis karena dipromosikan ke SK: ${sk.nomorSK} (${sk.level})`,
        tanggalSelesai: sk.tanggalTerbit,
      }
    });

    // Buat record pengurus
    const pengurus = await db.pengurus.create({
      data: {
        anggotaId,
        suratKeputusanId: skId,
        level: sk.level,
        provinsiId: sk.provinsiId,
        kabupatenId: sk.kabupatenId,
        jabatanId,
        status: "Aktif",
        tanggalMulai: sk.tanggalTerbit,
      },
      include: {
        anggota: { select: { namaLengkap: true, nia: true } },
      },
    });

    // Aktifkan wilayah jika perlu
    if (sk.level === "PROVINSI" && sk.provinsiId) {
      await db.provinsi.update({
        where: { id: sk.provinsiId },
        data: { status: "Aktif" },
      }).catch(() => {});
    } else if (sk.level === "KABUPATEN") {
      if (sk.kabupatenId) {
        await db.kabupaten.update({
          where: { id: sk.kabupatenId },
          data: { status: "Aktif" },
        }).catch(() => {});
      }
      if (sk.provinsiId) {
        await db.provinsi.update({
          where: { id: sk.provinsiId },
          data: { status: "Aktif" },
        }).catch(() => {});
      }
    }

    await db.activityLog.create({
      data: {
        table: "pengurus",
        recordId: pengurus.id,
        aksi: "create",
        oleh: "Admin",
        detail: JSON.stringify({
          anggotaId,
          suratKeputusanId: skId,
          nomorSK: sk.nomorSK,
          level: sk.level,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      data: pengurus,
      message: `${anggota.namaLengkap} berhasil ditambahkan sebagai pengurus di SK "${sk.nomorSK}".`,
    });
  } catch (error) {
    return handleApiError(error, "POST /api/surat-keputusan/[id]/pengurus", "Gagal menambahkan pengurus ke SK");
  }
}

// DELETE /api/surat-keputusan/[id]/pengurus — Hapus pengurus dari SK
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const skId = parseInt(idStr);
    const { searchParams } = new URL(req.url);
    const pengurusId = safeParseInt(searchParams.get("pengurusId"));

    if (pengurusId === null) {
      return NextResponse.json(
        { success: false, error: "pengurusId wajib diisi." },
        { status: 400 }
      );
    }

    const pengurus = await db.pengurus.findFirst({
      where: { id: pengurusId, suratKeputusanId: skId },
      include: { 
        anggota: { select: { namaLengkap: true } },
        suratKeputusan: { select: { approvalStatus: true } }
      },
    });

    if (!pengurus) {
      return NextResponse.json(
        { success: false, error: "Pengurus tidak ditemukan di SK ini." },
        { status: 404 }
      );
    }

    if (pengurus.suratKeputusan.approvalStatus === "DISETUJUI") {
      return NextResponse.json(
        { success: false, error: "SK sudah disetujui secara final. Tidak dapat menghapus pengurus. Harap nonaktifkan SK atau buat SK baru jika ada perubahan." },
        { status: 403 }
      );
    }

    await db.pengurus.delete({ where: { id: pengurusId } });

    await db.activityLog.create({
      data: {
        table: "pengurus",
        recordId: pengurusId,
        aksi: "delete",
        oleh: "Admin",
        detail: JSON.stringify({
          anggotaId: pengurus.anggotaId,
          suratKeputusanId: skId,
          nama: pengurus.anggota.namaLengkap,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `${pengurus.anggota.namaLengkap} berhasil dihapus dari SK.`,
    });
  } catch (error) {
    return handleApiError(error, "DELETE /api/surat-keputusan/[id]/pengurus", "Gagal menghapus pengurus dari SK");
  }
}
