import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decryptNIK } from "@/lib/encryption";

// GET /api/pengurus/[id]/detail — Full detail with tabs data
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);

    const pengurus = await db.pengurus.findUnique({
      where: { id },
      include: {
        anggota: {
          include: {
            provinsi: { select: { id: true, nama: true, kode: true } },
            kabupaten: { select: { id: true, nama: true, kode: true } },
          },
        },
        suratKeputusan: { select: { id: true, nomorSK: true, judul: true, level: true, status: true, fileSK: true, tanggalTerbit: true } },
        provinsi: { select: { id: true, nama: true, kode: true } },
        kabupaten: { select: { id: true, nama: true, kode: true } },
      },
    });

    if (!pengurus) {
      return NextResponse.json({ success: false, error: "Pengurus tidak ditemukan" }, { status: 404 });
    }

    // Get ALL SK history for this anggota
    const allPengurus = await db.pengurus.findMany({
      where: { anggotaId: pengurus.anggotaId },
      include: {
        suratKeputusan: { select: { nomorSK: true, judul: true, level: true, status: true } },
        provinsi: { select: { nama: true } },
        kabupaten: { select: { nama: true } },
      },
      orderBy: { tanggalMulai: "asc" },
    });

    // Get anggota in this pengurus's wilayah
    const whereAnggota: any = {};
    if (pengurus.level === "KABUPATEN" && pengurus.kabupatenId) {
      whereAnggota.kabupatenId = pengurus.kabupatenId;
    } else if (pengurus.level === "PROVINSI" && pengurus.provinsiId) {
      whereAnggota.provinsiId = pengurus.provinsiId;
    }

    const anggotaList = await db.anggota.findMany({
      where: whereAnggota,
      include: {
        provinsi: { select: { nama: true } },
        kabupaten: { select: { nama: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const totalAnggota = await db.anggota.count({ where: whereAnggota });

    const a = pengurus.anggota;

    return NextResponse.json({
      success: true,
      data: {
        pengurus: {
          id: pengurus.id,
          level: pengurus.level,
          status: pengurus.status,
          tanggalMulai: pengurus.tanggalMulai,
          tanggalSelesai: pengurus.tanggalSelesai,
          // From SK
          nomorSK: pengurus.suratKeputusan?.nomorSK,
          judulSK: pengurus.suratKeputusan?.judul,
          statusSK: pengurus.suratKeputusan?.status,
          fileSK: pengurus.suratKeputusan?.fileSK,
          // From anggota
          anggotaId: a.id,
          nia: a.nia,
          namaLengkap: a.namaLengkap,
          nik: decryptNIK(a.nik),
          tempatLahir: a.tempatLahir,
          tanggalLahir: a.tanggalLahir,
          jenisKelamin: a.jenisKelamin,
          agama: a.agama,
          pendidikan: a.pendidikan,
          pekerjaan: a.pekerjaan,
          alamat: a.alamat,
          email: a.email,
          whatsapp: a.whatsapp,
          foto: a.foto,
          // Dokumen anggota
          ktp: a.ktp,
          cv: a.cv,
          suratPernyataan: a.suratPernyataan,
          suratSehat: a.suratSehat,
          // Wilayah Tambahan
          provinsiId: a.provinsiId,
          kabupatenId: a.kabupatenId,
          kecamatan: a.kecamatan,
          desa: a.desa,
          kodePos: a.kodePos,
          // Wilayah
          provinsi: pengurus.provinsi || a.provinsi,
          kabupaten: pengurus.kabupaten || a.kabupaten,
        },
        riwayatSK: allPengurus.map((p) => ({
          id: p.id,
          nomorSK: p.suratKeputusan?.nomorSK || "-",
          judulSK: p.suratKeputusan?.judul || "-",
          level: p.level,
          wilayah: p.kabupaten?.nama || p.provinsi?.nama || "Indonesia",
          tanggalMulai: p.tanggalMulai,
          tanggalSelesai: p.tanggalSelesai,
          status: p.status,
          statusSK: p.suratKeputusan?.status,
        })),
        anggotaList: anggotaList.map((a) => ({
          id: a.id,
          nia: a.nia,
          namaLengkap: a.namaLengkap,
          foto: a.foto,
          status: a.status,
          angkatan: a.angkatan,
          kabupaten: a.kabupaten?.nama,
          provinsi: a.provinsi?.nama,
          tanggalDaftar: a.tanggalDaftar,
          tanggalAngkat: a.tanggalAngkat,
        })),
        totalAnggota,
        activity: [
          { tanggal: pengurus.createdAt, aksi: "Pengurus ditunjuk", oleh: "Admin" },
          { tanggal: pengurus.updatedAt, aksi: "Data pengurus diperbarui", oleh: "Admin" },
        ],
      },
    });
  } catch (error) {
    console.error("GET /api/pengurus/[id]/detail error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil detail pengurus" }, { status: 500 });
  }
}
