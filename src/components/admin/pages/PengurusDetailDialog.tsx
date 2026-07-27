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
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";

const TABS = [
  { id: "profil", label: "Profil", icon: Info },
  { id: "jabatan", label: "Jabatan", icon: Award },
  { id: "wilayah", label: "Wilayah", icon: MapPin },
  { id: "dokumen", label: "Dokumen", icon: FileText },
  { id: "riwayat", label: "Riwayat", icon: History },
  { id: "activity", label: "Activity", icon: Activity },
];

interface PengurusDetailProps {
  pengurusId: number | null;
  onClose: () => void;
  onEdit?: () => void;
  onViewAnggota?: (id: number) => void;
  onPengurusIdChanged?: (newId: number) => void;
}

export default function PengurusDetailDialog({
  pengurusId, onClose, onEdit, onViewAnggota, onPengurusIdChanged,
}: PengurusDetailProps) {
  const [activeTab, setActiveTab] = useState("profil");
  const [data, setData] = useState<any>(null);
  const [showGantiJabatanDialog, setShowGantiJabatanDialog] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [jabatanList, setJabatanList] = useState<any[]>([]);
  const [selectedJabatanId, setSelectedJabatanId] = useState<string>("");
  const [gantiLoading, setGantiLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [editForm, setEditForm] = useState({
    namaLengkap: "",
    nik: "",
    tempatLahir: "",
    tanggalLahir: "",
    jenisKelamin: "L",
    agama: "",
    pendidikan: "",
    pekerjaan: "",
    alamat: "",
    kecamatan: "",
    desa: "",
    kodePos: "",
    email: "",
    hp: "",
    whatsapp: "",
    angkatan: "",
    foto: "",
    ktp: "",
    cv: "",
    suratPernyataan: "",
    suratSehat: "",
  });

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

  // Fetch activity logs when activity tab is opened
  useEffect(() => {
    if (activeTab === "activity" && pengurusId) {
      fetch(`/api/activity-log?table=pengurus&recordId=${pengurusId}&limit=20`, { cache: "no-store" })
        .then((r) => r.json())
        .then((json) => { if (json.success) setActivityLogs(json.data); })
        .catch(() => {});
    }
  }, [activeTab, pengurusId]);

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
        // Jika ganti jabatan membuat record pengurus baru, update pengurusId via callback
        if (json.data?.id && json.data.id !== pengurusId) {
          onPengurusIdChanged?.(json.data.id);
        } else {
          // ID tidak berubah, just refresh data
          fetchData();
        }
      } else {
        toast.error(json.error || "Gagal ganti jabatan");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setGantiLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!p) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/anggota/${p.anggotaId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Biodata pengurus berhasil diperbarui");
        setShowEditForm(false);
        fetchData();
      } else {
        toast.error(json.error || "Gagal menyimpan");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setEditLoading(false);
    }
  };

  const openEditForm = () => {
    if (!p) return;
    setEditForm({
      namaLengkap: p.namaLengkap || "",
      nik: p.nik || "",
      tempatLahir: p.tempatLahir || "",
      tanggalLahir: p.tanggalLahir ? new Date(p.tanggalLahir).toISOString().split("T")[0] : "",
      jenisKelamin: p.jenisKelamin || "L",
      agama: p.agama || "",
      pendidikan: p.pendidikan || "",
      pekerjaan: p.pekerjaan || "",
      alamat: p.alamat || "",
      kecamatan: p.kecamatan || "",
      desa: p.desa || "",
      kodePos: p.kodePos || "",
      email: p.email || "",
      hp: p.hp || "",
      whatsapp: p.whatsapp || "",
      angkatan: p.angkatan || "",
      foto: p.foto || "",
      ktp: p.ktp || "",
      cv: p.cv || "",
      suratPernyataan: p.suratPernyataan || "",
      suratSehat: p.suratSehat || "",
    });
    setShowEditForm(true);
  };

  if (!pengurusId) return null;

  const p = data?.pengurus;
  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Aktif: "bg-emerald-100 text-emerald-700 border-emerald-200",
      Selesai: "bg-slate-100 text-slate-600 border-slate-200",
      Diberhentikan: "bg-rose-100 text-rose-700 border-rose-200",
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
              {/* Action buttons — di bawah header info, tidak absolute */}
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => setShowGantiJabatanDialog(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/80 hover:bg-violet-500 rounded-lg text-xs font-semibold"
                >
                  <Award className="w-3.5 h-3.5" /> Ganti Jabatan
                </button>
                <button
                  onClick={openEditForm}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit Biodata
                </button>
              </div>
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
                        {/* KTA Card Design — White background, Navy/Red/Yellow theme per KIPAN design */}
                        <div id="kta-card-pengurus" className="relative rounded-[20px] shadow-2xl overflow-hidden mx-auto bg-white" style={{ width: "480px", height: "302px" }}>
                          {/* Watermark logo */}
                          <img src="/kipan-logo.png" alt="" className="absolute right-[-40px] top-1/2 -translate-y-1/2 w-[200px] h-[200px] opacity-[0.05] pointer-events-none" />

                          {/* Wave footer */}
                          <div className="absolute bottom-0 left-0 right-0 h-[60px] overflow-hidden">
                            <svg viewBox="0 0 480 60" preserveAspectRatio="none" className="w-full h-full">
                              <path d="M0,30 Q120,0 240,30 T480,30 L480,60 L0,60 Z" fill="#002060" />
                              <path d="M0,35 Q120,5 240,35 T480,35" fill="none" stroke="#FFC107" strokeWidth="3" />
                            </svg>
                          </div>

                          {/* Content */}
                          <div className="relative h-full flex flex-col p-4 z-10">
                            {/* Header — Logo + Title + QR */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2.5">
                                <img src="/kipan-logo.png" alt="KIPAN" className="w-14 h-14 rounded-full object-cover" />
                                <div className="border-l border-gray-300 pl-2.5">
                                  <div className="text-2xl font-extrabold text-[#002060] leading-none">KIPAN</div>
                                  <div className="text-[8px] font-bold text-[#002060] uppercase tracking-wide mt-0.5">Kader Inti Pemuda</div>
                                  <div className="text-[8px] font-bold text-[#002060] uppercase tracking-wide">Anti Narkoba</div>
                                  <div className="text-[8px] font-bold text-[#E31C25] uppercase tracking-wide">Sekretariat Nasional</div>
                                </div>
                              </div>
                              {/* QR Code */}
                              <div className="shrink-0 bg-white p-1 rounded-lg border-2 border-[#002060]">
                                <QRCodeSVG value={p?.nia || "KIPAN"} size={56} level="M" />
                              </div>
                            </div>

                            {/* Member info — Photo + Details */}
                            <div className="flex items-start gap-3 flex-1">
                              {/* Photo */}
                              <div className="shrink-0">
                                <div className="w-[70px] h-[90px] rounded-[10px] overflow-hidden border-[3px] border-[#FFC107]" style={{ background: p?.foto ? "transparent" : "#CC0000" }}>
                                  <SafeImage src={p?.foto} alt={p?.namaLengkap || ""} className="w-full h-full object-cover" />
                                </div>
                              </div>
                              {/* Details */}
                              <div className="flex-1 min-w-0">
                                {/* Jabatan as title */}
                                <div className="text-sm font-extrabold text-[#002060] uppercase leading-tight truncate mb-1">
                                  {p?.jabatanNama}{p?.jabatanBidang && p?.jabatanBidang !== "Pengurus Harian" ? ` ${p.jabatanBidang}` : ""}
                                </div>
                                {/* NIP badge */}
                                <div className="inline-block bg-[#002060] text-white text-[9px] font-mono font-semibold px-2.5 py-1 rounded-full mb-2">
                                  {p?.nia}
                                </div>
                                {/* Data rows */}
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-4 h-4 rounded-full bg-[#002060] flex items-center justify-center shrink-0">
                                      <span className="text-white text-[7px]">N</span>
                                    </div>
                                    <span className="text-[9px] font-bold text-[#333] w-16 shrink-0">Nama</span>
                                    <span className="text-[9px] text-[#444] truncate">{p?.namaLengkap}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-4 h-4 rounded-full bg-[#002060] flex items-center justify-center shrink-0">
                                      <span className="text-white text-[7px]">L</span>
                                    </div>
                                    <span className="text-[9px] font-bold text-[#333] w-16 shrink-0">Wilayah</span>
                                    <span className="text-[9px] text-[#444] truncate">
                                      {normalizeLevel(p?.level || "") === "Nasional" ? "Indonesia" : (p?.kabupaten?.nama || p?.provinsi?.nama || "-")}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-4 h-4 rounded-full bg-[#002060] flex items-center justify-center shrink-0">
                                      <span className="text-white text-[7px]">S</span>
                                    </div>
                                    <span className="text-[9px] font-bold text-[#333] w-16 shrink-0">Status</span>
                                    <span className="text-[9px] text-[#444]">{p?.status} • Seumur Hidup</span>
                                  </div>
                                </div>
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
                              const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=56x56&data=${encodeURIComponent(p.nia || 'KIPAN')}`;
                              const levelText = p.level === 'NASIONAL' ? 'Nasional' : p.level === 'PROVINSI' ? 'Provinsi' : 'Kabupaten';
                              const wilayahText = p.level === 'NASIONAL' ? 'Indonesia' : (p.kabupaten?.nama || p.provinsi?.nama || '-');
                              const jabatanText = (p.jabatanNama || '-') + (p.jabatanBidang && p.jabatanBidang !== 'Pengurus Harian' ? ' ' + p.jabatanBidang : '');
                              printWin.document.write(`
                                <html><head><title>KTA - ${p.nia}</title>
                                <style>
                                  * { margin:0; padding:0; box-sizing:border-box; }
                                  body { display:flex; justify-content:center; align-items:center; min-height:100vh; background:#f0f0f0; font-family:'Segoe UI',Arial,sans-serif; }
                                  .card { width:480px; height:302px; background:#fff; border-radius:20px; position:relative; overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,0.2); }
                                  .watermark { position:absolute; right:-40px; top:50%; transform:translateY(-50%); width:200px; height:200px; opacity:0.05; }
                                  .wave { position:absolute; bottom:0; left:0; right:0; height:60px; overflow:hidden; }
                                  .wave svg { width:100%; height:100%; }
                                  .content { position:relative; height:100%; padding:16px; z-index:10; display:flex; flex-direction:column; }
                                  .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
                                  .logo-box { display:flex; align-items:center; gap:10px; }
                                  .logo-img { width:56px; height:56px; border-radius:50%; }
                                  .title-box { border-left:1px solid #ccc; padding-left:10px; }
                                  .title-main { font-size:24px; font-weight:900; color:#002060; line-height:1; }
                                  .title-sub1 { font-size:8px; font-weight:bold; color:#002060; text-transform:uppercase; letter-spacing:0.5px; margin-top:2px; }
                                  .title-sub2 { font-size:8px; font-weight:bold; color:#002060; text-transform:uppercase; letter-spacing:0.5px; }
                                  .title-sub3 { font-size:8px; font-weight:bold; color:#E31C25; text-transform:uppercase; letter-spacing:0.5px; }
                                  .qr-box { background:#fff; padding:4px; border-radius:8px; border:2px solid #002060; }
                                  .qr-img { width:56px; height:56px; }
                                  .info-row { display:flex; gap:12px; align-items:flex-start; flex:1; }
                                  .photo-frame { width:70px; height:90px; border-radius:10px; overflow:hidden; border:3px solid #FFC107; background:#CC0000; }
                                  .photo { width:100%; height:100%; object-fit:cover; }
                                  .details { flex:1; min-width:0; }
                                  .jabatan { font-size:14px; font-weight:900; color:#002060; text-transform:uppercase; line-height:1.1; margin-bottom:4px; }
                                  .nip-badge { display:inline-block; background:#002060; color:#fff; font-size:9px; font-family:monospace; font-weight:bold; padding:3px 10px; border-radius:20px; margin-bottom:8px; }
                                  .data-row { display:flex; align-items:center; gap:6px; margin-bottom:4px; }
                                  .icon-circle { width:16px; height:16px; border-radius:50%; background:#002060; display:flex; align-items:center; justify-content:center; }
                                  .icon-circle span { color:#fff; font-size:7px; }
                                  .label { font-size:9px; font-weight:bold; color:#333; width:60px; flex-shrink:0; }
                                  .value { font-size:9px; color:#444; }
                                </style></head><body>
                                <div class="card">
                                  <img src="${window.location.origin}/kipan-logo.png" class="watermark" />
                                  <div class="wave">
                                    <svg viewBox="0 0 480 60" preserveAspectRatio="none">
                                      <path d="M0,30 Q120,0 240,30 T480,30 L480,60 L0,60 Z" fill="#002060" />
                                      <path d="M0,35 Q120,5 240,35 T480,35" fill="none" stroke="#FFC107" stroke-width="3" />
                                    </svg>
                                  </div>
                                  <div class="content">
                                    <div class="header">
                                      <div class="logo-box">
                                        <img src="${window.location.origin}/kipan-logo.png" class="logo-img" />
                                        <div class="title-box">
                                          <div class="title-main">KIPAN</div>
                                          <div class="title-sub1">Kader Inti Pemuda</div>
                                          <div class="title-sub2">Anti Narkoba</div>
                                          <div class="title-sub3">Sekretariat Nasional</div>
                                        </div>
                                      </div>
                                      <div class="qr-box"><img src="${qrUrl}" class="qr-img" alt="QR" /></div>
                                    </div>
                                    <div class="info-row">
                                      ${p.foto ? `<div class="photo-frame" style="background:transparent"><img src="${p.foto}" class="photo" /></div>` : `<div class="photo-frame" style="display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px">${(p.namaLengkap||'?').charAt(0)}</div>`}
                                      <div class="details">
                                        <div class="jabatan">${jabatanText}</div>
                                        <div class="nip-badge">${p.nia}</div>
                                        <div class="data-row">
                                          <div class="icon-circle"><span>N</span></div>
                                          <span class="label">Nama</span>
                                          <span class="value">${p.namaLengkap}</span>
                                        </div>
                                        <div class="data-row">
                                          <div class="icon-circle"><span>L</span></div>
                                          <span class="label">Wilayah</span>
                                          <span class="value">${wilayahText}</span>
                                        </div>
                                        <div class="data-row">
                                          <div class="icon-circle"><span>S</span></div>
                                          <span class="label">Status</span>
                                          <span class="value">${p.status} • Seumur Hidup</span>
                                        </div>
                                      </div>
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
                            onClick={async () => {
                              if (!p) return;
                              try {
                                const cardEl = document.getElementById("kta-card-pengurus");
                                if (cardEl) {
                                  const canvas = await html2canvas(cardEl, { scale: 2, backgroundColor: null, useCORS: true });
                                  const link = document.createElement("a");
                                  link.download = `KTA-${p.nia}.png`;
                                  link.href = canvas.toDataURL("image/png");
                                  link.click();
                                  toast.success("KTA berhasil di-download sebagai PNG");
                                } else {
                                  throw new Error("KTA card element tidak ditemukan");
                                }
                              } catch (err) {
                                console.error("html2canvas error:", err);
                                // Fallback: download text
                                const text = `KARTU PENGURUS KIPAN INDONESIA\n=================================\n\nNIP: ${p.nia}\nNama: ${p.namaLengkap}\nJabatan: ${p.jabatanNama || '-'}${p.jabatanBidang && p.jabatanBidang !== 'Pengurus Harian' ? ' (' + p.jabatanBidang + ')' : ''}\nLevel: ${p.level === 'NASIONAL' ? 'Nasional' : p.level === 'PROVINSI' ? 'Provinsi' : 'Kabupaten'}\nWilayah: ${p.level === 'NASIONAL' ? 'Indonesia' : (p.kabupaten?.nama || p.provinsi?.nama || '-')}\nStatus: ${p.status}\nSK: ${p.nomorSK || '-'}\nMulai Menjabat: ${p.tanggalMulai ? new Date(p.tanggalMulai).toLocaleDateString('id-ID') : '-'}\nBerlaku: Seumur Hidup\n\nKIPAN Indonesia\nKader Inti Pemuda Anti Narkoba\nSekretariat Nasional`;
                                const blob = new Blob([text], { type: "text/plain" });
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.href = url;
                                link.download = `KTA-${p.nia}.txt`;
                                link.click();
                                URL.revokeObjectURL(url);
                                toast.info("Fallback: KTA di-download sebagai text");
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700"
                          >
                            <Download className="w-4 h-4" /> Download PNG
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
                      {activityLogs.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-8">Belum ada aktivitas tercatat</p>
                      ) : (
                        activityLogs.map((log, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              log.aksi === "create" ? "bg-emerald-100" :
                              log.aksi === "update" ? "bg-blue-100" :
                              log.aksi === "delete" ? "bg-rose-100" :
                              log.aksi === "ganti_jabatan" ? "bg-violet-100" :
                              log.aksi === "approve" ? "bg-emerald-100" :
                              log.aksi === "reject" ? "bg-rose-100" : "bg-slate-100"
                            }`}>
                              <Activity className={`w-4 h-4 ${
                                log.aksi === "create" || log.aksi === "approve" ? "text-emerald-600" :
                                log.aksi === "delete" || log.aksi === "reject" ? "text-rose-600" :
                                log.aksi === "ganti_jabatan" ? "text-violet-600" : "text-slate-500"
                              }`} />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-800">
                                {log.aksi === "create" ? "Pengurus ditunjuk" :
                                 log.aksi === "update" ? "Data pengurus diperbarui" :
                                 log.aksi === "delete" ? "Pengurus dinonaktifkan" :
                                 log.aksi === "ganti_jabatan" ? "Jabatan diganti" :
                                 log.aksi === "approve" ? "Pendaftaran disetujui" :
                                 log.aksi === "reject" ? "Pendaftaran ditolak" : log.aksi}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                {new Date(log.createdAt).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} • oleh {log.oleh}
                              </div>
                              {log.detail && (
                                <div className="text-[10px] text-slate-400 mt-1 font-mono">{log.detail}</div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
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

      {/* Edit Biodata Dialog */}
      {showEditForm && (
        <div
          className="fixed inset-0 z-[310] bg-blue-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowEditForm(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-gradient-to-r from-blue-600 to-sky-500 p-5 text-white sticky top-0 z-10">
              <button
                onClick={() => setShowEditForm(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Edit Biodata Pengurus</h2>
                  <p className="text-xs text-blue-100">{p?.namaLengkap}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-3">
              {/* Biodata Dasar */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
                <input type="text" value={editForm.namaLengkap} onChange={(e) => setEditForm({ ...editForm, namaLengkap: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">NIK</label>
                  <input type="text" maxLength={16} value={editForm.nik} onChange={(e) => setEditForm({ ...editForm, nik: e.target.value.replace(/\D/g, "") })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select value={editForm.jenisKelamin} onChange={(e) => setEditForm({ ...editForm, jenisKelamin: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none">
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tempat Lahir *</label>
                  <input type="text" value={editForm.tempatLahir} onChange={(e) => setEditForm({ ...editForm, tempatLahir: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tanggal Lahir *</label>
                  <input type="date" value={editForm.tanggalLahir} onChange={(e) => setEditForm({ ...editForm, tanggalLahir: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Agama</label>
                  <select value={editForm.agama} onChange={(e) => setEditForm({ ...editForm, agama: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none">
                    <option value="">-</option>
                    <option>Islam</option><option>Kristen</option><option>Katolik</option>
                    <option>Hindu</option><option>Buddha</option><option>Konghucu</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Pendidikan</label>
                  <select value={editForm.pendidikan} onChange={(e) => setEditForm({ ...editForm, pendidikan: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none">
                    <option value="">-</option>
                    <option>SMP</option><option>SMA/SMK</option><option>D3</option>
                    <option>S1</option><option>S2</option><option>S3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Pekerjaan</label>
                  <input type="text" value={editForm.pekerjaan} onChange={(e) => setEditForm({ ...editForm, pekerjaan: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                </div>
              </div>

              {/* Alamat */}
              <div className="border-t border-slate-100 pt-3">
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Alamat</p>
                <textarea value={editForm.alamat} onChange={(e) => setEditForm({ ...editForm, alamat: e.target.value })} rows={2}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none resize-none" />
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kecamatan</label>
                    <input type="text" value={editForm.kecamatan} onChange={(e) => setEditForm({ ...editForm, kecamatan: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Desa</label>
                    <input type="text" value={editForm.desa} onChange={(e) => setEditForm({ ...editForm, desa: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kode Pos</label>
                    <input type="text" maxLength={5} value={editForm.kodePos} onChange={(e) => setEditForm({ ...editForm, kodePos: e.target.value.replace(/\D/g, "") })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                  </div>
                </div>
              </div>

              {/* Kontak */}
              <div className="border-t border-slate-100 pt-3">
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Kontak</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email *</label>
                    <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">No. HP *</label>
                    <input type="tel" value={editForm.hp} onChange={(e) => setEditForm({ ...editForm, hp: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">WhatsApp</label>
                    <input type="tel" value={editForm.whatsapp} onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Angkatan</label>
                    <input type="text" value={editForm.angkatan} onChange={(e) => setEditForm({ ...editForm, angkatan: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                  </div>
                </div>
              </div>

              {/* Upload Dokumen */}
              <div className="border-t border-slate-100 pt-3">
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Upload Dokumen</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "foto", label: "Pas Foto", accept: "image/*" },
                    { key: "ktp", label: "KTP", accept: "image/*,.pdf" },
                    { key: "cv", label: "CV/Resume", accept: "image/*,.pdf" },
                    { key: "suratPernyataan", label: "Surat Pernyataan", accept: "image/*,.pdf" },
                    { key: "suratSehat", label: "Surat Sehat", accept: "image/*,.pdf" },
                  ].map((doc) => (
                    <div key={doc.key}>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">{doc.label}</label>
                      <input type="file" accept={doc.accept}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 1024 * 1024 * 2) { toast.error("File maksimal 2MB"); return; }
                          const reader = new FileReader();
                          reader.onload = () => {
                            setEditForm((prev) => ({ ...prev, [doc.key]: reader.result as string }));
                            toast.success(`${doc.label} terupload`);
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="w-full text-[10px] border border-slate-200 rounded-lg px-1.5 py-1 file:mr-1.5 file:py-0.5 file:px-1.5 file:rounded file:border-0 file:text-[10px] file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {(editForm as any)[doc.key] && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] text-emerald-600">✓ {doc.label} terupload</span>
                          <button type="button"
                            onClick={() => {
                              const url = (editForm as any)[doc.key] as string;
                              const w = window.open();
                              if (w) {
                                if (url.startsWith("data:image/")) {
                                  w.document.write(`<html><head><title>${doc.label}</title></head><body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#1e293b"><img src="${url}" style="max-width:100%;max-height:100vh;object-fit:contain" /></body></html>`);
                                } else if (url.startsWith("data:application/pdf")) {
                                  w.document.write(`<html><head><title>${doc.label}</title></head><body style="margin:0"><iframe src="${url}" style="width:100vw;height:100vh;border:0"></iframe></body></html>`);
                                }
                                w.document.close();
                              }
                            }}
                            className="text-[9px] text-blue-600 hover:text-blue-700 underline">Lihat</button>
                          <button type="button"
                            onClick={() => setEditForm((prev) => ({ ...prev, [doc.key]: "" }))}
                            className="text-[9px] text-rose-500 hover:text-rose-700 underline">Hapus</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex justify-end gap-2 sticky bottom-0 bg-white">
              <button onClick={() => setShowEditForm(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
                Batal
              </button>
              <button onClick={handleSaveEdit} disabled={editLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {editLoading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>
                ) : (
                  <><Edit className="w-4 h-4" /> Simpan Perubahan</>
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
