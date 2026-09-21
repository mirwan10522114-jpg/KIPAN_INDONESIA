import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { decryptNIK } from "@/lib/encryption";

// GET /api/anggota/[id]/detail — Full detail with tabs data
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);

    const anggota = await db.anggota.findUnique({
      where: { id },
      include: {
        provinsi: { select: { id: true, nama: true, kode: true } },
        kabupaten: { select: { id: true, nama: true, kode: true } },
      },
    });

    if (!anggota) {
      return NextResponse.json({ success: false, error: "Anggota tidak ditemukan" }, { status: 404 });
    }

    // Get pengurus in anggota's wilayah
    const wherePengurus: import("@prisma/client").Prisma.PengurusWhereInput = { status: "Aktif" };
    if (anggota.kabupatenId) {
      wherePengurus.OR = [
        { kabupatenId: anggota.kabupatenId },
        { provinsiId: anggota.provinsiId, level: "PROVINSI" },
        { level: "NASIONAL" },
      ];
    } else {
      wherePengurus.OR = [
        { provinsiId: anggota.provinsiId },
        { level: "NASIONAL" },
      ];
    }

    const pengurusWilayah = await db.pengurus.findMany({
      where: wherePengurus,
      include: {
        anggota: {
          select: {
            id: true,
            namaLengkap: true,
            foto: true,
            email: true,
            whatsapp: true,
            nia: true,
          },
        },
        suratKeputusan: { select: { judul: true, nomorSK: true } },
        provinsi: { select: { nama: true } },
        kabupaten: { select: { nama: true } },
        jabatan: { select: { nama: true } },
      },
      take: 10,
      orderBy: [
        { level: "asc" },
        { tanggalMulai: "asc" },
      ],
    });

    // Pendaftaran riwayat (if linked)
    const pendaftaranRiwayat = await db.pendaftaranRiwayat.findMany({
      where: {
        pendaftaran: {
          nik: anggota.nik,
        },
      },
      include: {
        pendaftaran: { select: { id: true, namaLengkap: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    // Build riwayat from anggota dates + pendaftaran riwayat
    const riwayat = [
      { tanggal: anggota.tanggalDaftar, aksi: "Pendaftaran diterima", oleh: "Calon Anggota" },
      ...(pendaftaranRiwayat.map((r) => ({
        tanggal: r.createdAt,
        aksi: r.aksi,
        oleh: r.oleh,
      }))),
      ...(anggota.tanggalAngkat ? [{ tanggal: anggota.tanggalAngkat, aksi: "Diangkat menjadi anggota", oleh: "Admin" }] : []),
    ];

    return NextResponse.json({
      success: true,
      data: {
        anggota: {
          id: anggota.id,
          nia: anggota.nia,
          namaLengkap: anggota.namaLengkap,
          nik: decryptNIK(anggota.nik),
          tempatLahir: anggota.tempatLahir,
          tanggalLahir: anggota.tanggalLahir,
          jenisKelamin: anggota.jenisKelamin,
          agama: anggota.agama,
          pendidikan: anggota.pendidikan,
          pekerjaan: anggota.pekerjaan,
          alamat: anggota.alamat,
          provinsi: anggota.provinsi,
          kabupaten: anggota.kabupaten,
          kecamatan: anggota.kecamatan,
          desa: anggota.desa,
          kodePos: anggota.kodePos,
          email: anggota.email,
          whatsapp: anggota.whatsapp,
          foto: anggota.foto,
          ktp: anggota.ktp,
          cv: anggota.cv,
          suratPernyataan: anggota.suratPernyataan,
          suratSehat: anggota.suratSehat,
          status: anggota.status,
          tanggalDaftar: anggota.tanggalDaftar,
          tanggalAngkat: anggota.tanggalAngkat,
          createdAt: anggota.createdAt,
          updatedAt: anggota.updatedAt,
        },
        pengurusWilayah: pengurusWilayah.map((p) => ({
          id: p.id,
          namaLengkap: p.anggota?.namaLengkap || "-",
          jabatan: p.suratKeputusan ? (p.jabatan?.nama || (p.level === "NASIONAL" ? "Pengurus Nasional" : p.level === "PROVINSI" ? "Pengurus Provinsi" : "Pengurus Kabupaten/Kota")) : "-",
          level: p.level,
          foto: p.anggota?.foto,
          email: p.anggota?.email,
          whatsapp: p.anggota?.whatsapp,
          status: p.status,
          wilayah: p.kabupaten?.nama || p.provinsi?.nama || "Indonesia",
        })),
        riwayat,
        activity: [
          { tanggal: anggota.createdAt, aksi: "Data anggota dibuat", oleh: "System" },
          ...(anggota.tanggalAngkat ? [{ tanggal: anggota.tanggalAngkat, aksi: "Anggota diangkat", oleh: "Admin" }] : []),
          { tanggal: anggota.updatedAt, aksi: "Data diperbarui", oleh: "System" },
        ],
      },
    });
  } catch (error) {
    console.error("GET /api/anggota/[id]/detail error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil detail anggota" }, { status: 500 });
  }
}
