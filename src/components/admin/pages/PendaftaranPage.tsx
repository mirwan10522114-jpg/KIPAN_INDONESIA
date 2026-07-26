"use client";

import { useState, useEffect } from "react";
import { Search, Eye, ArrowRight, Clock, RefreshCw } from "lucide-react";
import { STATUS_PENDAFTARAN_FLOW } from "@/lib/admin-data";
import type { Pendaftaran } from "@/lib/admin-data";

export default function PendaftaranPage({ onVerify }: { onVerify: (id: number) => void }) {
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<Pendaftaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/pendaftaran", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error || "Gagal memuat data");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = data.filter((p) => {
    const matchStatus = statusFilter === "Semua" || p.status === statusFilter;
    const matchSearch = p.namaLengkap.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statusCount = (status: string) =>
    status === "Semua" ? data.length : data.filter((p) => p.status === status).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Pendaftaran Baru</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola calon anggota KIPAN yang mendaftar</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {/* Status flow */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-blue-950">Alur Status Pendaftaran</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_PENDAFTARAN_FLOW.map((s, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${s.color}`}>
                {s.status}
              </span>
              {idx < STATUS_PENDAFTARAN_FLOW.length - 1 && (
                <ArrowRight className="w-3 h-3 text-slate-400" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {["Semua", "DIAJUKAN", "DIVERIFIKASI", "DISETUJUI", "DITOLAK", "PERBAIKAN"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
              statusFilter === s ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {s === "Semua" ? "Semua" : s.charAt(0) + s.slice(1).toLowerCase()} ({statusCount(s)})
          </button>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama calon anggota..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Memuat data pendaftaran...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Belum ada data pendaftaran
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Kabupaten</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Tanggal Daftar</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-blue-950">{p.namaLengkap}</div>
                    <div className="text-xs text-slate-500">{p.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    <div>{p.kabupaten?.nama || p.kabupaten || "-"}</div>
                    <div className="text-xs text-slate-400">{p.provinsi?.nama || p.provinsi || "-"}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {new Date(p.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      p.status === "DISETUJUI" ? "bg-emerald-100 text-emerald-700" :
                      p.status === "DITOLAK" ? "bg-rose-100 text-rose-700" :
                      p.status === "DIVERIFIKASI" ? "bg-blue-100 text-blue-700" :
                      p.status === "PERBAIKAN" ? "bg-amber-100 text-amber-700" :
                      p.status === "DIAJUKAN" ? "bg-cyan-100 text-cyan-700" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {p.status === "DIAJUKAN" ? "Diajukan" :
                       p.status === "DIVERIFIKASI" ? "Diverifikasi" :
                       p.status === "DISETUJUI" ? "Disetujui" :
                       p.status === "DITOLAK" ? "Ditolak" :
                       p.status === "PERBAIKAN" ? "Perbaikan" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => onVerify(p.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Verifikasi
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
