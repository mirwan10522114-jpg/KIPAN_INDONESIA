"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Building2, Users, UserCog, Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import { PROVINSI_LIST, KABUPATEN_LIST } from "@/lib/admin-data";

export default function WilayahPage() {
  const [tab, setTab] = useState<"provinsi" | "kabupaten">("provinsi");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");

  const filteredProv = PROVINSI_LIST.filter((p) => {
    const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "Semua" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });
  const filteredKab = KABUPATEN_LIST.filter((k) => {
    const matchSearch = k.nama.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "Semua" || k.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Master Wilayah</h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola data provinsi dan kabupaten/kota se-Indonesia
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          Tambah Wilayah
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 w-fit">
        <button
          onClick={() => setTab("provinsi")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "provinsi"
              ? "bg-blue-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <MapPin className="w-4 h-4 inline mr-1.5" />
          Provinsi ({PROVINSI_LIST.length})
        </button>
        <button
          onClick={() => setTab("kabupaten")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === "kabupaten"
              ? "bg-blue-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Building2 className="w-4 h-4 inline mr-1.5" />
          Kabupaten/Kota ({KABUPATEN_LIST.length})
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari wilayah..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
        >
          <option value="Semua">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Pembentukan">Pembentukan</option>
        </select>
        <span className="text-xs text-slate-500">
          {tab === "provinsi" ? `${filteredProv.length} dari ${PROVINSI_LIST.length}` : `${filteredKab.length} dari ${KABUPATEN_LIST.length}`} wilayah
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          {tab === "provinsi" ? (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Kode</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Nama Provinsi</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Kabupaten</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Anggota</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Pengurus</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Ketua</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProv.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-mono text-slate-600">{p.kode}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-blue-950">{p.nama}</td>
                    <td className="px-4 py-3 text-sm text-center text-slate-600">{p.jumlahKabupaten}</td>
                    <td className="px-4 py-3 text-sm text-center font-semibold text-blue-600">{p.jumlahAnggota.toLocaleString("id-ID")}</td>
                    <td className="px-4 py-3 text-sm text-center text-slate-600">{p.jumlahPengurus}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{p.ketua}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        p.status === "Aktif" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Lihat"><Eye className="w-4 h-4" /></button>
                        <button className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded" title="Edit"><Edit className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Nama Kabupaten/Kota</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Provinsi</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Anggota</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Pengurus</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Ketua</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredKab.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-semibold text-blue-950">{k.nama}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{k.provinsiNama}</td>
                    <td className="px-4 py-3 text-sm text-center font-semibold text-blue-600">{k.jumlahAnggota}</td>
                    <td className="px-4 py-3 text-sm text-center text-slate-600">{k.jumlahPengurus}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{k.ketua}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        k.status === "Aktif" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {k.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Lihat"><Eye className="w-4 h-4" /></button>
                        <button className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded" title="Edit"><Edit className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
