"use client";

import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Clock,
  UserCog,
  TrendingUp,
  MapPin,
  Building2,
  UserPlus as UserPlusIcon,
  CheckCircle,
  UserCog as UserCogIcon,
  Newspaper,
  GraduationCap,
  School,
  type LucideIcon,
} from "lucide-react";
import { DASHBOARD_STATS, AKTIVITAS_TERBARU, STATISTIK_BULANAN, PROVINSI_LIST, KABUPATEN_LIST } from "@/lib/admin-data";

const ACTIVITY_ICONS: Record<string, LucideIcon> = {
  UserPlus: UserPlusIcon,
  CheckCircle,
  UserCog: UserCogIcon,
  Newspaper,
  GraduationCap,
  School,
};

export default function DashboardPage() {
  const stats = [
    { label: "Total Anggota", value: DASHBOARD_STATS.totalAnggota.toLocaleString("id-ID"), icon: Users, color: "from-blue-500 to-sky-500", change: "+12% bulan ini" },
    { label: "Anggota Baru", value: DASHBOARD_STATS.anggotaBaru.toString(), icon: UserPlus, color: "from-emerald-500 to-teal-500", change: "+8 minggu ini" },
    { label: "Menunggu Verifikasi", value: DASHBOARD_STATS.menungguVerifikasi.toString(), icon: Clock, color: "from-amber-500 to-orange-500", change: "Perlu tindakan" },
    { label: "Total Pengurus", value: DASHBOARD_STATS.totalPengurus.toString(), icon: UserCog, color: "from-violet-500 to-purple-500", change: "38 provinsi" },
  ];

  const maxBar = Math.max(...STATISTIK_BULANAN.map((s) => s.anggotaBaru));

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-blue-950">Selamat Datang, Super Admin! 👋</h1>
        <p className="text-slate-500 text-sm mt-1">
          Ringkasan sistem keanggotaan KIPAN Indonesia per {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -3 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-extrabold text-blue-950">{stat.value}</div>
              <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              <div className="text-[10px] text-slate-400 mt-2">{stat.change}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-blue-950">Anggota Baru per Bulan</h3>
              <p className="text-xs text-slate-500">7 bulan terakhir</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">+595</div>
              <div className="text-xs text-emerald-600">↑ 23% growth</div>
            </div>
          </div>
          <div className="flex items-end gap-2 h-48">
            {STATISTIK_BULANAN.map((s, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex-1 flex items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(s.anggotaBaru / maxBar) * 100}%` }}
                    transition={{ delay: idx * 0.1, duration: 0.6 }}
                    className="w-full bg-gradient-to-t from-blue-600 to-sky-400 rounded-t-lg relative group cursor-pointer"
                  >
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-950 text-white text-[10px] px-2 py-0.5 rounded">
                      {s.anggotaBaru}
                    </div>
                  </motion.div>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">{s.bulan}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <h3 className="font-bold text-blue-950 mb-4">Aktivitas Terbaru</h3>
          <ul className="space-y-3">
            {AKTIVITAS_TERBARU.map((a) => {
              const Icon = ACTIVITY_ICONS[a.icon] || CheckCircle;
              return (
                <li key={a.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 leading-snug">{a.teks}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{a.waktu}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </motion.div>
      </div>

      {/* Wilayah stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Provinsi Aktif", value: "38", total: "38", icon: MapPin, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Kabupaten/Kota Aktif", value: "480", total: "514", icon: Building2, color: "text-sky-600", bg: "bg-sky-50" },
          { label: "Coverage Wilayah", value: "93%", total: "100%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((s, idx) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-950">
                  {s.value}<span className="text-sm text-slate-400">/{s.total}</span>
                </div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Top Provinces */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
      >
        <h3 className="font-bold text-blue-950 mb-4">Provinsi dengan Anggota Terbanyak</h3>
        <div className="space-y-3">
          {[...PROVINSI_LIST]
            .sort((a, b) => b.jumlahAnggota - a.jumlahAnggota)
            .slice(0, 5)
            .map((p, idx) => {
              const maxAnggota = Math.max(...PROVINSI_LIST.map((x) => x.jumlahAnggota));
              return (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-6">#{idx + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{p.nama}</span>
                      <span className="text-xs font-bold text-blue-600">{p.jumlahAnggota.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(p.jumlahAnggota / maxAnggota) * 100}%` }}
                        transition={{ delay: idx * 0.1, duration: 0.6 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-sky-400"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </motion.div>
    </div>
  );
}
