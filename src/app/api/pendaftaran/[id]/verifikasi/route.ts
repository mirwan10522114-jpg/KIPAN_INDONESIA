import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateNIP } from "@/lib/nip";

// PATCH /api/pendaftaran/[id]/verifikasi — Update status pendaftaran
// Body: { status: "DISETUJUI" | "DITOLAK" | "PERBAIKAN" | "DIVERIFIKASI", catatan?: string }
// Jika DISETUJUI: otomatis buat Anggota (data person) + terbitkan NIA
// TIDAK membuat Pengurus — promosi ke Pengurus dilakukan terpisah oleh Admin via menu Manajemen Pengurus
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);
    const body = await req.json();
    const { status, catatan } = body;

    const validStatus = ["DIAJUKAN", "DIVERIFIKASI", "DISETUJUI", "DITOLAK", "PERBAIKAN"];
    if (!validStatus.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Status tidak valid" },
        { status: 400 }
      );
    }

    const currentPendaftaran = await db.pendaftaran.findUnique({ where: { id }, select: { kabupatenId: true } });
    if (!currentPendaftaran) {
      return NextResponse.json({ success: false, error: "Data pendaftaran tidak ditemukan" }, { status: 404 });
    }

    const role = req.nextUrl.searchParams.get("role") || "SUPER_ADMIN";
    const wilayah = req.nextUrl.searchParams.get("wilayah");

    if (role === "ADMIN_KABUPATEN" && wilayah && parseInt(wilayah) !== currentPendaftaran.kabupatenId) {
      return NextResponse.json({ success: false, error: "Akses ditolak: Anda hanya dapat memverifikasi pendaftaran dari wilayah kabupaten Anda." }, { status: 403 });
    }

    const pendaftaran = await db.pendaftaran.update({
      where: { id },
      data: {
        status,
        catatan: catatan || null,
      },
    });

    // Tambah riwayat
    const aksiText =
      status === "DISETUJUI" ? "Disetujui, menjadi Anggota KIPAN" :
      status === "DITOLAK" ? "Pendaftaran ditolak" :
      status === "PERBAIKAN" ? "Diminta perbaikan dokumen" :
      status === "DIVERIFIKASI" ? "Verifikasi berkas dimulai" :
      "Status diperbarui";

    await db.pendaftaranRiwayat.create({
      data: {
        pendaftaranId: id,
        aksi: aksiText,
        oleh: "Admin",
        catatan: catatan || null,
      },
    });

    // Jika disetujui, buat record Anggota (data person) + NIA
    // TIDAK membuat Pengurus — itu dilakukan terpisah
    if (status === "DISETUJUI") {
      // Transaction: create anggota → generate NIP → update NIP
      const { nia } = await db.$transaction(async (tx) => {
        // 1. Create anggota dengan NIA placeholder
        const newAnggota = await tx.anggota.create({
          data: {
            nia: "TEMP-" + Date.now(),
            namaLengkap: pendaftaran.namaLengkap,
            nik: pendaftaran.nik,
            tempatLahir: pendaftaran.tempatLahir,
            tanggalLahir: pendaftaran.tanggalLahir,
            jenisKelamin: pendaftaran.jenisKelamin,
            agama: pendaftaran.agama,
            pendidikan: pendaftaran.pendidikan,
            pekerjaan: pendaftaran.pekerjaan,
            alamat: pendaftaran.alamat,
            provinsiId: pendaftaran.provinsiId,
            kabupatenId: pendaftaran.kabupatenId,
            kecamatan: pendaftaran.kecamatan,
            desa: pendaftaran.desa,
            kodePos: pendaftaran.kodePos,
            email: pendaftaran.email,
            
            whatsapp: pendaftaran.whatsapp,
            foto: pendaftaran.foto,
            ktp: pendaftaran.ktp,
            cv: pendaftaran.cv,
            suratPernyataan: pendaftaran.suratPernyataan,
            suratSehat: pendaftaran.suratSehat,
            status: "AKTIF",
            tanggalAngkat: new Date(),
            tanggalDaftar: pendaftaran.createdAt,
          },
        });

        // 2. Generate NIA dengan global sequence
        const tahun = new Date().getFullYear();
        const nia = await generateNIP(newAnggota.id, {
          provinsiId: pendaftaran.provinsiId,
          kabupatenId: pendaftaran.kabupatenId,
          tahun,
        }, tx);

        // 3. Update anggota dengan NIA yang benar
        await tx.anggota.update({
          where: { id: newAnggota.id },
          data: { nia },
        });

        return { nia, newAnggotaId: newAnggota.id };
      });

      await db.pendaftaranRiwayat.create({
        data: {
          pendaftaranId: id,
          aksi: `Menjadi Anggota KIPAN dengan NIA: ${nia}`,
          oleh: "Sistem",
        },
      });

      // Hapus data pendaftar setelah berhasil dijadikan anggota
      await db.pendaftaranRiwayat.deleteMany({
        where: { pendaftaranId: id },
      });
      await db.pendaftaran.delete({
        where: { id },
      });
      console.log(`[verifikasi] Pendaftaran id=${id} dihapus setelah disetujui (NIA: ${nia})`);
    }

    const aksiLog = status === "DISETUJUI" ? "approve" : status === "DITOLAK" ? "reject" : "update";
    await db.activityLog.create({
      data: { table: "pendaftaran", recordId: id, aksi: aksiLog, oleh: "Admin", detail: JSON.stringify({ status, catatan: catatan || null }) },
    });

    // Notify Admins
    import("@/lib/notification-service").then(({ notifyAdmins }) => {
      notifyAdmins({
        title: "Pembaruan Status Verifikasi",
        message: `Pendaftaran ${pendaftaran.namaLengkap} ${status === "DISETUJUI" ? "disetujui menjadi Anggota" : `diperbarui menjadi ${status}`}.`,
        type: "VERIFIKASI",
        link: "#admin?page=verifikasi",
        provinsiId: pendaftaran.provinsiId,
        kabupatenId: pendaftaran.kabupatenId,
      });
    }).catch(e => console.error("Failed to load notification-service", e));

    return NextResponse.json({
      success: true,
      data: pendaftaran,
      message: status === "DISETUJUI"
        ? "Pendaftaran disetujui. Pendaftar resmi menjadi Anggota KIPAN. Untuk menjadikan Pengurus, gunakan menu Manajemen Pengurus → Tambah ke SK."
        : `Status pendaftaran diperbarui menjadi ${status}`,
    });
  } catch (error) {
    console.error("PATCH /api/pendaftaran/[id]/verifikasi error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal update status pendaftaran" },
      { status: 500 }
    );
  }
}
