"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Building2,
  Users,
  UserCog,
  Calendar,
  Shield,
  History,
  Info,
  Edit,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export interface WilayahDetail {
  id: number;
  kode: string;
  nama: string;
  status: string;
  ketua: string;
  jumlahKabupaten?: number;
  jumlahAnggota: number;
  jumlahPengurus: number;
  provinsiNama?: string;
  createdAt: string;
  updatedAt: string;
}

const TABS = [
  { id: "informasi", label: "Informasi", icon: Info },
  { id: "pengurus", label: "Pengurus", icon: UserCog },
  { id: "anggota", label: "Anggota", icon: Users },
  { id: "riwayat", label: "Riwayat", icon: History },
];

export default function WilayahDetailDialog({
  detail,
  type, // "provinsi" | "kabupaten"
  onClose,
  onEdit,
}: {
  detail: WilayahDetail | null;
  type: "provinsi" | "kabupaten";
  onClose: () => void;
  onEdit?: () => void;
}) {
  const [activeTab, setActiveTab] = useState("informasi");

  if (!detail) return null;

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Aktif: "bg-emerald-100 text-emerald-700 border-emerald-200",
      Pembentukan: "bg-amber-100 text-amber-700 border-amber-200",
      Nonaktif: "bg-slate-100 text-slate-600 border-slate-200",
      Dibekukan: "bg-rose-100 text-rose-700 border-rose-200",
    };
    return styles[status] || "bg-slate-100 text-slate-600 border-slate-200";
  };

  // Mock data for tabs
  const mockPengurus = [
    { nama: detail.ketua, jabatan: type === "provinsi" ? "Ketua Provinsi" : "Ketua Kabupaten", status: "Aktif" },
    { nama: "Wakil Ketua", jabatan: "Wakil", status: "Aktif" },
    { nama: "Sekretaris", jabatan: "Sekretaris", status: "Aktif" },
  ];

  const mockAnggota = [
    { nia: `KIPAN-${detail.kode}-2024-00001`, nama: "Anggota 1", status: "AKTIF" },
    { nia: `KIPAN-${detail.kode}-2024-00002`, nama: "Anggota 2", status: "AKTIF" },
    { nia: `KIPAN-${detail.kode}-2024-00003`, nama: "Anggota 3", status: "NONAKTIF" },
  ];

  const mockRiwayat = [
    { tanggal: "2024-01-15 10:30", aksi: "Wilayah dibuat", oleh: "Super Admin" },
    { tanggal: "2024-03-20 14:00", aksi: "Ketua diperbarui", oleh: "Admin Nasional" },
    { tanggal: "2024-06-10 09:15", aksi: "Status diubah menjadi Aktif", oleh: "Super Admin" },
  ];

  return (
    <AnimatePresence>
      {detail && (
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
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 to-sky-500 p-6 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  {type === "provinsi" ? (
                    <MapPin className="w-8 h-8" />
                  ) : (
                    <Building2 className="w-8 h-8" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded">
                      {detail.kode}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge(detail.status)} bg-white`}>
                      {detail.status}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold">{detail.nama}</h2>
                  {detail.provinsiNama && (
                    <p className="text-blue-100 text-sm mt-1">Provinsi: {detail.provinsiNama}</p>
                  )}
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4" />
                      <span>Ketua: {detail.ketua || "-"}</span>
                    </div>
                    {detail.jumlahKabupaten !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4" />
                        <span>{detail.jumlahKabupaten} Kabupaten/Kota</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      <span>{detail.jumlahAnggota} Anggota</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UserCog className="w-4 h-4" />
                      <span>{detail.jumlahPengurus} Pengurus</span>
                    </div>
                  </div>
                </div>
              </div>
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100 sticky top-0 bg-white z-10">
              {TABS.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
                      activeTab === t.id
                        ? "text-blue-600 border-blue-600"
                        : "text-slate-500 border-transparent hover:text-blue-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Informasi */}
              {activeTab === "informasi" && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <InfoRow label="Kode" value={detail.kode} />
                  <InfoRow label="Nama" value={detail.nama} />
                  <InfoRow label="Tipe" value={type === "provinsi" ? "Provinsi" : "Kabupaten/Kota"} />
                  <InfoRow label="Status" value={detail.status} />
                  {detail.provinsiNama && (
                    <InfoRow label="Provinsi" value={detail.provinsiNama} />
                  )}
                  <InfoRow label="Ketua" value={detail.ketua || "-"} />
                  {detail.jumlahKabupaten !== undefined && (
                    <InfoRow label="Jumlah Kabupaten" value={String(detail.jumlahKabupaten)} />
                  )}
                  <InfoRow label="Jumlah Anggota" value={String(detail.jumlahAnggota)} />
                  <InfoRow label="Jumlah Pengurus" value={String(detail.jumlahPengurus)} />
                  <InfoRow label="Dibuat" value={new Date(detail.createdAt).toLocaleDateString("id-ID")} />
                  <InfoRow label="Diperbarui" value={new Date(detail.updatedAt).toLocaleDateString("id-ID")} />
                </div>
              )}

              {/* Pengurus */}
              {activeTab === "pengurus" && (
                <div className="space-y-2">
                  {mockPengurus.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center text-white text-xs font-bold">
                        {p.nama.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-800">{p.nama}</div>
                        <div className="text-xs text-slate-500">{p.jabatan}</div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        p.status === "Aktif" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Anggota */}
              {activeTab === "anggota" && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-bold text-slate-600">NIA</th>
                        <th className="px-3 py-2 text-left text-xs font-bold text-slate-600">Nama</th>
                        <th className="px-3 py-2 text-center text-xs font-bold text-slate-600">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {mockAnggota.map((a, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-3 py-2 text-xs font-mono text-blue-600">{a.nia}</td>
                          <td className="px-3 py-2 text-sm font-medium text-slate-800">{a.nama}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                              a.status === "AKTIF" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                            }`}>
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-slate-400 mt-3 text-center">
                    Menampilkan 3 dari {detail.jumlahAnggota} anggota
                  </p>
                </div>
              )}

              {/* Riwayat */}
              {activeTab === "riwayat" && (
                <div className="space-y-3">
                  {mockRiwayat.map((r, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                        <History className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-800">{r.aksi}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {r.tanggal} • oleh {r.oleh}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
      <div className="text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}
