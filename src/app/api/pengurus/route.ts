import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const level = searchParams.get("level");
    const where: any = {};
    if (level && level !== "Semua") where.level = level;

    const pengurus = await db.pengurus.findMany({
      where,
      include: {
        anggota: {
          include: {
            provinsi: { select: { nama: true, kode: true } },
            kabupaten: { select: { nama: true, kode: true } },
          },
        },
        jabatan: { select: { nama: true, bidang: true, level: true, urutan: true } },
        provinsi: { select: { nama: true, kode: true } },
        kabupaten: { select: { nama: true, kode: true } },
      },
      orderBy: [{ level: "asc" }, { jabatan: { urutan: "asc" } }],
    });

    return NextResponse.json({ success: true, data: pengurus, total: pengurus.length });
  } catch (error) {
    console.error("GET /api/pengurus error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data pengurus" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.anggotaId || !body.jabatanId) {
      return NextResponse.json({ success: false, error: "Pengurus wajib memiliki jabatan. Pilih anggota dan jabatan terlebih dahulu." }, { status: 400 });
    }

    // Validasi: jabatanId harus ada di database
    const jabatanExists = await db.jabatan.findUnique({ where: { id: parseInt(body.jabatanId) } });
    if (!jabatanExists) {
      return NextResponse.json({ success: false, error: "Jabatan tidak ditemukan. Pilih jabatan yang valid." }, { status: 400 });
    }

    // Rule: 1 orang hanya boleh pegang 1 jabatan aktif di satu waktu.
    // Jika user sudah punya jabatan aktif lain, OTOMATIS akhiri jabatan lama
    // (karier bisa naik: misal dari Anggota Divisi Kabupaten → Ketua Nasional)
    const existingActiveList = await db.pengurus.findMany({
      where: {
        anggotaId: parseInt(body.anggotaId),
        status: "Aktif",
      },
      include: { jabatan: true },
    });

    let endedOldJabatan = "";
    if (existingActiveList.length > 0) {
      // Akhiri semua jabatan aktif lama
      await db.pengurus.updateMany({
        where: {
          anggotaId: parseInt(body.anggotaId),
          status: "Aktif",
        },
        data: {
          status: "Selesai",
          tanggalSelesai: new Date(),
        },
      });
      const oldJabatan = existingActiveList[0];
      endedOldJabatan = ` Jabatan lama sebagai "${oldJabatan.jabatan?.nama}" (${oldJabatan.jabatan?.bidang}) di level ${oldJabatan.level} otomatis diakhiri.`;
    }

    const data: any = {
      anggotaId: parseInt(body.anggotaId),
      jabatanId: parseInt(body.jabatanId),
      level: body.level,
      status: body.status || "Aktif",
      tanggalMulai: body.tanggalMulai ? new Date(body.tanggalMulai) : new Date(),
      tanggalSelesai: body.tanggalSelesai ? new Date(body.tanggalSelesai) : null,
      nomorSK: body.nomorSK || "",
      fileSK: body.fileSK || null,
    };
    if (body.provinsiId) data.provinsiId = parseInt(body.provinsiId);
    if (body.kabupatenId) data.kabupatenId = parseInt(body.kabupatenId);

    const pengurus = await db.pengurus.create({
      data,
      include: {
        anggota: { include: { provinsi: { select: { nama: true } }, kabupaten: { select: { nama: true } } } },
        jabatan: { select: { nama: true, bidang: true, level: true, urutan: true } },
        provinsi: { select: { nama: true } },
        kabupaten: { select: { nama: true } },
      },
    });

    return NextResponse.json({ success: true, data: pengurus, message: `Pengurus berhasil ditambahkan dengan jabatan "${jabatanExists.nama}" di bidang "${jabatanExists.bidang}".${endedOldJabatan}` });
  } catch (error) {
    console.error("POST /api/pengurus error:", error);
    return NextResponse.json({ success: false, error: "Gagal menambahkan pengurus" }, { status: 500 });
  }
}
