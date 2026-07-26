import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/wilayah/[id]/detail?type=provinsi|kabupaten
// Returns: wilayah info + pengurus + anggota + kabupaten (if provinsi) + statistik + activity
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "provinsi";

    if (type === "provinsi") {
      const provinsi = await db.provinsi.findUnique({
        where: { id },
        include: {
          kabupaten: {
            include: {
              _count: { select: { anggota: true, pengurus: true } },
            },
            orderBy: { nama: "asc" },
          },
          pengurus: {
            include: {
              kabupaten: { select: { nama: true } },
            },
            orderBy: [{ level: "asc" }, { namaLengkap: "asc" }],
          },
          anggota: {
            include: {
              kabupaten: { select: { nama: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 100,
          },
        },
      });

      if (!provinsi) {
        return NextResponse.json({ success: false, error: "Provinsi tidak ditemukan" }, { status: 404 });
      }

      // Statistik
      const totalAnggota = await db.anggota.count({ where: { provinsiId: id } });
      const anggotaAktif = await db.anggota.count({ where: { provinsiId: id, status: "AKTIF" } });
      const anggotaNonaktif = await db.anggota.count({ where: { provinsiId: id, status: "NONAKTIF" } });
      const totalPengurus = await db.pengurus.count({ where: { provinsiId: id } });
      const pengurusAktif = await db.pengurus.count({ where: { provinsiId: id, status: "Aktif" } });
      const totalKabupaten = await db.kabupaten.count({ where: { provinsiId: id } });

      // Monthly growth (last 6 months)
      const monthlyGrowth = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
        const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() - i + 1, 1);
        const count = await db.anggota.count({
          where: {
            provinsiId: id,
            tanggalAngkat: { gte: monthStart, lt: monthEnd },
          },
        });
        monthlyGrowth.push({
          bulan: monthStart.toLocaleDateString("id-ID", { month: "short" }),
          jumlah: count,
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          wilayah: {
            id: provinsi.id,
            kode: provinsi.kode,
            nama: provinsi.nama,
            status: provinsi.status,
            ketua: provinsi.ketua,
            type: "provinsi",
            createdAt: provinsi.createdAt,
            updatedAt: provinsi.updatedAt,
          },
          kabupatenList: provinsi.kabupaten.map((k) => ({
            id: k.id,
            kode: k.kode,
            nama: k.nama,
            ketua: k.ketua,
            status: k.status,
            jumlahAnggota: k._count.anggota,
            jumlahPengurus: k._count.pengurus,
          })),
          pengurusList: provinsi.pengurus.map((p) => ({
            id: p.id,
            namaLengkap: p.namaLengkap,
            jabatan: p.jabatan,
            level: p.level,
            foto: p.foto,
            email: p.email,
            hp: p.hp,
            status: p.status,
            tanggalMulai: p.tanggalMulai,
            tanggalSelesai: p.tanggalSelesai,
            nomorSK: p.nomorSK,
            wilayah: p.kabupaten?.nama || provinsi.nama,
          })),
          anggotaList: provinsi.anggota.map((a) => ({
            id: a.id,
            nia: a.nia,
            namaLengkap: a.namaLengkap,
            foto: a.foto,
            status: a.status,
            angkatan: a.angkatan,
            kabupaten: a.kabupaten?.nama,
            tanggalDaftar: a.tanggalDaftar,
            tanggalAngkat: a.tanggalAngkat,
          })),
          statistik: {
            totalAnggota,
            anggotaAktif,
            anggotaNonaktif,
            totalPengurus,
            pengurusAktif,
            totalKabupaten,
            monthlyGrowth,
          },
          activity: [
            { tanggal: provinsi.createdAt, aksi: "Provinsi dibuat", oleh: "System" },
            ...(provinsi.ketua ? [{ tanggal: provinsi.updatedAt, aksi: `Ketua: ${provinsi.ketua}`, oleh: "Admin" }] : []),
          ],
        },
      });
    }

    // KABUPATEN
    const kabupaten = await db.kabupaten.findUnique({
      where: { id },
      include: {
        provinsi: { select: { nama: true, kode: true } },
        pengurus: {
          orderBy: [{ level: "asc" }, { namaLengkap: "asc" }],
        },
        anggota: {
          orderBy: { createdAt: "desc" },
          take: 100,
        },
      },
    });

    if (!kabupaten) {
      return NextResponse.json({ success: false, error: "Kabupaten tidak ditemukan" }, { status: 404 });
    }

    const totalAnggota = await db.anggota.count({ where: { kabupatenId: id } });
    const anggotaAktif = await db.anggota.count({ where: { kabupatenId: id, status: "AKTIF" } });
    const totalPengurus = await db.pengurus.count({ where: { kabupatenId: id } });

    const monthlyGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
      const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() - i + 1, 1);
      const count = await db.anggota.count({
        where: {
          kabupatenId: id,
          tanggalAngkat: { gte: monthStart, lt: monthEnd },
        },
      });
      monthlyGrowth.push({
        bulan: monthStart.toLocaleDateString("id-ID", { month: "short" }),
        jumlah: count,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        wilayah: {
          id: kabupaten.id,
          kode: kabupaten.kode,
          nama: kabupaten.nama,
          status: kabupaten.status,
          ketua: kabupaten.ketua,
          type: "kabupaten",
          provinsiNama: kabupaten.provinsi?.nama,
          createdAt: kabupaten.createdAt,
          updatedAt: kabupaten.updatedAt,
        },
        pengurusList: kabupaten.pengurus.map((p) => ({
          id: p.id,
          namaLengkap: p.namaLengkap,
          jabatan: p.jabatan,
          level: p.level,
          foto: p.foto,
          email: p.email,
          hp: p.hp,
          status: p.status,
          tanggalMulai: p.tanggalMulai,
          tanggalSelesai: p.tanggalSelesai,
          nomorSK: p.nomorSK,
          wilayah: kabupaten.nama,
        })),
        anggotaList: kabupaten.anggota.map((a) => ({
          id: a.id,
          nia: a.nia,
          namaLengkap: a.namaLengkap,
          foto: a.foto,
          status: a.status,
          angkatan: a.angkatan,
          tanggalDaftar: a.tanggalDaftar,
          tanggalAngkat: a.tanggalAngkat,
        })),
        statistik: {
          totalAnggota,
          anggotaAktif,
          anggotaNonaktif: totalAnggota - anggotaAktif,
          totalPengurus,
          pengurusAktif: await db.pengurus.count({ where: { kabupatenId: id, status: "Aktif" } }),
          totalKabupaten: 0,
          monthlyGrowth,
        },
        activity: [
          { tanggal: kabupaten.createdAt, aksi: "Kabupaten/Kota dibuat", oleh: "System" },
          ...(kabupaten.ketua ? [{ tanggal: kabupaten.updatedAt, aksi: `Ketua: ${kabupaten.ketua}`, oleh: "Admin" }] : []),
        ],
      },
    });
  } catch (error) {
    console.error("GET /api/wilayah/[id]/detail error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil detail wilayah" }, { status: 500 });
  }
}
