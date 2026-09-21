"use client";

import { useState, useEffect } from "react";
import { Shield, Users, Check, RefreshCw } from "lucide-react";

interface UserItem {
  id: string;
  role: string;
}

const ROLES_CONFIG = [
  {
    id: "SUPER_ADMIN",
    nama: "Super Admin",
    deskripsi: "Akses penuh ke seluruh modul, manajemen user, dan konfigurasi database",
    color: "from-rose-500 to-pink-500",
    permissions: [
      "Semua Hak Akses Sistem",
      "Manajemen User (Semua Role)",
      "Konfigurasi Wilayah & Master Data",
      "Verifikasi Pendaftaran Nasional",
      "Kelola Konten & Berita",
      "Export Laporan Seluruh Indonesia",
    ],
  },
  {
    id: "ADMIN_NASIONAL",
    nama: "Admin Nasional (DPP)",
    deskripsi: "Pengelolaan operasional SIM-KIPAN tingkat pusat / dewan pimpinan pusat",
    color: "from-blue-600 to-sky-500",
    permissions: [
      "Pengelolaan Pengurus Nasional",
      "Verifikasi Anggota Nasional",
      "Kelola Berita, Galeri & Program DPP",
      "Laporan Kepengurusan Nasional",
      "Monitoring Wilayah DPW & DPD",
    ],
  },
  {
    id: "ADMIN_PROVINSI",
    nama: "Admin Provinsi (DPW)",
    deskripsi: "Pengelolaan anggota & pengurus pada tingkat provinsi tertentu",
    color: "from-emerald-500 to-teal-500",
    permissions: [
      "Pengelolaan Pengurus DPW Provinsi",
      "Verifikasi Pendaftaran Tingkat Provinsi",
      "Kelola Berita & Program DPW",
      "Laporan Kepengurusan Provinsi Terkait",
    ],
  },
  {
    id: "ADMIN_KABUPATEN",
    nama: "Admin Kota/Kabupaten (DPD)",
    deskripsi: "Pengelolaan anggota & pengurus pada tingkat kota/kabupaten tertentu",
    color: "from-amber-500 to-orange-500",
    permissions: [
      "Pengelolaan Pengurus DPD Kab/Kota",
      "Verifikasi Pendaftaran Tingkat Kab/Kota",
      "Kelola Kegiatan Daerah",
      "Laporan Kepengurusan Kab/Kota Terkait",
    ],
  },
];

export default function RolePage() {
  const [userCounts, setUserCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const counts: Record<string, number> = {};
        for (const u of json.data as UserItem[]) {
          counts[u.role] = (counts[u.role] || 0) + 1;
        }
        setUserCounts(counts);
      }
    } catch (err) {
      console.error("Gagal mengambil data user:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Role & Hak Akses</h1>
          <p className="text-slate-500 text-sm mt-1">
            Daftar role kepengurusan berjenjang dan hak akses SIM-KIPAN
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Perbarui Data
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {ROLES_CONFIG.map((r) => {
          const count = userCounts[r.id] ?? 0;
          return (
            <div key={r.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 transition-all hover:shadow-md">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center shadow-md mb-3`}>
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-extrabold text-blue-950">
                {loading ? "..." : count}
              </div>
              <div className="text-sm font-semibold text-slate-700 mt-1">{r.nama}</div>
              <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{r.deskripsi}</div>
            </div>
          );
        })}
      </div>

      {/* Detail table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-blue-950">Detail Matriks Hak Akses</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Role & Tingkatan</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Pengguna Terdaftar</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Cakupan Hak Akses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ROLES_CONFIG.map((r) => {
                const count = userCounts[r.id] ?? 0;
                return (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-bold text-blue-950">{r.nama}</div>
                      <div className="text-xs text-slate-500">{r.deskripsi}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                        <Users className="w-3.5 h-3.5" />
                        {loading ? "..." : `${count} User`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {r.permissions.map((perm, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium">
                            <Check className="w-3 h-3 text-emerald-600" />
                            {perm}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
