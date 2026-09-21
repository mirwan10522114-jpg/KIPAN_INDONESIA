"use client";

import React from "react";
import { User, MapPin, CreditCard, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import SafeImage from "@/components/ui/safe-image";

interface KtaData {
  nia?: string | null;
  namaLengkap: string;
  foto?: string | null;
  kabupaten?: { nama: string } | string | null;
  provinsi?: { nama: string } | string | null;
  tempatLahir?: string | null;
  tanggalLahir?: string | Date | null;
  jenisKelamin?: string | null;
  agama?: string | null;
  alamat?: string | null;
}

interface KtaCardRendererProps {
  data: KtaData | null;
}

export default function KtaCardRenderer({ data: p }: KtaCardRendererProps) {
  if (!p) return null;

  const formatTanggal = (d: any) =>
    d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-";

  // Handle nested object or direct string for wilayah
  const kabupatenNama = typeof p.kabupaten === 'string' ? p.kabupaten : (p.kabupaten?.nama || "");
  const provinsiNama = typeof p.provinsi === 'string' ? p.provinsi : (p.provinsi?.nama || "");
  const wilayahDisplay = kabupatenNama || provinsiNama || "Wilayah";

  const handleDownload = async () => {
    try {
      const cardEl = document.getElementById("kta-card-wrapper");
      if (cardEl) {
        // Ensure fonts are loaded before capturing
        await document.fonts.ready;
        const dataUrl = await toPng(cardEl, {
          pixelRatio: 3,
          backgroundColor: "transparent",
          width: 480,
          height: cardEl.scrollHeight,
          style: {
            width: "480px",
            margin: "0",
          },
        });
        const link = document.createElement("a");
        link.download = `KTA-${p.nia || "KIPAN"}.png`;
        link.href = dataUrl;
        link.click();
        toast.success("KTA berhasil di-download sebagai PNG");
      } else {
        throw new Error("KTA card element tidak ditemukan");
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal mendownload KTA");
    }
  };

  const handlePrint = () => {
    const printWin = window.open("", "_blank");
    if (!printWin) return;
    printWin.document.write(`
      <html><head><title>KTA - ${p.nia}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { display:flex; flex-direction:column; gap:20px; justify-content:center; align-items:center; min-height:100vh; background:#f0f0f0; font-family:'Segoe UI',Arial,sans-serif; }
        @media print {
          body { background: white; }
          .card { page-break-inside: avoid; break-inside: avoid; }
        }
      </style></head><body>
        <div style="text-align:center; padding:20px; font-family:sans-serif;">
          <h2>Untuk mencetak KTA (2 Sisi), silakan gunakan tombol "Download PNG", kemudian cetak gambar yang telah diunduh tersebut agar ukurannya presisi.</h2>
          <button onclick="window.close()" style="margin-top:20px; padding:10px 20px; font-size:16px; cursor:pointer;">Tutup</button>
        </div>
      </body></html>
    `);
    printWin.document.close();
  };

  return (
    <div>
      <div id="kta-card-wrapper" className="flex flex-col gap-6 items-center mx-auto w-max bg-transparent pb-4" style={{ color: "#000000" }}>
        <style dangerouslySetInnerHTML={{ __html: `
          #kta-card-wrapper * { border-color: rgba(0,0,0,0); }
          #kta-card-wrapper .border-\\[\\#ffffff\\] { border-color: #ffffff !important; }
          #kta-card-wrapper .border-\\[\\#e0f2fe\\] { border-color: #e0f2fe !important; }
        `}} />
        
        {/* --- KTA DEPAN (FRONT) --- */}
        <div id="kta-card-front" className="relative rounded-[15px] overflow-hidden bg-[#ffffff] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]" style={{ width: "480px", height: "302px", fontFamily: "'Poppins', sans-serif" }}>
          {/* Top Right Wave Pattern */}
          <div className="absolute top-0 right-0 w-[250px] h-[150px] pointer-events-none">
            <svg viewBox="0 0 250 150" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,0 L250,0 L250,150 C180,100 100,120 0,0 Z" fill="#FFC307" />
              <path d="M50,0 L250,0 L250,110 C150,70 80,100 50,0 Z" fill="#002060" />
            </svg>
          </div>

          {/* Bottom Wave Pattern */}
          <div className="absolute bottom-0 left-0 w-full h-[80px] pointer-events-none">
            <svg viewBox="0 0 480 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,80 L480,80 L480,30 C380,60 200,10 0,50 Z" fill="#002060" />
              <path d="M0,45 C200,5 380,55 480,25" stroke="#FFC307" strokeWidth="4" fill="none" />
            </svg>
          </div>

          {/* Watermark Logo */}
          <img src="/kipan-logo.png" alt="" className="absolute right-[-40px] top-1/2 -translate-y-1/2 w-[220px] h-[220px] opacity-[0.06] pointer-events-none" />

          {/* Header (Logo + Title) */}
          <div className="relative z-10 flex items-center gap-3 p-5 pb-2">
            <img src="/kipan-logo.png" alt="Logo KIPAN" className="w-[65px] h-[65px] rounded-full object-cover shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] bg-[#ffffff]" />
            <div className="flex flex-col justify-center">
              <div className="text-[20px] font-black text-[#002060] leading-tight tracking-wide">KIPAN INDONESIA</div>
              <div className="text-[14px] font-bold text-[#0284c7] leading-tight">Kartu Anggota</div>
            </div>
          </div>

          {/* Main Content (Photo + Info) */}
          <div className="relative z-10 flex items-stretch gap-4 px-5 pb-4 flex-1">
            {/* Left: Photo */}
            <div className="shrink-0 w-[110px] h-[140px] rounded-[10px] bg-[#ffffff] border-[3px] border-[#ffffff] shadow-[0_0_0_2px_#FFC307] overflow-hidden mt-1 flex items-center justify-center">
              {p?.foto ? (
                <SafeImage src={p.foto} alt="Foto" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-[#e2e8f0]" />
              )}
            </div>

            {/* Right: Info */}
            <div className="flex-1 flex flex-col pt-1">
              <div className="text-[22px] font-black text-[#002060] leading-none mb-1 tracking-tight truncate w-[300px]">
                {p?.namaLengkap}
              </div>
              <div className="text-[11px] font-bold text-[#002060] mb-2 font-mono">
                {p?.nia || "KIPAN-XXXXXXXXXXXXXXXX"}
              </div>
              
              {/* Location Pin */}
              <div className="flex items-center gap-1.5 mb-3 text-[#002060]">
                <MapPin className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                <span className="text-[10px] font-semibold truncate max-w-[280px]">
                  {wilayahDisplay}
                </span>
              </div>

              {/* Detail Rows */}
              <div className="mt-1 relative z-20 border-l-2 border-[#FFC307] pl-3 py-0.5">
                <div className="grid grid-cols-[110px_8px_1fr] text-[9.5px] font-bold leading-[1.3] items-start gap-y-1 text-left">
                  <span className="text-[#0284c7] text-left">Tempat Tanggal Lahir</span>
                  <span className="text-[#002060] text-center">:</span>
                  <span className="text-[#002060] truncate pr-2 text-left">{p?.tempatLahir ? p.tempatLahir + ", " : ""}{p?.tanggalLahir ? formatTanggal(p.tanggalLahir) : "-"}</span>

                  <span className="text-[#0284c7] text-left">Jenis Kelamin</span>
                  <span className="text-[#002060] text-center">:</span>
                  <span className="text-[#002060] truncate pr-2 text-left">{p?.jenisKelamin === 'L' ? 'Laki-laki' : p?.jenisKelamin === 'P' ? 'Perempuan' : '-'}</span>

                  <span className="text-[#0284c7] text-left">Agama</span>
                  <span className="text-[#002060] text-center">:</span>
                  <span className="text-[#002060] truncate pr-2 text-left">{p?.agama || "-"}</span>

                  <span className="text-[#0284c7] text-left">Alamat Lengkap</span>
                  <span className="text-[#002060] text-center">:</span>
                  <span className="text-[#002060] line-clamp-2 pr-2 text-left">{p?.alamat || "-"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- KTA BELAKANG (BACK) --- */}
        <div id="kta-card-back" className="relative rounded-[15px] overflow-hidden bg-[#002060] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)]" style={{ width: "480px", height: "302px", fontFamily: "'Poppins', sans-serif" }}>
          {/* Watermark Peta Indonesia */}
          <div className="absolute inset-0 bg-[url('/peta-indonesia-v3.png')] bg-center bg-no-repeat bg-cover opacity-20 pointer-events-none"></div>

          {/* Bottom Wave Pattern */}
          <div className="absolute bottom-0 left-0 w-full h-[60px] pointer-events-none">
            <svg viewBox="0 0 480 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0,60 L480,60 L480,20 C380,40 200,0 0,30 Z" fill="#002060" />
              <path d="M0,25 C200,-5 380,35 480,15" stroke="#FFC307" strokeWidth="4" fill="none" />
            </svg>
          </div>

          {/* Header (Logo + Title + QR) */}
          <div className="relative z-10 flex items-start justify-between p-5 pb-3">
            <div className="flex items-center gap-3">
              <img src="/kipan-logo.png" alt="Logo KIPAN" className="w-[50px] h-[50px] rounded-full object-cover bg-[#ffffff] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]" />
              <div className="flex flex-col justify-center">
                <div className="text-[18px] font-black text-[#ffffff] leading-tight tracking-wide">KIPAN INDONESIA</div>
                <div className="text-[13px] font-bold text-[#ffffff] leading-tight">Kartu Anggota</div>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-1 mt-1">
              <div className="bg-[#ffffff] p-1.5 rounded-lg border border-[#e0f2fe] shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
                <QRCodeSVG value={p?.nia || "KIPAN"} size={52} level="M" />
              </div>
              <div className="text-[7.5px] font-bold text-[#ffffff] text-center leading-tight tracking-wider">
                SCAN UNTUK<br/>VERIFIKASI
              </div>
            </div>
          </div>

          {/* Content (Ketentuan) */}
          <div className="relative z-10 px-5 pt-1">
            <div className="text-[11px] font-bold text-[#ffffff] mb-2.5">
              Ketentuan Penggunaan Kartu
            </div>
            <div className="space-y-1.5">
              {[
                "Kartu ini adalah identitas resmi anggota KIPAN Indonesia.",
                "Harap dibawa saat kegiatan dan program KIPAN.",
                "Dilarang/menyalahgunakan kartu ini kepada pihak lain.",
                "Jika kehilangan, segera hubungi pengurus KIPAN Indonesia."
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-[14px] h-[14px] rounded-full bg-[#FFC307] flex items-center justify-center shrink-0 mt-[1px]">
                    <span className="text-[#002060] text-[9px] font-black leading-none">{i+1}</span>
                  </div>
                  <span className="text-[9.5px] font-medium text-[#ffffff] leading-snug w-[320px]">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Slogan Signature */}
          <div className="absolute bottom-3 right-4 z-10">
            <div className="text-[#ffffff] text-[14px] leading-tight text-right" style={{ fontFamily: "'Brush Script MT', 'Lucida Handwriting', cursive, serif", transform: "rotate(-4deg)" }}>
              <div className="mr-6">Bersama</div>
              <div className="mr-3">Membangun Kebaikan</div>
              <div className="mr-0">Menuju Indonesia Bersih</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons for KTA */}
      <div className="flex gap-2 justify-center mt-4">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <CreditCard className="w-4 h-4" /> Cetak Kartu
        </button>
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Download className="w-4 h-4" /> Download PNG
        </button>
      </div>
    </div>
  );
}
