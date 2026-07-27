"use client";

import { Shield, Users, Check } from "lucide-react";
import { ROLE_LIST } from "@/lib/admin-data";

export default function RolePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-blue-950">Role & Permission</h1>
        <p className="text-slate-500 text-sm mt-1">Kelola role dan hak akses pengguna sistem</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {ROLE_LIST.map((r, idx) => (
          <div key={r.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md mb-3 ${
              idx === 0 ? "bg-gradient-to-br from-rose-500 to-pink-500" :
              idx === 1 ? "bg-gradient-to-br from-violet-500 to-purple-500" :
              idx === 2 ? "bg-gradient-to-br from-blue-500 to-sky-500" :
              "bg-gradient-to-br from-cyan-500 to-teal-500"
            }`}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-extrabold text-blue-950">{r.jumlahUser}</div>
            <div className="text-sm font-semibold text-slate-700 mt-1">{r.nama}</div>
            <div className="text-xs text-slate-500 mt-0.5">{r.deskripsi}</div>
          </div>
        ))}
      </div>

      {/* Detail table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-blue-950">Detail Role & Permissions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Role</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Jumlah User</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Hak Akses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ROLE_LIST.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-bold text-blue-950">{r.nama}</div>
                    <div className="text-xs text-slate-500">{r.deskripsi}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                      <Users className="w-3 h-3" />
                      {r.jumlahUser}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {r.permissions.map((perm, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-medium">
                          <Check className="w-2.5 h-2.5" />
                          {perm}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
