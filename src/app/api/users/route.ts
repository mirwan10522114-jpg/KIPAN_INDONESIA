import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

const USER_SELECT: Prisma.UserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  provinsiId: true,
  kabupatenId: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  provinsi: { select: { id: true, nama: true, kode: true } },
  kabupaten: { select: { id: true, nama: true, kode: true } },
};

// ============================================================
// GET /api/users — List all users with filter & search
// ============================================================
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const q = searchParams.get("q");

    const where: any = {};
    if (role && role !== "Semua") {
      where.role = role;
    }
    if (q && q.trim()) {
      where.OR = [
        { name: { contains: q.trim() } },
        { email: { contains: q.trim() } },
      ];
    }

    const users = await db.user.findMany({
      where,
      select: USER_SELECT,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: users,
      total: users.length,
    });
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data pengguna" },
      { status: 500 }
    );
  }
}

// ============================================================
// POST /api/users — Create new user
// ============================================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role, status = "Aktif", provinsiId, kabupatenId } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, error: "Nama, email, password, dan role wajib diisi." },
        { status: 400 }
      );
    }

    const validRoles = ["SUPER_ADMIN", "ADMIN_NASIONAL", "ADMIN_PROVINSI", "ADMIN_KABUPATEN"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { success: false, error: "Role tidak valid." },
        { status: 400 }
      );
    }

    // Cek duplikasi email
    const existing = await db.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Email "${email}" sudah terdaftar.` },
        { status: 400 }
      );
    }

    // Validasi wilayah berdasarkan role
    let provId: number | null = null;
    let kabId: number | null = null;
    if (role === "ADMIN_PROVINSI") {
      if (!provinsiId) {
        return NextResponse.json(
          { success: false, error: "Admin Provinsi wajib memilih Provinsi yang dikelola." },
          { status: 400 }
        );
      }
      provId = parseInt(provinsiId);
    } else if (role === "ADMIN_KABUPATEN") {
      if (!provinsiId || !kabupatenId) {
        return NextResponse.json(
          { success: false, error: "Admin Kota/Kabupaten wajib memilih Provinsi dan Kabupaten/Kota." },
          { status: 400 }
        );
      }
      provId = parseInt(provinsiId);
      kabId = parseInt(kabupatenId);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await db.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        role,
        status,
        provinsiId: provId,
        kabupatenId: kabId,
      } as any,
      select: USER_SELECT,
    });

    return NextResponse.json({
      success: true,
      data: newUser,
      message: "Pengguna berhasil ditambahkan.",
    });
  } catch (error) {
    console.error("POST /api/users error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menambahkan pengguna" },
      { status: 500 }
    );
  }
}
