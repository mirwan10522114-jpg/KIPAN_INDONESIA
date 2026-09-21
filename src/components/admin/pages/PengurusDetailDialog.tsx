"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, UserCog, Mail, Phone, MapPin, Calendar, FileText, History,
  Users, Info, Edit, Shield, ExternalLink, Activity, Award,
  CheckCircle2, Building2, Briefcase, GraduationCap,
  CreditCard, Download, QrCode, CalendarDays, User, Star
} from "lucide-react";
import { toast } from "sonner";
import SafeImage from "@/components/ui/safe-image";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import { MASTER_PROVINSI, MASTER_KABUPATEN } from "@/lib/master-wilayah";
import KtaCardRenderer from "@/components/shared/KtaCardRenderer";
const TABS = [
  { id: "profil", label: "Profil", icon: Info },
  { id: "kepengurusan", label: "Kepengurusan", icon: Award },
  { id: "wilayah", label: "Wilayah", icon: MapPin },
  { id: "dokumen", label: "Dokumen", icon: FileText },
  { id: "riwayat", label: "Riwayat", icon: History },
  { id: "activity", label: "Activity", icon: Activity },
];

interface PengurusDetailProps {
  pengurusId: number | null;
  userRole?: string;
  onClose: () => void;
  onEdit?: () => void;
  onViewAnggota?: (id: number) => void;
  onPengurusIdChanged?: (newId: number) => void;
  onUpdate?: () => void;
}

