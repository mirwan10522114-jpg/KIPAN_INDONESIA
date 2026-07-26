"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCog,
  Shield,
  Building2,
  Clock,
  Plus,
  Search,
  RefreshCw,
  Download,
  FileText,
  Eye,
  Edit,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Inbox,
  Users,
  KeyRound,
  Ban,
  Trash2,
  ExternalLink,
  CalendarClock,
} from "lucide-react";
import { PENGURUS_LIST, PROVINSI_LIST, KABUPATEN_LIST } from "@/lib/admin-data";
import type { Pengurus } from "@/lib/admin-data";
import PengurusDetailDialog from "./PengurusDetailDialog";
import PengurusFormDialog from "./PengurusFormDialog";
import { toast } from "sonner";

type SortDir = "asc" | "desc" | null;

export default function PengurusPage({
  onNavigate,
  userRole = "SUPER_ADMIN",
}: {
  onNavigate?: (page: string) => void;
  userRole?: string;
}) {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("Semua");
  const [provinsiFilter, setProvinsiFilter] = useState("Semua");
  const [kabupatenFilter, setKabupatenFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [masaJabatanFilter, setMasaJabatanFilter] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [actionMenuId, setActionMenuId] = useState<number | null>(null);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [apiData, setApiData] = useState<any[]>([]);
  const [useApiData, setUseApiData] = useState(false);

  // Fetch from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pengurus", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setApiData(json.data);
        setUseApiData(true);
      }
    } catch (e) {
      console.error("Failed to fetch pengurus:", e);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchData();
  }, []);

  // Permission check
  const canCreate = ["SUPER_ADMIN", "ADMIN_NASIONAL", "ADMIN_PROVINSI"].includes(userRole);
  const canDelete = userRole === "SUPER_ADMIN";
  const canEdit = ["SUPER_ADMIN", "ADMIN_NASIONAL", "ADMIN_PROVINSI"].includes(userRole);
  const canResetPassword = ["SUPER_ADMIN", "ADMIN_NASIONAL"].includes(userRole);

  // Stat cards
  // Map API data to Pengurus format — normalize level to Title Case
  const normalizeLevel = (level: string): string => {
    if (!level) return "";
    const lower = level.toLowerCase();
    if (lower === "nasional") return "Nasional";
    if (lower === "provinsi") return "Provinsi";
    if (lower === "kabupaten") return "Kabupaten";
    if (lower === "kecamatan") return "Kecamatan";
    return level;
  };

  const pengurusData: any[] = useApiData ? apiData.map((p: any) => ({
    id: p.id,
    nama: p.namaLengkap,
    foto: p.foto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    jabatan: p.jabatan,
    level: normalizeLevel(p.level),
    wilayah: normalizeLevel(p.level) === "Nasional" ? "Indonesia" : (p.kabupaten?.nama || p.provinsi?.nama || ""),
    provinsiNama: p.provinsi?.nama,
    kabupatenNama: p.kabupaten?.nama,
    email: p.email,
    hp: p.hp || "",
    status: p.status,
    tanggalMulai: p.tanggalMulai,
    tanggalSelesai: p.tanggalSelesai,
    nomorSK: p.nomorSK || "",
    fileSK: p.foto,
    tempatLahir: p.tempatLahir,
    tanggalLahir: p.tanggalLahir,
    alamat: p.alamat,
  })) : PENGURUS_LIST;

  const totalPengurus = pengurusData.length;
  const pengurusNasional = pengurusData.filter((p) => p.level === "Nasional").length;
  const pengurusProvinsi = pengurusData.filter((p) => p.level === "Provinsi").length;
  const pengurusKabupaten = pengurusData.filter((p) => p.level === "Kabupaten").length;
  const masaJabatanBerakhir = pengurusData.filter((p) => {
    if (!p.tanggalSelesai) return false;
    const end = new Date(p.tanggalSelesai);
    const now = new Date();
    const diff = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff < 365; // within 1 year
  }).length;

  const statCards = [
    { label: "Total Pengurus", value: totalPengurus, icon: UserCog, color: "from-blue-500 to-sky-500" },
    { label: "Pengurus Nasional", value: pengurusNasional, icon: Shield, color: "from-violet-500 to-purple-500" },
    { label: "Pengurus Provinsi", value: pengurusProvinsi, icon: Building2, color: "from-sky-500 to-cyan-500" },
    { label: "Pengurus Kabupaten", value: pengurusKabupaten, icon: Building2, color: "from-cyan-500 to-teal-500" },
    { label: "Masa Jabatan Akan Berakhir", value: masaJabatanBerakhir, icon: CalendarClock, color: "from-amber-500 to-orange-500" },
  ];

  // Dependent: kabupaten options based on provinsi filter
  const kabupatenOptions = useMemo(() => {
    if (provinsiFilter === "Semua") return KABUPATEN_LIST;
    return KABUPATEN_LIST.filter((k) => k.provinsiNama === provinsiFilter);
  }, [provinsiFilter]);

  // Filter data
  const filtered = useMemo(() => {
    let result = pengurusData.filter((p) => {
      const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase()) ||
        p.jabatan.toLowerCase().includes(search.toLowerCase()) ||
        p.nomorSK.toLowerCase().includes(search.toLowerCase());
      const matchLevel = levelFilter === "Semua" || p.level === levelFilter;
      const matchProv = provinsiFilter === "Semua" || p.provinsiNama === provinsiFilter;
      const matchKab = kabupatenFilter === "Semua" || p.kabupatenNama === kabupatenFilter;
      const matchStatus = statusFilter === "Semua" || p.status === statusFilter;
      let matchMasa = true;
      if (masaJabatanFilter === "Aktif") {
        matchMasa = p.status === "Aktif" && (!p.tanggalSelesai || new Date(p.tanggalSelesai) > new Date());
      } else if (masaJabatanFilter === "Akan Berakhir") {
        if (!p.tanggalSelesai) matchMasa = false;
        else {
          const diff = (new Date(p.tanggalSelesai).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
          matchMasa = diff > 0 && diff < 365;
        }
      } else if (masaJabatanFilter === "Berakhir") {
        matchMasa = p.tanggalSelesai ? new Date(p.tanggalSelesai) < new Date() : false;
      }
      return matchSearch && matchLevel && matchProv && matchKab && matchStatus && matchMasa;
    });
    if (sortBy && sortDir) {
      result = [...result].sort((a: any, b: any) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        if (typeof aVal === "string") {
          return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      });
    }
    return result;
  }, [pengurusData, search, levelFilter, provinsiFilter, kabupatenFilter, statusFilter, masaJabatanFilter, sortBy, sortDir]);

  const totalData = filtered.length;
  const totalPages = Math.ceil(totalData / rowsPerPage) || 1;
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = Math.min(startIdx + rowsPerPage, totalData);
  const pageData = filtered.slice(startIdx, endIdx);

  // Summary stats from filtered data
  const filterSummary = {
    total: filtered.length,
    nasional: filtered.filter((p) => p.level === "Nasional").length,
    provinsi: filtered.filter((p) => p.level === "Provinsi").length,
    kabupaten: filtered.filter((p) => p.level === "Kabupaten").length,
    aktif: filtered.filter((p) => p.status === "Aktif").length,
    nonaktif: filtered.filter((p) => p.status !== "Aktif").length,
    akanBerakhir: filtered.filter((p) => {
      if (!p.tanggalSelesai) return false;
      const diff = (new Date(p.tanggalSelesai).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
      return diff > 0 && diff < 365;
    }).length,
  };
  const hasActiveFilters = search !== "" || levelFilter !== "Semua" || provinsiFilter !== "Semua" || statusFilter !== "Semua" || masaJabatanFilter !== "Semua";

  const handleSort = (col: string) => {
    if (sortBy === col) {
      if (sortDir === "asc") { setSortDir("desc"); }
      else if (sortDir === "desc") { setSortBy(null); setSortDir(null); }
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  const getSortIcon = (col: string) => {
    if (sortBy !== col) return <ArrowUpDown className="w-3 h-3 text-slate-300" />;
    if (sortDir === "asc") return <ChevronUp className="w-3 h-3 text-blue-600" />;
    if (sortDir === "desc") return <ChevronDown className="w-3 h-3 text-blue-600" />;
    return <ArrowUpDown className="w-3 h-3 text-slate-300" />;
  };

  const handleRefresh = () => {
    setLoading(true);
    setSearch("");
    setLevelFilter("Semua");
    setProvinsiFilter("Semua");
    setKabupatenFilter("Semua");
    setStatusFilter("Semua");
    setMasaJabatanFilter("Semua");
    setSortBy(null);
    setSortDir(null);
    setPage(1);
    setTimeout(() => setLoading(false), 600);
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Aktif: "bg-emerald-100 text-emerald-700 border-emerald-200",
      Nonaktif: "bg-slate-100 text-slate-600 border-slate-200",
      Dibekukan: "bg-rose-100 text-rose-700 border-rose-200",
    };
    return styles[status] || "bg-slate-100 text-slate-600 border-slate-200";
  };

  const levelBadge = (level: string) => {
    const styles: Record<string, string> = {
      Nasional: "bg-violet-100 text-violet-700",
      Provinsi: "bg-blue-100 text-blue-700",
      Kabupaten: "bg-cyan-100 text-cyan-700",
    };
    return styles[level] || "bg-slate-100 text-slate-600";
  };

  const formatMasaJabatan = (mulai: string, selesai?: string) => {
    const m = new Date(mulai).toLocaleDateString("id-ID", { month: "short", year: "numeric" });
    if (!selesai) return `${m} - Sekarang`;
    const s = new Date(selesai).toLocaleDateString("id-ID", { month: "short", year: "numeric" });
    return `${m} - ${s}`;
  };

  const handleSavePengurus = async (data: any) => {
    const res = await fetch("/api/pengurus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    toast.success(json.message);
    fetchData();
  };

  const actions = [
    { label: "Detail", icon: Eye, action: (item: any) => setDetailId(item.id), show: true },
    { label: "Edit", icon: Edit, action: (item: any) => { setActionMenuId(null); toast.info("Form edit pengurus akan dibuka"); }, show: canEdit },
    { label: "Lihat Anggota", icon: Users, action: () => { setActionMenuId(null); onNavigate?.("anggota"); }, show: true },
    { label: "Reset Password", icon: KeyRound, action: (item: any) => {
      setActionMenuId(null);
      toast.success(`Link reset password dikirim ke ${item.email}`);
    }, show: canResetPassword },
    { label: "Nonaktifkan", icon: Ban, action: (item: any) => {
      setActionMenuId(null);
      toast.success(`Pengurus ${item.nama} dinonaktifkan`);
      fetchData();
    }, show: canDelete, danger: false },
    { label: "Hapus", icon: Trash2, action: (item: any) => {
      setActionMenuId(null);
      if (window.confirm(`Yakin hapus pengurus "${item.nama}"?`)) {
        toast.success(`Pengurus ${item.nama} dihapus`);
        fetchData();
      }
    }, show: canDelete, danger: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Manajemen Pengurus</h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola data pengurus KIPAN dari tingkat Nasional hingga Kabupaten/Kota
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowFormDialog(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Pengurus
          </button>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((s, idx) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{ y: -3 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-md mb-3`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-extrabold text-blue-950">{s.value}</div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari nama, jabatan, atau nomor SK..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
          />
        </div>
        <select
          value={levelFilter}
          onChange={(e) => { setLevelFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
        >
          <option value="Semua">Semua Level</option>
          <option value="Nasional">Nasional</option>
          <option value="Provinsi">Provinsi</option>
          <option value="Kabupaten">Kabupaten</option>
        </select>
        <select
          value={provinsiFilter}
          onChange={(e) => { setProvinsiFilter(e.target.value); setKabupatenFilter("Semua"); setPage(1); }}
          className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
        >
          <option value="Semua">Semua Provinsi</option>
          {PROVINSI_LIST.map((p) => (
            <option key={p.id}>{p.nama}</option>
          ))}
        </select>
        <select
          value={kabupatenFilter}
          onChange={(e) => { setKabupatenFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
          disabled={provinsiFilter === "Semua"}
        >
          <option value="Semua">Semua Kabupaten</option>
          {kabupatenOptions.map((k) => (
            <option key={k.id}>{k.nama}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
        >
          <option value="Semua">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Nonaktif">Nonaktif</option>
          <option value="Dibekukan">Dibekukan</option>
        </select>
        <select
          value={masaJabatanFilter}
          onChange={(e) => { setMasaJabatanFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
        >
          <option value="Semua">Semua Masa Jabatan</option>
          <option value="Aktif">Sedang Menjabat</option>
          <option value="Akan Berakhir">Akan Berakhir (&lt;1 thn)</option>
          <option value="Berakhir">Sudah Berakhir</option>
        </select>
        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Export Excel">
            <Download className="w-4 h-4" />
          </button>
          <button className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Export PDF">
            <FileText className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Summary */}
      {totalData > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-blue-600 rounded-full" />
            <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wider">Ringkasan Hasil Filter</h3>
            {hasActiveFilters && (
              <span className="text-[10px] text-blue-500 bg-white px-2 py-0.5 rounded-full border border-blue-200">
                {totalData} dari {pengurusData.length} data
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <SumCard label="Total" value={filterSummary.total} color="text-blue-600" bg="bg-blue-50" />
            <SumCard label="Nasional" value={filterSummary.nasional} color="text-violet-600" bg="bg-violet-50" />
            <SumCard label="Provinsi" value={filterSummary.provinsi} color="text-blue-600" bg="bg-sky-50" />
            <SumCard label="Kabupaten" value={filterSummary.kabupaten} color="text-cyan-600" bg="bg-cyan-50" />
            <SumCard label="Aktif" value={filterSummary.aktif} color="text-emerald-600" bg="bg-emerald-50" />
            <SumCard label="Nonaktif" value={filterSummary.nonaktif} color="text-slate-600" bg="bg-slate-100" />
            <SumCard label="Akan Berakhir" value={filterSummary.akanBerakhir} color="text-amber-600" bg="bg-amber-50" />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-200 animate-pulse rounded-full" />
                <div className="flex-1 h-4 bg-slate-200 animate-pulse rounded" />
                <div className="w-24 h-4 bg-slate-200 animate-pulse rounded" />
                <div className="w-20 h-4 bg-slate-200 animate-pulse rounded" />
                <div className="w-28 h-4 bg-slate-200 animate-pulse rounded" />
                <div className="w-8 h-4 bg-slate-200 animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : pageData.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Belum ada data pengurus</h3>
            <p className="text-sm text-slate-500 mb-4">
              {search || levelFilter !== "Semua" || statusFilter !== "Semua" || provinsiFilter !== "Semua"
                ? "Tidak ada data yang sesuai dengan filter. Coba ubah filter atau kata kunci pencarian."
                : "Belum ada pengurus yang terdaftar dalam sistem."}
            </p>
            {canCreate && !search && levelFilter === "Semua" && statusFilter === "Semua" && (
              <button
                onClick={() => setShowFormDialog(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Tambah Pengurus
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Foto</th>
                  <Th onClick={() => handleSort("nama")} icon={getSortIcon("nama")}>Nama</Th>
                  <Th onClick={() => handleSort("jabatan")} icon={getSortIcon("jabatan")}>Jabatan</Th>
                  <Th onClick={() => handleSort("level")} icon={getSortIcon("level")}>Level</Th>
                  <Th onClick={() => handleSort("wilayah")} icon={getSortIcon("wilayah")}>Wilayah</Th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Masa Jabatan</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Nomor SK</th>
                  <Th onClick={() => handleSort("status")} icon={getSortIcon("status")}>Status</Th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => setDetailId(item.id)}
                  >
                    <td className="px-4 py-3">
                      <img src={item.foto} alt={item.nama} className="w-9 h-9 rounded-full object-cover border-2 border-blue-100" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-semibold text-blue-950">{item.nama}</div>
                      <div className="text-xs text-slate-500">{item.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">{item.jabatan}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${levelBadge(item.level)}`}>
                        {item.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.wilayah}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {formatMasaJabatan(item.tanggalMulai, item.tanggalSelesai)}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={item.fileSK || "#"}
                        onClick={(e) => e.preventDefault()}
                        className="inline-flex items-center gap-1 text-xs font-mono text-blue-600 hover:text-blue-700 hover:underline"
                        title="Lihat file SK"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        {item.nomorSK}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block">
                        <button
                          onClick={() => setActionMenuId(actionMenuId === item.id ? null : item.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                          title="Menu aksi"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        <AnimatePresence>
                          {actionMenuId === item.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -5, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -5, scale: 0.95 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 py-1 z-20"
                            >
                              {actions.filter((a) => a.show).map((action, idx) => {
                                const Icon = action.icon;
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      action.action(item);
                                      setActionMenuId(null);
                                    }}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-slate-50 transition-colors ${
                                      action.danger ? "text-rose-600" : "text-slate-700"
                                    }`}
                                  >
                                    <Icon className="w-3.5 h-3.5" />
                                    {action.label}
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && pageData.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-slate-100">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                className="px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
              >
                {[10, 25, 50, 100].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <span className="ml-2">
                Menampilkan {startIdx + 1}-{endIdx} dari {totalData} data
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(1)} disabled={currentPage === 1} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30 disabled:cursor-not-allowed" title="Halaman pertama">
                <ChevronsUpDown className="w-4 h-4 rotate-90" />
              </button>
              <button onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30 disabled:cursor-not-allowed" title="Halaman sebelumnya">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium text-slate-600 px-3 py-1">{currentPage} / {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30 disabled:cursor-not-allowed" title="Halaman berikutnya">
                <ChevronRight className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(totalPages)} disabled={currentPage === totalPages} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30 disabled:cursor-not-allowed" title="Halaman terakhir">
                <ChevronsUpDown className="w-4 h-4 -rotate-90" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <PengurusDetailDialog
        pengurusId={detailId}
        onClose={() => setDetailId(null)}
        onEdit={canEdit ? () => { setDetailId(null); } : undefined}
        onViewAnggota={(id) => { setDetailId(null); onNavigate?.("anggota"); }}
      />

      {/* Form Dialog */}
      <PengurusFormDialog
        open={showFormDialog}
        onClose={() => setShowFormDialog(false)}
        onSave={handleSavePengurus}
      />

      {/* Backdrop for action menu */}
      {actionMenuId !== null && (
        <div className="fixed inset-0 z-[5]" onClick={() => setActionMenuId(null)} />
      )}
    </div>
  );
}

function SumCard({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <div className={`${bg} rounded-xl p-3 text-center`}>
      <div className={`text-xl font-extrabold ${color}`}>{value}</div>
      <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}

function Th({ children, onClick, icon }: { children: React.ReactNode; onClick: () => void; icon: React.ReactNode }) {
  return (
    <th
      onClick={onClick}
      className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 select-none"
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {icon}
      </span>
    </th>
  );
}
