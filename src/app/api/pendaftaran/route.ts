import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { MASTER_PROVINSI, MASTER_KABUPATEN } from "@/lib/master-wilayah";
import { encryptNIK, decryptNIK } from "@/lib/encryption";

// ============================================================
// GET /api/pendaftaran — List semua pendaftaran
// ============================================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const role = searchParams.get("role");
    const wilayah = searchParams.get("wilayah");

    let where: any = {};
    if (status && status !== "Semua") {
      where.status = status;
    }

    if (role === "ADMIN_PROVINSI" && wilayah) {
      const w = wilayah.replace("Provinsi ", "").trim();
      const prov = await db.provinsi.findFirst({ where: { nama: w } });
      if (prov) {
        where.provinsiId = prov.id;
      } else {
        where.provinsiId = -1;
      }
    } else if (role === "ADMIN_KABUPATEN" && wilayah) {
      const w = wilayah.replace("Kabupaten ", "Kab. ").trim();
      const kab = await db.kabupaten.findFirst({ where: { nama: w } });
      if (kab) {
        where.kabupatenId = kab.id;
      } else {
        where.kabupatenId = -1;
      }
    }

    const pendaftaran = await db.pendaftaran.findMany({
      where,
      include: {
        provinsi: { select: { id: true, nama: true, kode: true } },
        kabupaten: { select: { id: true, nama: true, kode: true } },
        riwayat: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Dekripsi NIK untuk ditampilkan di Admin Dashboard
    const pendaftaranWithDecryptedNik = pendaftaran.map(p => ({
      ...p,
      nik: decryptNIK(p.nik)
    }));

    return NextResponse.json({
      success: true,
      data: pendaftaranWithDecryptedNik,
      total: pendaftaranWithDecryptedNik.length,
    });
  } catch (error) {
    console.error("GET /api/pendaftaran error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data pendaftaran" },
      { status: 500 }
    );
  }
}

