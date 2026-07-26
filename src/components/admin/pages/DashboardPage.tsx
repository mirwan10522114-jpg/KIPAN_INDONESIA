"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Clock,
  UserCog,
  TrendingUp,
  MapPin,
  Building2,
  RefreshCw,
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Memuat data...</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 h-32">
              <div className="w-11 h-11 rounded-xl bg-slate-200 animate-pulse mb-3" />
              <div className="h-8 bg-slate-200 animate-pulse rounded mb-2 w-20" />
              <div className="h-3 bg-slate-200 animate-pulse rounded w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = data.stats;
  const statCards = [
    { label: "Total Anggota", value: stats.totalAnggota.toLocaleString("id-ID"), icon: Users, color: "from-blue-500 to-sky-500", change: `${stats.anggotaAktif} aktif` },
    { label: "Anggota Baru", value: stats.anggotaBaru.toString(), icon: UserPlus, color: "from-emerald-500 to-teal-500", change: "Bulan ini" },
    { label: "Menunggu Verifikasi", value: stats.menungguVerifikasi.toString(), icon: Clock, color: "from-amber-500 to-orange-500", change: "Perlu tindakan" },
    { label: "Total Pengurus", value: stats.totalPengurus.toString(), icon: UserCog, color: "from-violet-500 to-purple-500", change: `${stats.totalProvinsi} provinsi` },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Selamat Datang, Super Admin! 👋</h1>
          <p className="text-slate-500 text-sm mt-1">
            Ringkasan sistem keanggotaan KIPAN Indonesia per{" "}
            {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Anggota per provinsi */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <h3 className="font-bold text-blue-950 mb-4">Anggota per Provinsi (Top 8)</h3>
          <div className="space-y-3">
            {data.anggotaPerProvinsi.slice(0, 8).map((p: any, idx: number) => {
              const maxAnggota = Math.max(...data.anggotaPerProvinsi.map((x: any) => x.jumlah));
              return (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-6">#{idx + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{p.nama}</span>
                      <span className="text-xs font-bold text-blue-600">{p.jumlah.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(p.jumlah / maxAnggota) * 100}%` }}
                        transition={{ delay: idx * 0.1, duration: 0.6 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-sky-400"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {data.anggotaPerProvinsi.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">Belum ada data anggota</p>
            )}
          </div>
        </motion.div>

        {/* Recent pendaftaran */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <h3 className="font-bold text-blue-950 mb-4">Pendaftaran Terbaru</h3>
          <ul className="space-y-3">
            {data.recentPendaftaran.map((p: any, idx: number) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700 leading-snug">
                    <strong>{p.nama}</strong> mendaftar dari {p.kabupaten || "wilayah"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(p.waktu).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} • {p.status}
                  </p>
                </div>
              </li>
            ))}
            {data.recentPendaftaran.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">Belum ada pendaftaran terbaru</p>
            )}
          </ul>
        </motion.div>
      </div>

      {/* Wilayah stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Provinsi Terdaftar", value: stats.totalProvinsi, total: 38, icon: MapPin, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Kabupaten/Kota Terdaftar", value: stats.totalKabupaten, total: 514, icon: Building2, color: "text-sky-600", bg: "bg-sky-50" },
          { label: "Coverage Wilayah", value: `${Math.round((stats.totalKabupaten / 514) * 100)}%`, total: "100%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
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

      {/* Status distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
      >
        <h3 className="font-bold text-blue-950 mb-4">Distribusi Status Anggota</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Aktif", value: data.anggotaByStatus.AKTIF || 0, color: "bg-emerald-500" },
            { label: "Nonaktif", value: data.anggotaByStatus.NONAKTIF || 0, color: "bg-slate-400" },
            { label: "Mengundurkan Diri", value: data.anggotaByStatus.MENGUNDURKAN_DIRI || 0, color: "bg-amber-500" },
            { label: "Diberhentikan", value: data.anggotaByStatus.DIBERHENTIKAN || 0, color: "bg-rose-500" },
            { label: "Meninggal", value: data.anggotaByStatus.MENINGGAL || 0, color: "bg-slate-600" },
          ].map((s, idx) => (
            <div key={idx} className="text-center p-3 bg-slate-50 rounded-xl">
              <div className={`w-3 h-3 ${s.color} rounded-full mx-auto mb-2`} />
              <div className="text-xl font-bold text-blue-950">{s.value}</div>
              <div className="text-[10px] text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
