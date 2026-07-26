"use client";

import { useState } from "react";
import { Plus, Search, Eye, Edit, UserCog, Trash2 } from "lucide-react";
import { PENGURUS_LIST } from "@/lib/admin-data";

export default function PengurusPage() {
  const [filter, setFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [search, setSearch] = useState("");

  const filtered = PENGURUS_LIST.filter((p) => {
    const matchLevel = filter === "Semua" || p.level === filter;
    const matchStatus = statusFilter === "Semua" || p.status === statusFilter;
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase()) ||
      p.jabatan.toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Manajemen Pengurus</h1>
          <p className="text-slate-500 text-sm mt-1">Total {PENGURUS_LIST.length} pengurus terdaftar</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Tambah Pengurus
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {["Semua", "Nasional", "Provinsi", "Kabupaten"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                filter === f ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
        >
          <option value="Semua">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Nonaktif">Nonaktif</option>
        </select>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pengurus..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
          />
        </div>
        <span className="text-xs text-slate-500">{filtered.length} dari {PENGURUS_LIST.length} pengurus</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Foto</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Nama</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Jabatan</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Level</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Wilayah</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Status</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <img src={p.foto} alt={p.nama} className="w-10 h-10 rounded-full object-cover border-2 border-blue-100" />
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm font-semibold text-blue-950">{p.nama}</div>
                  <div className="text-xs text-slate-500">{p.email}</div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700">{p.jabatan}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    p.level === "Nasional" ? "bg-violet-100 text-violet-700" :
                    p.level === "Provinsi" ? "bg-blue-100 text-blue-700" :
                    "bg-cyan-100 text-cyan-700"
                  }`}>
                    {p.level}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{p.wilayah}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    p.status === "Aktif" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Eye className="w-4 h-4" /></button>
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
