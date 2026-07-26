import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/dashboard — Statistik untuk dashboard admin
export async function GET() {
  try {
    const [
      totalAnggota,
      anggotaAktif,
      anggotaBaru,
      menungguVerifikasi,
      totalPengurus,
      totalProvinsi,
      totalKabupaten,
      totalBerita,
      totalGaleri,
      totalProgram,
      pendaftaranByStatus,
      anggotaByProvinsi,
      anggotaByStatus,
    ] = await Promise.all([
      db.anggota.count(),
      db.anggota.count({ where: { status: "AKTIF" } }),
      db.anggota.count({
        where: {
          tanggalAngkat: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          },
        },
      }),
      db.pendaftaran.count({
        where: { status: { in: ["DIAJUKAN", "DIVERIFIKASI"] } },
      }),
      db.pengurus.count({ where: { status: "Aktif" } }),
      db.provinsi.count(),
      db.kabupaten.count(),
      db.berita.count(),
      db.galeri.count(),
      db.programKerja.count(),
      db.pendaftaran.groupBy({
        by: ["status"],
        _count: true,
      }),
      db.anggota.groupBy({
        by: ["provinsiId"],
        _count: true,
      }),
      db.anggota.groupBy({
        by: ["status"],
        _count: true,
      }),
    ]);

    // Get provinsi names
    const provinsiIds = anggotaByProvinsi.map((a) => a.provinsiId);
    const provinsiList = await db.provinsi.findMany({
      where: { id: { in: provinsiIds } },
      select: { id: true, nama: true, kode: true },
    });

    const anggotaPerProvinsi = anggotaByProvinsi.map((a) => {
      const prov = provinsiList.find((p) => p.id === a.provinsiId);
      return {
        nama: prov?.nama || "Unknown",
        kode: prov?.kode || "",
        jumlah: a._count,
      };
    }).sort((a, b) => b.jumlah - a.jumlah);

    // Recent activities (pendaftaran terbaru)
    const recentPendaftaran = await db.pendaftaran.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        namaLengkap: true,
        status: true,
        createdAt: true,
        kabupaten: { select: { nama: true } },
      },
    });

    // Pendaftaran hari ini
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const pendaftaranHariIni = await db.pendaftaran.count({
      where: { createdAt: { gte: today } },
    });

    // Trend anggota baru 7 bulan terakhir
    const monthlyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
      const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() - i + 1, 1);
      const count = await db.anggota.count({
        where: {
          tanggalAngkat: {
            gte: monthStart,
            lt: monthEnd,
          },
        },
      });
      monthlyTrend.push({
        bulan: monthStart.toLocaleDateString("id-ID", { month: "short" }),
        baru: count,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalAnggota,
          anggotaAktif,
          anggotaBaru,
          menungguVerifikasi,
          totalPengurus,
          totalProvinsi,
          totalKabupaten,
          totalBerita,
          totalGaleri,
          totalProgram,
          pendaftaranHariIni,
        },
        pendaftaranByStatus: pendaftaranByStatus.reduce((acc: any, cur) => {
          acc[cur.status] = cur._count;
          return acc;
        }, {}),
        anggotaPerProvinsi,
        anggotaByStatus: anggotaByStatus.reduce((acc: any, cur) => {
          acc[cur.status] = cur._count;
          return acc;
        }, {}),
        recentPendaftaran: recentPendaftaran.map((p) => ({
          id: p.id,
          nama: p.namaLengkap,
          status: p.status,
          waktu: p.createdAt,
          kabupaten: p.kabupaten?.nama,
        })),
        monthlyTrend,
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data dashboard" }, { status: 500 });
  }
}
