"use client";

import { useState } from "react";
import { Plus, Calendar, Edit, Trash2, Search } from "lucide-react";
import { PROGRAM_KERJA_LIST } from "@/lib/admin-data";

export default function ProgramPage() {
  const [tingkatFilter, setTingkatFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [search, setSearch] = useState("");

  const filtered = PROGRAM_KERJA_LIST.filter((p) => {
    const matchTingkat = tingkatFilter === "Semua" || p.tingkat === tingkatFilter;
    const matchStatus = statusFilter === "Semua" || p.status === statusFilter;
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase()) ||
      (p.pic || "").toLowerCase().includes(search.toLowerCase());
    return matchTingkat && matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Program Kerja</h1>
          <p className="text-slate-500 text-sm mt-1">{filtered.length} dari {PROGRAM_KERJA_LIST.length} program kerja</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Tambah Program
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={tingkatFilter}
          onChange={(e) => setTingkatFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
        >
          <option value="Semua">Semua Tingkat</option>
          <option value="Nasional">Nasional</option>
          <option value="Provinsi">Provinsi</option>
          <option value="Kabupaten">Kabupaten</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
        >
          <option value="Semua">Semua Status</option>
          <option value="Direncanakan">Direncanakan</option>
          <option value="Berjalan">Berjalan</option>
          <option value="Selesai">Selesai</option>
        </select>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama program atau PIC..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Nama Program</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Tingkat</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Periode</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">PIC</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Status</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm font-semibold text-blue-950">{p.nama}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    p.tingkat === "Nasional" ? "bg-violet-100 text-violet-700" :
                    p.tingkat === "Provinsi" ? "bg-blue-100 text-blue-700" :
                    "bg-cyan-100 text-cyan-700"
                  }`}>{p.tingkat}</span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">
                  <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {p.tanggalMulai} → {p.tanggalSelesai}</div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{p.pic}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    p.status === "Berjalan" ? "bg-emerald-100 text-emerald-700" :
                    p.status === "Selesai" ? "bg-slate-100 text-slate-600" :
                    "bg-amber-100 text-amber-700"
                  }`}>{p.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded"><Edit className="w-4 h-4" /></button>
                    <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
