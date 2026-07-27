"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, MapPin, Building2, UserCog, Info, BarChart3,
  Edit, TrendingUp, Activity, CheckCircle2, ExternalLink,
} from "lucide-react";
import SafeImage from "@/components/ui/safe-image";

const TABS = [
  { id: "informasi", label: "Informasi", icon: Info },
  { id: "kabupaten", label: "Kabupaten", icon: Building2 },
  { id: "pengurus", label: "Pengurus", icon: UserCog },
  { id: "statistik", label: "Statistik", icon: BarChart3 },
  { id: "activity", label: "Activity", icon: Activity },
];

interface WilayahDetailProps {
  wilayahId: number | null;
  type: "provinsi" | "kabupaten";
  onClose: () => void;
  onEdit?: () => void;
  onViewPengurus?: (id: number) => void;
  onViewAnggota?: (id: number) => void;
  onAddAnggota?: () => void;
  onNavigateToPengurus?: (filter: { provinsiNama?: string; kabupatenNama?: string; level?: string }) => void;
}

export default function WilayahDetailDialog({
  wilayahId, type, onClose, onEdit, onViewPengurus, onNavigateToPengurus,
}: WilayahDetailProps) {
  const [activeTab, setActiveTab] = useState("informasi");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!wilayahId) return;
    let active = true;
    const controller = new AbortController();
    fetch(`/api/wilayah/${wilayahId}/detail?type=${type}`, { cache: "no-store", signal: controller.signal })
      .then((r) => r.json())
      .then((json) => {
        if (active && json.success) setData(json.data);
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); };
  }, [wilayahId, type]);

  if (!wilayahId) return null;

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Aktif: "bg-emerald-100 text-emerald-700 border-emerald-200",
      Pembentukan: "bg-amber-100 text-amber-700 border-amber-200",
      Nonaktif: "bg-slate-100 text-slate-600 border-slate-200",
      Dibekukan: "bg-rose-100 text-rose-700 border-rose-200",
    };
    return styles[status] || "bg-slate-100 text-slate-600 border-slate-200";
  };

  const w = data?.wilayah;
  const s = data?.statistik;

  return (
    <AnimatePresence>
      {wilayahId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[300] bg-blue-950/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 to-sky-500 p-6 text-white">
              <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  {type === "provinsi" ? <MapPin className="w-8 h-8" /> : <Building2 className="w-8 h-8" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded">{w?.kode}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-white ${statusBadge(w?.status || "")}`}>
                      {w?.status}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold">{w?.nama}</h2>
                  {w?.provinsiNama && <p className="text-blue-100 text-sm mt-1">Provinsi: {w.provinsiNama}</p>}
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1.5"><UserCog className="w-4 h-4" /><span>Ketua: {w?.ketua || "-"}</span></div>
                    {type === "provinsi" && <div className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /><span>{s?.totalKabupaten || 0} Kabupaten/Kota</span></div>}
                    <div className="flex items-center gap-1.5"><UserCog className="w-4 h-4" /><span>{s?.totalPengurus || 0} Pengurus</span></div>
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
              {loading ? (
                <div className="space-y-3">
                  {[1,2,3,4].map((i) => <div key={i} className="h-4 bg-slate-200 animate-pulse rounded" />)}
                </div>
              ) : !data ? (
                <p className="text-sm text-slate-500 text-center py-8">Gagal memuat data</p>
              ) : (
                <>
                  {/* INFORMASI */}
                  {activeTab === "informasi" && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <InfoRow label="Kode" value={w?.kode} />
                      <InfoRow label="Nama" value={w?.nama} />
                      <InfoRow label="Tipe" value={type === "provinsi" ? "Provinsi" : "Kabupaten/Kota"} />
                      <InfoRow label="Status" value={w?.status} />
                      {w?.provinsiNama && <InfoRow label="Provinsi" value={w.provinsiNama} />}
                      <InfoRow label="Ketua" value={w?.ketua || "-"} />
                      <InfoRow label="Dibuat" value={w?.createdAt ? new Date(w.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"} />
                      <InfoRow label="Diperbarui" value={w?.updatedAt ? new Date(w.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"} />
                    </div>
                  )}

                  {/* KABUPATEN (provinsi only) */}
                  {activeTab === "kabupaten" && type === "provinsi" && (
                    <div>
                      <p className="text-xs text-slate-500 mb-3 bg-blue-50 border border-blue-100 rounded-lg p-2">
                        💡 Klik nama kabupaten/kota untuk melihat daftar pengurus di wilayah tersebut
                      </p>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-bold text-slate-600 uppercase">Kode</th>
                              <th className="px-3 py-2 text-left text-xs font-bold text-slate-600 uppercase">Nama</th>
                              <th className="px-3 py-2 text-left text-xs font-bold text-slate-600 uppercase">Ketua</th>
                              <th className="px-3 py-2 text-center text-xs font-bold text-slate-600 uppercase">Pengurus</th>
                              <th className="px-3 py-2 text-center text-xs font-bold text-slate-600 uppercase">Status</th>
                              <th className="px-3 py-2 text-center text-xs font-bold text-slate-600 uppercase">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {data.kabupatenList?.map((k: any) => (
                              <tr key={k.id} className="hover:bg-slate-50">
                                <td className="px-3 py-2 text-xs font-mono text-slate-600">{k.kode}</td>
                                <td className="px-3 py-2 text-sm font-semibold text-blue-950">{k.nama}</td>
                                <td className="px-3 py-2 text-sm text-slate-600">{k.ketua || "-"}</td>
                                <td className="px-3 py-2 text-center text-sm font-bold text-violet-600">{k.jumlahPengurus}</td>
                                <td className="px-3 py-2 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold border ${statusBadge(k.status)}`}>{k.status}</span>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <button
                                    onClick={() => {
                                      onClose();
                                      onNavigateToPengurus?.({
                                        provinsiNama: w?.nama,
                                        kabupatenNama: k.nama,
                                        level: "Kabupaten",
                                      });
                                    }}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md border border-blue-200"
                                    title={`Lihat pengurus di ${k.nama}`}
                                  >
                                    <ExternalLink className="w-3 h-3" /> Lihat Pengurus
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {(!data.kabupatenList || data.kabupatenList.length === 0) && (
                              <tr><td colSpan={6} className="px-3 py-8 text-center text-sm text-slate-400">Belum ada kabupaten/kota</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  {activeTab === "kabupaten" && type === "kabupaten" && (
                    <p className="text-sm text-slate-500 text-center py-8">Tab ini hanya tersedia untuk Provinsi</p>
                  )}

                  {/* PENGURUS */}
                  {activeTab === "pengurus" && (
                    <div className="space-y-2">
                      {data.pengurusList?.map((p: any) => (
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
                              (p.level || "").toLowerCase() === "nasional" ? "bg-violet-100 text-violet-700" :
                              (p.level || "").toLowerCase() === "provinsi" ? "bg-blue-100 text-blue-700" : "bg-cyan-100 text-cyan-700"
                            }`}>{p.level}</span>
                            <div className={`text-[9px] mt-1 ${p.status === "Aktif" ? "text-emerald-600" : "text-slate-400"}`}>{p.status}</div>
                          </div>
                        </div>
                      ))}
                      {(!data.pengurusList || data.pengurusList.length === 0) && (
                        <p className="text-sm text-slate-400 text-center py-8">Belum ada pengurus</p>
                      )}
                    </div>
                  )}

                  {/* STATISTIK */}
                  {activeTab === "statistik" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <StatCard label="Total Pengurus" value={s?.totalPengurus || 0} color="from-violet-500 to-purple-500" icon={UserCog} />
                        <StatCard label="Pengurus Aktif" value={s?.pengurusAktif || 0} color="from-emerald-500 to-teal-500" icon={CheckCircle2} />
                        {type === "provinsi" && <StatCard label="Kabupaten" value={s?.totalKabupaten || 0} color="from-cyan-500 to-blue-500" icon={Building2} />}
                      </div>

                      {/* Monthly growth bar chart */}
                      <div className="bg-slate-50 rounded-2xl p-5">
                        <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-600" /> Pertumbuhan Pengurus (6 Bulan)
                        </h4>
                        <div className="flex items-end gap-3 h-40">
                          {s?.monthlyGrowth?.map((m: any, idx: number) => {
                            const maxVal = Math.max(...(s?.monthlyGrowth?.map((g: any) => g.jumlah) || [1]), 1);
                            return (
                              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-xs font-bold text-blue-600">{m.jumlah}</span>
                                <div className="w-full flex-1 flex items-end">
                                  <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(m.jumlah / maxVal) * 100}%` }}
                                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                                    className="w-full bg-gradient-to-t from-blue-600 to-sky-400 rounded-t-lg min-h-[4px]"
                                  />
                                </div>
                                <span className="text-[10px] text-slate-500">{m.bulan}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Distribution */}
                      <div className="bg-slate-50 rounded-2xl p-5">
                        <h4 className="text-sm font-bold text-slate-700 mb-4">Distribusi Status Pengurus</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center p-3 bg-white rounded-xl">
                            <div className="text-2xl font-bold text-emerald-600">{s?.pengurusAktif || 0}</div>
                            <div className="text-xs text-slate-500">Pengurus Aktif</div>
                          </div>
                          <div className="text-center p-3 bg-white rounded-xl">
                            <div className="text-2xl font-bold text-slate-400">{(s?.totalPengurus || 0) - (s?.pengurusAktif || 0)}</div>
                            <div className="text-xs text-slate-500">Nonaktif / Selesai</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ACTIVITY */}
                  {activeTab === "activity" && (
                    <div className="space-y-3">
                      {data.activity?.map((a: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                            <Activity className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-800">{a.aksi}</div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {new Date(a.tanggal).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} • oleh {a.oleh}
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!data.activity || data.activity.length === 0) && (
                        <p className="text-sm text-slate-400 text-center py-8">Belum ada aktivitas</p>
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

function StatCard({ label, value, color, icon: Icon }: { label: string; value: number; color: string; icon: any }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-slate-100">
      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-2`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-2xl font-extrabold text-blue-950">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
