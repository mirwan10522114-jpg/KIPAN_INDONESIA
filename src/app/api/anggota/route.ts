import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateNIP } from "@/lib/nip";
import { handleApiError, safeParseInt } from "@/lib/api-error";
import { encryptNIK, decryptNIK } from "@/lib/encryption";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || "";
    const provinsiId = searchParams.get("provinsiId") || "";
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role");
    const wilayah = searchParams.get("wilayah");

    const where: any = {
      pengurus: {
        none: {
          status: "Aktif"
        }
      }
    };
    if (status && status !== "Semua") where.status = status;
    if (provinsiId && provinsiId !== "Semua") where.provinsiId = parseInt(provinsiId);
    if (search) {
      where.OR = [
        { namaLengkap: { contains: search } },
        { nia: { contains: search } },
        { nik: { equals: encryptNIK(search) } }, // Exact match for encrypted search
      ];
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

    const total = await db.anggota.count({ where });
    const totalPages = Math.ceil(total / limit) || 1;
    const currentPage = Math.min(page, totalPages);
    const skip = (currentPage - 1) * limit;

    const anggota = await db.anggota.findMany({
      where,
      include: {
        provinsi: { select: { nama: true, kode: true } },
        kabupaten: { select: { nama: true, kode: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const anggotaDecrypted = anggota.map(a => ({
      ...a,
      nik: decryptNIK(a.nik)
    }));

    return NextResponse.json({
      success: true,
      data: anggotaDecrypted,
      total,
      page: currentPage,
      limit,
      totalPages,
    });
  } catch (error) {
    return handleApiError(error, "GET /api/anggota", "Gagal mengambil data anggota");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validasi semua field biodata & kontak wajib
    const requiredFields = [
      { key: "namaLengkap", label: "Nama Lengkap" },
      { key: "tempatLahir", label: "Tempat Lahir" },
      { key: "tanggalLahir", label: "Tanggal Lahir" },
      { key: "alamat", label: "Alamat" },
      { key: "email", label: "Email" },
      { key: "whatsapp", label: "No. WhatsApp" },
      { key: "provinsiId", label: "Provinsi" },
      { key: "kabupatenId", label: "Kabupaten/Kota" },
    ];
    for (const f of requiredFields) {
      if (!body[f.key] || !String(body[f.key]).trim()) {
        return NextResponse.json({ success: false, error: `${f.label} wajib diisi` }, { status: 400 });
      }
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json({ success: false, error: "Format email tidak valid. Contoh: nama@domain.com" }, { status: 400 });
    }

    // Validasi format WhatsApp Indonesia
    const waRegex = /^08\d{8,12}$/;
    if (!waRegex.test(String(body.whatsapp).replace(/[\s-]/g, ""))) {
      return NextResponse.json({ success: false, error: "Format No. WhatsApp tidak valid. Gunakan format: 08xxxxxxxxxx (8-13 digit setelah 08)" }, { status: 400 });
    }

    // Validasi NIK 16 digit numeric (wajib)
    if (!body.nik || String(body.nik).length !== 16 || !/^\d{16}$/.test(String(body.nik))) {
      return NextResponse.json({ success: false, error: "NIK wajib diisi dengan tepat 16 digit angka." }, { status: 400 });
    }

    // Validasi tanggalLahir: tidak boleh future date
    if (body.tanggalLahir) {
      const lahir = new Date(body.tanggalLahir);
      if (lahir > new Date()) {
        return NextResponse.json({ success: false, error: "Tanggal lahir tidak boleh di masa depan." }, { status: 400 });
      }
    }

    // Validasi provinsi & kabupaten
    const provIdNum = safeParseInt(body.provinsiId);
    const kabIdNum = safeParseInt(body.kabupatenId);
    if (provIdNum === null || kabIdNum === null) {
      return NextResponse.json({ success: false, error: "Provinsi atau kabupaten tidak valid" }, { status: 400 });
    }
    const prov = await db.provinsi.findUnique({ where: { id: provIdNum } });
    const kab = await db.kabupaten.findUnique({ where: { id: kabIdNum } });

    if (!prov || !kab) {
      return NextResponse.json({ success: false, error: "Provinsi atau kabupaten tidak ditemukan" }, { status: 400 });
    }

    const role = req.nextUrl.searchParams.get("role") || "SUPER_ADMIN";
    const wilayah = req.nextUrl.searchParams.get("wilayah");

    if (role === "ADMIN_PROVINSI" && wilayah && parseInt(wilayah) !== provIdNum) {
      return NextResponse.json({ success: false, error: "Akses ditolak: Anda hanya dapat mendaftarkan anggota di provinsi Anda." }, { status: 403 });
    }
    if (role === "ADMIN_KABUPATEN" && wilayah && parseInt(wilayah) !== kabIdNum) {
      return NextResponse.json({ success: false, error: "Akses ditolak: Anda hanya dapat mendaftarkan anggota di kabupaten Anda." }, { status: 403 });
    }

    // Transaction: create anggota → generate NIP → update NIP
    const updated = await db.$transaction(async (tx) => {
      // 1. Create anggota dengan NIP placeholder
      const newAnggota = await tx.anggota.create({
        data: {
          nia: "TEMP-" + Date.now(),
          namaLengkap: body.namaLengkap,
          nik: encryptNIK(body.nik),
          tempatLahir: body.tempatLahir || "",
          tanggalLahir: body.tanggalLahir ? new Date(body.tanggalLahir) : new Date("2000-01-01"),
          jenisKelamin: body.jenisKelamin || "L",
          agama: body.agama || null,
          pendidikan: body.pendidikan || null,
          pekerjaan: body.pekerjaan || null,
          alamat: body.alamat || "",
          provinsiId: provIdNum,
          kabupatenId: kabIdNum,
          kecamatan: body.kecamatan || null,
          email: body.email || "",
          whatsapp: body.whatsapp || "",
          foto: body.foto || null,
          ktp: body.ktp || null,
          cv: body.cv || null,
          suratPernyataan: body.suratPernyataan || null,
          suratSehat: body.suratSehat || null,
          status: "Aktif",
          tanggalAngkat: new Date(),
        },
      });

      // 2. Generate NIP dengan global sequence
      const tahun = new Date().getFullYear();
      const nia = await generateNIP(newAnggota.id, {
        provinsiId: provIdNum,
        kabupatenId: kabIdNum,
        tahun,
      }, tx);

      // 3. Update anggota dengan NIP yang benar
      const result = await tx.anggota.update({
        where: { id: newAnggota.id },
        data: { nia },
        include: {
          provinsi: { select: { nama: true, kode: true } },
          kabupaten: { select: { nama: true, kode: true } },
        },
      });

      return { anggota: result, nia };
    });

    return NextResponse.json({ success: true, data: updated.anggota, message: `Anggota berhasil ditambahkan dengan NIP: ${updated.nia}` });
  } catch (error) {
    return handleApiError(error, "POST /api/anggota", "Gagal menambahkan anggota");
  }
}
 
