import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/wilayah/[id]/detail?type=provinsi|kabupaten
// Returns: wilayah info + pengurus + kabupaten (if provinsi) + statistik + activity
// Note: Konsep "Anggota" sudah dihapus — semua orang adalah Pengurus dengan jabatan tertentu.
// Statistik monthlyGrowth sekarang menghitung jumlah pengurus baru per bulan.
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
              _count: { select: { pengurus: true } },
            },
            orderBy: { nama: "asc" },
          },
          pengurus: {
            include: {
              anggota: {
                select: {
                  id: true,
                  namaLengkap: true,
                  foto: true,
                  email: true,
                  hp: true,
                  nia: true,
                },
              },
              jabatan: { select: { nama: true, bidang: true, level: true, urutan: true } },
              kabupaten: { select: { nama: true } },
            },
            orderBy: [
              { level: "asc" },
              { jabatan: { urutan: "asc" } },
            ],
          },
        },
      });

      if (!provinsi) {
        return NextResponse.json({ success: false, error: "Provinsi tidak ditemukan" }, { status: 404 });
      }

      // Statistik — HANYA pengurus level PROVINSI di provinsi ini
      const totalPengurus = await db.pengurus.count({ where: { provinsiId: id, level: "PROVINSI" } });
      const pengurusAktif = await db.pengurus.count({ where: { provinsiId: id, level: "PROVINSI", status: "Aktif" } });
      const totalKabupaten = await db.kabupaten.count({ where: { provinsiId: id } });

      // Monthly growth (last 6 months) — count pengurus baru
      const monthlyGrowth = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
        const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() - i + 1, 1);
        const count = await db.pengurus.count({
          where: {
            provinsiId: id,
            tanggalMulai: { gte: monthStart, lt: monthEnd },
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
            jumlahPengurus: k._count.pengurus,
          })),
          // FILTER: hanya tampilkan pengurus level PROVINSI (bukan Nasional yang kebetulan punya provinsiId)
          pengurusList: provinsi.pengurus
            .filter((p) => p.level === "PROVINSI")
            .map((p) => ({
              id: p.id,
              namaLengkap: p.anggota?.namaLengkap || "-",
              jabatan: p.jabatan?.nama || "-",
              bidang: p.jabatan?.bidang || "-",
              level: p.level,
              foto: p.anggota?.foto,
              email: p.anggota?.email,
              hp: p.anggota?.hp,
              status: p.status,
              tanggalMulai: p.tanggalMulai,
              tanggalSelesai: p.tanggalSelesai,
              nomorSK: p.nomorSK,
              wilayah: p.kabupaten?.nama || provinsi.nama,
            })),
          statistik: {
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
          include: {
            anggota: {
              select: {
                id: true,
                namaLengkap: true,
                foto: true,
                email: true,
                hp: true,
                nia: true,
              },
            },
            jabatan: { select: { nama: true, bidang: true, level: true, urutan: true } },
          },
          orderBy: [
            { level: "asc" },
            { jabatan: { urutan: "asc" } },
          ],
        },
      },
    });

    if (!kabupaten) {
      return NextResponse.json({ success: false, error: "Kabupaten tidak ditemukan" }, { status: 404 });
    }

    const totalPengurus = await db.pengurus.count({ where: { kabupatenId: id } });
    const pengurusAktif = await db.pengurus.count({ where: { kabupatenId: id, status: "Aktif" } });

    const monthlyGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
      const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() - i + 1, 1);
      const count = await db.pengurus.count({
        where: {
          kabupatenId: id,
          tanggalMulai: { gte: monthStart, lt: monthEnd },
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
          namaLengkap: p.anggota?.namaLengkap || "-",
          jabatan: p.jabatan?.nama || "-",
          bidang: p.jabatan?.bidang || "-",
          level: p.level,
          foto: p.anggota?.foto,
          email: p.anggota?.email,
          hp: p.anggota?.hp,
          status: p.status,
          tanggalMulai: p.tanggalMulai,
          tanggalSelesai: p.tanggalSelesai,
          nomorSK: p.nomorSK,
          wilayah: kabupaten.nama,
        })),
        statistik: {
          totalPengurus,
          pengurusAktif,
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
