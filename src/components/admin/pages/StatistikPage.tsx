"use client";

import { useState, useEffect } from "react";
import { Users, MapPin, Building2, CheckCircle2, TrendingUp, RefreshCw, AlertCircle } from "lucide-react";

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
  anggotaPerProvinsi: { nama: string; kode: string; jumlah: number }[];
  anggotaByStatus: Record<string, number>;
  monthlyTrend: { bulan: string; baru: number }[];
}

export default function StatistikPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data statistik:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalAnggota = data?.stats?.totalAnggota ?? 0;
  const totalPengurus = data?.stats?.totalPengurus ?? 0;
  const totalProvinsi = data?.stats?.totalProvinsi ?? 0;
  const totalKabupaten = data?.stats?.totalKabupaten ?? 0;

  const cards = [
    {
      label: "Total Nasional",
      value: totalAnggota.toLocaleString("id-ID"),
      icon: Users,
      color: "from-blue-500 to-sky-500",
    },
    {
      label: "Provinsi Terdaftar",
      value: totalProvinsi.toLocaleString("id-ID"),
      icon: MapPin,
      color: "from-violet-500 to-purple-500",
    },
    {
      label: "Kabupaten/Kota Terdaftar",
      value: totalKabupaten.toLocaleString("id-ID"),
      icon: Building2,
      color: "from-cyan-500 to-blue-500",
    },
    {
      label: "Pengurus Aktif",
      value: totalPengurus.toLocaleString("id-ID"),
      icon: CheckCircle2,
      color: "from-emerald-500 to-teal-500",
    },
  ];

  const monthlyTrend = data?.monthlyTrend || [
    { bulan: "Jul", baru: 0 },
    { bulan: "Agu", baru: 0 },
    { bulan: "Sep", baru: 0 },
    { bulan: "Okt", baru: 0 },
    { bulan: "Nov", baru: 0 },
    { bulan: "Des", baru: 0 },
    { bulan: "Jan", baru: 0 },
  ];
  const maxBar = Math.max(...monthlyTrend.map((s) => s.baru), 1);

  const topProvinsi = data?.anggotaPerProvinsi?.slice(0, 5) || [];
  const maxAnggota = Math.max(...topProvinsi.map((p) => p.jumlah), 1);

  const statusList = [
    { label: "Aktif", key: "Aktif", color: "bg-emerald-500" },
    { label: "Nonaktif", key: "Nonaktif", color: "bg-slate-400" },
    { label: "Mengundurkan Diri", key: "Mengundurkan Diri", color: "bg-amber-500" },
    { label: "Diberhentikan", key: "Diberhentikan", color: "bg-rose-500" },
    { label: "Meninggal", key: "Meninggal", color: "bg-slate-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Statistik Pengurus & Anggota</h1>
          <p className="text-slate-500 text-sm mt-1">
            Data statistik riil langsung dari pendaftaran dan kepengurusan SIM-KIPAN
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Perbarui Data
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 transition-all hover:shadow-md">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center shadow-md mb-3`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-extrabold text-blue-950">
                {loading ? "..." : c.value}
              </div>
              <div className="text-sm text-slate-500 mt-1">{c.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chart pengurus baru */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-blue-950">Pertumbuhan Baru per Bulan</h3>
              <p className="text-xs text-slate-400 mt-0.5">Tren pengangkatan anggota 7 bulan terakhir</p>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex items-end gap-2 h-48 pt-4">
            {monthlyTrend.map((s, idx) => {
              const heightPct = s.baru > 0 ? (s.baru / maxBar) * 100 : 4;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className={`w-full rounded-t-lg flex items-end justify-center pb-1 transition-all duration-500 ${
                        s.baru > 0
                          ? "bg-gradient-to-t from-blue-600 to-sky-400"
                          : "bg-slate-100"
                      }`}
                      style={{ height: `${heightPct}%` }}
                    >
                      {s.baru > 0 && (
                        <span className="text-[10px] font-bold text-white">{s.baru}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">{s.bulan}</span>
                </div>
              );
            })}
          </div>
          {monthlyTrend.every((m) => m.baru === 0) && (
            <div className="text-center text-xs text-slate-400 mt-3 pt-3 border-t border-slate-50">
              Belum ada data pertumbuhan anggota baru pada periode ini (0 anggota baru).
            </div>
          )}
        </div>

        {/* Top provinsi */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-bold text-blue-950 mb-1">Top Provinsi (Pengurus Terbanyak)</h3>
          <p className="text-xs text-slate-400 mb-4">Peringkat provinsi berdasarkan jumlah pengurus aktif</p>

          {topProvinsi.length === 0 || topProvinsi.every((p) => p.jumlah === 0) ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-2">
                <AlertCircle className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Belum Ada Data Pengurus Daerah</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Data akan terisi secara otomatis ketika pengurus tingkat DPW/DPD telah terdaftar dan diverifikasi.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProvinsi.map((p, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-6">#{idx + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{p.nama}</span>
                      <span className="text-xs font-bold text-blue-600">{p.jumlah.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-sky-400 transition-all duration-500"
                        style={{ width: `${(p.jumlah / maxAnggota) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status breakdown */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-blue-950 mb-1">Distribusi Status Anggota</h3>
        <p className="text-xs text-slate-400 mb-4">Status keaktifan seluruh anggota yang tercatat dalam database</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statusList.map((s, idx) => {
            const count = data?.anggotaByStatus?.[s.key] ?? 0;
            const pct = totalAnggota > 0 ? ((count / totalAnggota) * 100).toFixed(1) : "0.0";
            return (
              <div key={idx} className="text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className={`w-3 h-3 ${s.color} rounded-full mx-auto mb-2`} />
                <div className="text-2xl font-bold text-blue-950">
                  {loading ? "..." : count.toLocaleString("id-ID")}
                </div>
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