export default function PengurusDetailDialog({
  pengurusId, userRole = "SUPER_ADMIN", onClose, onEdit, onViewAnggota, onPengurusIdChanged, onUpdate
}: PengurusDetailProps) {
  const [activeTab, setActiveTab] = useState("profil");
  const [data, setData] = useState<any>(null);
  const [showEditForm, setShowEditForm] = useState(false);
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
    provinsiId: "",
    kabupatenId: "",
    kecamatan: "",
    kodePos: "",
    email: "",
    whatsapp: "",
    foto: "",
    ktp: "",
    cv: "",
    sk: "",
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
        onUpdate?.();
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
      provinsiId: p.provinsiId || "",
      kabupatenId: p.kabupatenId || "",
      kecamatan: p.kecamatan || "",
      kodePos: p.kodePos || "",
      email: p.email || "",
      
      whatsapp: p.whatsapp || "",
      foto: p.foto || "",
      ktp: p.ktp || "",
      cv: p.cv || "",
      sk: p.sk || "",
      suratPernyataan: p.suratPernyataan || "",
      suratSehat: p.suratSehat || "",
    });
    setShowEditForm(true);
  };

  if (!pengurusId) return null;

  const p = data?.pengurus;
  
  const canEdit = (() => {
    if (!p) return false;
    if (userRole === "SUPER_ADMIN" || userRole === "ADMIN_NASIONAL") return true;
    if (userRole === "ADMIN_PROVINSI") return p.level === "Provinsi" || p.level === "Kabupaten";
    if (userRole === "ADMIN_KABUPATEN") return p.level === "Kabupaten";
    return false;
  })();

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Aktif: "bg-emerald-100 text-emerald-700 border-emerald-200",
      Demisioner: "bg-amber-100 text-amber-700 border-amber-200",
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
                  <p className="text-blue-100 text-sm mt-1">Pengurus {normalizeLevel(p?.level || "")}</p>
                  {p?.nia && (
                    <span className="inline-block mt-2 px-2.5 py-1 bg-white/20 rounded-md text-xs font-mono font-semibold">
                      NIP: {p.nia}
                    </span>
                  )}
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /><span>{normalizeLevel(p?.level || "") === "Nasional" ? "Indonesia" : (p?.kabupaten?.nama || p?.provinsi?.nama || "-")}</span></div>
                    <div className="flex items-center gap-1.5"><Mail className="w-4 h-4" /><span>{p?.email}</span></div>
                    <div className="flex items-center gap-1.5"><Phone className="w-4 h-4" /><span>{p?.anggota?.whatsapp || "-"}</span></div>
                    <div className="flex items-center gap-1.5"><FileText className="w-4 h-4" /><span>SK: {p?.nomorSK || "-"}</span></div>
                  </div>
                </div>
              </div>
              {/* Action buttons — di bawah header info, tidak absolute */}
              <div className="flex flex-wrap gap-2 mt-4">
                {canEdit && (
                  <button
                    onClick={openEditForm}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Biodata
                  </button>
                )}
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
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 text-center">Kartu Anggota (KTA)</h3>
                        <KtaCardRenderer data={p} />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Biodata</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <InfoRow label="NIP" value={p?.nia} />
                          <InfoRow label="Nama Lengkap" value={p?.namaLengkap} />
                          <InfoRow label="Tempat Lahir" value={p?.tempatLahir || "-"} />
                          <InfoRow label="Tanggal Lahir" value={p?.tanggalLahir ? formatTanggal(p.tanggalLahir) : "-"} />
                          <InfoRow label="Jenis Kelamin" value={p?.jenisKelamin === "L" ? "Laki-laki" : (p?.jenisKelamin === "P" ? "Perempuan" : "-")} />
                          <InfoRow label="Agama" value={p?.agama || "-"} />
                          <InfoRow label="Pendidikan" value={p?.pendidikan || "-"} />
                          <InfoRow label="Pekerjaan" value={p?.pekerjaan || "-"} />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Alamat</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <InfoRow label="Alamat" value={p?.alamat || "-"} />
                          <InfoRow label="Kecamatan" value={p?.kecamatan || "-"} />
                          <InfoRow label="Kabupaten/Kota" value={p?.kabupaten?.nama || "-"} />
                          <InfoRow label="Provinsi" value={p?.provinsi?.nama || "-"} />
                          <InfoRow label="Kode Pos" value={p?.kodePos || "-"} />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Kontak</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <InfoRow label="Email" value={p?.email || "-"} />
                          <InfoRow label="No. WhatsApp" value={p?.whatsapp || "-"} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* KEPENGURUSAN */}
                  {activeTab === "kepengurusan" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <InfoRow label="Level" value={normalizeLevel(p?.level)} />
                        <InfoRow label="Wilayah" value={normalizeLevel(p?.level) === "Nasional" ? "Indonesia" : (p?.kabupaten?.nama || p?.provinsi?.nama || "-")} />
                        <InfoRow label="Nomor SK" value={p?.nomorSK || "-"} />
                        <InfoRow label="Judul SK" value={p?.judulSK || "-"} />
                        <InfoRow label="Status Jabatan" value={p?.status} />
                        {p?.status !== "Aktif" && p?.keteranganStatus && (
                          <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1">
                            <div className="text-xs text-slate-500 mb-1">Keterangan / Alasan Status</div>
                            <div className="text-sm font-medium text-slate-800">{p.keteranganStatus}</div>
                          </div>
                        )}
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
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-blue-50 p-3 rounded-xl border border-blue-100 mb-2">
                        <div className="text-xs text-blue-800 font-medium">Perbarui atau unggah ulang dokumen?</div>
                        {canEdit && (
                          <button onClick={openEditForm} className="shrink-0 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5 transition-colors">
                            <Edit className="w-3.5 h-3.5" /> Ganti Dokumen
                          </button>
                        )}
                      </div>
                      <div className="space-y-2">
                      {[
                        { nama: "Surat Keputusan (SK)", uploaded: !!p?.fileSK, icon: FileText, url: p?.fileSK },
                        { nama: "KTP", uploaded: !!p?.ktp, icon: FileText, url: p?.ktp },
                        { nama: "Pas Foto", uploaded: !!p?.foto, icon: FileText, url: p?.foto },
                        { nama: "CV/Resume", uploaded: !!p?.cv, icon: FileText, url: p?.cv },
                        { nama: "SK (Pendaftaran)", uploaded: !!p?.sk, icon: FileText, url: p?.sk },
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
                                      const parts = url.split(",");
                                      const header = parts[0];
                                      const base64 = parts[1];
                                      const mimeMatch = header.match(/:(.*?);/);
                                      if (mimeMatch && base64) {
                                        const mimeType = mimeMatch[1];
                                        try {
                                          const binary = atob(base64);
                                          const array = new Uint8Array(binary.length);
                                          for (let i = 0; i < binary.length; i++) {
                                            array[i] = binary.charCodeAt(i);
                                          }
                                          const blob = new Blob([array], { type: mimeType });
                                          const objectUrl = URL.createObjectURL(blob);
                                          window.open(objectUrl, "_blank");
                                        } catch (e) {
                                          console.error("Failed to decode base64", e);
                                          alert("Gagal membuka dokumen. Format file tidak valid.");
                                        }
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
                    </div>
                  )}

                  {/* RIWAYAT SK */}
                  {activeTab === "riwayat" && (
                    <div className="space-y-3">
                      {data.riwayatSK?.map((r: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <Shield className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-slate-800">{r.judulSK}</div>
                            <div className="text-xs text-slate-500 mt-0.5">Level: {r.level} • Wilayah: {r.wilayah}</div>
                            <div className="flex items-center gap-3 mt-2 text-xs">
                              <span className="text-slate-500">Periode: {formatTanggal(r.tanggalMulai)} - {r.tanggalSelesai ? formatTanggal(r.tanggalSelesai) : "Sekarang"}</span>
                              <span className="text-slate-500">SK: {r.nomorSK || "-"}</span>
                              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${r.status === "Aktif" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{r.status}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!data.riwayatSK || data.riwayatSK.length === 0) && (
                        <p className="text-sm text-slate-400 text-center py-8">Belum ada riwayat kepengurusan</p>
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
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Alamat Lengkap</p>
                <textarea value={editForm.alamat} onChange={(e) => setEditForm({ ...editForm, alamat: e.target.value })} rows={2}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none resize-none" />
                
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Provinsi</label>
                    <select value={editForm.provinsiId} 
                      onChange={(e) => setEditForm({ ...editForm, provinsiId: e.target.value, kabupatenId: "" })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none">
                      <option value="">Pilih Provinsi</option>
                      {MASTER_PROVINSI.map((p) => (
                        <option key={p.kode} value={p.kode}>{p.nama}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kabupaten/Kota</label>
                    <select value={editForm.kabupatenId} 
                      onChange={(e) => setEditForm({ ...editForm, kabupatenId: e.target.value })}
                      disabled={!editForm.provinsiId}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none disabled:bg-slate-50">
                      <option value="">Pilih Kab/Kota</option>
                      {MASTER_KABUPATEN.filter(k => String(k.provinsiKode) === String(editForm.provinsiId)).map((k) => (
                        <option key={k.kode} value={k.kode}>{k.nama}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kecamatan</label>
                    <input type="text" value={editForm.kecamatan} onChange={(e) => setEditForm({ ...editForm, kecamatan: e.target.value })}
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
                </div>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">WhatsApp</label>
                    <input type="tel" value={editForm.whatsapp} onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                  </div>
                </div>
              </div>

              {/* Upload Dokumen */}
              <div className="border-t border-slate-100 pt-3">
                <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Upload Dokumen</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "foto", label: "Pas Foto", accept: "image/jpeg,image/png,image/jpg", format: "JPG/PNG" },
                    { key: "ktp", label: "KTP", accept: "image/jpeg,image/png,image/jpg,.pdf", format: "JPG/PNG/PDF" },
                    { key: "cv", label: "CV/Resume", accept: ".pdf", format: "PDF" },
                    { key: "sk", label: "SK (Pendaftaran)", accept: ".pdf", format: "PDF" },
                    { key: "suratPernyataan", label: "Surat Pernyataan", accept: ".pdf", format: "PDF" },
                    { key: "suratSehat", label: "Surat Sehat", accept: ".pdf", format: "PDF" },
                  ].map((doc) => (
                    <div key={doc.key}>
                      <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                        {doc.label} <span className="text-slate-400 font-normal">({doc.format}, Max 2MB)</span>
                      </label>
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
