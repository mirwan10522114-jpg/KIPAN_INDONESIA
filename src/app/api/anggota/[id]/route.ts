import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleApiError, safeParseInt } from "@/lib/api-error";
import { encryptNIK, decryptNIK } from "@/lib/encryption";

// GET /api/anggota/[id] — Get biodata anggota by id
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);
    const anggota = await db.anggota.findUnique({
      where: { id },
    });

    if (!anggota) {
      return NextResponse.json({ success: false, error: "Data anggota tidak ditemukan" }, { status: 404 });
    }

    anggota.nik = decryptNIK(anggota.nik);

    return NextResponse.json({ success: true, data: anggota });
  } catch (error) {
    console.error("GET /api/anggota/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat biodata" },
      { status: 500 }
    );
  }
}

// PUT /api/anggota/[id] — Update biodata anggota (data person)
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);
    const body = await req.json();
    const role = req.nextUrl.searchParams.get("role") || "SUPER_ADMIN";
    const wilayah = req.nextUrl.searchParams.get("wilayah");

    // RBAC Check
    const anggota = await db.anggota.findUnique({ where: { id }, select: { provinsiId: true, kabupatenId: true } });
    if (!anggota) {
      return NextResponse.json({ success: false, error: "Anggota tidak ditemukan" }, { status: 404 });
    }
    if (role === "ADMIN_PROVINSI" && wilayah && parseInt(wilayah) !== anggota.provinsiId) {
      return NextResponse.json({ success: false, error: "Akses ditolak: Anggota berada di luar wilayah provinsi Anda." }, { status: 403 });
    }
    if (role === "ADMIN_KABUPATEN" && wilayah && parseInt(wilayah) !== anggota.kabupatenId) {
      return NextResponse.json({ success: false, error: "Akses ditolak: Anggota berada di luar wilayah kabupaten Anda." }, { status: 403 });
    }

    // Validasi format email jika diubah
    if (body.email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (body.email && !emailRegex.test(body.email)) {
        return NextResponse.json({ success: false, error: "Format email tidak valid. Contoh: nama@domain.com" }, { status: 400 });
      }
    }

    // Validasi format HP Indonesia jika diubah
    if (body.hp !== undefined) {
      const hpRegex = /^08\d{8,12}$/;
      if (body.hp && !hpRegex.test(String(body.hp).replace(/[\s-]/g, ""))) {
        return NextResponse.json({ success: false, error: "Format No. HP tidak valid. Gunakan format: 08xxxxxxxxxx (8-13 digit setelah 08)" }, { status: 400 });
      }
    }

    // Validasi NIK 16 digit numeric jika diubah
    if (body.nik !== undefined && body.nik) {
      if (String(body.nik).length !== 16 || !/^\d{16}$/.test(String(body.nik))) {
        return NextResponse.json({ success: false, error: "NIK harus tepat 16 digit angka." }, { status: 400 });
      }
    }

    // Validasi tanggalLahir tidak boleh future date jika diubah
    if (body.tanggalLahir !== undefined && body.tanggalLahir) {
      const lahir = new Date(body.tanggalLahir);
      if (lahir > new Date()) {
        return NextResponse.json({ success: false, error: "Tanggal lahir tidak boleh di masa depan." }, { status: 400 });
      }
    }

    // Build update data — hanya field yang diberikan (undefined = tidak diubah)
    const data: any = {};
    const changes: string[] = [];
    if (body.namaLengkap !== undefined) { data.namaLengkap = body.namaLengkap; changes.push("namaLengkap"); }
    if (body.nik !== undefined) { data.nik = encryptNIK(body.nik); changes.push("nik"); }
    if (body.tempatLahir !== undefined) { data.tempatLahir = body.tempatLahir; changes.push("tempatLahir"); }
    if (body.tanggalLahir !== undefined) { data.tanggalLahir = body.tanggalLahir ? new Date(body.tanggalLahir) : undefined; changes.push("tanggalLahir"); }
    if (body.jenisKelamin !== undefined) { data.jenisKelamin = body.jenisKelamin; changes.push("jenisKelamin"); }
    if (body.agama !== undefined) { data.agama = body.agama || null; changes.push("agama"); }
    if (body.pendidikan !== undefined) { data.pendidikan = body.pendidikan || null; changes.push("pendidikan"); }
    if (body.pekerjaan !== undefined) { data.pekerjaan = body.pekerjaan || null; changes.push("pekerjaan"); }
    if (body.alamat !== undefined) { data.alamat = body.alamat; changes.push("alamat"); }
    
    // Wilayah (hanya simpan kalau ada)
    if (body.kecamatan !== undefined) { data.kecamatan = body.kecamatan || null; changes.push("kecamatan"); }
    if (body.desa !== undefined) { data.desa = body.desa || null; changes.push("desa"); }
    if (body.kodePos !== undefined) { data.kodePos = body.kodePos || null; changes.push("kodePos"); }

    if (body.provinsiId) {
      data.provinsiId = parseInt(body.provinsiId);
      changes.push("provinsiId");
    } else if (body.provinsiId === "") {
      data.provinsiId = null;
      changes.push("provinsiId");
    }

    if (body.kabupatenId) {
      data.kabupatenId = parseInt(body.kabupatenId);
      changes.push("kabupatenId");
    } else if (body.kabupatenId === "") {
      data.kabupatenId = null;
      changes.push("kabupatenId");
    }

    if (body.email !== undefined) { data.email = body.email; changes.push("email"); }
    if (body.hp !== undefined) { data.hp = body.hp; changes.push("hp"); }
    if (body.whatsapp !== undefined) { data.whatsapp = body.whatsapp || null; changes.push("whatsapp"); }
    
    // Dokumen: HANYA update jika body mengirimkan string yang tidak kosong (base64/url)
    // Karena form edit kita tidak memiliki fitur "hapus dokumen", mengirim string kosong 
    // berarti dokumen tersebut tidak diubah (mencegah bug dokumen hilang jika string kosong dikirim)
    if (body.foto) { data.foto = body.foto; changes.push("foto"); }
    if (body.ktp) { data.ktp = body.ktp; changes.push("ktp"); }
    if (body.cv) { data.cv = body.cv; changes.push("cv"); }
    if (body.suratPernyataan) { data.suratPernyataan = body.suratPernyataan; changes.push("suratPernyataan"); }
    if (body.suratSehat) { data.suratSehat = body.suratSehat; changes.push("suratSehat"); }

    const updated = await db.anggota.update({
      where: { id },
      data,
    });

    await db.activityLog.create({
      data: {
        table: "anggota",
        recordId: id,
        aksi: "update",
        oleh: "Admin",
        detail: JSON.stringify(Object.keys(data)).slice(0, 191),
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Biodata pengurus berhasil diperbarui",
    });
    } catch (error: any) {
      console.error("PUT /api/anggota/[id] error:", error);
      return NextResponse.json(
        { success: false, error: "Gagal memperbarui biodata: " + (error.message || String(error)) },
        { status: 500 }
      );
    }
}

