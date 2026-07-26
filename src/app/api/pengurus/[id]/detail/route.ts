import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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
        jabatan: { select: { id: true, nama: true, level: true, urutan: true } },
        provinsi: { select: { id: true, nama: true, kode: true } },
        kabupaten: { select: { id: true, nama: true, kode: true } },
      },
    });

    if (!pengurus) {
      return NextResponse.json({ success: false, error: "Pengurus tidak ditemukan" }, { status: 404 });
    }

    // Get ALL jabatan history for this anggota
    const allJabatan = await db.pengurus.findMany({
      where: { anggotaId: pengurus.anggotaId },
      include: {
        jabatan: { select: { nama: true, level: true } },
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
          nomorSK: pengurus.nomorSK,
          fileSK: pengurus.fileSK,
          // From anggota
          anggotaId: a.id,
          nia: a.nia,
          namaLengkap: a.namaLengkap,
          nik: a.nik,
          tempatLahir: a.tempatLahir,
          tanggalLahir: a.tanggalLahir,
          jenisKelamin: a.jenisKelamin,
          agama: a.agama,
          pendidikan: a.pendidikan,
          pekerjaan: a.pekerjaan,
          alamat: a.alamat,
          email: a.email,
          hp: a.hp,
          whatsapp: a.whatsapp,
          foto: a.foto,
          // Dokumen anggota
          ktp: a.ktp,
          cv: a.cv,
          suratPernyataan: a.suratPernyataan,
          suratSehat: a.suratSehat,
          // From jabatan
          jabatanNama: pengurus.jabatan?.nama,
          jabatanLevel: pengurus.jabatan?.level,
          jabatanUrutan: pengurus.jabatan?.urutan,
          // Wilayah
          provinsi: pengurus.provinsi || a.provinsi,
          kabupaten: pengurus.kabupaten || a.kabupaten,
        },
        riwayatJabatan: allJabatan.map((p) => ({
          id: p.id,
          jabatan: p.jabatan?.nama || "-",
          level: p.level,
          wilayah: p.kabupaten?.nama || p.provinsi?.nama || "Indonesia",
          tanggalMulai: p.tanggalMulai,
          tanggalSelesai: p.tanggalSelesai,
          nomorSK: p.nomorSK,
          status: p.status,
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
