import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// PATCH /api/pengurus/[id] — Update pengurus (status, tanggalMulai, tanggalSelesai)
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);
    const body = await req.json();
    const role = req.nextUrl.searchParams.get("role") || "SUPER_ADMIN";

    // RBAC Check
    const currentPengurus = await db.pengurus.findUnique({ where: { id }, select: { level: true } });
    if (!currentPengurus) {
      return NextResponse.json({ success: false, error: "Pengurus tidak ditemukan" }, { status: 404 });
    }
    const pengurusLevel = currentPengurus.level.toUpperCase();

    if (role === "ADMIN_PROVINSI" && !["PROVINSI", "KABUPATEN"].includes(pengurusLevel)) {
      return NextResponse.json({ success: false, error: "Tidak memiliki hak akses mengubah pengurus Nasional." }, { status: 403 });
    }
    if (role === "ADMIN_KABUPATEN" && pengurusLevel !== "KABUPATEN") {
      return NextResponse.json({ success: false, error: "Hanya dapat mengubah pengurus Kabupaten." }, { status: 403 });
    }

    const VALID_STATUS = ["Aktif", "Demisioner", "Mengundurkan Diri", "Diberhentikan", "Meninggal"];

    const data: any = {};
    if (body.status !== undefined) {
      if (!VALID_STATUS.includes(body.status)) {
        return NextResponse.json({ success: false, error: `Status tidak valid. Pilihan: ${VALID_STATUS.join(", ")}` }, { status: 400 });
      }
      if (!body.keteranganStatus || body.keteranganStatus.trim() === "") {
        return NextResponse.json({ success: false, error: "Keterangan/Alasan wajib diisi saat mengubah status" }, { status: 400 });
      }
      data.status = body.status;
      data.keteranganStatus = body.keteranganStatus.trim();
    }
    if (body.tanggalMulai !== undefined) {
      data.tanggalMulai = body.tanggalMulai ? new Date(body.tanggalMulai) : undefined;
    }
    if (body.tanggalSelesai !== undefined) {
      data.tanggalSelesai = body.tanggalSelesai ? new Date(body.tanggalSelesai) : null;
    }

    const updated = await db.pengurus.update({
      where: { id },
      data,
      include: {
        anggota: { select: { namaLengkap: true, nia: true } },
        suratKeputusan: { select: { nomorSK: true, judul: true } },
      },
    });

    await db.activityLog.create({
      data: {
        table: "pengurus",
        recordId: id,
        aksi: "update",
        oleh: "Admin",
        detail: JSON.stringify(data),
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Data pengurus berhasil diperbarui",
    });
  } catch (error) {
    console.error("PATCH /api/pengurus/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui data pengurus" },
      { status: 500 }
    );
  }
}

// DELETE /api/pengurus/[id] — Hapus pengurus
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);
    const role = req.nextUrl.searchParams.get("role") || "SUPER_ADMIN";

    const pengurus = await db.pengurus.findUnique({
      where: { id },
      include: { anggota: { select: { namaLengkap: true } } },
    });

    if (!pengurus) {
      return NextResponse.json({ success: false, error: "Pengurus tidak ditemukan" }, { status: 404 });
    }

    // RBAC Check
    if (role === "ADMIN_PROVINSI" && !["Provinsi", "Kabupaten"].includes(pengurus.level)) {
      return NextResponse.json({ success: false, error: "Tidak memiliki hak akses menghapus pengurus Nasional." }, { status: 403 });
    }
    if (role === "ADMIN_KABUPATEN" && pengurus.level !== "Kabupaten") {
      return NextResponse.json({ success: false, error: "Hanya dapat menghapus pengurus Kabupaten." }, { status: 403 });
    }

    await db.pengurus.delete({ where: { id } });

    await db.activityLog.create({
      data: {
        table: "pengurus",
        recordId: id,
        aksi: "delete",
        oleh: "Admin",
        detail: JSON.stringify({ anggotaId: pengurus.anggotaId, nama: pengurus.anggota.namaLengkap }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Pengurus ${pengurus.anggota.namaLengkap} berhasil dihapus.`,
    });
  } catch (error) {
    console.error("DELETE /api/pengurus/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus pengurus" },
      { status: 500 }
    );
  }
}
