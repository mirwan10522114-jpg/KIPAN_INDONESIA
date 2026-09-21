import { NextRequest, NextResponse } from "next/server";

// GET /api/wilayah/kecamatan?kabupatenKode=3218
// Proxy server-side ke API emsifa untuk menghindari CORS
export async function GET(req: NextRequest) {
  try {
    const kabupatenKode = req.nextUrl.searchParams.get("kabupatenKode");
    if (!kabupatenKode) {
      return NextResponse.json({ success: false, error: "kabupatenKode wajib diisi" }, { status: 400 });
    }

    const res = await fetch(
      `https://emsifa.github.io/api-wilayah-indonesia/api/districts/${kabupatenKode}.json`,
      { next: { revalidate: 86400 } } // Cache 24 jam
    );

    if (!res.ok) {
      return NextResponse.json({ success: true, data: [] });
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
      return NextResponse.json({ success: true, data: [] });
    }

    const formatted = data
      .map((d: any) => ({
        kode: d.id,
        nama: d.name,
      }))
      .sort((a: any, b: any) => a.nama.localeCompare(b.nama));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Error fetching kecamatan:", error);
    return NextResponse.json({ success: true, data: [] });
  }
}
