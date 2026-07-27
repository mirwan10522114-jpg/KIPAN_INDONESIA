import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// ============================================================
// PATCH /api/jabatan/[id] — Update jabatan (nama, bidang, urutan, status, level)
// ============================================================
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);
    const body = await req.json();

    // Get current jabatan untuk cek uniqueness
    const current = await db.jabatan.findUnique({ where: { id } });
    if (!current) {
      return NextResponse.json(
        { success: false, error: "Jabatan tidak ditemukan" },
        { status: 404 }
      );
    }

    const data: any = {};
    if (body.nama !== undefined) data.nama = body.nama;
    if (body.bidang !== undefined) data.bidang = body.bidang;
    if (body.status !== undefined) data.status = body.status;
    if (body.level !== undefined) {
      const validLevels = ["Nasional", "Provinsi", "Kabupaten"];
      if (!validLevels.includes(body.level)) {
        return NextResponse.json(
          { success: false, error: "Level harus Nasional, Provinsi, atau Kabupaten" },
          { status: 400 }
        );
      }
      data.level = body.level;
    }

    // Validasi urutan: harus positive integer
    if (body.urutan !== undefined) {
      const urutanNum = Number(body.urutan);
      if (isNaN(urutanNum) || urutanNum < 1 || !Number.isInteger(urutanNum)) {
        return NextResponse.json(
          { success: false, error: "Urutan harus berupa angka positif (minimal 1)." },
          { status: 400 }
        );
      }
      data.urutan = urutanNum;
    }

    // Uniqueness check: jika nama/bidang/level berubah, cek kombinasi (nama, bidang, level)
    const newNama = data.nama ?? current.nama;
    const newBidang = data.bidang ?? current.bidang;
    const newLevel = data.level ?? current.level;

    if (data.nama !== undefined || data.bidang !== undefined || data.level !== undefined) {
      const existing = await db.jabatan.findFirst({
        where: {
          nama: newNama,
          bidang: newBidang,
          level: newLevel,
          id: { not: id }, // exclude current
        },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, error: `Jabatan "${newNama}" dengan bidang "${newBidang}" di level ${newLevel} sudah ada.` },
          { status: 400 }
        );
      }
    }

    const updated = await db.jabatan.update({
      where: { id },
      data,
    });

    await db.activityLog.create({
      data: { table: "jabatan", recordId: id, aksi: "update", oleh: "Admin", detail: JSON.stringify(data) },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Jabatan berhasil diperbarui",
    });
  } catch (error) {
    console.error("PATCH /api/jabatan/[id] error:", error);
    return NextResponse.json({ success: false, error: "Gagal memperbarui jabatan" }, { status: 500 });
  }
}

// ============================================================
// DELETE /api/jabatan/[id] — Soft delete jabatan (set status=Nonaktif)
// Jika masih dipakai pengurus AKTIF → tolak
// Jika hanya dipakai pengurus Selesai/Diberhentikan → soft delete (FK safe)
// ============================================================
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);

    // Cek apakah dipakai pengurus AKTIF
    const activePengurusCount = await db.pengurus.count({
      where: { jabatanId: id, status: "Aktif" },
    });
    if (activePengurusCount > 0) {
      return NextResponse.json(
        { success: false, error: `Jabatan tidak bisa dihapus karena masih dipakai oleh ${activePengurusCount} pengurus aktif. Nonaktifkan saja.` },
        { status: 400 }
      );
    }

    // Soft delete: set status = "Nonaktif" (bukan hard delete, karena FK ke pengurus)
    await db.jabatan.update({
      where: { id },
      data: { status: "Nonaktif" },
    });

    await db.activityLog.create({
      data: { table: "jabatan", recordId: id, aksi: "delete", oleh: "Admin", detail: JSON.stringify({ softDelete: true }) },
    });

    return NextResponse.json({
      success: true,
      message: "Jabatan berhasil dinonaktifkan (soft delete). Data riwayat pengurus tetap terjaga.",
    });
  } catch (error) {
    console.error("DELETE /api/jabatan/[id] error:", error);
    return NextResponse.json({ success: false, error: "Gagal menghapus jabatan" }, { status: 500 });
  }
}
