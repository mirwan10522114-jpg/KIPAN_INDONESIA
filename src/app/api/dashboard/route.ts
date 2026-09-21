import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/dashboard — Statistik untuk dashboard admin
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const wilayah = searchParams.get("wilayah");

    let pendaftaranFilter: any = {};
    let anggotaFilter: any = {};
    let provinsiId: number | null = null;
    let kabupatenId: number | null = null;

    if (role === "ADMIN_PROVINSI" && wilayah) {
      const w = wilayah.replace("Provinsi ", "").trim();
      const prov = await db.provinsi.findFirst({ where: { nama: w } });
      if (prov) {
        pendaftaranFilter = { provinsiId: prov.id };
        anggotaFilter = { provinsiId: prov.id };
        provinsiId = prov.id;
      } else {
        pendaftaranFilter = { provinsiId: -1 };
        anggotaFilter = { provinsiId: -1 };
      }
    } else if (role === "ADMIN_KABUPATEN" && wilayah) {
      const w = wilayah.replace("Kabupaten ", "Kab. ").trim();
      const kab = await db.kabupaten.findFirst({ where: { nama: w } });
      if (kab) {
        pendaftaranFilter = { kabupatenId: kab.id };
        anggotaFilter = { kabupatenId: kab.id };
        kabupatenId = kab.id;
      } else {
        pendaftaranFilter = { kabupatenId: -1 };
        anggotaFilter = { kabupatenId: -1 };
      }
    }

    const [
      totalAnggota,
      anggotaAktif,
      anggotaBaru,
      menungguVerifikasi,
      totalPengurusAktif,
      totalSKAktif,
      totalProvinsiAktif,
      totalKabupatenAktif,
      totalProvinsiSemua,
      totalKabupatenSemua,
      totalBerita,
      totalGaleri,
      totalProgram,
      pendaftaranByStatus,
      anggotaByStatus,
    ] = await Promise.all([
      // Anggota dihitung sesuai scope wilayah admin
      db.anggota.count({ where: anggotaFilter }),
      db.anggota.count({ where: { status: "AKTIF", ...anggotaFilter } }),
      db.anggota.count({
        where: {
          tanggalAngkat: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
          },
          ...anggotaFilter,
        },
      }),
      db.pendaftaran.count({
        where: { status: { in: ["DIAJUKAN", "DIVERIFIKASI"] }, ...pendaftaranFilter },
      }),
      // Pengurus aktif = yang punya SK aktif dan DISETUJUI
      db.pengurus.count({
        where: {
          status: "Aktif",
          suratKeputusan: { status: "Aktif", approvalStatus: "DISETUJUI" },
        },
      }),
      db.suratKeputusan.count({ where: { status: "Aktif", approvalStatus: "DISETUJUI" } }),
      db.provinsi.count({
        where: {
          OR: [
            { status: "Aktif" },
            { pengurus: { some: { status: "Aktif" } } },
            { anggota: { some: { status: "AKTIF" } } },
          ],
        },
      }),
      db.kabupaten.count({
        where: {
          OR: [
            { status: "Aktif" },
            { pengurus: { some: { status: "Aktif" } } },
            { anggota: { some: { status: "AKTIF" } } },
          ],
        },
      }),
      db.provinsi.count(),
      db.kabupaten.count(),
      db.berita.count(),
      db.galeri.count(),
      db.programKerja.count(),
      db.pendaftaran.groupBy({
        by: ["status"],
        where: pendaftaranFilter,
        _count: true,
      }),
      // anggotaByStatus sesuai scope
      db.anggota.groupBy({
        by: ["status"],
        where: anggotaFilter,
        _count: true,
      }),
    ]);

    // ── WILAYAH CHART: adaptif sesuai role ──────────────────────────────
    // ADMIN_KABUPATEN → per Kecamatan
    // ADMIN_PROVINSI  → per Kabupaten di provinsinya
    // SUPER_ADMIN / ADMIN_NASIONAL → per Provinsi
    let wilayahChart: { nama: string; kode: string; jumlah: number }[] = [];
    let wilayahChartLabel = "Anggota per Provinsi";

    if (kabupatenId !== null) {
      // Kumpulkan anggota per kecamatan dalam kabupaten ini
      wilayahChartLabel = "Anggota per Kecamatan";
      const rows = await db.anggota.groupBy({
        by: ["kecamatan"],
        where: { kabupatenId },
        _count: true,
        orderBy: { _count: { kecamatan: "desc" } },
      });
      wilayahChart = rows
        .filter((r) => r.kecamatan)
        .map((r) => ({ nama: r.kecamatan!, kode: "", jumlah: r._count }))
        .sort((a, b) => b.jumlah - a.jumlah);
    } else if (provinsiId !== null) {
      // Kumpulkan anggota per kabupaten dalam provinsi ini
      wilayahChartLabel = "Anggota per Kabupaten";
      const allKab = await db.kabupaten.findMany({
        where: { provinsiId },
        select: { id: true, nama: true, kode: true },
      });
      const rows = await db.anggota.groupBy({
        by: ["kabupatenId"],
        where: { provinsiId },
        _count: true,
      });
      wilayahChart = rows
        .map((r) => {
          const kab = allKab.find((k) => k.id === r.kabupatenId);
          return { nama: kab?.nama || "Unknown", kode: kab?.kode || "", jumlah: r._count };
        })
        .filter((p) => p.nama !== "Unknown")
        .sort((a, b) => b.jumlah - a.jumlah);
    } else {
      // SUPER_ADMIN / ADMIN_NASIONAL: per Provinsi
      wilayahChartLabel = "Anggota per Provinsi";
      const allProvinsi = await db.provinsi.findMany({
        select: { id: true, nama: true, kode: true },
      });
      const rows = await db.anggota.groupBy({
        by: ["provinsiId"],
        _count: true,
        orderBy: { _count: { provinsiId: "desc" } },
      });
      wilayahChart = rows
        .map((g) => {
          const prov = allProvinsi.find((p) => p.id === g.provinsiId);
          return { nama: prov?.nama || "Unknown", kode: prov?.kode || "", jumlah: g._count };
        })
        .filter((p) => p.nama !== "Unknown")
        .sort((a, b) => b.jumlah - a.jumlah);
    }

    // Pengurus nasional count untuk referensi
    const pengurusNasionalCount = await db.pengurus.count({
      where: { status: "Aktif", level: "NASIONAL", suratKeputusan: { status: "Aktif", approvalStatus: "DISETUJUI" } },
    });

    // Recent activities (pendaftaran terbaru)
    const recentPendaftaran = await db.pendaftaran.findMany({
      where: pendaftaranFilter,
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
      where: { createdAt: { gte: today }, ...pendaftaranFilter },
    });

    const trendFilter = req.nextUrl.searchParams.get("trendFilter") || "7_bulan";
    const monthlyTrend: Array<{ bulan: string; baru: number }> = [];

    if (trendFilter === "7_hari" || trendFilter === "30_hari") {
      const days = trendFilter === "7_hari" ? 7 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (days - 1));
      startDate.setHours(0, 0, 0, 0);

      const dailyRaw = await db.$queryRaw`
        SELECT DATE_FORMAT(tanggalAngkat, '%Y-%m-%d') as tgl_key, COUNT(*) as jumlah
        FROM anggota
        WHERE tanggalAngkat >= ${startDate}
        GROUP BY tgl_key
        ORDER BY tgl_key
      ` as Array<{ tgl_key: string; jumlah: bigint }>;
      
      const dailyMap: Record<string, number> = {};
      for (const row of dailyRaw) dailyMap[row.tgl_key] = Number(row.jumlah);

      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        monthlyTrend.push({
          bulan: d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
          baru: dailyMap[key] || 0,
        });
      }
    } else {
      // 7_bulan or 12_bulan
      const months = trendFilter === "12_bulan" ? 12 : 7;
      const startDate = new Date(new Date().getFullYear(), new Date().getMonth() - (months - 1), 1);
      
      const monthlyRaw = await db.$queryRaw`
        SELECT DATE_FORMAT(tanggalAngkat, '%Y-%m') as bulan_key, COUNT(*) as jumlah
        FROM anggota
        WHERE tanggalAngkat >= ${startDate}
        GROUP BY bulan_key
        ORDER BY bulan_key
      ` as Array<{ bulan_key: string; jumlah: bigint }>;
      
      const monthlyMap: Record<string, number> = {};
      for (const row of monthlyRaw) monthlyMap[row.bulan_key] = Number(row.jumlah);

      for (let i = months - 1; i >= 0; i--) {
        const monthDate = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
        const key = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
        monthlyTrend.push({
          bulan: monthDate.toLocaleDateString("id-ID", { month: "short", year: months === 12 ? "2-digit" : undefined }),
          baru: monthlyMap[key] || 0,
        });
      }
    }

    const response = NextResponse.json({
      success: true,
      data: {
        stats: {
          totalAnggota,
          anggotaAktif,
          anggotaBaru,
          menungguVerifikasi,
          totalPengurus: totalPengurusAktif,
          totalSKAktif,
          totalProvinsi: totalProvinsiAktif,
          totalKabupaten: totalKabupatenAktif,
          totalProvinsiSemua,
          totalKabupatenSemua,
          totalBerita,
          totalGaleri,
          totalProgram,
          pendaftaranHariIni,
          pengurusNasional: pengurusNasionalCount,
        },
        pendaftaranByStatus: pendaftaranByStatus.reduce((acc: any, cur) => {
          acc[cur.status] = cur._count;
          return acc;
        }, {}),
        wilayahChart,
        wilayahChartLabel,
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
    return response;
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data dashboard" }, { status: 500 });
  }
}
