import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateNIP } from "@/lib/nip";
import { handleApiError, safeParseInt } from "@/lib/api-error";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const level = searchParams.get("level") || "";
    const bidang = searchParams.get("bidang") || "";
    const status = searchParams.get("status") || "";
    const provinsiId = searchParams.get("provinsiId") || "";
    const kabupatenId = searchParams.get("kabupatenId") || "";

    // Build where clause — server-side filtering
    const where: any = {};
    if (level && level !== "Semua") where.level = level;
    if (status && status !== "Semua") where.status = status;
    if (provinsiId && provinsiId !== "Semua") where.provinsiId = parseInt(provinsiId);
    if (kabupatenId && kabupatenId !== "Semua") where.kabupatenId = parseInt(kabupatenId);
    if (bidang && bidang !== "Semua") where.jabatan = { bidang };
    if (search) {
      where.OR = [
        { anggota: { namaLengkap: { contains: search } } },
        { anggota: { nia: { contains: search } } },
        { jabatan: { nama: { contains: search } } },
        { jabatan: { bidang: { contains: search } } },
        { nomorSK: { contains: search } },
      ];
    }

    // Get total count for pagination
    const total = await db.pengurus.count({ where });
    const totalPages = Math.ceil(total / limit) || 1;
    const currentPage = Math.min(page, totalPages);
    const skip = (currentPage - 1) * limit;

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
      skip,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: pengurus,
      total,
      page: currentPage,
      limit,
      totalPages,
    });
  } catch (error) {
    return handleApiError(error, "GET /api/pengurus", "Gagal mengambil data pengurus");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validasi: jabatanId wajib dan harus numeric valid
    const jabatanIdNum = safeParseInt(body.jabatanId);
    if (!body.jabatanId || jabatanIdNum === null) {
      return NextResponse.json({ success: false, error: "Jabatan wajib dipilih." }, { status: 400 });
    }

    // Validasi: anggotaId wajib (kecuali mode manual orang baru)
    const isManualMode = body.isNewAnggota === true && body.newAnggotaData;
    let anggotaIdNum: number | null = safeParseInt(body.anggotaId);
    if (!isManualMode && (!body.anggotaId || anggotaIdNum === null)) {
      return NextResponse.json({ success: false, error: "Anggota wajib dipilih dari database, atau gunakan mode Input Manual untuk orang baru." }, { status: 400 });
    }

    // Validasi: jabatanId harus ada di database
    const jabatanExists = await db.jabatan.findUnique({ where: { id: jabatanIdNum } });
    if (!jabatanExists) {
      return NextResponse.json({ success: false, error: "Jabatan tidak ditemukan. Pilih jabatan yang valid." }, { status: 400 });
    }

    // ===== MODE MANUAL: auto-create anggota baru (dalam transaction) =====
    let anggotaIdToUse: number;
    if (isManualMode) {
      const nd = body.newAnggotaData;
      // Validasi semua field biodata & kontak wajib
      const requiredFields = [
        { key: "namaLengkap", label: "Nama Lengkap" },
        { key: "tempatLahir", label: "Tempat Lahir" },
        { key: "tanggalLahir", label: "Tanggal Lahir" },
        { key: "alamat", label: "Alamat" },
        { key: "email", label: "Email" },
        { key: "hp", label: "No. HP" },
      ];
      for (const f of requiredFields) {
        if (!nd[f.key] || !String(nd[f.key]).trim()) {
          return NextResponse.json({ success: false, error: `${f.label} wajib diisi untuk orang baru.` }, { status: 400 });
        }
      }
      // Validasi level & wilayah
      const provinsiIdNum = safeParseInt(body.provinsiId);
      const kabupatenIdNum = safeParseInt(body.kabupatenId);
      // Untuk mode manual, provinsiId & kabupatenId WAJIB (karena Anggota schema require keduanya),
      // terlepas dari level pengurus (NASIONAL/PROVINSI/KABUPATEN).
      // Wilayah ini adalah domisili anggota, bukan penempatan pengurus.
      if (provinsiIdNum === null) {
        return NextResponse.json({ success: false, error: "Provinsi domisili anggota wajib dipilih (untuk data biodata anggota)." }, { status: 400 });
      }
      if (kabupatenIdNum === null) {
        return NextResponse.json({ success: false, error: "Kabupaten/Kota domisili anggota wajib dipilih (untuk data biodata anggota)." }, { status: 400 });
      }

      // Validasi format email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(nd.email)) {
        return NextResponse.json({ success: false, error: "Format email tidak valid. Contoh: nama@domain.com" }, { status: 400 });
      }

      // Validasi format HP Indonesia
      const hpRegex = /^08\d{8,12}$/;
      if (!hpRegex.test(nd.hp.replace(/[\s-]/g, ""))) {
        return NextResponse.json({ success: false, error: "Format No. HP tidak valid. Gunakan format: 08xxxxxxxxxx (8-13 digit setelah 08)" }, { status: 400 });
      }

      // Validasi NIK 16 digit numeric (jika diisi)
      if (nd.nik && nd.nik.length !== 16) {
        return NextResponse.json({ success: false, error: "NIK harus tepat 16 digit angka." }, { status: 400 });
      }

      // Validasi tanggalLahir: tidak boleh future date, minimum umur 16 tahun
      if (nd.tanggalLahir) {
        const lahir = new Date(nd.tanggalLahir);
        const now = new Date();
        if (lahir > now) {
          return NextResponse.json({ success: false, error: "Tanggal lahir tidak boleh di masa depan." }, { status: 400 });
        }
        const umur = now.getFullYear() - lahir.getFullYear();
        if (umur < 16) {
          return NextResponse.json({ success: false, error: "Umur minimal 16 tahun untuk menjadi pengurus." }, { status: 400 });
        }
      }

      // Validasi provinsiId exists (hanya untuk level PROVINSI & KABUPATEN)
      if ((body.level === "PROVINSI" || body.level === "KABUPATEN") && provinsiIdNum !== null) {
        const provExists = await db.provinsi.findUnique({ where: { id: provinsiIdNum } });
        if (!provExists) {
          return NextResponse.json({ success: false, error: "Provinsi tidak ditemukan di database." }, { status: 400 });
        }
      }

      // Validasi kabupatenId exists (jika level KABUPATEN)
      if (body.level === "KABUPATEN" && kabupatenIdNum !== null) {
        const kabExists = await db.kabupaten.findUnique({ where: { id: kabupatenIdNum } });
        if (!kabExists) {
          return NextResponse.json({ success: false, error: "Kabupaten/Kota tidak ditemukan di database." }, { status: 400 });
        }
      }

      // Transaction: create anggota → generate NIP → update NIP
      const result = await db.$transaction(async (tx) => {
        // 1. Create anggota dengan NIP placeholder
        const anggotaData: any = {
          nia: "TEMP-" + Date.now(),
          namaLengkap: nd.namaLengkap.trim(),
          nik: nd.nik || "",
          tempatLahir: nd.tempatLahir || "",
          tanggalLahir: nd.tanggalLahir ? new Date(nd.tanggalLahir) : new Date("2000-01-01"),
          jenisKelamin: nd.jenisKelamin || "L",
          alamat: nd.alamat || "",
          provinsiId: provinsiIdNum!,
          email: nd.email || "",
          hp: nd.hp || "",
          whatsapp: nd.hp || null,
          foto: nd.foto || null,
          ktp: nd.ktp || null,
          cv: nd.cv || null,
          suratPernyataan: nd.suratPernyataan || null,
          suratSehat: nd.suratSehat || null,
          status: "Aktif",
          angkatan: body.angkatan || "XII",
          tanggalAngkat: new Date(),
        };
        if (kabupatenIdNum !== null) anggotaData.kabupatenId = kabupatenIdNum;

        const newAnggota = await tx.anggota.create({
          data: anggotaData,
        });

        // 2. Generate NIP dengan global sequence
        const tahun = new Date().getFullYear();
        const nia = await generateNIP(newAnggota.id, {
          provinsiId: provinsiIdNum!,
          kabupatenId: kabupatenIdNum,
          tahun,
        }, tx);

        // 3. Update anggota dengan NIP yang benar
        await tx.anggota.update({
          where: { id: newAnggota.id },
          data: { nia },
        });

        return newAnggota.id;
      });

      anggotaIdToUse = result;
    } else {
      anggotaIdToUse = anggotaIdNum!;
    }

    // Rule: 1 orang hanya boleh pegang 1 jabatan aktif di satu waktu.
    // Jika user sudah punya jabatan aktif lain, OTOMATIS akhiri jabatan lama
    const existingActiveList = await db.pengurus.findMany({
      where: {
        anggotaId: anggotaIdToUse,
        status: "Aktif",
      },
      include: { jabatan: true },
    });

    let endedOldJabatan = "";
    if (existingActiveList.length > 0) {
      await db.pengurus.updateMany({
        where: {
          anggotaId: anggotaIdToUse,
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
      anggotaId: anggotaIdToUse,
      jabatanId: jabatanIdNum,
      level: body.level,
      status: body.status || "Aktif",
      tanggalMulai: body.tanggalMulai ? new Date(body.tanggalMulai) : new Date(),
      tanggalSelesai: body.tanggalSelesai ? new Date(body.tanggalSelesai) : null,
      nomorSK: body.nomorSK || "",
      fileSK: body.fileSK || null,
    };
    if (body.level === "PROVINSI" || body.level === "KABUPATEN") {
      const provNum = safeParseInt(body.provinsiId);
      if (provNum !== null) data.provinsiId = provNum;
    }
    if (body.level === "KABUPATEN") {
      const kabNum = safeParseInt(body.kabupatenId);
      if (kabNum !== null) data.kabupatenId = kabNum;
    }

    const pengurus = await db.pengurus.create({
      data,
      include: {
        anggota: { include: { provinsi: { select: { nama: true } }, kabupaten: { select: { nama: true } } } },
        jabatan: { select: { nama: true, bidang: true, level: true, urutan: true } },
        provinsi: { select: { nama: true } },
        kabupaten: { select: { nama: true } },
      },
    });

    await db.activityLog.create({
      data: {
        table: "pengurus",
        recordId: pengurus.id,
        aksi: "create",
        oleh: "Admin",
        detail: JSON.stringify({ anggotaId: pengurus.anggotaId, jabatanId: pengurus.jabatanId, level: pengurus.level, status: pengurus.status }),
      },
    });

    return NextResponse.json({ success: true, data: pengurus, message: `Pengurus berhasil ditambahkan dengan jabatan "${jabatanExists.nama}" di bidang "${jabatanExists.bidang}".${endedOldJabatan}` });
  } catch (error) {
    return handleApiError(error, "POST /api/pengurus", "Gagal menambahkan pengurus");
  }
}
