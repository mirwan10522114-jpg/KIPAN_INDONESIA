import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const kecamatan = req.nextUrl.searchParams.get("kecamatan");
    const kabupaten = req.nextUrl.searchParams.get("kabupaten") || "";
    
    if (!kecamatan) {
      return NextResponse.json({ success: false, error: "kecamatan wajib diisi" }, { status: 400 });
    }

    const res = await fetch(`https://kodepos.vercel.app/search?q=${encodeURIComponent(kecamatan)}`, {
      next: { revalidate: 86400 } // Cache 24 jam
    });

    if (!res.ok) {
      return NextResponse.json({ success: true, data: "" });
    }

    const json = await res.json();
    if (json.data && json.data.length > 0) {
      // Bersihkan kata "Kabupaten", "Kota", "Kab." agar bisa dicocokkan dengan data API (misal: "Sukabumi")
      const cleanKabupaten = kabupaten.toLowerCase().replace(/\(kabupaten\)|\(kota\)|kabupaten|kota|kab\./g, "").trim();

      // Cari yang regency-nya cocok dengan kabupaten dari form
      const matched = json.data.find((item: any) => {
        if (!cleanKabupaten) return true; // fallback
        const apiRegency = item.regency.toLowerCase();
        return apiRegency.includes(cleanKabupaten) || cleanKabupaten.includes(apiRegency);
      });

      if (matched) {
        return NextResponse.json({ success: true, data: matched.code.toString() });
      }

      // Jika tidak ada yang cocok secara spesifik, kembalikan hasil pertama
      return NextResponse.json({ success: true, data: json.data[0].code.toString() });
    }

    return NextResponse.json({ success: true, data: "" });
  } catch (error) {
    console.error("Error fetching kodepos:", error);
    return NextResponse.json({ success: true, data: "" });
  }
}
