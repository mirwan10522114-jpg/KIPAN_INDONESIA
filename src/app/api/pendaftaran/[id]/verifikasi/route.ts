import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateNIP } from "@/lib/nip";

// PATCH /api/pendaftaran/[id]/verifikasi — Update status pendaftaran
// Body: { status: "DISETUJUI" | "DITOLAK" | "PERBAIKAN" | "DIVERIFIKASI", catatan?: string, jabatanId?: number }
// Jika DISETUJUI: otomatis buat Anggota (data person) + Pengurus dengan jabatan dari admin pilih
// Jika jabatanId tidak diberikan, default = jabatan "Anggota" pertama yang ditemukan di level Kabupaten
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);
    const body = await req.json();
    const { status, catatan, jabatanId } = body;

    const validStatus = ["DIAJUKAN", "DIVERIFIKASI", "DISETUJUI", "DITOLAK", "PERBAIKAN"];
    if (!validStatus.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Status tidak valid" },
        { status: 400 }
      );
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
      status === "DISETUJUI" ? "Disetujui, menjadi Pengurus" :
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

    // Jika disetujui, buat record Anggota (data person) + Pengurus (jabatan)
    if (status === "DISETUJUI") {
      // Tentukan jabatanId SEBELUM transaction (default ke "Anggota" di "Divisi Organisasi dan Keanggotaan")
      let finalJabatanId = jabatanId;
      if (!finalJabatanId) {
        const defaultJabatan = await db.jabatan.findFirst({
          where: {
            nama: "Anggota",
            bidang: "Divisi Organisasi dan Keanggotaan",
            level: "Kabupaten",
          },
        });
        if (!defaultJabatan) {
          const fallback = await db.jabatan.findFirst({
            where: { nama: "Anggota", level: "Kabupaten" },
          });
          finalJabatanId = fallback?.id;
        } else {
          finalJabatanId = defaultJabatan.id;
        }
      }

      if (!finalJabatanId) {
        return NextResponse.json(
          { success: false, error: "Jabatan 'Anggota' belum tersedia. Tambahkan dulu di menu Bidang & Jabatan." },
          { status: 400 }
        );
      }

      // Transaction: create anggota → generate NIP → update NIP → create pengurus
      const { nia, newAnggotaId } = await db.$transaction(async (tx) => {
        // 1. Create anggota dengan NIP placeholder
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
            hp: pendaftaran.hp,
            whatsapp: pendaftaran.whatsapp,
            foto: pendaftaran.foto,
            ktp: pendaftaran.ktp,
            cv: pendaftaran.cv,
            suratPernyataan: pendaftaran.suratPernyataan,
            suratSehat: pendaftaran.suratSehat,
            status: "Aktif",
            angkatan: "XII",
            tanggalAngkat: new Date(),
            tanggalDaftar: pendaftaran.createdAt,
          },
        });

        // 2. Generate NIP dengan global sequence
        const tahun = new Date().getFullYear();
        const nia = await generateNIP(newAnggota.id, {
          provinsiId: pendaftaran.provinsiId,
          kabupatenId: pendaftaran.kabupatenId,
          tahun,
        }, tx);

        // 3. Update anggota dengan NIP yang benar
        await tx.anggota.update({
          where: { id: newAnggota.id },
          data: { nia },
        });

        // 4. Cek apakah anggota sudah punya jabatan aktif
        const existingPengurus = await tx.pengurus.findFirst({
          where: { anggotaId: newAnggota.id, status: "Aktif" },
        });

        if (!existingPengurus) {
          // 5. Create record Pengurus dengan jabatan pilihan
          await tx.pengurus.create({
            data: {
              anggotaId: newAnggota.id,
              jabatanId: parseInt(finalJabatanId),
              level: "KABUPATEN",
              provinsiId: pendaftaran.provinsiId,
              kabupatenId: pendaftaran.kabupatenId,
              status: "Aktif",
              tanggalMulai: new Date(),
              nomorSK: `SK-AUTO/${nia}/${tahun}`,
            },
          });
        }

        return { nia, newAnggotaId: newAnggota.id };
      });

      await db.pendaftaranRiwayat.create({
        data: {
          pendaftaranId: id,
          aksi: `Menjadi Pengurus dengan NIP: ${nia}`,
          oleh: "Sistem",
        },
      });

      // HAPUS data pendaftar setelah berhasil dijadikan pengurus
      // (riwayat sudah disimpan, anggota & pengurus sudah dibuat)
      // Ini memastikan data calon pengurus tidak mengotori daftar verifikasi
      // Tracking pendaftaran via nomorPendaftaran akan return 404 dengan pesan "sudah disetujui"
      await db.pendaftaranRiwayat.deleteMany({
        where: { pendaftaranId: id },
      });
      await db.pendaftaran.delete({
        where: { id },
      });
      console.log(`[verifikasi] Pendaftaran id=${id} dihapus setelah disetujui (NIP: ${nia})`);
    }

    const aksiLog = status === "DISETUJUI" ? "approve" : status === "DITOLAK" ? "reject" : "update";
    await db.activityLog.create({
      data: { table: "pendaftaran", recordId: id, aksi: aksiLog, oleh: "Admin", detail: JSON.stringify({ status, catatan: catatan || null }) },
    });

    return NextResponse.json({
      success: true,
      data: pendaftaran,
      message: status === "DISETUJUI"
        ? "Pendaftaran disetujui. Otomatis dibuatkan record Pengurus dengan jabatan 'Anggota Divisi'. Data pendaftar telah dihapus dari daftar verifikasi (karena sudah menjadi pengurus)."
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
