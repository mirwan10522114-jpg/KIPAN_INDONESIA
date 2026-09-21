import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

// ============================================================
// Helper untuk handle error Prisma secara konsisten di semua API
// ============================================================

export function handleApiError(error: unknown, context: string, fallbackMsg: string) {
  // Prisma validation error (data tidak valid / field required missing / type mismatch)
  if (error instanceof Prisma.PrismaClientValidationError) {
    console.error(`[${context}] PrismaClientValidationError:`, error.message);
    // Ambil baris pertama yang berisi info field yang bermasalah
    const lines = error.message.split("\n").filter(Boolean);
    const detail = lines
      .filter((l) => l.includes("Argument") || l.includes("Field") || l.includes("required"))
      .slice(0, 2)
      .join(" ");
    return NextResponse.json(
      {
        success: false,
        error: `${fallbackMsg}: ${detail || "Data tidak valid"}`,
      },
      { status: 400 }
    );
  }

  // Prisma known error codes (foreign key, unique constraint, dst)
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error(`[${context}] PrismaClientKnownRequestError:`, error.code, error.message);
    let msg = fallbackMsg;
    if (error.code === "P2002") {
      const target = (error.meta?.target as string[])?.join(", ") || "field";
      msg = `Data duplikat: ${target} sudah ada di database.`;
    } else if (error.code === "P2003") {
      const field = (error.meta?.field_name as string) || "field";
      msg = `Referensi tidak valid (foreign key): ${field} tidak ditemukan di database.`;
    } else if (error.code === "P2025") {
      msg = `Record tidak ditemukan di database.`;
    } else if (error.code === "P2014") {
      msg = `Relasi data tidak valid.`;
    } else {
      msg = `${fallbackMsg} (kode ${error.code})`;
    }
    return NextResponse.json(
      { success: false, error: msg },
      { status: 400 }
    );
  }

  // Generic error
  console.error(`[${context}] error:`, error);
  const detail = error instanceof Error ? error.message : "Unknown error";
  return NextResponse.json(
    { success: false, error: `${fallbackMsg}: ${detail}` },
    { status: 500 }
  );
}

// Helper untuk safely parse integer dari body (return null jika invalid)
export function safeParseInt(value: any): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = parseInt(String(value));
  return isNaN(n) ? null : n;
}
