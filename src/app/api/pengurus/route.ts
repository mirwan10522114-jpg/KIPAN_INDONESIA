import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateNIP } from "@/lib/nip";

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

    // Validasi: jabatanId wajib
    if (!body.jabatanId) {
      return NextResponse.json({ success: false, error: "Jabatan wajib dipilih." }, { status: 400 });
    }

    // Validasi: anggotaId wajib (kecuali mode manual orang baru)
    const isManualMode = body.isNewAnggota === true && body.newAnggotaData;
    if (!isManualMode && !body.anggotaId) {
      return NextResponse.json({ success: false, error: "Anggota wajib dipilih dari database, atau gunakan mode Input Manual untuk orang baru." }, { status: 400 });
    }

    // Validasi: jabatanId harus ada di database
    const jabatanExists = await db.jabatan.findUnique({ where: { id: parseInt(body.jabatanId) } });
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
      if (body.level === "PROVINSI" && !body.provinsiId) {
        return NextResponse.json({ success: false, error: "Provinsi penempatan wajib dipilih." }, { status: 400 });
      }
      if (body.level === "KABUPATEN" && (!body.provinsiId || !body.kabupatenId)) {
        return NextResponse.json({ success: false, error: "Provinsi & Kabupaten/Kota wajib dipilih." }, { status: 400 });
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

      // Validasi provinsiId exists
      const provExists = await db.provinsi.findUnique({ where: { id: parseInt(body.provinsiId) } });
      if (!provExists) {
        return NextResponse.json({ success: false, error: "Provinsi tidak ditemukan di database." }, { status: 400 });
      }

      // Validasi kabupatenId exists (jika level KABUPATEN)
      if (body.level === "KABUPATEN" && body.kabupatenId) {
        const kabExists = await db.kabupaten.findUnique({ where: { id: parseInt(body.kabupatenId) } });
        if (!kabExists) {
          return NextResponse.json({ success: false, error: "Kabupaten/Kota tidak ditemukan di database." }, { status: 400 });
        }
      }

      // Transaction: create anggota → generate NIP → update NIP
      const result = await db.$transaction(async (tx) => {
        // 1. Create anggota dengan NIP placeholder
        const newAnggota = await tx.anggota.create({
          data: {
            nia: "TEMP-" + Date.now(),
            namaLengkap: nd.namaLengkap.trim(),
            nik: nd.nik || "",
            tempatLahir: nd.tempatLahir || "",
            tanggalLahir: nd.tanggalLahir ? new Date(nd.tanggalLahir) : new Date("2000-01-01"),
            jenisKelamin: nd.jenisKelamin || "L",
            alamat: nd.alamat || "",
            provinsiId: parseInt(body.provinsiId),
            ...(body.kabupatenId ? { kabupatenId: parseInt(body.kabupatenId) } : {}),
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
          },
        });

        // 2. Generate NIP dengan global sequence
        const tahun = new Date().getFullYear();
        const nia = await generateNIP(newAnggota.id, {
          provinsiId: parseInt(body.provinsiId),
          kabupatenId: body.kabupatenId ? parseInt(body.kabupatenId) : null,
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
      anggotaIdToUse = parseInt(body.anggotaId);
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