// ============================================================
// POST /api/pendaftaran — Submit pendaftaran baru
// ============================================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validasi field wajib
    const requiredFields = [
      "namaLengkap", "nik", "tempatLahir", "tanggalLahir",
      "jenisKelamin", "alamat", "provinsiNama", "kabupatenKode",
      "email", "whatsapp",
    ];
    for (const field of requiredFields) {
      if (!body[field] || String(body[field]).trim() === "") {
        return NextResponse.json(
          { success: false, error: `Field ${field} wajib diisi` },
          { status: 400 }
        );
      }
    }

    // Validasi NIK 16 digit
    if (String(body.nik).length !== 16) {
      return NextResponse.json(
        { success: false, error: "NIK harus 16 digit" },
        { status: 400 }
      );
    }

    // Validasi umur 16-30 tahun
    const tanggalLahir = new Date(body.tanggalLahir);
    if (isNaN(tanggalLahir.getTime())) {
      return NextResponse.json(
        { success: false, error: "Tanggal lahir tidak valid" },
        { status: 400 }
      );
    }
    const umur = new Date().getFullYear() - tanggalLahir.getFullYear();
    if (umur < 16 || umur > 30) {
      return NextResponse.json(
        { success: false, error: "Umur harus antara 16-30 tahun" },
        { status: 400 }
      );
    }

    // Lookup Provinsi by nama (jika belum ada di DB, auto-create dari MASTER_PROVINSI)
    let provinsi = await db.provinsi.findFirst({
      where: { nama: String(body.provinsiNama) },
    });
    if (!provinsi) {
      const masterProv = MASTER_PROVINSI.find(
        (p) =>
          p.nama.toLowerCase() === String(body.provinsiNama).toLowerCase() ||
          p.kode === String(body.provinsiKode)
      );
      if (!masterProv) {
        return NextResponse.json(
          {
            success: false,
            error: `Provinsi "${body.provinsiNama}" tidak ditemukan di master wilayah.`,
          },
          { status: 400 }
        );
      }
      // Pastikan kode unik
      const existingKode = await db.provinsi.findUnique({
        where: { kode: masterProv.kode },
      });
      const kodeFinal = existingKode ? `${masterProv.kode}-${Date.now().toString().slice(-4)}` : masterProv.kode;
      provinsi = await db.provinsi.create({
        data: {
          kode: kodeFinal,
          nama: masterProv.nama,
          status: "Aktif",
        },
      });
      console.log(`[pendaftaran] Auto-created provinsi: ${provinsi.nama} (${provinsi.kode})`);
    }

    // Lookup Kabupaten by kode Kemendagri (4-digit) — pastikan milik provinsi yg dipilih
    let kabupaten = await db.kabupaten.findFirst({
      where: {
        kode: String(body.kabupatenKode),
        provinsiId: provinsi.id,
      },
    });
    if (!kabupaten) {
      // Auto-create kabupaten dari master-wilayah jika belum ada di DB
      // ini memastikan user dari kabupaten manapun di Indonesia bisa mendaftar
      const masterKab = MASTER_KABUPATEN.find(
        (k) => k.kode === String(body.kabupatenKode)
      );
      if (!masterKab) {
        return NextResponse.json(
          {
            success: false,
            error: `Kabupaten dengan kode ${body.kabupatenKode} tidak ditemukan di master wilayah.`,
          },
          { status: 400 }
        );
      }
      kabupaten = await db.kabupaten.create({
        data: {
          kode: masterKab.kode,
          nama: masterKab.nama,
          provinsiId: provinsi.id,
          status: "Aktif",
        },
      });
      console.log(`[pendaftaran] Auto-created kabupaten: ${kabupaten.nama} (${kabupaten.kode})`);
    }

    // Generate nomor pendaftaran unik: REG-YYYYMM-XXXX (4 digit sequence per bulan)
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const prefix = `REG-${yyyy}${mm}-`;
    const lastReg = await db.pendaftaran.findFirst({
      where: { nomorPendaftaran: { startsWith: prefix } },
      orderBy: { nomorPendaftaran: "desc" },
      select: { nomorPendaftaran: true },
    });
    let seq = 1;
    if (lastReg) {
      const lastSeqStr = lastReg.nomorPendaftaran.slice(-4);
      seq = parseInt(lastSeqStr) + 1;
    }
    const nomorPendaftaran = `${prefix}${String(seq).padStart(4, "0")}`;

    const pendaftaran = await db.pendaftaran.create({
      data: {
        nomorPendaftaran,
        namaLengkap: body.namaLengkap,
        nik: encryptNIK(body.nik),
        tempatLahir: body.tempatLahir,
        tanggalLahir: tanggalLahir,
        jenisKelamin: body.jenisKelamin,
        agama: body.agama || null,
        pendidikan: body.pendidikan || null,
        pekerjaan: body.pekerjaan || null,
        statusPribadi: body.statusPribadi || null,
        alamat: body.alamat,
        provinsiId: provinsi.id,
        kabupatenId: kabupaten.id,
        kecamatan: body.kecamatan || null,
        desa: body.desa || null,
        kodePos: body.kodePos || null,
        email: body.email,
        whatsapp: body.whatsapp,
        motivasi: body.motivasi || null,
        foto: body.foto || null,
        ktp: body.ktp || null,
        cv: body.cv || null,
        sk: body.sk || null,
        suratPernyataan: body.suratPernyataan || null,
        suratSehat: body.suratSehat || null,
        persyaratan: JSON.stringify(body.persyaratan || []),
        status: "DIAJUKAN",
      },
    });

    // Tambah riwayat
    await db.pendaftaranRiwayat.create({
      data: {
        pendaftaranId: pendaftaran.id,
        aksi: "Pendaftaran dikirim",
        oleh: "Calon Anggota",
      },
    });

    // Notify Admins
    import("@/lib/notification-service").then(({ notifyAdmins }) => {
      notifyAdmins({
        title: "Pendaftaran Baru",
        message: `${body.namaLengkap} mendaftar sebagai anggota dari ${kabupaten.nama}.`,
        type: "PENDAFTARAN",
        link: "#admin?page=verifikasi",
        provinsiId: provinsi.id,
        kabupatenId: kabupaten.id,
      });
    }).catch(e => console.error("Failed to load notification-service", e));

    return NextResponse.json({
      success: true,
      data: pendaftaran,
      nomorPendaftaran,
      message: "Pendaftaran berhasil dikirim! Simpan Nomor Pendaftaran Anda untuk tracking status. Tim KIPAN akan memverifikasi dalam 3-5 hari kerja.",
    });
  } catch (error) {
    // Tangani Prisma error secara spesifik
    if (error instanceof Prisma.PrismaClientValidationError) {
      console.error("POST /api/pendaftaran validation error:", error.message);
      return NextResponse.json(
        { success: false, error: "Data pendaftaran tidak valid: " + error.message.split("\n").slice(0, 3).join(" ") },
        { status: 400 }
      );
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error("POST /api/pendaftaran known error:", error.code, error.message);
      const msg =
        error.code === "P2003"
          ? "Referensi provinsi/kabupaten tidak valid (foreign key constraint failed)."
          : `Database error (${error.code}): ${error.message}`;
      return NextResponse.json(
        { success: false, error: msg },
        { status: 400 }
      );
    }
    console.error("POST /api/pendaftaran error:", error);
    const detail = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Gagal submit pendaftaran: ${detail}` },
      { status: 500 }
    );
  }
}
