import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

// Konfigurasi sesuai PRD §6.2
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "Tidak ada file yang diunggah" }, { status: 400 });
    }

    // ================================================================
    // VALIDASI TIPE FILE — Sesuai PRD §6.2
    // Hanya JPEG, PNG, WebP yang diperbolehkan
    // ================================================================
    const mimeType = file.type;
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Format file tidak didukung. Hanya JPEG, PNG, dan WebP yang diperbolehkan. File Anda: ${mimeType || "tidak diketahui"}`,
        },
        { status: 400 }
      );
    }

    // Validasi ekstensi file
    const originalName = file.name || "";
    const ext = originalName.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        {
          success: false,
          error: `Ekstensi file .${ext} tidak diperbolehkan. Gunakan: .jpg, .jpeg, .png, atau .webp`,
        },
        { status: 400 }
      );
    }

    // ================================================================
    // VALIDASI UKURAN FILE — Maks. 5 MB sesuai PRD §6.2
    // ================================================================
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return NextResponse.json(
        {
          success: false,
          error: `Ukuran file terlalu besar (${fileSizeMB} MB). Maksimal ${MAX_FILE_SIZE_MB} MB per file.`,
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Pastikan folder uploads ada
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Buat nama file unik dengan prefix deskriptif
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const safeOriginalName = originalName.replace(/[^a-zA-Z0-9.-]/g, "").slice(0, 50);
    const filename = `upload-${uniqueSuffix}.${ext}`;
    const filepath = path.join(uploadDir, filename);

    // Tulis file ke disk
    await writeFile(filepath, buffer);

    // Kembalikan URL publik
    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({ success: true, url: publicUrl, filename, sizeBytes: file.size });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengunggah file" }, { status: 500 });
  }
}
