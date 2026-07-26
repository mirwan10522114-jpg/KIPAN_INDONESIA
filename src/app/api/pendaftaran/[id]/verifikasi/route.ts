import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PATCH /api/pendaftaran/[id]/verifikasi — Update status pendaftaran
// Body: { status: "DISETUJUI" | "DITOLAK" | "PERBAIKAN" | "DIVERIFIKASI", catatan?: string }
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);
    const body = await req.json();
    const { status, catatan } = body;

    const validStatus = ["DIAJUKAN", "DIVERIFIKASI", "DISETUJUI", "DITOLAK", "PERBAIKAN"];
    if (!validStatus.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Status tidak valid" },
        { status: 400 }
      );
    }

    const pendaftaran = await db.pendaftaran.update({
      where: { id },
      data: {
        status,
        catatan: catatan || null,
      },
    });

    // Tambah riwayat
    const aksiText =
      status === "DISETUJUI" ? "Disetujui, menunggu jadwal pelatihan" :
      status === "DITOLAK" ? "Pendaftaran ditolak" :
      status === "PERBAIKAN" ? "Diminta perbaikan dokumen" :
      status === "DIVERIFIKASI" ? "Verifikasi berkas dimulai" :
      "Status diperbarui";

    await db.pendaftaranRiwayat.create({
      data: {
        pendaftaranId: id,
        aksi: aksiText,
        oleh: "Admin Kabupaten",
        catatan: catatan || null,
      },
    });

    // Jika disetujui, buat record anggota
    if (status === "DISETUJUI") {
      // Generate NIA: KIPAN-PROVKODE-KABKODE-YEAR-SEQ
      const tahun = new Date().getFullYear();
      const prov = await db.provinsi.findUnique({ where: { id: pendaftaran.provinsiId } });
      const kab = await db.kabupaten.findUnique({ where: { id: pendaftaran.kabupatenId } });

      const countAnggotaThisYear = await db.anggota.count({
        where: {
          provinsiId: pendaftaran.provinsiId,
          kabupatenId: pendaftaran.kabupatenId,
          tanggalAngkat: { gte: new Date(tahun, 0, 1) },
        },
      });

      const seq = String(countAnggotaThisYear + 1).padStart(5, "0");
      const nia = `KIPAN-${prov?.kode}-${kab?.kode}-${tahun}-${seq}`;

      await db.anggota.create({
        data: {
          nia,
          namaLengkap: pendaftaran.namaLengkap,
          nik: pendaftaran.nik,
          tempatLahir: pendaftaran.tempatLahir,
          tanggalLahir: pendaftaran.tanggalLahir,
          jenisKelamin: pendaftaran.jenisKelamin,
          agama: pendaftaran.agama,
          pendidikan: pendaftaran.pendidikan,
          pekerjaan: pendaftaran.pekerjaan,
          alamat: pendaftaran.alamat,
          provinsiId: pendaftaran.provinsiId,
          kabupatenId: pendaftaran.kabupatenId,
          kecamatan: pendaftaran.kecamatan,
          desa: pendaftaran.desa,
          kodePos: pendaftaran.kodePos,
          email: pendaftaran.email,
          hp: pendaftaran.hp,
          whatsapp: pendaftaran.whatsapp,
          foto: pendaftaran.foto,
          ktp: pendaftaran.ktp,
          cv: pendaftaran.cv,
          suratPernyataan: pendaftaran.suratPernyataan,
          suratSehat: pendaftaran.suratSehat,
          status: "AKTIF",
          angkatan: "XII",
          tanggalAngkat: new Date(),
          tanggalDaftar: pendaftaran.createdAt,
        },
      });

      await db.pendaftaranRiwayat.create({
        data: {
          pendaftaranId: id,
          aksi: `Menjadi anggota dengan NIA: ${nia}`,
          oleh: "Sistem",
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: pendaftaran,
      message: `Status pendaftaran diperbarui menjadi ${status}`,
    });
  } catch (error) {
    console.error("PATCH /api/pendaftaran/[id]/verifikasi error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal update status pendaftaran" },
      { status: 500 }
    );
  }
}
