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
        provinsi: { select: { id: true, nama: true, kode: true } },
        kabupaten: { select: { id: true, nama: true, kode: true } },
      },
    });

    if (!pengurus) {
      return NextResponse.json({ success: false, error: "Pengurus tidak ditemukan" }, { status: 404 });
    }

    // Get anggota in this pengurus's wilayah
    const whereAnggota: any = {};
    if (pengurus.level === "KABUPATEN" && pengurus.kabupatenId) {
      whereAnggota.kabupatenId = pengurus.kabupatenId;
    } else if (pengurus.level === "PROVINSI" && pengurus.provinsiId) {
      whereAnggota.provinsiId = pengurus.provinsiId;
    } else if (pengurus.level === "NASIONAL") {
      // All anggota
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

    // Mock riwayat jabatan (in production, this would be a separate table)
    const riwayatJabatan = [
      {
        id: 1,
        jabatan: pengurus.jabatan,
        level: pengurus.level,
        wilayah: pengurus.level === "Nasional" ? "Indonesia" : (pengurus.kabupaten?.nama || pengurus.provinsi?.nama || ""),
        tanggalMulai: pengurus.tanggalMulai,
        tanggalSelesai: pengurus.tanggalSelesai,
        nomorSK: pengurus.nomorSK,
        status: pengurus.status,
        aktif: true,
      },
    ];

    // Mock activity log
    const activity = [
      { tanggal: pengurus.createdAt, aksi: "Pengurus ditambahkan ke sistem", oleh: "Admin" },
      { tanggal: pengurus.updatedAt, aksi: "Data pengurus diperbarui", oleh: "Admin" },
    ];

    return NextResponse.json({
      success: true,
      data: {
        pengurus: {
          id: pengurus.id,
          namaLengkap: pengurus.namaLengkap,
          jabatan: pengurus.jabatan,
          level: pengurus.level,
          foto: pengurus.foto,
          email: pengurus.email,
          hp: pengurus.hp,
          status: pengurus.status,
          tanggalMulai: pengurus.tanggalMulai,
          tanggalSelesai: pengurus.tanggalSelesai,
          nomorSK: pengurus.nomorSK,
          tempatLahir: pengurus.tempatLahir,
          tanggalLahir: pengurus.tanggalLahir,
          alamat: pengurus.alamat,
          provinsi: pengurus.provinsi,
          kabupaten: pengurus.kabupaten,
        },
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
        riwayatJabatan,
        activity,
      },
    });
  } catch (error) {
    console.error("GET /api/pengurus/[id]/detail error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil detail pengurus" }, { status: 500 });
  }
}
