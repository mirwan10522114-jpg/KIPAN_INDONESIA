"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Loader2,
  FileSearch,
  Copy,
  Check,
  Calendar,
  MapPin,
  History,
} from "lucide-react";

interface TimelineItem {
  id: number;
  aksi: string;
  oleh: string;
  catatan: string | null;
  createdAt: string;
}

interface TrackResult {
  nomorPendaftaran: string;
  namaLengkap: string;
  status: string;
  statusInfo: {
    label: string;
    color: string;
    desc: string;
  };
  catatan: string | null;
  provinsiNama: string | null;
  kabupatenNama: string | null;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineItem[];
}

const STATUS_STYLES: Record<string, { bg: string; border: string; text: string; icon: any }> = {
  blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", icon: Clock },
  amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", icon: AlertCircle },
  orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", icon: AlertCircle },
  red: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", icon: XCircle },
  green: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", icon: CheckCircle2 },
  gray: { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-700", icon: AlertCircle },
};

export default function LacakPendaftaran() {
  const [nomor, setNomor] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!nomor.trim()) {
      setError("Masukkan nomor pendaftaran Anda");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    setNotFound(false);
    try {
      const res = await fetch(`/api/pendaftaran/track?nomor=${encodeURIComponent(nomor.trim())}`);
      let data: any;
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server merespons HTTP ${res.status} (body bukan JSON). Coba lagi nanti.`);
      }
      if (res.status === 404 && data.notFound) {
        setNotFound(true);
        return;
      }
      if (!data.success) {
        throw new Error(data.error || `Gagal tracking (HTTP ${res.status})`);
      }
      setResult(data.data);
    } catch (e: any) {
      setError(e?.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section id="lacak-pendaftaran" className="relative py-20 lg:py-28 bg-gradient-to-br from-slate-50 to-blue-50 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-blue-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-sky-200/30 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <FileSearch className="w-3.5 h-3.5" />
            Tracking Status
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-blue-950 mb-3">
            Lacak Pendaftaran Anda
          </h2>
          <p className="text-slate-600 text-sm lg:text-base leading-relaxed max-w-xl mx-auto">
            Sudah mendaftar? Masukkan <strong>Nomor Pendaftaran</strong> Anda (format: REG-YYYYMM-XXXX)
            untuk mengetahui status pendaftaran Anda secara real-time.
          </p>
        </motion.div>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl shadow-xl border border-blue-100 p-6 lg:p-8 mb-6"
        >
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="nomor-pendaftaran" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Nomor Pendaftaran *
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="nomor-pendaftaran"
                  type="text"
                  value={nomor}
                  onChange={(e) => setNomor(e.target.value.toUpperCase())}
                  placeholder="Contoh: REG-202607-0001"
                  className="w-full pl-12 pr-32 py-4 text-base lg:text-lg font-mono font-semibold border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !nomor.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Mencari...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Lacak
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2 ml-1">
                💡 Nomor pendaftaran dikirim saat Anda selesai mendaftar. Format: REG-YYYYMM-XXXX
              </p>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>
        </motion.div>

        {/* Result */}
        <AnimatePresence mode="wait">
          {notFound && (
            <motion.div
              key="not-found"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl shadow-xl border border-amber-100 p-8 text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4">
                <FileSearch className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Pendaftaran Tidak Ditemukan
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Nomor pendaftaran <span className="font-mono font-bold">{nomor}</span> tidak ditemukan di sistem.
                Kemungkinan:
              </p>
              <ul className="text-sm text-slate-600 leading-relaxed space-y-1.5 mb-6 inline-block text-left">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>Pendaftaran Anda sudah <strong>disetujui</strong> dan Anda kini terdaftar sebagai Pengurus — data pendaftar dihapus dari sistem tracking.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>Ada salah ketik pada nomor pendaftaran — periksa kembali formatnya.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>Pendaftaran belum pernah dilakukan dengan nomor ini.</span>
                </li>
              </ul>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                💡 Jika Anda yakin sudah disetujui, silakan cek nama Anda di halaman <strong>Struktur Pengurus</strong>,
                atau hubungi pengurus wilayah Anda.
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden"
            >
              {/* Header dengan status besar */}
              {(() => {
                const style = STATUS_STYLES[result.statusInfo.color] || STATUS_STYLES.gray;
                const StatusIcon = style.icon;
                return (
                  <div className={`${style.bg} ${style.border} border-b p-6 lg:p-8`}>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm`}>
                          <StatusIcon className={`w-6 h-6 ${style.text}`} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Status Pendaftaran
                          </div>
                          <div className={`text-xl lg:text-2xl font-extrabold ${style.text}`}>
                            {result.statusInfo.label}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(result.nomorPendaftaran)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        title="Salin nomor pendaftaran"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? "Disalin!" : "Salin"}
                      </button>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {result.statusInfo.desc}
                    </p>
                  </div>
                );
              })()}

              {/* Detail */}
              <div className="p-6 lg:p-8 space-y-5">
                {/* Info grid */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">Nama Pendaftar</div>
                    <div className="text-sm font-bold text-slate-800">{result.namaLengkap}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">Nomor Pendaftaran</div>
                    <div className="text-sm font-bold text-slate-800 font-mono">{result.nomorPendaftaran}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Tanggal Daftar
                    </div>
                    <div className="text-sm font-bold text-slate-800">{formatDate(result.createdAt)}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Wilayah
                    </div>
                    <div className="text-sm font-bold text-slate-800">
                      {result.kabupatenNama || "-"}, {result.provinsiNama || "-"}
                    </div>
                  </div>
                </div>

                {/* Catatan admin (jika ada) */}
                {result.catatan && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Catatan dari Admin
                    </div>
                    <div className="text-sm text-amber-900 leading-relaxed">{result.catatan}</div>
                  </div>
                )}

                {/* Timeline */}
                {result.timeline && result.timeline.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5" />
                      Riwayat Status
                    </div>
                    <div className="space-y-3">
                      {result.timeline.map((item, idx) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${idx === result.timeline.length - 1 ? "bg-blue-600" : "bg-slate-300"}`} />
                            {idx < result.timeline.length - 1 && (
                              <div className="w-0.5 flex-1 bg-slate-200 mt-1" />
                            )}
                          </div>
                          <div className="flex-1 pb-3">
                            <div className="text-sm font-semibold text-slate-800">{item.aksi}</div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {formatDate(item.createdAt)} · oleh {item.oleh}
                            </div>
                            {item.catatan && (
                              <div className="text-xs text-slate-600 mt-1 bg-slate-50 px-2 py-1 rounded">
                                {item.catatan}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Last updated */}
                <div className="text-xs text-slate-400 text-center pt-3 border-t border-slate-100">
                  Terakhir diperbarui: {formatDate(result.updatedAt)}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help text */}
        {!result && !notFound && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-center"
          >
            <p className="text-sm text-blue-700 leading-relaxed">
              📋 Belum punya nomor pendaftaran?{" "}
              <a href="#pendaftaran" className="font-bold underline hover:text-blue-800">
                Daftar sekarang di sini
              </a>
              . Setelah pendaftaran berhasil, Anda akan menerima nomor pendaftaran untuk tracking.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
