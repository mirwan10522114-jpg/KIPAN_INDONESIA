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
      // 1. Buat record Anggota (data person) dengan NIP placeholder
      const newAnggota = await db.anggota.create({
        data: {
          nia: "TEMP-" + Date.now(), // placeholder, akan di-update setelah dapat ID
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
          status: "AKTIF",
          angkatan: "XII",
          tanggalAngkat: new Date(),
          tanggalDaftar: pendaftaran.createdAt,
        },
      });

      // Generate NIP dengan global sequence (pakai newAnggota.id)
      const tahun = new Date().getFullYear();
      const nia = await generateNIP(newAnggota.id, {
        provinsiId: pendaftaran.provinsiId,
        kabupatenId: pendaftaran.kabupatenId,
        tahun,
      });
      // Update anggota dengan NIP yang benar
      await db.anggota.update({
        where: { id: newAnggota.id },
        data: { nia },
      });

      // 2. Tentukan jabatanId — default ke "Anggota" di "Divisi Organisasi dan Keanggotaan" level Kabupaten
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
          // Fallback: cari jabatan "Anggota" pertama di level Kabupaten
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

      // 3. Cek apakah anggota sudah punya jabatan aktif (di level mana pun)
      // Aturan: 1 orang hanya boleh pegang 1 jabatan aktif (tidak boleh double jabatan antar level)
      const existingPengurus = await db.pengurus.findFirst({
        where: {
          anggotaId: newAnggota.id,
          status: "Aktif",
        },
        include: { jabatan: true },
      });

      if (existingPengurus) {
        // Sudah punya jabatan aktif — skip membuat record baru, tapi tetap set status pendaftaran
        console.log(`Pengurus ${newAnggota.namaLengkap} sudah punya jabatan aktif: ${existingPengurus.jabatan?.nama} di level ${existingPengurus.level}. Skip buat record baru.`);
      }

      if (!existingPengurus) {
        // 4. Buat record Pengurus dengan jabatan "Anggota" di divisi pilihan
        await db.pengurus.create({
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

        // Update ketua wilayah jika belum ada ketua
        const kabupatenRecord = await db.kabupaten.findUnique({ where: { id: pendaftaran.kabupatenId } });
        if (kabupatenRecord && !kabupatenRecord.ketua) {
          await db.kabupaten.update({
            where: { id: pendaftaran.kabupatenId },
            data: { ketua: newAnggota.namaLengkap },
          });
        }
      }

      await db.pendaftaranRiwayat.create({
        data: {
          pendaftaranId: id,
          aksi: `Menjadi Pengurus dengan NIP: ${nia}`,
          oleh: "Sistem",
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: pendaftaran,
      message: status === "DISETUJUI"
        ? "Pendaftaran disetujui. Otomatis dibuatkan record Pengurus dengan jabatan 'Anggota Divisi'."
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
