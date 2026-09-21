import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, safeParseInt } from "@/lib/api-error";
import { decryptNIK } from "@/lib/encryption";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const level = searchParams.get("level") || "";
    const status = searchParams.get("status") || "";
    const provinsiId = searchParams.get("provinsiId") || "";
    const kabupatenId = searchParams.get("kabupatenId") || "";
    const suratKeputusanId = searchParams.get("suratKeputusanId") || "";
    const role = searchParams.get("role");
    const wilayah = searchParams.get("wilayah");

    // Build where clause — server-side filtering
    const where: any = {};
    if (level && level !== "Semua") where.level = level;
    if (status && status !== "Semua") where.status = status;
    if (provinsiId && provinsiId !== "Semua") where.provinsiId = parseInt(provinsiId);
    if (kabupatenId && kabupatenId !== "Semua") where.kabupatenId = parseInt(kabupatenId);

    if (role === "ADMIN_PROVINSI" && wilayah) {
      const w = wilayah.replace("Provinsi ", "").trim();
      const prov = await db.provinsi.findFirst({ where: { nama: w } });
      if (prov) {
        where.provinsiId = prov.id;
      } else {
        where.provinsiId = -1;
      }
    } else if (role === "ADMIN_KABUPATEN" && wilayah) {
      const w = wilayah.replace("Kabupaten ", "Kab. ").trim();
      const kab = await db.kabupaten.findFirst({ where: { nama: w } });
      if (kab) {
        where.kabupatenId = kab.id;
      } else {
        where.kabupatenId = -1;
      }
    }
    
    // Sesuai PRD v3: Tampilan global pengurus HANYA untuk SK yang DISETUJUI
    // Jika tidak sedang melihat spesifik SK, filter berdasarkan approvalStatus
    if (suratKeputusanId && suratKeputusanId !== "Semua") {
      where.suratKeputusanId = parseInt(suratKeputusanId);
    } else {
      where.suratKeputusan = { approvalStatus: "DISETUJUI" };
    }

    if (search) {
      where.OR = [
        { anggota: { namaLengkap: { contains: search } } },
        { anggota: { nia: { contains: search } } },
        { suratKeputusan: { nomorSK: { contains: search } } },
        { suratKeputusan: { judul: { contains: search } } },
      ];
    }

    // Get total count for pagination
    const total = await db.pengurus.count({ where });
    const totalPages = Math.ceil(total / limit) || 1;
    const currentPage = Math.min(page, totalPages);
    const skip = (currentPage - 1) * limit;

    const pengurus = await db.pengurus.findMany({
      where,
      include: {
        anggota: {
          include: {
            provinsi: { select: { nama: true, kode: true } },
            kabupaten: { select: { nama: true, kode: true } },
          },
        },
        suratKeputusan: { select: { nomorSK: true, judul: true, level: true, status: true, fileSK: true } },
        provinsi: { select: { nama: true, kode: true } },
        kabupaten: { select: { nama: true, kode: true } },
        jabatan: { select: { nama: true } },
      },
      orderBy: [{ level: "asc" }, { createdAt: "desc" }],
      skip,
      take: limit,
    });

    const pengurusDecrypted = pengurus.map(p => ({
      ...p,
      anggota: {
        ...p.anggota,
        nik: decryptNIK(p.anggota.nik)
      },
      jabatan: p.jabatan?.nama || (p.level === "NASIONAL" ? "Pengurus Nasional" : p.level === "PROVINSI" ? "Pengurus Provinsi" : "Pengurus Kabupaten/Kota")
    }));

    return NextResponse.json({
      success: true,
      data: pengurusDecrypted,
      total,
      page: currentPage,
      limit,
      totalPages,
    });
  } catch (error) {
    return handleApiError(error, "GET /api/pengurus", "Gagal mengambil data pengurus");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validasi: suratKeputusanId wajib
    const skIdNum = safeParseInt(body.suratKeputusanId);
    if (!body.suratKeputusanId || skIdNum === null) {
      return NextResponse.json({ success: false, error: "Surat Keputusan wajib dipilih." }, { status: 400 });
    }

    // Validasi: anggotaId wajib
    const anggotaIdNum = safeParseInt(body.anggotaId);
    if (!body.anggotaId || anggotaIdNum === null) {
      return NextResponse.json({ success: false, error: "Anggota wajib dipilih." }, { status: 400 });
    }

    // Validasi: SK harus ada dan aktif
    const skExists = await db.suratKeputusan.findUnique({ where: { id: skIdNum } });
    if (!skExists) {
      return NextResponse.json({ success: false, error: "Surat Keputusan tidak ditemukan." }, { status: 400 });
    }
    if (skExists.status !== "Aktif") {
      return NextResponse.json({ success: false, error: "SK tidak aktif." }, { status: 400 });
    }

    const role = req.nextUrl.searchParams.get("role") || "SUPER_ADMIN";
    if (role === "ADMIN_PROVINSI" && !["Provinsi", "Kabupaten"].includes(skExists.level)) {
      return NextResponse.json({ success: false, error: "Tidak memiliki hak akses membuat pengurus Nasional." }, { status: 403 });
    }
    if (role === "ADMIN_KABUPATEN" && skExists.level !== "Kabupaten") {
      return NextResponse.json({ success: false, error: "Hanya dapat membuat pengurus Kabupaten." }, { status: 403 });
    }

    // Cek apakah sudah ada di SK ini
    const alreadyInSK = await db.pengurus.findFirst({
      where: { anggotaId: anggotaIdNum, suratKeputusanId: skIdNum },
    });
    if (alreadyInSK) {
      return NextResponse.json(
        { success: false, error: "Anggota ini sudah tercantum di SK tersebut." },
        { status: 400 }
      );
    }

    const data: any = {
      anggotaId: anggotaIdNum,
      suratKeputusanId: skIdNum,
      level: body.level || skExists.level,
      status: body.status || "Aktif",
      jabatanId: body.jabatanId ? safeParseInt(body.jabatanId) : null,
      tanggalMulai: body.tanggalMulai ? new Date(body.tanggalMulai) : skExists.tanggalTerbit,
      tanggalSelesai: body.tanggalSelesai ? new Date(body.tanggalSelesai) : null,
    };

    if (body.level === "PROVINSI" || body.level === "KABUPATEN") {
      const provNum = safeParseInt(body.provinsiId);
      if (provNum !== null) data.provinsiId = provNum;
    }
    if (body.level === "KABUPATEN") {
      const kabNum = safeParseInt(body.kabupatenId);
      if (kabNum !== null) data.kabupatenId = kabNum;
    }

    // Demisionerkan pengurus lama untuk anggota ini jika ada
    await db.pengurus.updateMany({
      where: {
        anggotaId: anggotaIdNum,
        status: "Aktif",
      },
      data: {
        status: "Demisioner",
        tanggalSelesai: data.tanggalMulai,
      }
    });

    const pengurus = await db.pengurus.create({
      data,
      include: {
        anggota: { include: { provinsi: { select: { nama: true } }, kabupaten: { select: { nama: true } } } },
        suratKeputusan: { select: { nomorSK: true, judul: true } },
        provinsi: { select: { nama: true } },
        kabupaten: { select: { nama: true } },
        jabatan: { select: { nama: true } },
      },
    });

    // Aktifkan wilayah jika pengurus baru berstatus Aktif
    if (pengurus.status === "Aktif") {
      if (pengurus.level === "PROVINSI" && pengurus.provinsiId) {
        await db.provinsi.update({
          where: { id: pengurus.provinsiId },
          data: { status: "Aktif" },
        }).catch(() => {});
      } else if (pengurus.level === "KABUPATEN" && pengurus.kabupatenId) {
        await db.kabupaten.update({
          where: { id: pengurus.kabupatenId },
          data: { status: "Aktif" },
        }).catch(() => {});
        if (pengurus.provinsiId) {
          await db.provinsi.update({
            where: { id: pengurus.provinsiId },
            data: { status: "Aktif" },
          }).catch(() => {});
        }
      }
    }

    await db.activityLog.create({
      data: {
        table: "pengurus",
        recordId: pengurus.id,
        aksi: "create",
        oleh: "Admin",
        detail: JSON.stringify({ anggotaId: pengurus.anggotaId, suratKeputusanId: pengurus.suratKeputusanId, jabatanId: pengurus.jabatanId, level: pengurus.level, status: pengurus.status }),
      },
    });

    return NextResponse.json({
      success: true,
      data: pengurus,
      message: `Pengurus berhasil ditambahkan ke SK "${skExists.nomorSK}".`
    });
  } catch (error) {
    return handleApiError(error, "POST /api/pengurus", "Gagal menambahkan pengurus");
  }
}
