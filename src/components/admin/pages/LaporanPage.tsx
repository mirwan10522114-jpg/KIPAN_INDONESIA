"use client";

import { Download, FileText, Filter } from "lucide-react";

export default function LaporanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-blue-950">Laporan Keanggotaan</h1>
        <p className="text-slate-500 text-sm mt-1">Generate dan export laporan keanggotaan KIPAN</p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-blue-950">Filter Laporan</h3>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Provinsi</label>
            <select className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500">
              <option>Semua Provinsi</option>
              <option>DKI Jakarta</option>
              <option>Jawa Barat</option>
              <option>Jawa Tengah</option>
              <option>Jawa Timur</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kabupaten/Kota</label>
            <select className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500">
              <option>Semua Kabupaten</option>
              <option>Bandung Barat</option>
              <option>Bandung</option>
              <option>Jakarta Selatan</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tahun</label>
            <select className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500">
              <option>2025</option>
              <option>2024</option>
              <option>2023</option>
              <option>Semua Tahun</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white text-sm font-semibold rounded-lg hover:bg-rose-700">
            <FileText className="w-4 h-4" /> Export PDF
          </button>
          <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700">
            <Download className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Anggota", value: "12.580" },
          { label: "Anggota Baru (2025)", value: "595" },
          { label: "Pendaftaran Pending", value: "45" },
          { label: "Pelatihan Selesai", value: "24" },
        ].map((s, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="text-3xl font-extrabold text-blue-950">{s.value}</div>
            <div className="text-sm text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Preview table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-blue-950">Preview Laporan</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Provinsi</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Kabupaten</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Anggota</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Pengurus</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Baru 2025</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { p: "Jawa Barat", k: 27, a: 2450, p: 110, b: 120 },
                { p: "DKI Jakarta", k: 6, a: 1850, p: 78, b: 95 },
                { p: "Jawa Timur", k: 38, a: 2150, p: 105, b: 110 },
                { p: "Jawa Tengah", k: 35, a: 1980, p: 92, b: 88 },
                { p: "Banten", k: 8, a: 980, p: 42, b: 45 },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-semibold text-blue-950">{row.p}</td>
                  <td className="px-4 py-3 text-sm text-center text-slate-600">{row.k}</td>
                  <td className="px-4 py-3 text-sm text-center font-semibold text-blue-600">{row.a.toLocaleString("id-ID")}</td>
                  <td className="px-4 py-3 text-sm text-center text-slate-600">{row.p}</td>
                  <td className="px-4 py-3 text-sm text-center text-emerald-600 font-semibold">+{row.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
