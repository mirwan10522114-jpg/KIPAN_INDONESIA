"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Users, Info, FileText, History, UserCog, Activity,
  QrCode, CreditCard, Mail, Phone, MapPin, Calendar, Award,
  CheckCircle2, Download, Edit, ExternalLink,
} from "lucide-react";
import SafeImage from "@/components/ui/safe-image";

const TABS = [
  { id: "profil", label: "Profil", icon: Info },
  { id: "keanggotaan", label: "Keanggotaan", icon: Award },
  { id: "dokumen", label: "Dokumen", icon: FileText },
  { id: "riwayat", label: "Riwayat", icon: History },
  { id: "pengurus", label: "Pengurus Wilayah", icon: UserCog },
  { id: "activity", label: "Activity", icon: Activity },
];

interface AnggotaDetailProps {
  anggotaId: number | null;
  onClose: () => void;
  onEdit?: () => void;
  onViewPengurus?: (id: number) => void;
  onPromote?: (id: number) => void;
}

export default function AnggotaDetailDialog({
  anggotaId, onClose, onEdit, onViewPengurus, onPromote,
}: AnggotaDetailProps) {
  const [activeTab, setActiveTab] = useState("profil");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!anggotaId) return;
    let active = true;
    fetch(`/api/anggota/${anggotaId}/detail`, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => { if (active && json.success) setData(json.data); })
      .catch(() => {})
      .finally(() => { if (active) {} });
    return () => { active = false; };
  }, [anggotaId]);

  if (!anggotaId) return null;

  const a = data?.anggota;
  const formatTanggal = (d: string) => d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-";

  return (
    <AnimatePresence>
      {anggotaId && (
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
            <div className="relative bg-gradient-to-br from-emerald-600 to-teal-500 p-6 text-white">
              <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-start gap-4">
                <SafeImage src={a?.foto} alt={a?.namaLengkap || ""} className="w-20 h-20 rounded-2xl object-cover border-4 border-white/30" loading="eager" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded">{a?.nia}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      a?.status === "AKTIF" ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"
                    }`}>{a?.status}</span>
                  </div>
                  <h2 className="text-2xl font-bold">{a?.namaLengkap}</h2>
                  <p className="text-emerald-100 text-sm mt-1">
                    {a?.kabupaten?.nama}, {a?.provinsi?.nama}
                  </p>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /><span>Angkatan: {a?.angkatan || "-"}</span></div>
                    <div className="flex items-center gap-1.5"><Mail className="w-4 h-4" /><span>{a?.email}</span></div>
                    <div className="flex items-center gap-1.5"><Phone className="w-4 h-4" /><span>{a?.hp}</span></div>
                  </div>
                </div>
                {/* QR Code placeholder */}
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <QrCode className="w-10 h-10" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold"
                >
                  <CreditCard className="w-3.5 h-3.5" /> Cetak Kartu
                </button>
                <button
                  onClick={() => {
                    // Generate a simple text-based PDF download
                    const a = data?.anggota;
                    if (!a) return;
                    const text = `KARTU ANGGOTA KIPAN INDONESIA\n\nNIA: ${a.nia}\nNama: ${a.namaLengkap}\nWilayah: ${a.kabupaten?.nama || "-"}, ${a.provinsi?.nama || "-"}\nStatus: ${a.status}\nAngkatan: ${a.angkatan || "-"}\nTanggal Daftar: ${a.tanggalDaftar ? new Date(a.tanggalDaftar).toLocaleDateString("id-ID") : "-"}\n\nKIPAN Indonesia`;
                    const blob = new Blob([text], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `KTA-${a.nia}.txt`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
                {onEdit && (
                  <button onClick={onEdit} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold">
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                )}
                {onPromote && (
                  <button
                    onClick={() => onPromote(anggotaId!)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/80 hover:bg-violet-500 rounded-lg text-xs font-semibold"
                  >
                    <UserCog className="w-3.5 h-3.5" /> Jadikan Pengurus
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
                      activeTab === t.id ? "text-emerald-600 border-emerald-600" : "text-slate-500 border-transparent hover:text-emerald-600"
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
                          <InfoRow label="NIK" value={a?.nik} />
                          <InfoRow label="Nama Lengkap" value={a?.namaLengkap} />
                          <InfoRow label="Tempat Lahir" value={a?.tempatLahir} />
                          <InfoRow label="Tanggal Lahir" value={a?.tanggalLahir ? formatTanggal(a.tanggalLahir) : "-"} />
                          <InfoRow label="Jenis Kelamin" value={a?.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"} />
                          <InfoRow label="Agama" value={a?.agama || "-"} />
                          <InfoRow label="Pendidikan" value={a?.pendidikan || "-"} />
                          <InfoRow label="Pekerjaan" value={a?.pekerjaan || "-"} />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Alamat</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <InfoRow label="Alamat" value={a?.alamat} />
                          <InfoRow label="Kecamatan" value={a?.kecamatan || "-"} />
                          <InfoRow label="Kabupaten/Kota" value={a?.kabupaten?.nama || "-"} />
                          <InfoRow label="Provinsi" value={a?.provinsi?.nama || "-"} />
                          <InfoRow label="Kode Pos" value={a?.kodePos || "-"} />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Kontak</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <InfoRow label="Email" value={a?.email} />
                          <InfoRow label="No. HP" value={a?.hp} />
                          <InfoRow label="WhatsApp" value={a?.whatsapp || "-"} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* KEANGGOTAAN */}
                  {activeTab === "keanggotaan" && (
                    <div className="space-y-4">
                      {/* Kartu Anggota Digital */}
                      <div className="bg-gradient-to-br from-blue-600 to-sky-500 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-xs opacity-80">Kartu Anggota Digital</div>
                            <div className="font-bold text-lg">KIPAN Indonesia</div>
                          </div>
                          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                            <QrCode className="w-10 h-10" />
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <SafeImage src={a?.foto} alt={a?.namaLengkap || ""} className="w-12 h-12 rounded-xl object-cover border-2 border-white/30" />
                          <div>
                            <div className="font-bold">{a?.namaLengkap}</div>
                            <div className="text-xs opacity-80 font-mono">{a?.nia}</div>
                            <div className="text-xs opacity-80 mt-0.5">{a?.kabupaten?.nama}, {a?.provinsi?.nama}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4 text-xs">
                          <span className="opacity-80">Angkatan: {a?.angkatan || "-"}</span>
                          <span className="opacity-80">Status: {a?.status}</span>
                          <span className="opacity-80">Berlaku: Seumur hidup</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <InfoRow label="NIA" value={a?.nia} />
                        <InfoRow label="Status" value={a?.status} />
                        <InfoRow label="Angkatan" value={a?.angkatan || "-"} />
                        <InfoRow label="Tanggal Daftar" value={a?.tanggalDaftar ? formatTanggal(a.tanggalDaftar) : "-"} />
                        <InfoRow label="Tanggal Diangkat" value={a?.tanggalAngkat ? formatTanggal(a.tanggalAngkat) : "-"} />
                        <InfoRow label="Provinsi" value={a?.provinsi?.nama || "-"} />
                        <InfoRow label="Kabupaten/Kota" value={a?.kabupaten?.nama || "-"} />
                      </div>
                    </div>
                  )}

                  {/* DOKUMEN */}
                  {activeTab === "dokumen" && (
                    <div className="space-y-2">
                      {[
                        { nama: "KTP", uploaded: !!a?.nik, icon: FileText, url: "#" },
                        { nama: "Pas Foto", uploaded: !!a?.foto, icon: FileText, url: a?.foto || "#" },
                        { nama: "CV/Resume", uploaded: false, icon: FileText, url: "#" },
                        { nama: "Surat Pernyataan", uploaded: false, icon: FileText, url: "#" },
                        { nama: "Surat Sehat", uploaded: false, icon: FileText, url: "#" },
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
                              {d.uploaded && d.url !== "#" && (
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

                  {/* RIWAYAT */}
                  {activeTab === "riwayat" && (
                    <div className="space-y-3">
                      {data.riwayat?.map((r: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            r.aksi.includes("Disetujui") || r.aksi.includes("Diangkat") ? "bg-emerald-100" :
                            r.aksi.includes("Ditolak") ? "bg-rose-100" : "bg-blue-100"
                          }`}>
                            <History className={`w-4 h-4 ${
                              r.aksi.includes("Disetujui") || r.aksi.includes("Diangkat") ? "text-emerald-600" :
                              r.aksi.includes("Ditolak") ? "text-rose-600" : "text-blue-600"
                            }`} />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-800">{r.aksi}</div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {new Date(r.tanggal).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} • oleh {r.oleh}
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!data.riwayat || data.riwayat.length === 0) && (
                        <p className="text-sm text-slate-400 text-center py-8">Belum ada riwayat</p>
                      )}
                    </div>
                  )}

                  {/* PENGURUS WILAYAH */}
                  {activeTab === "pengurus" && (
                    <div className="space-y-2">
                      {data.pengurusWilayah?.map((p: any) => (
                        <div
                          key={p.id}
                          onClick={() => onViewPengurus?.(p.id)}
                          className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
                        >
                          <SafeImage src={p.foto} alt={p.namaLengkap} className="w-10 h-10 rounded-full object-cover border-2 border-blue-100" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-blue-950">{p.namaLengkap}</div>
                            <div className="text-xs text-slate-500">{p.jabatan} • {p.wilayah}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                              p.level === "Nasional" ? "bg-violet-100 text-violet-700" :
                              p.level === "Provinsi" ? "bg-blue-100 text-blue-700" : "bg-cyan-100 text-cyan-700"
                            }`}>{p.level}</span>
                          </div>
                        </div>
                      ))}
                      {(!data.pengurusWilayah || data.pengurusWilayah.length === 0) && (
                        <p className="text-sm text-slate-400 text-center py-8">Belum ada pengurus di wilayah ini</p>
                      )}
                    </div>
                  )}

                  {/* ACTIVITY */}
                  {activeTab === "activity" && (
                    <div className="space-y-3">
                      {data.activity?.map((act: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                            <Activity className="w-4 h-4 text-slate-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-800">{act.aksi}</div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {new Date(act.tanggal).toLocaleString("id-ID")} • oleh {act.oleh}
                            </div>
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
