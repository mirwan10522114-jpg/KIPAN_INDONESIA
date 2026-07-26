"use client";

import { useState } from "react";
import { Plus, Search, Eye, ArrowRight, Clock } from "lucide-react";
import { PENDAFTARAN_LIST, STATUS_PENDAFTARAN_FLOW } from "@/lib/admin-data";

export default function PendaftaranPage({ onVerify }: { onVerify: (id: number) => void }) {
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [search, setSearch] = useState("");

  const filtered = PENDAFTARAN_LIST.filter((p) => {
    const matchStatus = statusFilter === "Semua" || p.status === statusFilter;
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const statusCount = (status: string) =>
    status === "Semua"
      ? PENDAFTARAN_LIST.length
      : PENDAFTARAN_LIST.filter((p) => p.status === status).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-blue-950">Pendaftaran Baru</h1>
        <p className="text-slate-500 text-sm mt-1">Kelola calon anggota KIPAN yang mendaftar</p>
      </div>

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
        {["Semua", "Draft", "Diajukan", "Diverifikasi", "Disetujui", "Ditolak", "Perbaikan"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
              statusFilter === s ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {s} ({statusCount(s)})
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
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Nama</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Kabupaten</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Tanggal Daftar</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Dokumen</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Status</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((p) => {
              const uploadedDocs = p.dokumen.filter((d) => d.uploaded).length;
              const totalDocs = p.dokumen.length;
              return (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <img src={p.foto} alt={p.nama} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <div className="text-sm font-semibold text-blue-950">{p.nama}</div>
                        <div className="text-xs text-slate-500">{p.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    <div>{p.kabupaten}</div>
                    <div className="text-xs text-slate-400">{p.provinsi}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.tanggalDaftar}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-semibold ${
                      uploadedDocs === totalDocs ? "text-emerald-600" : "text-amber-600"
                    }`}>
                      {uploadedDocs}/{totalDocs}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      p.status === "Disetujui" ? "bg-emerald-100 text-emerald-700" :
                      p.status === "Ditolak" ? "bg-rose-100 text-rose-700" :
                      p.status === "Diverifikasi" ? "bg-blue-100 text-blue-700" :
                      p.status === "Perbaikan" ? "bg-amber-100 text-amber-700" :
                      p.status === "Diajukan" ? "bg-cyan-100 text-cyan-700" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {p.status}
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
