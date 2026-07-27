import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// POST /api/jabatan/bulk-create-bidang
// Body: { bidang: string, levels: string[] }
// Untuk setiap level, create 3 default jabatan: Ketua Divisi, Sekretaris Divisi, Anggota
// Skip jika jabatan sudah ada di bidang+level tsb (no error)
// Semua dalam db.$transaction
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bidang, levels } = body;

    if (!bidang || !bidang.trim()) {
      return NextResponse.json({ success: false, error: "Nama bidang wajib diisi" }, { status: 400 });
    }
    if (!levels || !Array.isArray(levels) || levels.length === 0) {
      return NextResponse.json({ success: false, error: "Pilih minimal 1 level" }, { status: 400 });
    }

    const validLevels = ["Nasional", "Provinsi", "Kabupaten"];
    for (const l of levels) {
      if (!validLevels.includes(l)) {
        return NextResponse.json({ success: false, error: `Level "${l}" tidak valid. Pilih: Nasional, Provinsi, atau Kabupaten` }, { status: 400 });
      }
    }

    const defaultJabatan = [
      { nama: "Ketua Divisi", urutan: 1 },
      { nama: "Sekretaris Divisi", urutan: 2 },
      { nama: "Anggota", urutan: 3 },
    ];

    const result = await db.$transaction(async (tx) => {
      let created = 0;
      let skipped = 0;

      for (const level of levels) {
        for (const dj of defaultJabatan) {
          // Cek duplicate
          const existing = await tx.jabatan.findFirst({
            where: { nama: dj.nama, bidang: bidang.trim(), level },
          });
          if (existing) {
            skipped++;
            continue;
          }
          await tx.jabatan.create({
            data: {
              nama: dj.nama,
              bidang: bidang.trim(),
              level,
              urutan: dj.urutan,
              status: "Aktif",
            },
          });
          created++;
        }
      }

      return { created, skipped };
    });

    return NextResponse.json({
      success: true,
      created: result.created,
      skipped: result.skipped,
      message: `Bidang "${bidang.trim()}" dibuat dengan ${result.created} jabatan baru (${result.skipped} di-skip karena sudah ada).`,
    });
  } catch (error) {
    console.error("POST /api/jabatan/bulk-create-bidang error:", error);
    return NextResponse.json({ success: false, error: "Gagal membuat bidang baru" }, { status: 500 });
  }
}
