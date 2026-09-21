"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { IdCard, Search, ArrowRight, Shield, ShieldCheck } from "lucide-react";
import KtaCardRenderer from "@/components/shared/KtaCardRenderer";

export default function CekKeanggotaan() {
  const [nik, setNik] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nik.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(`/api/anggota/cek?q=${encodeURIComponent(nik)}`);
      const json = await res.json();
      if (json.success) {
        setResult(json.data);
      } else {
        setError(json.error || "Data tidak ditemukan");
      }
    } catch (err) {
      setError("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="cek-anggota" className="bg-white py-20 lg:py-28 border-y border-slate-200">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Card Container */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl shadow-sky-900/5 border border-slate-200"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <IdCard className="w-6 h-6 text-sky-500" />
            <h3 className="text-slate-800 font-bold text-base sm:text-lg">
              Masukkan NIK (KTP) atau Nomor Anggota:
            </h3>
          </div>

          {/* Search Form */}
          <form onSubmit={handleCheck}>
            <div className="relative group">
              {/* Glowing Sky Blue Effect */}
              <div className="absolute -inset-0.5 bg-sky-500/10 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
              
              <div className="relative flex items-center bg-white rounded-2xl border border-sky-200 shadow-[0_0_15px_rgba(14,165,233,0.1)] focus-within:shadow-[0_0_20px_rgba(14,165,233,0.2)] transition-all">
                <Search className="w-6 h-6 text-slate-400 absolute left-6" />
                
                <input 
                  type="text"
                  value={nik}
                  onChange={(e) => setNik(e.target.value)}
                  placeholder="Contoh: 3201... atau AGY-..."
                  className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm sm:text-base font-mono pl-16 pr-28 py-6 sm:py-7 rounded-2xl outline-none"
                />
                
                <button 
                  type="submit"
                  disabled={loading}
                  className="absolute right-4 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-sky-600 transition-colors disabled:opacity-50"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-950 text-white flex items-center justify-center group-hover:bg-sky-500 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-medium tracking-wide">Periksa</span>
                </button>
              </div>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm font-medium text-center"
            >
              ⚠️ {error}
            </motion.div>
          )}

          {/* Search Result */}
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-6 bg-emerald-50 border border-emerald-100 rounded-2xl relative overflow-hidden shadow-sm"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-emerald-900 font-bold text-lg">Keanggotaan Valid</h4>
                    <p className="text-emerald-700 text-sm font-medium">Terverifikasi di Database KIPAN</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-6">
                  <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
                    <div className="text-xs text-slate-500 mb-1">Nama Lengkap</div>
                    <div className="text-slate-800 font-semibold">{result.namaLengkap}</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
                    <div className="text-xs text-slate-500 mb-1">Nomor Anggota (NIA)</div>
                    <div className="text-slate-800 font-mono font-semibold">{result.nia}</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
                    <div className="text-xs text-slate-500 mb-1">Wilayah</div>
                    <div className="text-slate-800 font-medium">{result.kabupaten}, {result.provinsi}</div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
                    <div className="text-xs text-slate-500 mb-1">Status / Jabatan</div>
                    <div className="text-slate-800 font-medium">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700 mr-2 border border-emerald-200">
                        {result.status}
                      </span>
                      {result.jabatan}
                    </div>
                  </div>
                </div>

                {result.status === "AKTIF" && (
                  <div className="mt-8 pt-8 border-t border-emerald-100">
                    <h4 className="text-center font-bold text-slate-700 mb-6 uppercase tracking-wider text-sm">
                      Kartu Anggota (KTA) Anda
                    </h4>
                    <div className="flex justify-center w-full overflow-x-auto pb-4">
                      <KtaCardRenderer data={result} />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Info Text */}
          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mt-8 text-sm">
            <div className="flex items-center gap-2 text-emerald-600 font-medium">
              <Shield className="w-4 h-4" />
              <span>Terenkripsi SSL 256-bit</span>
            </div>
            <div className="text-slate-500 font-medium">
              Format: 16 Digit NIK / No. Anggota
            </div>
          </div>

          {/* Security Banner */}
          <div className="mt-8 border border-slate-200 bg-slate-50 rounded-2xl p-5 sm:p-6 flex gap-4 items-start shadow-sm">
            <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-slate-800 font-bold text-sm sm:text-base mb-2">
                Jaminan Kerahasiaan & Keamanan Pencarian
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Pencarian NIK dan Nomor Anggota dilindungi enkripsi SSL 256-bit dan pembatasan frekuensi pencarian (*rate-limiting* anti-scraping) sesuai standar UU Perlindungan Data Pribadi (UU PDP).
              </p>
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
