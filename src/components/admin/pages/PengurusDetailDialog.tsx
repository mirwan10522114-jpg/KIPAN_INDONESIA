"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, UserCog, Mail, Phone, MapPin, Calendar, FileText, History,
  Users, Info, Edit, Shield, ExternalLink, Activity, Award,
  CheckCircle2, Building2, Briefcase, GraduationCap,
} from "lucide-react";
import SafeImage from "@/components/ui/safe-image";

const TABS = [
  { id: "profil", label: "Profil", icon: Info },
  { id: "jabatan", label: "Jabatan", icon: Award },
  { id: "wilayah", label: "Wilayah", icon: MapPin },
  { id: "anggota", label: "Anggota", icon: Users },
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

  useEffect(() => {
    if (!pengurusId) return;
    let active = true;
    fetch(`/api/pengurus/${pengurusId}/detail`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => { if (active && json.success) setData(json.data); })
      .catch(() => {})
      .finally(() => { if (active) {} });
    return () => { active = false; };
  }, [pengurusId]);

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
    <AnimatePresence>
      {pengurusId && (
        <motion.div
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
                  <p className="text-blue-100 text-sm mt-1">{p?.jabatan}</p>
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
                      <div>
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Biodata</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
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
                            <th className="px-3 py-2 text-left text-xs font-bold text-slate-600 uppercase">NIA</th>
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
                        { nama: "Surat Keputusan (SK)", uploaded: !!p?.nomorSK, icon: FileText, url: p?.fileSK || "#" },
                        { nama: "KTP", uploaded: false, icon: FileText, url: "#" },
                        { nama: "CV/Resume", uploaded: false, icon: FileText, url: "#" },
                        { nama: "Pas Foto", uploaded: !!p?.foto, icon: FileText, url: p?.foto || "#" },
                      ].map((d, idx) => {
                        const Icon = d.icon;
                        return (
                          <div key={idx} className={`flex items-center justify-between p-3 rounded-lg border ${d.uploaded ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${d.uploaded ? "bg-emerald-100" : "bg-rose-100"}`}>
                                <Icon className={`w-5 h-5 ${d.uploaded ? "text-emerald-600" : "text-rose-600"}`} />
                              </div>
                              <span className="text-sm font-medium text-slate-800">{d.nama}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {d.uploaded && (
                                <button
                                  onClick={() => window.open(d.url, "_blank")}
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
