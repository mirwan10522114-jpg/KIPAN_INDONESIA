import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, safeParseInt } from "@/lib/api-error";

export const dynamic = "force-dynamic";

// GET /api/surat-keputusan — List SK dengan filter
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const level = searchParams.get("level") || "";
    const status = searchParams.get("status") || "";
    const approvalStatus = searchParams.get("approvalStatus") || "";
    const provinsiId = searchParams.get("provinsiId") || "";
    const role = searchParams.get("role");
    const wilayah = searchParams.get("wilayah");

    const where: any = {};
    if (level && level !== "Semua") where.level = level;
    if (status && status !== "Semua") where.status = status;
    if (approvalStatus && approvalStatus !== "Semua") where.approvalStatus = approvalStatus;
    if (provinsiId && provinsiId !== "Semua") where.provinsiId = parseInt(provinsiId);
    where.AND = [];
    if (search) {
      where.AND.push({
        OR: [
          { nomorSK: { contains: search } },
          { judul: { contains: search } },
        ]
      });
    }

    if (role === "ADMIN_PROVINSI" && wilayah) {
      const w = wilayah.replace("Provinsi ", "").trim();
      const prov = await db.provinsi.findFirst({ where: { nama: w } });
      if (prov) {
        where.AND.push({
          OR: [
            { provinsiId: prov.id },
            { approvalStatus: "DISETUJUI" }
          ]
        });
      } else {
        where.provinsiId = -1;
      }
    } else if (role === "ADMIN_KABUPATEN" && wilayah) {
      const w = wilayah.replace("Kabupaten ", "Kab. ").trim();
      const kab = await db.kabupaten.findFirst({ where: { nama: w } });
      if (kab) {
        where.AND.push({
          OR: [
            { kabupatenId: kab.id },
            { approvalStatus: "DISETUJUI" }
          ]
        });
      } else {
        where.kabupatenId = -1;
      }
    }

    if (where.AND.length === 0) delete where.AND;

    const total = await db.suratKeputusan.count({ where });
    const totalPages = Math.ceil(total / limit) || 1;
    const currentPage = Math.min(page, totalPages);
    const skip = (currentPage - 1) * limit;

    const data = await db.suratKeputusan.findMany({
      where,
      include: {
        provinsi: { select: { nama: true, kode: true } },
        kabupaten: { select: { nama: true, kode: true } },
        _count: { select: { pengurus: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data,
      total,
      page: currentPage,
      limit,
      totalPages,
    });
  } catch (error) {
    return handleApiError(error, "GET /api/surat-keputusan", "Gagal mengambil data SK");
  }
}

// POST /api/surat-keputusan — Buat SK baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.nomorSK || !body.judul || !body.level || !body.tanggalTerbit) {
      return NextResponse.json(
        { success: false, error: "Nomor SK, Judul, Level, dan Tanggal Terbit wajib diisi." },
        { status: 400 }
      );
    }

    // Check unique nomor SK
    const existing = await db.suratKeputusan.findUnique({ where: { nomorSK: body.nomorSK } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Nomor SK "${body.nomorSK}" sudah digunakan.` },
        { status: 400 }
      );
    }

    // Tentukan approvalStatus berdasarkan role pembuat
    // Karena kita tidak memiliki session role di backend pada contoh ini, 
    // kita akan mengirim role pembuat dari frontend, atau default DRAFT.
    const creatorRole = body.creatorRole || "SUPER_ADMIN";
    let initialApprovalStatus = "DRAFT";
    
    if (creatorRole === "ADMIN_KABUPATEN") {
      initialApprovalStatus = "MENUNGGU_PROVINSI";
    } else if (creatorRole === "ADMIN_PROVINSI") {
      initialApprovalStatus = "MENUNGGU_NASIONAL";
    } else if (creatorRole === "SUPER_ADMIN" || creatorRole === "ADMIN_NASIONAL") {
      initialApprovalStatus = "DISETUJUI";
    }

    const data: any = {
      nomorSK: body.nomorSK.trim(),
      judul: body.judul.trim(),
      level: body.level,
      tanggalTerbit: new Date(body.tanggalTerbit),
      tanggalBerakhir: body.tanggalBerakhir ? new Date(body.tanggalBerakhir) : null,
      fileSK: body.fileSK || null,
      status: body.status || "Aktif",
      approvalStatus: initialApprovalStatus,
    };

    if (body.level === "PROVINSI" || body.level === "KABUPATEN") {
      const provNum = safeParseInt(body.provinsiId);
      if (provNum !== null) data.provinsiId = provNum;
    }
    if (body.level === "KABUPATEN") {
      const kabNum = safeParseInt(body.kabupatenId);
      if (kabNum !== null) data.kabupatenId = kabNum;
    }

    const sk = await db.suratKeputusan.create({
      data,
      include: {
        provinsi: { select: { nama: true } },
        kabupaten: { select: { nama: true } },
      },
    });

    await db.activityLog.create({
      data: {
        table: "surat_keputusan",
        recordId: sk.id,
        aksi: "create",
        oleh: "Admin",
        detail: JSON.stringify({ nomorSK: sk.nomorSK, judul: sk.judul, level: sk.level }),
      },
    });

    // Notify Admins
    import("@/lib/notification-service").then(({ notifyAdmins }) => {
      let msg = `SK ${sk.level} baru diajukan: ${sk.nomorSK}`;
      if (sk.level === "KABUPATEN") msg = `SK Kabupaten ${sk.kabupaten?.nama} diajukan: ${sk.nomorSK}`;
      if (sk.level === "PROVINSI") msg = `SK Provinsi ${sk.provinsi?.nama} diajukan: ${sk.nomorSK}`;

      notifyAdmins({
        title: "Pengajuan SK Baru",
        message: msg,
        type: "SK",
        link: "#admin?page=sk",
        provinsiId: sk.provinsiId,
        kabupatenId: sk.kabupatenId,
      });
    }).catch(e => console.error("Failed to load notification-service", e));

    return NextResponse.json({
      success: true,
      data: sk,
      message: `SK "${sk.nomorSK}" berhasil dibuat.`,
    });
  } catch (error) {
    return handleApiError(error, "POST /api/surat-keputusan", "Gagal membuat SK");
  }
}
