import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError } from "@/lib/api-error";
import { decryptNIK } from "@/lib/encryption";

// GET /api/surat-keputusan/[id] — Detail SK + daftar pengurus
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);

    const sk = await db.suratKeputusan.findUnique({
      where: { id },
      include: {
        provinsi: { select: { nama: true, kode: true } },
        kabupaten: { select: { nama: true, kode: true } },
        pengurus: {
          include: {
            anggota: {
              select: {
                id: true,
                nia: true,
                namaLengkap: true,
                jenisKelamin: true,
                foto: true,
                provinsi: { select: { nama: true } },
                kabupaten: { select: { nama: true } },
              },
            },
            jabatan: { select: { nama: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!sk) {
      return NextResponse.json({ success: false, error: "SK tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: sk });
  } catch (error) {
    return handleApiError(error, "GET /api/surat-keputusan/[id]", "Gagal mengambil detail SK");
  }
}

// PUT /api/surat-keputusan/[id] — Update SK
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);
    const body = await req.json();

    const data: any = {};
    if (body.nomorSK !== undefined) data.nomorSK = body.nomorSK.trim();
    if (body.judul !== undefined) data.judul = body.judul.trim();
    if (body.level !== undefined) data.level = body.level;
    if (body.provinsiId !== undefined) data.provinsiId = body.provinsiId || null;
    if (body.kabupatenId !== undefined) data.kabupatenId = body.kabupatenId || null;
    if (body.tanggalTerbit !== undefined) data.tanggalTerbit = new Date(body.tanggalTerbit);
    if (body.tanggalBerakhir !== undefined) data.tanggalBerakhir = body.tanggalBerakhir ? new Date(body.tanggalBerakhir) : null;
    if (body.fileSK !== undefined) data.fileSK = body.fileSK || null;
    if (body.status !== undefined) data.status = body.status;

    const updated = await db.suratKeputusan.update({
      where: { id },
      data,
      include: {
        provinsi: { select: { nama: true } },
        kabupaten: { select: { nama: true } },
      },
    });

    await db.activityLog.create({
      data: {
        table: "surat_keputusan",
        recordId: id,
        aksi: "update",
        oleh: "Admin",
        detail: JSON.stringify(data),
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "SK berhasil diperbarui.",
    });
  } catch (error) {
    return handleApiError(error, "PUT /api/surat-keputusan/[id]", "Gagal memperbarui SK");
  }
}

// DELETE /api/surat-keputusan/[id] — Hapus SK (hanya jika tidak ada pengurus aktif)
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);

    const pengurusCount = await db.pengurus.count({
      where: { suratKeputusanId: id },
    });

    if (pengurusCount > 0) {
      return NextResponse.json(
        { success: false, error: `Tidak dapat menghapus SK karena masih memiliki ${pengurusCount} pengurus terkait. Nonaktifkan SK terlebih dahulu, lalu hapus pengurus.` },
        { status: 400 }
      );
    }

    await db.suratKeputusan.delete({ where: { id } });

    await db.activityLog.create({
      data: {
        table: "surat_keputusan",
        recordId: id,
        aksi: "delete",
        oleh: "Admin",
      },
    });

    return NextResponse.json({
      success: true,
      message: "SK berhasil dihapus.",
    });
  } catch (error) {
    return handleApiError(error, "DELETE /api/surat-keputusan/[id]", "Gagal menghapus SK");
  }
}
