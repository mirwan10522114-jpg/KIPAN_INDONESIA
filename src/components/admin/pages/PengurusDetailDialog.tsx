"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, UserCog, Mail, Phone, MapPin, Calendar, FileText, History,
  Users, Info, Edit, Shield, ExternalLink, Activity, Award,
  CheckCircle2, Building2, Briefcase, GraduationCap,
  CreditCard, Download, QrCode,
} from "lucide-react";
import { toast } from "sonner";
import SafeImage from "@/components/ui/safe-image";

const TABS = [
  { id: "profil", label: "Profil", icon: Info },
  { id: "jabatan", label: "Jabatan", icon: Award },
  { id: "wilayah", label: "Wilayah", icon: MapPin },
  { id: "anggota", label: "Pengurus Wilayah", icon: Users },
  { id: "dokumen", label: "Dokumen", icon: FileText },
  { id: "riwayat", label: "Riwayat", icon: History },
  { id: "activity", label: "Activity", icon: Activity },
];

interface PengurusDetailProps {
  pengurusId: number | null;
  onClose: () => void;
  onEdit?: () => void;
  onViewAnggota?: (id: number) => void;
}

export default function PengurusDetailDialog({
  pengurusId, onClose, onEdit, onViewAnggota,
}: PengurusDetailProps) {
  const [activeTab, setActiveTab] = useState("profil");
  const [data, setData] = useState<any>(null);
  const [showGantiJabatanDialog, setShowGantiJabatanDialog] = useState(false);
  const [jabatanList, setJabatanList] = useState<any[]>([]);
  const [selectedJabatanId, setSelectedJabatanId] = useState<string>("");
  const [gantiLoading, setGantiLoading] = useState(false);

  const fetchData = () => {
    if (!pengurusId) return;
    fetch(`/api/pengurus/${pengurusId}/detail`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => { if (json.success) setData(json.data); })
      .catch(() => {});
  };

  useEffect(() => {
    fetchData();
  }, [pengurusId]);

  // Fetch jabatan list when dialog opened
  useEffect(() => {
    if (showGantiJabatanDialog && data?.pengurus?.level) {
      // Map level: NASIONAL/PROVINSI/KABUPATEN → Nasional/Provinsi/Kabupaten
      const levelMap: Record<string, string> = {
        NASIONAL: "Nasional",
        PROVINSI: "Provinsi",
        KABUPATEN: "Kabupaten",
      };
      const levelName = levelMap[data.pengurus.level] || "Kabupaten";
      fetch(`/api/jabatan?level=${levelName}`, { cache: "no-store" })
        .then((r) => r.json())
        .then((json) => {
          if (json.success) {
            setJabatanList(json.data);
            // Set default: current jabatan
            const current = data.pengurus;
            if (current.jabatanNama) {
              const j = json.data.find((x: any) => x.nama === current.jabatanNama && x.bidang === current.bidang);
              // Actually we need to find by jabatanId — but we don't have it directly in response. Use bidang+nama.
              // For now, default ke "Anggota" di bidang yang sama
              if (j) setSelectedJabatanId(String(j.id));
            }
          }
        });
    }
  }, [showGantiJabatanDialog, data]);

  const handleGantiJabatan = async () => {
    if (!selectedJabatanId || !pengurusId) return;
    setGantiLoading(true);
    try {
      const res = await fetch(`/api/pengurus/${pengurusId}/ganti-jabatan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jabatanId: parseInt(selectedJabatanId) }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        setShowGantiJabatanDialog(false);
        fetchData();
      } else {
        toast.error(json.error || "Gagal ganti jabatan");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setGantiLoading(false);
    }
  };

  if (!pengurusId) return null;

  const p = data?.pengurus;
  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Aktif: "bg-emerald-100 text-emerald-700 border-emerald-200",
      Nonaktif: "bg-slate-100 text-slate-600 border-slate-200",
      Dibekukan: "bg-rose-100 text-rose-700 border-rose-200",
    };
    return styles[status] || "bg-slate-100 text-slate-600 border-slate-200";
  };
  const levelBadge = (level: string) => {
    const lower = (level || "").toLowerCase();
    const styles: Record<string, string> = {
      nasional: "bg-violet-100 text-violet-700",
      provinsi: "bg-blue-100 text-blue-700",
      kabupaten: "bg-cyan-100 text-cyan-700",
      kecamatan: "bg-teal-100 text-teal-700",
    };
    return styles[lower] || "bg-slate-100 text-slate-600";
  };

  const normalizeLevel = (level: string): string => {
    const lower = (level || "").toLowerCase();
    if (lower === "nasional") return "Nasional";
    if (lower === "provinsi") return "Provinsi";
    if (lower === "kabupaten") return "Kabupaten";
    if (lower === "kecamatan") return "Kecamatan";
    return level || "-";
  };
  const formatTanggal = (d: string) => d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-";

  return (
    <>
    <AnimatePresence>
      {pengurusId && (
        <motion.div
          key="main-dialog"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[300] bg-blue-950/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 to-sky-500 p-6 text-white">
              <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-start gap-4">
                <SafeImage src={p?.foto} alt={p?.namaLengkap || ""} className="w-20 h-20 rounded-2xl object-cover border-4 border-white/30" loading="eager" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${levelBadge(p?.level || "")}`}>{normalizeLevel(p?.level || "")}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-white ${statusBadge(p?.status || "")}`}>{p?.status}</span>
                  </div>
                  <h2 className="text-2xl font-bold">{p?.namaLengkap}</h2>
                  <p className="text-blue-100 text-sm mt-1">{p?.jabatan}{p?.jabatanBidang && p?.jabatanBidang !== "Pengurus Harian" ? ` • ${p.jabatanBidang}` : ""}</p>
                  {p?.nia && (
                    <span className="inline-block mt-2 px-2.5 py-1 bg-white/20 rounded-md text-xs font-mono font-semibold">
                      NIP: {p.nia}
                    </span>
                  )}
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /><span>{normalizeLevel(p?.level || "") === "Nasional" ? "Indonesia" : (p?.kabupaten?.nama || p?.provinsi?.nama || "-")}</span></div>
                    <div className="flex items-center gap-1.5"><Mail className="w-4 h-4" /><span>{p?.email}</span></div>
                    <div className="flex items-center gap-1.5"><Phone className="w-4 h-4" /><span>{p?.hp || "-"}</span></div>
                    <div className="flex items-center gap-1.5"><FileText className="w-4 h-4" /><span>SK: {p?.nomorSK || "-"}</span></div>
                  </div>
                </div>
              </div>
              {onEdit && (
                <button onClick={onEdit} className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold">
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
              )}
              <button
                onClick={() => setShowGantiJabatanDialog(true)}
                className="absolute bottom-4 right-24 inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/80 hover:bg-violet-500 rounded-lg text-xs font-semibold"
              >
                <Award className="w-3.5 h-3.5" /> Ganti Jabatan
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 sticky top-0 bg-white z-10 overflow-x-auto">
              {TABS.map((t) => {
                const Icon = t.icon;
                return (
                  <button key={t.id} onClick={() => setActiveTab(t.id)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                      activeTab === t.id ? "text-blue-600 border-blue-600" : "text-slate-500 border-transparent hover:text-blue-600"
                    }`}>
                    <Icon className="w-4 h-4" />{t.label}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="p-6">
              {!data ? (
                <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-4 bg-slate-200 animate-pulse rounded" />)}</div>
              ) : (
                <>
                  {/* PROFIL */}
                  {activeTab === "profil" && (
                    <div className="space-y-6">
                      {/* KTA — Kartu Pengurus Digital */}
                      <div>
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Kartu Pengurus (KTA)</h3>
                        {/* KTA Card Design — Navy Blue theme matching KIPAN logo */}
                        <div id="kta-card-pengurus" className="relative rounded-2xl shadow-2xl overflow-hidden max-w-md mx-auto" style={{ aspectRatio: "1.586/1" }}>
                          {/* Navy blue background */}
                          <div className="absolute inset-0 bg-gradient-to-br from-[#0a1f44] via-[#0d2a5c] to-[#0a1f44]" />
                          
                          {/* Gold border line */}
                          <div className="absolute inset-2 border-2 border-yellow-500/60 rounded-xl pointer-events-none" />
                          
                          {/* Decorative circles */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full -translate-y-1/3 translate-x-1/3" />
                          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/5 rounded-full translate-y-1/3 -translate-x-1/3" />

                          {/* Content */}
                          <div className="relative h-full flex flex-col p-5">
                            {/* Header — Logo + Org Name */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2.5">
                                <img src="/kipan-logo.png" alt="KIPAN" className="w-12 h-12 rounded-full object-cover border-2 border-yellow-500/60" />
                                <div className="text-white">
                                  <div className="text-[9px] uppercase tracking-wider text-yellow-400 font-semibold">Kader Inti Pemuda</div>
                                  <div className="text-xs font-bold text-white leading-tight">Anti Narkoba</div>
                                  <div className="text-[8px] text-blue-200 mt-0.5">Sekretariat Nasional</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-[9px] text-yellow-400 font-semibold uppercase tracking-wider">Kartu Pengurus</div>
                                <div className="text-[8px] text-blue-200">KIPAN Indonesia</div>
                              </div>
                            </div>

                            {/* Member info — Photo + Details */}
                            <div className="flex items-center gap-3 flex-1">
                              <div className="shrink-0">
                                <SafeImage src={p?.foto} alt={p?.namaLengkap || ""} className="w-16 h-20 rounded-lg object-cover border-2 border-yellow-500/60" />
                              </div>
                              <div className="flex-1 min-w-0 text-white">
                                <div className="text-[8px] text-yellow-400 uppercase tracking-wider mb-0.5">Nama</div>
                                <div className="font-bold text-sm leading-tight truncate">{p?.namaLengkap}</div>
                                
                                <div className="text-[8px] text-yellow-400 uppercase tracking-wider mt-2 mb-0.5">NIP</div>
                                <div className="text-[10px] font-mono text-blue-100 truncate">{p?.nia}</div>
                                
                                <div className="text-[8px] text-yellow-400 uppercase tracking-wider mt-2 mb-0.5">Jabatan</div>
                                <div className="text-[10px] text-blue-100 truncate">
                                  {p?.jabatanNama}{p?.jabatanBidang && p?.jabatanBidang !== "Pengurus Harian" ? ` • ${p.jabatanBidang}` : ""}
                                </div>
                              </div>
                            </div>

                            {/* Footer — Level, Wilayah, Status */}
                            <div className="flex items-end justify-between mt-3 pt-2 border-t border-yellow-500/20">
                              <div className="text-white">
                                <div className="text-[7px] text-yellow-400 uppercase">Level</div>
                                <div className="text-[9px] font-semibold">{normalizeLevel(p?.level || "")}</div>
                                <div className="text-[7px] text-blue-200 mt-1">
                                  {normalizeLevel(p?.level || "") === "Nasional" ? "Indonesia" : (p?.kabupaten?.nama || p?.provinsi?.nama || "-")}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-[7px] text-yellow-400 uppercase">Status</div>
                                <div className="text-[9px] font-semibold text-white">{p?.status}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-[7px] text-yellow-400 uppercase">Berlaku</div>
                                <div className="text-[9px] font-semibold text-white">Seumur Hidup</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons for KTA */}
                        <div className="flex gap-2 justify-center mt-4">
                          <button
                            onClick={() => {
                              if (!p) return;
                              const printWin = window.open("", "_blank");
                              if (!printWin) return;
                              printWin.document.write(`
                                <html><head><title>KTA - ${p.nia}</title>
                                <style>
                                  * { margin:0; padding:0; box-sizing:border-box; }
                                  body { display:flex; justify-content:center; align-items:center; min-height:100vh; background:#f0f0f0; font-family:'Segoe UI',sans-serif; }
                                  .card { width:480px; height:302px; background:linear-gradient(135deg,#0a1f44,#0d2a5c,#0a1f44); border-radius:16px; padding:20px; position:relative; overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,0.3); }
                                  .gold-border { position:absolute; inset:8px; border:2px solid rgba(234,179,8,0.6); border-radius:12px; }
                                  .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; position:relative; }
                                  .logo-box { display:flex; align-items:center; gap:10px; }
                                  .logo-img { width:48px; height:48px; border-radius:50%; border:2px solid rgba(234,179,8,0.6); }
                                  .org-name { color:white; }
                                  .org-name .top { font-size:9px; text-transform:uppercase; letter-spacing:1px; color:#eab308; font-weight:600; }
                                  .org-name .mid { font-size:12px; font-weight:bold; color:white; }
                                  .org-name .sub { font-size:8px; color:#93c5fd; }
                                  .card-type { text-align:right; }
                                  .card-type .label { font-size:9px; color:#eab308; font-weight:600; text-transform:uppercase; letter-spacing:1px; }
                                  .card-type .sub { font-size:8px; color:#93c5fd; }
                                  .info-row { display:flex; gap:12px; align-items:center; position:relative; flex:1; }
                                  .photo { width:64px; height:80px; border-radius:8px; object-fit:cover; border:2px solid rgba(234,179,8,0.6); }
                                  .details { color:white; flex:1; }
                                  .field-label { font-size:8px; color:#eab308; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:1px; }
                                  .field-value { font-size:11px; color:#dbeafe; margin-bottom:6px; }
                                  .field-value.name { font-size:14px; font-weight:bold; color:white; }
                                  .field-value.nip { font-family:monospace; font-size:10px; }
                                  .footer { display:flex; justify-content:space-between; align-items:flex-end; margin-top:8px; padding-top:8px; border-top:1px solid rgba(234,179,8,0.2); position:relative; }
                                  .footer-item .label { font-size:7px; color:#eab308; text-transform:uppercase; }
                                  .footer-item .value { font-size:9px; color:white; font-weight:600; }
                                  .footer-item .sub { font-size:7px; color:#93c5fd; }
                                </style></head><body>
                                <div class="card">
                                  <div class="gold-border"></div>
                                  <div class="header">
                                    <div class="logo-box">
                                      <img src="${window.location.origin}/kipan-logo.png" class="logo-img" />
                                      <div class="org-name">
                                        <div class="top">Kader Inti Pemuda</div>
                                        <div class="mid">Anti Narkoba</div>
                                        <div class="sub">Sekretariat Nasional</div>
                                      </div>
                                    </div>
                                    <div class="card-type">
                                      <div class="label">Kartu Pengurus</div>
                                      <div class="sub">KIPAN Indonesia</div>
                                    </div>
                                  </div>
                                  <div class="info-row">
                                    ${p.foto ? `<img src="${p.foto}" class="photo" />` : `<div class="photo" style="background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;color:white;font-size:24px">${(p.namaLengkap||'?').charAt(0)}</div>`}
                                    <div class="details">
                                      <div class="field-label">Nama</div>
                                      <div class="field-value name">${p.namaLengkap}</div>
                                      <div class="field-label">NIP</div>
                                      <div class="field-value nip">${p.nia}</div>
                                      <div class="field-label">Jabatan</div>
                                      <div class="field-value">${p.jabatanNama || '-'}${p.jabatanBidang && p.jabatanBidang !== 'Pengurus Harian' ? ' &bull; ' + p.jabatanBidang : ''}</div>
                                    </div>
                                  </div>
                                  <div class="footer">
                                    <div class="footer-item">
                                      <div class="label">Level</div>
                                      <div class="value">${p.level === 'NASIONAL' ? 'Nasional' : p.level === 'PROVINSI' ? 'Provinsi' : 'Kabupaten'}</div>
                                      <div class="sub">${p.level === 'NASIONAL' ? 'Indonesia' : (p.kabupaten?.nama || p.provinsi?.nama || '-')}</div>
                                    </div>
                                    <div class="footer-item" style="text-align:center">
                                      <div class="label">Status</div>
                                      <div class="value">${p.status}</div>
                                    </div>
                                    <div class="footer-item" style="text-align:right">
                                      <div class="label">Berlaku</div>
                                      <div class="value">Seumur Hidup</div>
                                    </div>
                                  </div>
                                </div>
                                <script>setTimeout(()=>window.print(),500)</script>
                                </body></html>
                              `);
                              printWin.document.close();
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
                          >
                            <CreditCard className="w-4 h-4" /> Cetak Kartu
                          </button>
                          <button
                            onClick={() => {
                              if (!p) return;
                              const text = `KARTU PENGURUS KIPAN INDONESIA\n=================================\n\nNIP: ${p.nia}\nNama: ${p.namaLengkap}\nJabatan: ${p.jabatanNama || '-'}${p.jabatanBidang && p.jabatanBidang !== 'Pengurus Harian' ? ' (' + p.jabatanBidang + ')' : ''}\nLevel: ${p.level === 'NASIONAL' ? 'Nasional' : p.level === 'PROVINSI' ? 'Provinsi' : 'Kabupaten'}\nWilayah: ${p.level === 'NASIONAL' ? 'Indonesia' : (p.kabupaten?.nama || p.provinsi?.nama || '-')}\nStatus: ${p.status}\nSK: ${p.nomorSK || '-'}\nMulai Menjabat: ${p.tanggalMulai ? new Date(p.tanggalMulai).toLocaleDateString('id-ID') : '-'}\nBerlaku: Seumur Hidup\n\nKIPAN Indonesia\nKader Inti Pemuda Anti Narkoba\nSekretariat Nasional`;
                              const blob = new Blob([text], { type: "text/plain" });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement("a");
                              link.href = url;
                              link.download = `KTA-${p.nia}.txt`;
                              link.click();
                              URL.revokeObjectURL(url);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700"
                          >
                            <Download className="w-4 h-4" /> Download
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Biodata</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <InfoRow label="NIP" value={p?.nia} />
                          <InfoRow label="Nama Lengkap" value={p?.namaLengkap} />
                          <InfoRow label="Tempat Lahir" value={p?.tempatLahir || "-"} />
                          <InfoRow label="Tanggal Lahir" value={p?.tanggalLahir ? formatTanggal(p.tanggalLahir) : "-"} />
                          <InfoRow label="Alamat" value={p?.alamat || "-"} />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Kontak</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <InfoRow label="Email" value={p?.email} />
                          <InfoRow label="No. HP" value={p?.hp || "-"} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* JABATAN */}
                  {activeTab === "jabatan" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <InfoRow label="Jabatan" value={p?.jabatan} />
                        <InfoRow label="Level" value={p?.level} />
                        <InfoRow label="Nomor SK" value={p?.nomorSK || "-"} />
                        <InfoRow label="Status Jabatan" value={p?.status} />
                        <InfoRow label="Mulai Menjabat" value={p?.tanggalMulai ? formatTanggal(p.tanggalMulai) : "-"} />
                        <InfoRow label="Berakhir" value={p?.tanggalSelesai ? formatTanggal(p.tanggalSelesai) : "Sampai sekarang"} />
                      </div>
                    </div>
                  )}

                  {/* WILAYAH */}
                  {activeTab === "wilayah" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <InfoRow label="Level" value={normalizeLevel(p?.level || "")} />
                        <InfoRow label="Provinsi" value={p?.provinsi?.nama || "-"} />
                        <InfoRow label="Kabupaten/Kota" value={p?.kabupaten?.nama || "-"} />
                        <InfoRow label="Alamat" value={p?.alamat || "-"} />
                      </div>
                    </div>
                  )}

                  {/* ANGGOTA */}
                  {activeTab === "anggota" && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-bold text-slate-600 uppercase">NIP</th>
                            <th className="px-3 py-2 text-left text-xs font-bold text-slate-600 uppercase">Nama</th>
                            <th className="px-3 py-2 text-center text-xs font-bold text-slate-600 uppercase">Angkatan</th>
                            <th className="px-3 py-2 text-center text-xs font-bold text-slate-600 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {data.anggotaList?.map((a: any) => (
                            <tr key={a.id} onClick={() => onViewAnggota?.(a.id)} className="hover:bg-slate-50 cursor-pointer">
                              <td className="px-3 py-2 text-xs font-mono text-blue-600">{a.nia}</td>
                              <td className="px-3 py-2 text-sm font-medium text-slate-800">{a.namaLengkap}</td>
                              <td className="px-3 py-2 text-center text-xs text-slate-500">{a.angkatan || "-"}</td>
                              <td className="px-3 py-2 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                                  a.status === "AKTIF" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                                }`}>{a.status}</span>
                              </td>
                            </tr>
                          ))}
                          {(!data.anggotaList || data.anggotaList.length === 0) && (
                            <tr><td colSpan={4} className="px-3 py-8 text-center text-sm text-slate-400">Belum ada anggota di wilayah ini</td></tr>
                          )}
                        </tbody>
                      </table>
                      {data.anggotaList?.length > 0 && (
                        <p className="text-xs text-slate-400 mt-3 text-center">Menampilkan {data.anggotaList.length} dari {data.totalAnggota} anggota</p>
                      )}
                    </div>
                  )}

                  {/* DOKUMEN */}
                  {activeTab === "dokumen" && (
                    <div className="space-y-2">
                      {[
                        { nama: "Surat Keputusan (SK)", uploaded: !!p?.fileSK, icon: FileText, url: p?.fileSK },
                        { nama: "KTP", uploaded: !!p?.ktp, icon: FileText, url: p?.ktp },
                        { nama: "Pas Foto", uploaded: !!p?.foto, icon: FileText, url: p?.foto },
                        { nama: "CV/Resume", uploaded: !!p?.cv, icon: FileText, url: p?.cv },
                        { nama: "Surat Pernyataan", uploaded: !!p?.suratPernyataan, icon: FileText, url: p?.suratPernyataan },
                        { nama: "Surat Sehat", uploaded: !!p?.suratSehat, icon: FileText, url: p?.suratSehat },
                      ].map((d, idx) => {
                        const Icon = d.icon;
                        return (
                          <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border ${d.uploaded ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${d.uploaded ? "bg-emerald-100" : "bg-rose-100"}`}>
                                <Icon className={`w-5 h-5 ${d.uploaded ? "text-emerald-600" : "text-rose-600"}`} />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-800">{d.nama}</div>
                                <div className="text-[10px] text-slate-500">{d.uploaded ? "Tersedia" : "Belum diupload"}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {d.uploaded && d.url && (
                                <button
                                  onClick={() => {
                                    const url = d.url!;
                                    if (url.startsWith("data:")) {
                                      const w = window.open();
                                      if (w) {
                                        if (url.startsWith("data:image/")) {
                                          w.document.write(`<html><head><title>${d.nama}</title></head><body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#1e293b"><img src="${url}" style="max-width:100%;max-height:100vh;object-fit:contain" /></body></html>`);
                                        } else if (url.startsWith("data:application/pdf")) {
                                          w.document.write(`<html><head><title>${d.nama}</title></head><body style="margin:0"><iframe src="${url}" style="width:100vw;height:100vh;border:0"></iframe></body></html>`);
                                        } else {
                                          w.document.write(`<html><head><title>${d.nama}</title></head><body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh"><a href="${url}" download="${d.nama}" style="padding:12px 24px;background:#0ea5e9;color:white;text-decoration:none;border-radius:8px">Download ${d.nama}</a></body></html>`);
                                        }
                                        w.document.close();
                                      }
                                    } else {
                                      window.open(url, "_blank");
                                    }
                                  }}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-white px-2 py-1 rounded border border-blue-200"
                                >
                                  <ExternalLink className="w-3 h-3" /> Lihat
                                </button>
                              )}
                              {d.uploaded ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <X className="w-5 h-5 text-rose-400" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* RIWAYAT JABATAN */}
                  {activeTab === "riwayat" && (
                    <div className="space-y-3">
                      {data.riwayatJabatan?.map((r: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <Shield className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-slate-800">{r.jabatan}</div>
                            <div className="text-xs text-slate-500 mt-0.5">Level: {r.level} • Wilayah: {r.wilayah}</div>
                            <div className="flex items-center gap-3 mt-2 text-xs">
                              <span className="text-slate-500">Periode: {formatTanggal(r.tanggalMulai)} - {r.tanggalSelesai ? formatTanggal(r.tanggalSelesai) : "Sekarang"}</span>
                              <span className="text-slate-500">SK: {r.nomorSK || "-"}</span>
                              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${r.status === "Aktif" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{r.status}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!data.riwayatJabatan || data.riwayatJabatan.length === 0) && (
                        <p className="text-sm text-slate-400 text-center py-8">Belum ada riwayat jabatan</p>
                      )}
                    </div>
                  )}

                  {/* ACTIVITY */}
                  {activeTab === "activity" && (
                    <div className="space-y-3">
                      {data.activity?.map((a: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                            <Activity className="w-4 h-4 text-slate-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-800">{a.aksi}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{new Date(a.tanggal).toLocaleString("id-ID")} • oleh {a.oleh}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

      {/* Ganti Jabatan Dialog */}
      {showGantiJabatanDialog && (
        <div
          className="fixed inset-0 z-[310] bg-blue-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowGantiJabatanDialog(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-gradient-to-r from-violet-600 to-purple-500 p-5 text-white">
              <button
                onClick={() => setShowGantiJabatanDialog(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Ganti Jabatan</h2>
                  <p className="text-xs text-violet-100">{p?.namaLengkap}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 text-xs text-violet-800">
                ℹ️ Sistem akan:
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  <li>Mengakhiri jabatan lama (status: Selesai)</li>
                  <li>Membuat record jabatan baru dengan tanggal mulai hari ini</li>
                  <li>Level & wilayah tetap sama dengan jabatan lama</li>
                </ul>
              </div>

              {p?.jabatanNama && (
                <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-2">
                  Jabatan saat ini: <strong>{p.jabatanNama}</strong>
                  {p.jabatanBidang && <span className="text-slate-500"> ({p.jabatanBidang})</span>}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pilih Bidang & Jabatan Baru *
                </label>
                <select
                  value={selectedJabatanId}
                  onChange={(e) => setSelectedJabatanId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-violet-500 outline-none"
                >
                  <option value="">— Pilih Bidang & Jabatan —</option>
                  {Object.entries(
                    jabatanList.reduce((acc: any, j: any) => {
                      if (!acc[j.bidang]) acc[j.bidang] = [];
                      acc[j.bidang].push(j);
                      return acc;
                    }, {})
                  ).sort(([a], [b]) => a.localeCompare(b)).map(([bidang, items]: [string, any]) => (
                    <optgroup key={bidang} label={bidang}>
                      {items
                        .sort((a: any, b: any) => a.urutan - b.urutan)
                        .map((j: any) => (
                          <option key={j.id} value={j.id}>
                            {j.nama}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setShowGantiJabatanDialog(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleGantiJabatan}
                disabled={gantiLoading || !selectedJabatanId}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50"
              >
                {gantiLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    Ganti Jabatan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm font-medium text-slate-800">{value || "-"}</div>
    </div>
  );
}
