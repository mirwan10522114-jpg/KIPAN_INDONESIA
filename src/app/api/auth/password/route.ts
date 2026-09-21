import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  try {
    const { username, oldPassword, newPassword } = await req.json();

    if (!username || !oldPassword || !newPassword) {
      return NextResponse.json({ success: false, error: "Semua field wajib diisi." }, { status: 400 });
    }

    if (newPassword.length < 3) {
      return NextResponse.json({ success: false, error: "Password baru minimal 3 karakter." }, { status: 400 });
    }

    // Cari user
    const user = await db.user.findUnique({
      where: { email: username.trim().toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User tidak ditemukan." }, { status: 404 });
    }

    // Verifikasi password lama
    const passwordMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json({ success: false, error: "Password saat ini salah." }, { status: 401 });
    }

    // Hash password baru
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    return NextResponse.json({
      success: true,
      message: "Password berhasil diubah.",
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan pada server." }, { status: 500 });
  }
}