// PATCH /api/anggota/[id] — Update status dan field dasar anggota
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);
    const body = await req.json();
    const role = req.nextUrl.searchParams.get("role") || "SUPER_ADMIN";
    const wilayah = req.nextUrl.searchParams.get("wilayah");

    // RBAC Check
    const anggota = await db.anggota.findUnique({ where: { id }, select: { provinsiId: true, kabupatenId: true } });
    if (!anggota) {
      return NextResponse.json({ success: false, error: "Anggota tidak ditemukan" }, { status: 404 });
    }
    if (role === "ADMIN_PROVINSI" && wilayah && parseInt(wilayah) !== anggota.provinsiId) {
      return NextResponse.json({ success: false, error: "Akses ditolak: Anggota berada di luar wilayah provinsi Anda." }, { status: 403 });
    }
    if (role === "ADMIN_KABUPATEN" && wilayah && parseInt(wilayah) !== anggota.kabupatenId) {
      return NextResponse.json({ success: false, error: "Akses ditolak: Anggota berada di luar wilayah kabupaten Anda." }, { status: 403 });
    }

    const VALID_STATUS = ["Aktif", "Nonaktif", "Mengundurkan Diri", "Diberhentikan", "Meninggal"];

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
    if (body.namaLengkap !== undefined && body.namaLengkap.trim()) data.namaLengkap = body.namaLengkap.trim();
    if (body.pekerjaan !== undefined) data.pekerjaan = body.pekerjaan || null;
    if (body.alamat !== undefined) data.alamat = body.alamat || null;
    if (body.email !== undefined) data.email = body.email || null;
    if (body.whatsapp !== undefined) data.whatsapp = body.whatsapp || null;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, error: "Tidak ada field yang diubah" }, { status: 400 });
    }

    const updated = await db.anggota.update({
      where: { id },
      data,
    });

    await db.activityLog.create({
      data: {
        table: "anggota",
        recordId: id,
        aksi: "patch",
        oleh: "Admin",
        detail: JSON.stringify({ fields: Object.keys(data) }).slice(0, 191),
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Data anggota berhasil diperbarui",
    });
  } catch (error) {
    console.error("PATCH /api/anggota/[id] error:", error);
    return NextResponse.json({ success: false, error: "Gagal memperbarui data anggota" }, { status: 500 });
  }
}
