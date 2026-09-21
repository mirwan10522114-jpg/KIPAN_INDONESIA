import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

const USER_SELECT: Prisma.UserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true, // @ts-ignore - this field exists in Prisma but IDE cache might be stale
  provinsiId: true,
  kabupatenId: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  provinsi: { select: { id: true, nama: true, kode: true } },
  kabupaten: { select: { id: true, nama: true, kode: true } },
};

// ============================================================
// GET /api/users/[id] — Get single user detail
// ============================================================
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("GET /api/users/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data pengguna." },
      { status: 500 }
    );
  }
}

// ============================================================
// PUT /api/users/[id] — Update user
// ============================================================
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, email, password, role, status, provinsiId, kabupatenId } = body;

    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    // Jika email diubah, pastikan tidak duplikat
    if (email && email.trim().toLowerCase() !== existing.email.toLowerCase()) {
      const emailUsed = await db.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      });
      if (emailUsed) {
        return NextResponse.json(
          { success: false, error: `Email "${email}" sudah digunakan akun lain.` },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.trim().toLowerCase();
    if (status) updateData.status = status;

    if (role) {
      const validRoles = ["SUPER_ADMIN", "ADMIN_NASIONAL", "ADMIN_PROVINSI", "ADMIN_KABUPATEN"];
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { success: false, error: "Role tidak valid." },
          { status: 400 }
        );
      }
      updateData.role = role;

      if (role === "SUPER_ADMIN" || role === "ADMIN_NASIONAL") {
        updateData.provinsiId = null;
        updateData.kabupatenId = null;
      } else if (role === "ADMIN_PROVINSI") {
        if (!provinsiId) {
          return NextResponse.json(
            { success: false, error: "Admin Provinsi wajib memilih Provinsi yang dikelola." },
            { status: 400 }
          );
        }
        updateData.provinsiId = parseInt(provinsiId);
        updateData.kabupatenId = null;
      } else if (role === "ADMIN_KABUPATEN") {
        if (!provinsiId || !kabupatenId) {
          return NextResponse.json(
            { success: false, error: "Admin Kota/Kabupaten wajib memilih Provinsi dan Kabupaten/Kota." },
            { status: 400 }
          );
        }
        updateData.provinsiId = parseInt(provinsiId);
        updateData.kabupatenId = parseInt(kabupatenId);
      }
    } else {
      if (provinsiId !== undefined) {
        updateData.provinsiId = provinsiId ? parseInt(provinsiId) : null;
      }
      if (kabupatenId !== undefined) {
        updateData.kabupatenId = kabupatenId ? parseInt(kabupatenId) : null;
      }
    }

    // Jika ada password baru yang diisi
    if (password && password.trim().length > 0) {
      if (password.trim().length < 6) {
        return NextResponse.json(
          { success: false, error: "Password minimal 6 karakter." },
          { status: 400 }
        );
      }
      updateData.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const updated = await db.user.update({
      where: { id },
      data: updateData,
      select: USER_SELECT,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Data pengguna berhasil diperbarui.",
    });
  } catch (error) {
    console.error("PUT /api/users/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui data pengguna." },
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE /api/users/[id] — Delete user
// ============================================================
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    // Proteksi: jangan hapus jika dia adalah satu-satunya SUPER_ADMIN
    if (user.role === "SUPER_ADMIN") {
      const superAdminCount = await db.user.count({
        where: { role: "SUPER_ADMIN" },
      });
      if (superAdminCount <= 1) {
        return NextResponse.json(
          { success: false, error: "Tidak dapat menghapus satu-satunya Super Admin dalam sistem." },
          { status: 400 }
        );
      }
    }

    await db.user.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Pengguna berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE /api/users/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus pengguna." },
      { status: 500 }
    );
  }
}
