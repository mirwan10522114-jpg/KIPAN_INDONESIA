"use client";

import { useState, useEffect } from "react";
import { Download, FileText, Filter, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface DashboardData {
  stats: {
    totalAnggota: number;
    anggotaAktif: number;
    anggotaBaru: number;
    menungguVerifikasi: number;
    totalPengurus: number;
    totalProvinsi: number;
    totalKabupaten: number;
  };
  anggotaPerProvinsi: { nama: string; kode: string; jumlah: number }[];
}

interface ProvinsiItem {
  id: number;
  nama: string;
  kode: string;
}

export default function LaporanPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [provinsiList, setProvinsiList] = useState<ProvinsiItem[]>([]);
  const [selectedProvinsi, setSelectedProvinsi] = useState("Semua");
  const [selectedTahun, setSelectedTahun] = useState("2026");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, wilRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/wilayah"),
      ]);
      const dashJson = await dashRes.json();
      const wilJson = await wilRes.json();

      if (dashJson.success) setData(dashJson.data);
      if (wilJson.success && wilJson.data?.provinsi) {
        setProvinsiList(wilJson.data.provinsi);
      }
    } catch (err) {
      console.error("Gagal memuat data laporan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalPengurus = data?.stats?.totalPengurus ?? 0;
  const anggotaBaru = data?.stats?.anggotaBaru ?? 0;
  const menungguVerifikasi = data?.stats?.menungguVerifikasi ?? 0;
  const totalAnggota = data?.stats?.totalAnggota ?? 0;

  const handleExport = (type: "PDF" | "Excel") => {
    toast.info(`Mengunduh laporan kepengurusan format ${type}...`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Laporan Kepengurusan</h1>
          <p className="text-slate-500 text-sm mt-1">Generate dan rekapitulasi data kepengurusan riil SIM-KIPAN</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Perbarui Data
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-blue-950">Filter Laporan</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Provinsi</label>
            <select
              value={selectedProvinsi}
              onChange={(e) => setSelectedProvinsi(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white"
            >
              <option value="Semua">Semua Provinsi (Nasional)</option>
              {provinsiList.map((p) => (
                <option key={p.id} value={p.nama}>
                  {p.nama}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tahun Laporan</label>
            <select
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="Semua">Semua Tahun</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={() => handleExport("PDF")}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-600 text-white text-sm font-semibold rounded-lg hover:bg-rose-700 transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4" /> Export PDF
            </button>
            <button
              onClick={() => handleExport("Excel")}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" /> Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Anggota", value: totalAnggota.toLocaleString("id-ID") },
          { label: "Pengurus Aktif", value: totalPengurus.toLocaleString("id-ID") },
          { label: "Anggota Baru (Bulan Ini)", value: anggotaBaru.toLocaleString("id-ID") },
          { label: "Pendaftaran Menunggu", value: menungguVerifikasi.toLocaleString("id-ID") },
        ].map((s, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="text-3xl font-extrabold text-blue-950">
              {loading ? "..." : s.value}
            </div>
            <div className="text-sm text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Preview table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-blue-950">Rekapitulasi Pengurus per Provinsi</h3>
          <span className="text-xs text-slate-400">Tahun {selectedTahun}</span>
        </div>
        <div className="overflow-x-auto">
          {(!data?.anggotaPerProvinsi || data.anggotaPerProvinsi.length === 0) ? (
            <div className="py-12 flex flex-col items-center justify-center text-center p-6">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Belum Ada Catatan Rekapitulasi</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Tidak ada data kepengurusan yang tercatat untuk filter yang dipilih (total 0 pengurus).
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Provinsi / Wilayah</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Kode</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Jumlah Pengurus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.anggotaPerProvinsi.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-semibold text-blue-950">{row.nama}</td>
                    <td className="px-4 py-3 text-sm text-center text-slate-600 font-mono text-xs">{row.kode}</td>
                    <td className="px-4 py-3 text-sm text-center font-bold text-blue-600">{row.jumlah}</td>
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
