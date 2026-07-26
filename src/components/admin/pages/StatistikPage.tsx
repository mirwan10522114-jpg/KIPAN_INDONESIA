"use client";

import { Users, MapPin, Building2, CheckCircle2, TrendingUp } from "lucide-react";
import { DASHBOARD_STATS, STATISTIK_BULANAN, PROVINSI_LIST } from "@/lib/admin-data";

export default function StatistikPage() {
  const cards = [
    { label: "Total Nasional", value: DASHBOARD_STATS.totalAnggota.toLocaleString("id-ID"), icon: Users, color: "from-blue-500 to-sky-500" },
    { label: "Provinsi Terdaftar", value: DASHBOARD_STATS.totalProvinsi.toString(), icon: MapPin, color: "from-violet-500 to-purple-500" },
    { label: "Kabupaten/Kota Terdaftar", value: DASHBOARD_STATS.totalKabupaten.toString(), icon: Building2, color: "from-cyan-500 to-blue-500" },
    { label: "Pengurus Aktif", value: "11.820", icon: CheckCircle2, color: "from-emerald-500 to-teal-500" },
  ];

  const maxBar = Math.max(...STATISTIK_BULANAN.map((s) => s.anggotaBaru));
  const maxAnggota = Math.max(...PROVINSI_LIST.map((p) => p.jumlahAnggota));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-blue-950">Statistik Pengurus</h1>
        <p className="text-slate-500 text-sm mt-1">Ringkasan statistik kepengurusan KIPAN Indonesia</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center shadow-md mb-3`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-extrabold text-blue-950">{c.value}</div>
              <div className="text-sm text-slate-500 mt-1">{c.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chart pengurus baru */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-blue-950">Pengurus Baru per Bulan</h3>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex items-end gap-2 h-48">
            {STATISTIK_BULANAN.map((s, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-sky-400 rounded-t-lg flex items-end justify-center pb-1"
                    style={{ height: `${(s.anggotaBaru / maxBar) * 100}%` }}
                  >
                    <span className="text-[10px] font-bold text-white">{s.anggotaBaru}</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">{s.bulan}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top provinsi */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-bold text-blue-950 mb-4">Top 5 Provinsi (Pengurus Terbanyak)</h3>
          <div className="space-y-3">
            {[...PROVINSI_LIST]
              .sort((a, b) => b.jumlahAnggota - a.jumlahAnggota)
              .slice(0, 5)
              .map((p, idx) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-6">#{idx + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{p.nama}</span>
                      <span className="text-xs font-bold text-blue-600">{p.jumlahAnggota.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-sky-400"
                        style={{ width: `${(p.jumlahAnggota / maxAnggota) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Status breakdown */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-blue-950 mb-4">Distribusi Status Pengurus</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Aktif", value: 11820, color: "bg-emerald-500" },
            { label: "Nonaktif", value: 580, color: "bg-slate-400" },
            { label: "Mengundurkan Diri", value: 120, color: "bg-amber-500" },
            { label: "Diberhentikan", value: 60, color: "bg-rose-500" },
          ].map((s, idx) => {
            const total = 12580;
            const pct = ((s.value / total) * 100).toFixed(1);
            return (
              <div key={idx} className="text-center p-4 bg-slate-50 rounded-xl">
                <div className={`w-3 h-3 ${s.color} rounded-full mx-auto mb-2`} />
                <div className="text-2xl font-bold text-blue-950">{s.value.toLocaleString("id-ID")}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
                <div className="text-xs font-semibold text-blue-600 mt-1">{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
