"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  UserCog,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  History,
  Users,
  Info,
  Edit,
  Shield,
  ExternalLink,
} from "lucide-react";
import type { Pengurus } from "@/lib/admin-data";

const TABS = [
  { id: "informasi", label: "Informasi", icon: Info },
  { id: "riwayat", label: "Riwayat Jabatan", icon: History },
  { id: "anggota", label: "Anggota Wilayah", icon: Users },
  { id: "log", label: "Log Aktivitas", icon: FileText },
];

export default function PengurusDetailDialog({
  detail,
  onClose,
  onEdit,
}: {
  detail: Pengurus | null;
  onClose: () => void;
  onEdit?: () => void;
}) {
  const [activeTab, setActiveTab] = useState("informasi");

  if (!detail) return null;

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Aktif: "bg-emerald-100 text-emerald-700 border-emerald-200",
      Nonaktif: "bg-slate-100 text-slate-600 border-slate-200",
      Dibekukan: "bg-rose-100 text-rose-700 border-rose-200",
    };
    return styles[status] || "bg-slate-100 text-slate-600 border-slate-200";
  };

  const levelBadge = (level: string) => {
    const styles: Record<string, string> = {
      Nasional: "bg-violet-100 text-violet-700",
      Provinsi: "bg-blue-100 text-blue-700",
      Kabupaten: "bg-cyan-100 text-cyan-700",
    };
    return styles[level] || "bg-slate-100 text-slate-600";
  };

  const mockRiwayat = [
    { tanggal: "2020-01-15", jabatan: detail.jabatan, wilayah: detail.wilayah, sk: detail.nomorSK, status: "Aktif" },
    { tanggal: "2017-01-20", jabatan: "Wakil " + detail.jabatan, wilayah: detail.wilayah, sk: "SK-OLD/2017", status: "Selesai" },
  ];

  const mockAnggota = [
    { nia: `KIPAN-XX-2024-0001`, nama: "Anggota 1", status: "AKTIF" },
    { nia: `KIPAN-XX-2024-0002`, nama: "Anggota 2", status: "AKTIF" },
    { nia: `KIPAN-XX-2024-0003`, nama: "Anggota 3", status: "NONAKTIF" },
  ];

  const mockLog = [
    { tanggal: "2025-01-15 10:30", aksi: "Login ke sistem", oleh: detail.nama },
    { tanggal: "2025-01-10 14:00", aksi: "Memperbarui data anggota", oleh: detail.nama },
    { tanggal: "2024-12-20 09:15", aksi: "Menambahkan berita baru", oleh: detail.nama },
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
                <img
                  src={detail.foto}
                  alt={detail.nama}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-white/30"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${levelBadge(detail.level)}`}>
                      {detail.level}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge(detail.status)} bg-white`}>
                      {detail.status}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold">{detail.nama}</h2>
                  <p className="text-blue-100 text-sm mt-1">{detail.jabatan}</p>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      <span>{detail.wilayah}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4" />
                      <span>{detail.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4" />
                      <span>{detail.hp}</span>
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
            <div className="flex border-b border-slate-100 sticky top-0 bg-white z-10 overflow-x-auto">
              {TABS.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
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
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Biodata</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <InfoRow label="Nama Lengkap" value={detail.nama} />
                      <InfoRow label="Tempat Lahir" value={detail.tempatLahir || "-"} />
                      <InfoRow label="Tanggal Lahir" value={detail.tanggalLahir ? new Date(detail.tanggalLahir).toLocaleDateString("id-ID") : "-"} />
                      <InfoRow label="Alamat" value={detail.alamat || "-"} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Jabatan</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <InfoRow label="Jabatan" value={detail.jabatan} />
                      <InfoRow label="Level" value={detail.level} />
                      <InfoRow label="Wilayah" value={detail.wilayah} />
                      <InfoRow label="Status" value={detail.status} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Masa Jabatan & SK</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <InfoRow label="Mulai Jabatan" value={new Date(detail.tanggalMulai).toLocaleDateString("id-ID")} />
                      <InfoRow label="Berakhir" value={detail.tanggalSelesai ? new Date(detail.tanggalSelesai).toLocaleDateString("id-ID") : "-"} />
                      <div className="col-span-2">
                        <div className="text-xs text-slate-500 mb-1">Nomor SK</div>
                        <a
                          href={detail.fileSK || "#"}
                          onClick={(e) => e.preventDefault()}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          <FileText className="w-4 h-4" />
                          {detail.nomorSK}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Kontak</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <InfoRow label="Email" value={detail.email} />
                      <InfoRow label="No. HP" value={detail.hp} />
                    </div>
                  </div>
                </div>
              )}

              {/* Riwayat Jabatan */}
              {activeTab === "riwayat" && (
                <div className="space-y-3">
                  {mockRiwayat.map((r, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-800">{r.jabatan}</div>
                        <div className="text-xs text-slate-500 mt-0.5">Wilayah: {r.wilayah}</div>
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <span className="text-slate-500">Periode: {new Date(r.tanggal).toLocaleDateString("id-ID")}</span>
                          <span className="text-slate-500">SK: {r.sk}</span>
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${
                            r.status === "Aktif" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                          }`}>{r.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Anggota Wilayah */}
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
                            }`}>{a.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-xs text-slate-400 mt-3 text-center">
                    Menampilkan 3 dari {detail.level === "Nasional" ? "12.580" : "320"} anggota
                  </p>
                </div>
              )}

              {/* Log Aktivitas */}
              {activeTab === "log" && (
                <div className="space-y-3">
                  {mockLog.map((l, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-800">{l.aksi}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{l.tanggal} • oleh {l.oleh}</div>
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
