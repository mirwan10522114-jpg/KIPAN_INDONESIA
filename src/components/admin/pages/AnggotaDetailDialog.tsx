"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Users, Info, FileText, History, UserCog, Activity,
  QrCode, CreditCard, Mail, Phone, MapPin, Calendar, Award,
  CheckCircle2, Download, Edit, ExternalLink, Shield,
} from "lucide-react";
import SafeImage from "@/components/ui/safe-image";
import KtaCardRenderer from "@/components/shared/KtaCardRenderer";

const TABS = [
  { id: "keanggotaan", label: "Kartu Anggota", icon: Award },
  { id: "profil", label: "Profil", icon: Info },
  { id: "dokumen", label: "Dokumen", icon: FileText },
  { id: "riwayat", label: "Riwayat", icon: History },
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
  const [activeTab, setActiveTab] = useState("keanggotaan");
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
  const hitungUmur = (d: string) => {
    if (!d) return "-";
    const dob = new Date(d);
    const diff = Date.now() - dob.getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970) + " Tahun";
  };

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
            <div className="relative bg-gradient-to-r from-blue-600 to-sky-500 p-6 text-white">
              <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-start gap-4">
                <SafeImage src={a?.foto} alt={a?.namaLengkap || ""} className="w-20 h-20 rounded-2xl object-cover border-4 border-white/30" loading="eager" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded">{a?.nia}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-white ${
                      a?.status === "Aktif" ? "text-blue-600 border-blue-200" : "text-slate-500 border-slate-200"
                    }`}>{a?.status}</span>
                  </div>
                  <h2 className="text-2xl font-bold">{a?.namaLengkap}</h2>
                  <p className="text-blue-100 text-sm mt-1">
                    Anggota KIPAN
                  </p>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /><span>{a?.kabupaten?.nama || a?.provinsi?.nama || "-"}</span></div>
                    <div className="flex items-center gap-1.5"><Mail className="w-4 h-4" /><span>{a?.email}</span></div>
                    <div className="flex items-center gap-1.5"><Phone className="w-4 h-4" /><span>{a?.whatsapp || "-"}</span></div>
                  </div>
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
                    const text = `KARTU PENGURUS KIPAN INDONESIA\n\nNIP: ${a.nia}\nNama: ${a.namaLengkap}\nWilayah: ${a.kabupaten?.nama || "-"}, ${a.provinsi?.nama || "-"}\nStatus: ${a.status}\nTanggal Daftar: ${a.tanggalDaftar ? new Date(a.tanggalDaftar).toLocaleDateString("id-ID") : "-"}\n\nKIPAN Indonesia`;
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
                          <InfoRow label="NIK" value={a?.nik} />
                          <InfoRow label="Nama Lengkap" value={a?.namaLengkap} />
                          <InfoRow label="Tempat Lahir" value={a?.tempatLahir} />
                          <InfoRow label="Tanggal Lahir" value={a?.tanggalLahir ? formatTanggal(a.tanggalLahir) : "-"} />
                          <InfoRow label="Umur" value={a?.tanggalLahir ? hitungUmur(a.tanggalLahir) : "-"} />
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
                          <InfoRow label="Email" value={a?.email || "-"} />
                          <InfoRow label="No. WhatsApp" value={a?.whatsapp || "-"} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* KEANGGOTAAN — KARTU ANGGOTA */}
                  {activeTab === "keanggotaan" && (
                    <div className="space-y-4">
                      {/* Kartu Anggota Digital — KTA Design */}
                      <div className="text-center">
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Kartu Anggota (KTA)</h3>
                        <KtaCardRenderer data={a} />
                      </div>

                      {/* Data Keanggotaan */}
                      <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                        <InfoRow label="NIP" value={a?.nia} />
                        <InfoRow label="Status Keanggotaan" value={a?.status} />
                        {a?.status !== "Aktif" && a?.keteranganStatus && (
                          <div className="col-span-2 bg-slate-50 p-3 rounded-lg border border-slate-100 mt-1">
                            <div className="text-xs text-slate-500 mb-1">Keterangan / Alasan Status</div>
                            <div className="text-sm font-medium text-slate-800">{a.keteranganStatus}</div>
                          </div>
                        )}
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
                        { nama: "KTP", uploaded: !!a?.ktp, icon: FileText, url: a?.ktp },
                        { nama: "Pas Foto", uploaded: !!a?.foto, icon: FileText, url: a?.foto },
                        { nama: "CV/Resume", uploaded: !!a?.cv, icon: FileText, url: a?.cv },
                        { nama: "SK (Pendaftaran)", uploaded: !!a?.sk, icon: FileText, url: a?.sk },
                        { nama: "Surat Pernyataan", uploaded: !!a?.suratPernyataan, icon: FileText, url: a?.suratPernyataan },
                        { nama: "Surat Sehat", uploaded: !!a?.suratSehat, icon: FileText, url: a?.suratSehat },
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
                                    // Untuk data URL (base64) atau URL normal, buka di tab baru
                                    if (d.url!.startsWith("data:")) {
                                      // Base64: convert to Blob to avoid browser restrictions on data URLs
                                      const parts = d.url!.split(",");
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
                                      window.open(d.url, "_blank");
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
