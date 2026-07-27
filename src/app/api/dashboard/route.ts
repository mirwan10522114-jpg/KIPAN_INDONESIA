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
      db.anggota.count({ where: { status: "Aktif" } }),
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

    // PERBAIKAN: Hitung pengurus per provinsi berdasarkan LEVEL pengurus (bukan provinsiId anggota)
    // - Pengurus level PROVINSI: dihitung di provinsi tsb
    // - Pengurus level KABUPATEN: dihitung di provinsi tempat kabupaten tsb berada
    // - Pengurus level NASIONAL: TIDAK dihitung di provinsi mana pun (mereka tingkat pusat)
    const pengurusPerProvinsiRaw = await db.pengurus.findMany({
      where: {
        status: "Aktif",
        OR: [
          { level: "PROVINSI" },
          { level: "KABUPATEN" },
        ],
      },
      select: {
        level: true,
        provinsiId: true,
        kabupaten: { select: { provinsiId: true } },
      },
    });
    const pengurusPerProvinsiMap: Record<number, number> = {};
    let pengurusNasionalCount = 0;
    for (const p of pengurusPerProvinsiRaw) {
      let provId = null;
      if (p.level === "PROVINSI") provId = p.provinsiId;
      else if (p.level === "KABUPATEN") provId = p.kabupaten?.provinsiId;
      if (provId) {
        pengurusPerProvinsiMap[provId] = (pengurusPerProvinsiMap[provId] || 0) + 1;
      }
    }
    // Tambah count pengurus Nasional (untuk konsistensi total = 78)
    pengurusNasionalCount = await db.pengurus.count({
      where: { status: "Aktif", level: "NASIONAL" },
    });
    const anggotaPerProvinsi = Object.entries(pengurusPerProvinsiMap)
      .map(([provIdStr, jumlah]) => {
        const prov = provinsiList.find((p) => p.id === parseInt(provIdStr));
        return {
          nama: prov?.nama || "Unknown",
          kode: prov?.kode || "",
          jumlah,
        };
      })
      .sort((a, b) => b.jumlah - a.jumlah);
    // Tambahkan "Nasional (Pusat)" di awal list
    if (pengurusNasionalCount > 0) {
      anggotaPerProvinsi.unshift({
        nama: "Nasional (Pusat)",
        kode: "PUSAT",
        jumlah: pengurusNasionalCount,
      });
    }

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

    // Trend anggota baru 7 bulan terakhir — single groupBy query (optimized)
    const sixMonthsAgo = new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1);
    const monthlyRaw = await db.$queryRaw`
      SELECT strftime('%Y-%m', tanggalAngkat) as bulan_key, COUNT(*) as jumlah
      FROM anggota
      WHERE tanggalAngkat >= ${sixMonthsAgo}
      GROUP BY bulan_key
      ORDER BY bulan_key
    ` as Array<{ bulan_key: string; jumlah: bigint }>;
    const monthlyMap: Record<string, number> = {};
    for (const row of monthlyRaw) {
      monthlyMap[row.bulan_key] = Number(row.jumlah);
    }
    const monthlyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const monthDate = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
      const key = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
      monthlyTrend.push({
        bulan: monthDate.toLocaleDateString("id-ID", { month: "short" }),
        baru: monthlyMap[key] || 0,
      });
    }

    const response = NextResponse.json({
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
    response.headers.set("Cache-Control", "max-age=60");
    return response;
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data dashboard" }, { status: 500 });
  }
}
