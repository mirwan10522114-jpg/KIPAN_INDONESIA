import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: "Username dan password wajib diisi." }, { status: 400 });
    }

    // Cari user berdasarkan email (username = email)
    const user = await db.user.findUnique({
      where: { email: username.trim().toLowerCase() },
      include: {
        provinsi: { select: { nama: true } },
        kabupaten: { select: { nama: true } },
      }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Username atau password salah." }, { status: 401 });
    }

    if (user.status !== "Aktif") {
      return NextResponse.json({ success: false, error: "Akun Anda tidak aktif. Hubungi administrator." }, { status: 403 });
    }

    // Verifikasi password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (!passwordMatch) {
      return NextResponse.json({ success: false, error: "Username atau password salah." }, { status: 401 });
    }

    // Update lastLoginAt
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Susun wilayah string
    let wilayahStr = "Nasional";
    if (user.role === "ADMIN_PROVINSI" && user.provinsi) {
      wilayahStr = user.provinsi.nama;
    } else if (user.role === "ADMIN_KABUPATEN" && user.kabupaten) {
      wilayahStr = user.kabupaten.nama;
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        username: user.email,
        displayName: user.name,
        role: user.role,
        wilayah: wilayahStr,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
