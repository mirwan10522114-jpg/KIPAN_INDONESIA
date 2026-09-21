"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Clock,
  UserCog,
  TrendingUp,
  MapPin,
  Building2,
  RefreshCw,
  AlertCircle,
  FileText,
  Newspaper,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Activity,
  Globe,
  Shield,
  Calendar,
  X,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

interface DashboardData {
  stats: {
    totalAnggota: number;
    anggotaAktif: number;
    anggotaBaru: number;
    menungguVerifikasi: number;
    totalPengurus: number;
    totalProvinsi: number;
    totalKabupaten: number;
    totalBerita: number;
    totalGaleri: number;
    totalProgram: number;
  };
  pendaftaranByStatus: Record<string, number>;
  wilayahChart: { nama: string; kode: string; jumlah: number }[];
  wilayahChartLabel: string;
  anggotaByStatus: Record<string, number>;
  recentPendaftaran: {
    id: number;
    nama: string;
    status: string;
    waktu: string;
    kabupaten: string | null;
  }[];
  monthlyTrend?: { bulan: string; baru: number }[];
}

export default function DashboardPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { role, wilayah } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showAllProvinsi, setShowAllProvinsi] = useState(false);
  const [drillDownProv, setDrillDownProv] = useState<string | null>(null);
  const [drillDownData, setDrillDownData] = useState<any>(null);
  const [drillDownLoading, setDrillDownLoading] = useState(false);
  const [trendFilter, setTrendFilter] = useState("7_bulan");

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (role) params.append("role", role);
      if (wilayah) params.append("wilayah", wilayah);
      params.append("trendFilter", trendFilter);
      
      const res = await fetch(`/api/dashboard?${params.toString()}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setLastUpdate(new Date());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!role) return; // Wait for hydration
    fetchData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [trendFilter, role, wilayah]);

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

  // Role helpers
  const isNasionalOrAbove = role === "SUPER_ADMIN" || role === "ADMIN_NASIONAL";
  const isProvinsiOrAbove = isNasionalOrAbove || role === "ADMIN_PROVINSI";

  // Quick actions (priority items) — filter berdasarkan role
  const quickActions = [
    {
      icon: AlertCircle,
      label: `${data.pendaftaranByStatus.DIAJUKAN || 0} Pendaftaran Menunggu Verifikasi`,
      desc: "Perlu ditinjau segera",
      action: "Verifikasi",
      color: "from-amber-500 to-orange-500",
      bgColor: "from-amber-50 to-orange-50",
      borderColor: "border-amber-200",
      iconColor: "text-amber-600",
      count: data.pendaftaranByStatus.DIAJUKAN || 0,
      priority: "high",
      targetPage: "verifikasi",
      show: true, // semua role bisa lihat
    },
    {
      icon: FileText,
      label: `${data.pendaftaranByStatus.PERBAIKAN || 0} Data Perlu Perbaikan`,
      desc: "Calon anggota dengan dokumen kurang",
      action: "Lihat",
      color: "from-blue-500 to-sky-500",
      bgColor: "from-blue-50 to-sky-50",
      borderColor: "border-blue-200",
      iconColor: "text-blue-600",
      count: data.pendaftaranByStatus.PERBAIKAN || 0,
      priority: "medium",
      targetPage: "pendaftaran",
      show: true,
    },
    {
      icon: UserPlus,
      label: "Tambah Pengurus",
      desc: "Input pengurus baru manual",
      action: "Tambah",
      color: "from-emerald-500 to-teal-500",
      bgColor: "from-emerald-50 to-teal-50",
      borderColor: "border-emerald-200",
      iconColor: "text-emerald-600",
      count: null,
      priority: "low",
      targetPage: "pengurus",
      show: true,
    },
    {
      icon: Newspaper,
      label: "Tambah Berita",
      desc: "Publikasikan berita baru",
      action: "Tulis",
      color: "from-violet-500 to-purple-500",
      bgColor: "from-violet-50 to-purple-50",
      borderColor: "border-violet-200",
      iconColor: "text-violet-600",
      count: null,
      priority: "low",
      targetPage: "berita",
      show: isNasionalOrAbove, // hanya SUPER_ADMIN & ADMIN_NASIONAL
    },
  ].filter((a) => a.show);

  // Stat cards (2 rows)
  const statCardsRow1 = [
    { label: "Total Anggota", value: stats.totalAnggota, icon: Users, color: "from-blue-500 to-sky-500", change: `${stats.anggotaAktif} aktif`, targetPage: "anggota" },
    { label: "Anggota Aktif", value: stats.anggotaAktif, icon: CheckCircle2, color: "from-emerald-500 to-teal-500", change: `${Math.round((stats.anggotaAktif / Math.max(stats.totalAnggota, 1)) * 100)}% dari total`, targetPage: "anggota" },
    { label: "Menunggu Verifikasi", value: stats.menungguVerifikasi, icon: Clock, color: "from-amber-500 to-orange-500", change: "Perlu tindakan", targetPage: "verifikasi" },
    { label: "Anggota Baru Bulan Ini", value: stats.anggotaBaru, icon: UserPlus, color: "from-violet-500 to-purple-500", change: "Bulan berjalan", targetPage: "anggota" },
  ];

  const statCardsRow2 = [
    { label: "Total Pengurus", value: stats.totalPengurus, icon: UserCog, color: "from-cyan-500 to-blue-500", change: isNasionalOrAbove ? `${stats.totalProvinsi} provinsi` : "Pengurus aktif", targetPage: "pengurus", show: true },
    { label: "Provinsi Terdaftar", value: stats.totalProvinsi, icon: MapPin, color: "from-sky-500 to-indigo-500", change: "dari 38 provinsi", targetPage: "wilayah", show: isNasionalOrAbove },
    { label: "Kabupaten Terdaftar", value: stats.totalKabupaten, icon: Building2, color: "from-teal-500 to-cyan-500", change: "dari 514 kab/kota", targetPage: "wilayah", show: isProvinsiOrAbove },
    { label: "Coverage Wilayah", value: `${Math.round((stats.totalKabupaten / 514) * 100)}%`, icon: Globe, color: "from-indigo-500 to-violet-500", change: "Nasional", targetPage: "wilayah", show: isNasionalOrAbove },
  ].filter(s => s.show);

  // Format waktu relatif
  const formatRelativeTime = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "Baru saja";
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
  };

  const formatClock = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  // Last update display
  const updateDiff = Math.floor((new Date().getTime() - lastUpdate.getTime()) / 1000);
  const updateText = updateDiff < 60 ? `${updateDiff} detik lalu` : `${Math.floor(updateDiff / 60)} menit lalu`;

  // Status distribution
  const statusDistribution = [
    { label: "Aktif", value: data.anggotaByStatus.Aktif || 0, color: "bg-emerald-500", dot: "bg-emerald-500", textColor: "text-emerald-700" },
    { label: "Nonaktif", value: data.anggotaByStatus.Nonaktif || 0, color: "bg-slate-400", dot: "bg-slate-400", textColor: "text-slate-700" },
    { label: "Mengundurkan Diri", value: data.anggotaByStatus["Mengundurkan Diri"] || 0, color: "bg-amber-500", dot: "bg-amber-500", textColor: "text-amber-700" },
    { label: "Diberhentikan", value: data.anggotaByStatus.Diberhentikan || 0, color: "bg-rose-500", dot: "bg-rose-500", textColor: "text-rose-700" },
    { label: "Meninggal", value: data.anggotaByStatus.Meninggal || 0, color: "bg-slate-600", dot: "bg-slate-600", textColor: "text-slate-800" },
  ];

  // Pendaftaran status summary
  const pendaftaranStatus = [
    { label: "Draft", value: data.pendaftaranByStatus.DRAFT || 0, color: "bg-slate-100 text-slate-600" },
    { label: "Diajukan", value: data.pendaftaranByStatus.DIAJUKAN || 0, color: "bg-cyan-100 text-cyan-700" },
    { label: "Diverifikasi", value: data.pendaftaranByStatus.DIVERIFIKASI || 0, color: "bg-blue-100 text-blue-700" },
    { label: "Perbaikan", value: data.pendaftaranByStatus.PERBAIKAN || 0, color: "bg-amber-100 text-amber-700" },
    { label: "Disetujui", value: data.pendaftaranByStatus.DISETUJUI || 0, color: "bg-emerald-100 text-emerald-700" },
    { label: "Ditolak", value: data.pendaftaranByStatus.DITOLAK || 0, color: "bg-rose-100 text-rose-700" },
  ];

  // Chart data - dari API (adaptif per role)
  const allWilayahData = data.wilayahChart || [];
  const chartLabel = data.wilayahChartLabel || "Anggota per Wilayah";
  const maxAnggota = Math.max(...allWilayahData.map((p) => p.jumlah), 1);
  const visibleProvinsi = showAllProvinsi ? allWilayahData : allWilayahData.slice(0, 8);
  // Alias compat
  const allProvinsiWithData = allWilayahData;

  const handleProvinsiClick = async (provinsiNama: string) => {
    setDrillDownProv(provinsiNama);
    setDrillDownLoading(true);
    setDrillDownData(null);
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        // Find provinsi ID from wilayah API
        const wilRes = await fetch("/api/wilayah?type=provinsi", { cache: "no-store" });
        const wilJson = await wilRes.json();
        const prov = wilJson.data?.find((p: any) => p.nama === provinsiNama);
        if (prov) {
          const detailRes = await fetch(`/api/wilayah/${prov.id}/detail?type=provinsi`, { cache: "no-store" });
          const detailJson = await detailRes.json();
          if (detailJson.success) {
            setDrillDownData(detailJson.data);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDrillDownLoading(false);
    }
  };

  // Perlu tindakan — filter sesuai role
  const perluTindakan = [
    { icon: AlertCircle, text: `${data.pendaftaranByStatus.DIAJUKAN || 0} Pendaftaran Baru`, color: "text-amber-600", bg: "bg-amber-50", targetPage: "verifikasi", show: true },
    { icon: FileText, text: `${data.pendaftaranByStatus.PERBAIKAN || 0} Dokumen Kurang`, color: "text-blue-600", bg: "bg-blue-50", targetPage: "pendaftaran", show: true },
    { icon: UserCog, text: `${stats.totalPengurus} Profil Pengurus`, color: "text-violet-600", bg: "bg-violet-50", targetPage: "pengurus", show: isProvinsiOrAbove },
  ].filter((i) => i.show);

  return (
    <div className="space-y-6">
      {/* ============ HERO ============ */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">
            Selamat Datang, {role === "SUPER_ADMIN" ? "Super Admin" : role === "ADMIN_NASIONAL" ? "Admin Nasional" : role === "ADMIN_PROVINSI" ? "Admin Provinsi" : "Admin Kabupaten"} 👋
          </h1>
          <div className="flex items-center gap-2 mt-1.5 text-sm text-slate-500">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-medium text-blue-700">KIPAN Indonesia</span>
            <span className="text-slate-300">•</span>
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Ringkasan Sistem Hari Ini</p>
        </div>
        <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 px-4 py-2.5 shadow-sm">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Terakhir diperbarui</div>
            <div className="text-xs font-semibold text-slate-700">{updateText}</div>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ============ QUICK ACTION (Prioritas Utama) ============ */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 bg-blue-600 rounded-full" />
          <h2 className="text-sm font-bold text-blue-950 uppercase tracking-wider">Quick Action</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            const isPriority = action.priority === "high" && (action.count ?? 0) > 0;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ y: -3 }}
                className={`relative bg-gradient-to-br ${action.bgColor} border ${action.borderColor} rounded-2xl p-4 overflow-hidden`}
              >
                {isPriority && (
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                  </span>
                )}
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-md shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-slate-800 leading-tight">{action.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{action.desc}</div>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate?.(action.targetPage)}
                  className={`mt-3 w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200`}
                >
                  {action.action}
                  <ChevronRight className="w-3 h-3" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ============ STAT CARDS (2 rows) ============ */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 bg-blue-600 rounded-full" />
          <h2 className="text-sm font-bold text-blue-950 uppercase tracking-wider">Statistik Utama</h2>
        </div>
        {/* Row 1 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {statCardsRow1.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ y: -3 }}
                onClick={() => onNavigate?.(stat.targetPage)}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 cursor-pointer hover:border-blue-200 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-3xl font-extrabold text-blue-950">{stat.value.toLocaleString("id-ID")}</div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
                <div className="text-[10px] text-slate-400 mt-2">{stat.change}</div>
              </motion.div>
            );
          })}
        </div>
        {/* Row 2 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCardsRow2.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.08 }}
                whileHover={{ y: -3 }}
                onClick={() => onNavigate?.(stat.targetPage)}
                className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 cursor-pointer hover:border-blue-200 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-blue-950">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
                <div className="text-[10px] text-slate-400 mt-2">{stat.change}</div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ============ PENDAFTARAN TERBARU & AKTIVITAS ============ */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pendaftaran Terbaru */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-blue-950">Pendaftaran Terbaru</h3>
            </div>
            <button
              onClick={() => onNavigate?.("pendaftaran")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Lihat semua →
            </button>
          </div>
          <ul className="divide-y divide-slate-50">
            {data.recentPendaftaran.map((p, idx) => (
              <li
                key={p.id}
                onClick={() => onNavigate?.("verifikasi")}
                className="p-4 hover:bg-slate-50 flex items-center gap-3 cursor-pointer"
              >
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center text-white text-sm font-bold">
                    {p.nama.charAt(0)}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1">{formatClock(p.waktu)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-blue-950 truncate">{p.nama}</div>
                  <div className="text-xs text-slate-500">
                    Mendaftar dari {p.kabupaten || "wilayah"}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                    p.status === "DISETUJUI" ? "bg-emerald-100 text-emerald-700" :
                    p.status === "DITOLAK" ? "bg-rose-100 text-rose-700" :
                    p.status === "DIVERIFIKASI" ? "bg-blue-100 text-blue-700" :
                    p.status === "PERBAIKAN" ? "bg-amber-100 text-amber-700" :
                    p.status === "DIAJUKAN" ? "bg-cyan-100 text-cyan-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {p.status === "DIAJUKAN" ? "Diajukan" :
                     p.status === "DIVERIFIKASI" ? "Diverifikasi" :
                     p.status === "DISETUJUI" ? "Disetujui" :
                     p.status === "DITOLAK" ? "Ditolak" :
                     p.status === "PERBAIKAN" ? "Perbaikan" : "Draft"}
                  </span>
                  <span className="text-[10px] text-slate-400">{formatRelativeTime(p.waktu)}</span>
                </div>
              </li>
            ))}
            {data.recentPendaftaran.length === 0 && (
              <li className="p-8 text-center text-sm text-slate-500">Belum ada pendaftaran terbaru</li>
            )}
          </ul>
        </motion.div>

        {/* Aktivitas Terbaru */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-blue-950">Aktivitas Terbaru</h3>
            </div>
            <button
              onClick={() => onNavigate?.("pendaftaran")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Lihat semua →
            </button>
          </div>
          <ul className="p-5 space-y-4">
            {data.recentPendaftaran.slice(0, 5).map((p, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-700 leading-snug">
                    <strong>{p.nama}</strong> mendaftar dari {p.kabupaten || "wilayah"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{formatRelativeTime(p.waktu)} • Status: {p.status}</p>
                </div>
                <button
                  onClick={() => onNavigate?.("verifikasi")}
                  className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 shrink-0"
                >
                  Detail →
                </button>
              </li>
            ))}
            {data.recentPendaftaran.length === 0 && (
              <li className="text-sm text-slate-500 text-center py-4">Belum ada aktivitas</li>
            )}
          </ul>
        </motion.div>
      </div>

      {/* ============ TOP PROVINSI & STATUS ANGGOTA ============ */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-blue-950">{chartLabel}</h3>
            </div>
            {allProvinsiWithData.length > 8 && (
              <button
                onClick={() => setShowAllProvinsi(!showAllProvinsi)}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
              >
                {showAllProvinsi ? "Tutup" : "Lihat Semua"}
              </button>
            )}
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2
                          [&::-webkit-scrollbar]:w-1.5
                          [&::-webkit-scrollbar-thumb]:bg-blue-200
                          [&::-webkit-scrollbar-thumb]:rounded-full
                          [&::-webkit-scrollbar-track]:bg-transparent">
            {visibleProvinsi.map((p, idx) => (
              <div
                key={idx}
                onClick={() => role === "SUPER_ADMIN" || role === "ADMIN_NASIONAL" ? handleProvinsiClick(p.nama) : undefined}
                className={`flex items-center gap-3 rounded-lg p-1 -m-1 transition-colors group ${role === "SUPER_ADMIN" || role === "ADMIN_NASIONAL" ? "cursor-pointer hover:bg-slate-50" : ""}`}
                title={role === "SUPER_ADMIN" || role === "ADMIN_NASIONAL" ? `Klik untuk lihat detail ${p.nama}` : p.nama}
              >
                <span className="text-xs font-bold text-slate-400 w-6">#{idx + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{p.nama}</span>
                    <span className="text-xs font-bold text-blue-600">{p.jumlah.toLocaleString("id-ID")} anggota</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(p.jumlah / maxAnggota) * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full"
                    />
                  </div>
                </div>
              </div>
            ))}
            {visibleProvinsi.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">Belum ada data {chartLabel.toLowerCase()}</p>
            )}
          </div>
        </motion.div>

        {/* Distribusi Status Anggota */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-blue-950">Distribusi Status Anggota</h3>
            </div>
            <span className="text-xs text-slate-400">Total {stats.totalAnggota}</span>
          </div>
          <div className="space-y-3">
            {statusDistribution.map((s, idx) => {
              const total = stats.totalAnggota || 1;
              const pct = ((s.value / total) * 100).toFixed(1);
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <div className={`w-3 h-3 ${s.dot} rounded-full shrink-0`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{s.label}</span>
                      <span className={`text-sm font-bold ${s.textColor}`}>{s.value}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: idx * 0.08, duration: 0.6 }}
                        className={`h-full ${s.color} rounded-full`}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 w-12 text-right">{pct}%</span>
                </motion.div>
              );
            })}
          </div>

          {/* Donut chart visual */}
          <div className="mt-5 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {(() => {
                    let offset = 0;
                    const total = stats.totalAnggota || 1;
                    const colors = ["#10b981", "#94a3b8", "#f59e0b", "#f43f5e", "#475569"];
                    return statusDistribution.map((s, idx) => {
                      const pct = (s.value / total) * 100;
                      const dash = (pct * 100) / 100;
                      const circle = (
                        <circle
                          key={idx}
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="transparent"
                          stroke={colors[idx]}
                          strokeWidth="3"
                          strokeDasharray={`${dash} ${100 - dash}`}
                          strokeDashoffset={-offset}
                        />
                      );
                      offset += dash;
                      return circle;
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl font-extrabold text-blue-950">{stats.totalAnggota}</div>
                  <div className="text-[10px] text-slate-500">Total</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ============ RINGKASAN PENDAFTARAN & PERLU TINDAKAN ============ */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Status Pendaftaran */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-blue-950">Ringkasan Status Pendaftaran</h3>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {pendaftaranStatus.map((s, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="text-center p-4 bg-slate-50 rounded-xl"
              >
                <div className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mb-2 ${s.color}`}>
                  {s.label}
                </div>
                <div className="text-2xl font-extrabold text-blue-950">{s.value}</div>
              </motion.div>
            ))}
          </div>

          {/* Stacked bar visualization */}
          <div className="mt-5">
            <div className="text-xs text-slate-500 mb-2">Visualisasi Distribusi</div>
            <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
              {pendaftaranStatus.map((s, idx) => {
                const total = pendaftaranStatus.reduce((a, b) => a + b.value, 0) || 1;
                const pct = (s.value / total) * 100;
                if (pct === 0) return null;
                const colors = ["bg-slate-400", "bg-cyan-500", "bg-blue-500", "bg-amber-500", "bg-emerald-500", "bg-rose-500"];
                return (
                  <motion.div
                    key={idx}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: idx * 0.05, duration: 0.6 }}
                    className={`${colors[idx]} h-full`}
                    title={`${s.label}: ${s.value}`}
                  />
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Perlu Tindakan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-amber-900">Perlu Tindakan</h3>
          </div>
          <ul className="space-y-3">
            {perluTindakan.map((item, idx) => {
              const Icon = item.icon;
              return (
                <li
                  key={idx}
                  onClick={() => onNavigate?.(item.targetPage)}
                  className="flex items-center gap-3 bg-white rounded-xl p-3 border border-amber-100 cursor-pointer hover:border-amber-300 hover:shadow-sm transition-all"
                >
                  <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <span className="text-sm text-slate-700 flex-1">{item.text}</span>
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </li>
              );
            })}
          </ul>
          <div className="mt-4 pt-4 border-t border-amber-200">
            <div className="text-xs text-amber-700 text-center">
              Total: {perluTindakan.reduce((a, b) => {
                const match = b.text.match(/\d+/);
                return a + (match ? parseInt(match[0]) : 0);
              }, 0)} item perlu ditindaklanjuti
            </div>
          </div>
        </motion.div>
      </div>

      {/* ============ COVERAGE WILAYAH — hanya untuk SUPER_ADMIN & ADMIN_NASIONAL ============ */}
      {isNasionalOrAbove && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-blue-950">Coverage Wilayah Nasional</h3>
          </div>
          <span className="text-xs text-slate-400">Real-time</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Provinsi */}
          <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <MapPin className="w-6 h-6 text-blue-600" />
              <span className="text-xs font-semibold text-blue-600 bg-white px-2 py-0.5 rounded-full">
                {Math.round((stats.totalProvinsi / 38) * 100)}%
              </span>
            </div>
            <div className="text-3xl font-extrabold text-blue-950">
              {stats.totalProvinsi}<span className="text-base text-slate-400">/38</span>
            </div>
            <div className="text-sm text-slate-600 mt-1">Provinsi Terdaftar</div>
            <div className="mt-3 h-2 bg-white rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(stats.totalProvinsi / 38) * 100}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-gradient-to-r from-blue-500 to-sky-400"
              />
            </div>
          </div>

          {/* Kabupaten */}
          <div className="bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <Building2 className="w-6 h-6 text-sky-600" />
              <span className="text-xs font-semibold text-sky-600 bg-white px-2 py-0.5 rounded-full">
                {Math.round((stats.totalKabupaten / 514) * 100)}%
              </span>
            </div>
            <div className="text-3xl font-extrabold text-blue-950">
              {stats.totalKabupaten}<span className="text-base text-slate-400">/514</span>
            </div>
            <div className="text-sm text-slate-600 mt-1">Kabupaten/Kota Terdaftar</div>
            <div className="mt-3 h-2 bg-white rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(stats.totalKabupaten / 514) * 100}%` }}
                transition={{ duration: 0.8 }}
                className="h-full bg-gradient-to-r from-sky-500 to-cyan-400"
              />
            </div>
          </div>

          {/* Anggota per Provinsi rata-rata */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <Users className="w-6 h-6 text-emerald-600" />
              <span className="text-xs font-semibold text-emerald-600 bg-white px-2 py-0.5 rounded-full">
                Rata-rata
              </span>
            </div>
            <div className="text-3xl font-extrabold text-blue-950">
              {Math.round(stats.totalAnggota / (stats.totalProvinsi || 1))}
            </div>
            <div className="text-sm text-slate-600 mt-1">Pengurus per Provinsi</div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
        </div>
      </motion.div>
      )}

      {/* ============ CHART: TREND ANGGOTA ============ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-blue-950">Tren Pertumbuhan Anggota</h3>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={trendFilter}
              onChange={(e) => setTrendFilter(e.target.value)}
              className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500"
            >
              <option value="7_hari">7 Hari Terakhir</option>
              <option value="30_hari">30 Hari Terakhir</option>
              <option value="7_bulan">7 Bulan Terakhir</option>
              <option value="12_bulan">1 Tahun Terakhir</option>
            </select>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 text-blue-600">
                <span className="w-2 h-2 bg-blue-500 rounded-full" /> Anggota Baru
              </span>
            </div>
          </div>
        </div>
        <LineChart data={data.monthlyTrend || []} />
      </motion.div>

      {/* Drill-down Popup */}
      <AnimatePresence>
        {drillDownProv && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrillDownProv(null)}
            className="fixed inset-0 z-[300] bg-blue-950/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-r from-blue-600 to-sky-500 p-5 text-white">
                <button onClick={() => setDrillDownProv(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6" />
                  <div>
                    <h2 className="text-xl font-bold">{drillDownProv}</h2>
                    <p className="text-xs text-blue-100">Detail Pengurus</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {drillDownLoading ? (
                  <div className="space-y-3">
                    {[1,2,3,4].map((i) => <div key={i} className="h-4 bg-slate-200 animate-pulse rounded" />)}
                  </div>
                ) : !drillDownData ? (
                  <p className="text-sm text-slate-500 text-center py-8">Gagal memuat data</p>
                ) : (
                  <div className="space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-violet-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-extrabold text-violet-600">{drillDownData.statistik?.totalPengurus || 0}</div>
                        <div className="text-xs text-slate-500">Pengurus</div>
                      </div>
                      <div className="bg-cyan-50 rounded-xl p-4 text-center">
                        <div className="text-2xl font-extrabold text-cyan-600">{drillDownData.statistik?.totalKabupaten || 0}</div>
                        <div className="text-xs text-slate-500">Kabupaten</div>
                      </div>
                    </div>

                    {/* Pengurus List */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Pengurus ({drillDownData.statistik?.totalPengurus || 0})</h4>
                      <div className="space-y-2 max-h-72 overflow-y-auto">
                        {drillDownData.pengurusList?.map((p: any) => (
                          <div key={p.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {p.namaLengkap?.charAt(0) || "?"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-slate-800 truncate">{p.namaLengkap}</div>
                              <div className="text-xs text-slate-500 truncate">
                                {p.jabatan}
                              </div>
                            </div>
                            <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-semibold shrink-0 ${
                              (p.level || "").toLowerCase() === "nasional" ? "bg-violet-100 text-violet-700" :
                              (p.level || "").toLowerCase() === "provinsi" ? "bg-blue-100 text-blue-700" : "bg-cyan-100 text-cyan-700"
                            }`}>{p.level}</span>
                          </div>
                        ))}
                        {(!drillDownData.pengurusList || drillDownData.pengurusList.length === 0) && (
                          <p className="text-xs text-slate-400 text-center py-3">Belum ada pengurus</p>
                        )}
                        {drillDownData.pengurusList?.length > 20 && (
                          <p className="text-[10px] text-slate-400 text-center pt-2">
                            Menampilkan 20 dari {drillDownData.statistik?.totalPengurus || 0} pengurus
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// LINE CHART COMPONENT (SVG-based, no external library)
// ============================================================
function LineChart({ data }: { data: { bulan: string; baru: number }[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-sm text-slate-400">
        Belum ada data tren
      </div>
    );
  }

  const width = 800;
  const height = 240;
  const padding = { top: 20, right: 40, bottom: 40, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxBaru = Math.max(...data.map((d) => d.baru), 1);

  // X scale
  const xStep = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;

  // Points for bar (anggota baru)
  const barPoints = data.map((d, i) => ({
    x: padding.left + i * xStep,
    y: padding.top + chartHeight - (d.baru / maxBaru) * chartHeight,
  }));

  // Build cumulative line
  const cumData: number[] = [];
  data.reduce((acc, d) => {
    const newTotal = acc + d.baru;
    cumData.push(newTotal);
    return newTotal;
  }, 0);
  const minCum = Math.min(...cumData);
  const maxCum = Math.max(...cumData);
  const cumRange = maxCum - minCum || 1;

  const linePoints = cumData.map((c, i) => ({
    x: padding.left + i * xStep,
    y: padding.top + chartHeight - ((c - minCum) / cumRange) * (chartHeight - 20) - 10,
  }));

  const linePath = linePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${linePoints[linePoints.length - 1].x} ${padding.top + chartHeight} L ${linePoints[0].x} ${padding.top + chartHeight} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minWidth: "600px" }}>
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
          const y = padding.top + chartHeight * pct;
          return (
            <g key={idx}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" className="fill-slate-400" style={{ fontSize: "10px" }}>
                {Math.round(maxBaru * (1 - pct))}
              </text>
            </g>
          );
        })}

        {/* Area under line */}
        <path d={areaPath} fill="url(#areaGradient)" />

        {/* Line for cumulative */}
        <path d={linePath} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 5" />

        {/* Bars for anggota baru */}
        {barPoints.map((p, idx) => (
          <g key={idx}>
            <rect
              x={p.x - 12}
              y={p.y}
              width="24"
              height={padding.top + chartHeight - p.y}
              fill="url(#barGradient)"
              rx="3"
            />
            <text x={p.x} y={p.y - 6} textAnchor="middle" className="fill-blue-600" style={{ fontSize: "10px", fontWeight: "bold" }}>
              {data[idx].baru}
            </text>
          </g>
        ))}

        {/* Points on line */}
        {linePoints.map((p, idx) => (
          <circle key={idx} cx={p.x} cy={p.y} r="3" fill="#94a3b8" stroke="white" strokeWidth="1.5" />
        ))}

        {/* X axis labels */}
        {data.map((d, idx) => (
          <text key={idx} x={padding.left + idx * xStep} y={height - padding.bottom + 20} textAnchor="middle" className="fill-slate-500" style={{ fontSize: "12px", fontWeight: 500 }}>
            {d.bulan}
          </text>
        ))}
      </svg>
    </div>
  );
}
