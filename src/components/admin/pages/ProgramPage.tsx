"use client";

import { Plus, Calendar, MapPin, User, Edit, Trash2 } from "lucide-react";
import { PROGRAM_KERJA_LIST } from "@/lib/admin-data";

export default function ProgramPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Program Kerja</h1>
          <p className="text-slate-500 text-sm mt-1">{PROGRAM_KERJA_LIST.length} program kerja terdaftar</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Tambah Program
        </button>
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
            {PROGRAM_KERJA_LIST.map((p) => (
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
