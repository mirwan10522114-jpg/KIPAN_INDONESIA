"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Building2,
  UserCog,
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
  MapPinned,
  Ban,
  Trash2,
  ArrowUpDown,
  Inbox,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { PROVINSI_LIST, KABUPATEN_LIST } from "@/lib/admin-data";
import WilayahDetailDialog from "./WilayahDetailDialog";
import WilayahFormDialog, { type WilayahFormData } from "./WilayahFormDialog";
import { exportWilayahPdf } from "@/lib/pdf-export";
import { toast } from "sonner";
import { fetchJson } from "@/lib/fetch-helper";

type SortDir = "asc" | "desc" | null;

export default function WilayahPage({
  onNavigate,
  userRole = "SUPER_ADMIN",
}: {
  onNavigate?: (page: string, filter?: Record<string, string>) => void;
  userRole?: string;
}) {
  const [tab, setTab] = useState<"provinsi" | "kabupaten">("provinsi");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [provinsiFilter, setProvinsiFilter] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [detailType, setDetailType] = useState<"provinsi" | "kabupaten">("provinsi");
  const [actionMenuId, setActionMenuId] = useState<number | null>(null);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [formData, setFormData] = useState<WilayahFormData | null>(null);
  const [apiProvinsi, setApiProvinsi] = useState<any[]>([]);
  const [apiKabupaten, setApiKabupaten] = useState<any[]>([]);
  const [useApiData, setUseApiData] = useState(false);
  const [totalAllPengurus, setTotalAllPengurus] = useState(0);

  // Fetch from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const [wilRes, pengRes] = await Promise.all([
        fetch("/api/wilayah", { cache: "no-store" }),
        fetch("/api/pengurus", { cache: "no-store" }),
      ]);
      const wilJson = await wilRes.json();
      const pengJson = await pengRes.json();
      if (wilJson.success) {
        setApiProvinsi(wilJson.data.provinsi || []);
        setApiKabupaten(wilJson.data.kabupaten || []);
        setUseApiData(true);
      }
      if (pengJson.success) {
        setTotalAllPengurus(pengJson.total || 0);
      }
    } catch (e) {
      console.error("Failed to fetch wilayah:", e);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fill ketua wilayah dari pengurus dengan jabatan Ketua Umum
  const autoFillKetua = async () => {
    try {
      const res = await fetch("/api/wilayah/auto-fill-ketua", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        fetchData();
      } else {
        toast.error(json.error || "Gagal auto-fill ketua");
      }
    } catch (e) {
      toast.error("Gagal auto-fill ketua");
    }
  };

  // Sinkronkan status wilayah otomatis berdasarkan keberadaan pengurus:
  // Wilayah yang ada pengurus aktif -> "Aktif", yang tidak ada -> "Pembentukan"
  const syncStatusWilayah = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/wilayah/sync-status", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        fetchData();
      } else {
        toast.error(json.error || "Gagal sinkronisasi status");
      }
    } catch (e) {
      toast.error("Gagal sinkronisasi status wilayah");
    } finally {
      setLoading(false);
    }
  };

  // Initial load — just fetch data (auto-fill ketua via manual button only)
  useEffect(() => {
    fetchData();
  }, []);

  // Permission check
  const canCreateProvinsi = userRole === "SUPER_ADMIN";
  const canCreateKabupaten = ["SUPER_ADMIN", "ADMIN_NASIONAL", "ADMIN_PROVINSI"].includes(userRole);
  const canDelete = userRole === "SUPER_ADMIN";
  const canEdit = ["SUPER_ADMIN", "ADMIN_NASIONAL", "ADMIN_PROVINSI"].includes(userRole);

  // Use API data if available, fallback to mock data
  const provData = useApiData ? apiProvinsi.map((p: any) => ({
    id: p.id,
    kode: p.kode,
    nama: p.nama,
    status: p.status,
    ketua: p.ketua || "",
    jumlahKabupaten: p._count?.kabupaten || 0,
    jumlahPengurus: p._count?.pengurus || 0,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  })) : PROVINSI_LIST;

  const kabData = useApiData ? apiKabupaten.map((k: any) => ({
    id: k.id,
    kode: k.kode,
    nama: k.nama,
    provinsiNama: k.provinsi?.nama || "",
    status: k.status,
    ketua: k.ketua || "",
    jumlahPengurus: k._count?.pengurus || 0,
    createdAt: k.createdAt,
    updatedAt: k.updatedAt,
  })) : KABUPATEN_LIST;

  // Stat cards — use API data for consistency with dashboard
  const statCards = [
    { label: "Total Provinsi", value: provData.length, total: null, icon: MapPin, color: "from-blue-500 to-sky-500", targetPage: null },
    { label: "Total Kabupaten/Kota", value: kabData.length, total: null, icon: Building2, color: "from-sky-500 to-cyan-500", targetPage: null },
    { label: "Total Pengurus", value: totalAllPengurus, total: null, icon: UserCog, color: "from-violet-500 to-purple-500", targetPage: "pengurus" },
  ];

  // Filter data
  const filteredProv = useMemo(() => {
    let result = provData.filter((p: any) => {
      const matchSearch = p.nama.toLowerCase().includes(search.toLowerCase()) ||
        p.kode.toLowerCase().includes(search.toLowerCase()) ||
        (p.ketua || "").toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "Semua" || p.status === statusFilter;
      return matchSearch && matchStatus;
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
  }, [provData, search, statusFilter, sortBy, sortDir]);

  const filteredKab = useMemo(() => {
    let result = kabData.filter((k: any) => {
      const matchSearch = k.nama.toLowerCase().includes(search.toLowerCase()) ||
        k.kode.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "Semua" || k.status === statusFilter;
      const matchProv = provinsiFilter === "Semua" || k.provinsiNama === provinsiFilter;
      return matchSearch && matchStatus && matchProv;
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
  }, [kabData, search, statusFilter, provinsiFilter, sortBy, sortDir]);

  const currentData = tab === "provinsi" ? filteredProv : filteredKab;
  const totalData = currentData.length;
  const totalPages = Math.ceil(totalData / rowsPerPage) || 1;
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = Math.min(startIdx + rowsPerPage, totalData);
  const pageData = currentData.slice(startIdx, endIdx);

  // Summary stats from filtered data
  const filterSummary = tab === "provinsi" ? {
    total: filteredProv.length,
    aktif: filteredProv.filter((p: any) => p.status === "Aktif").length,
    pembentukan: filteredProv.filter((p: any) => p.status === "Pembentukan").length,
    nonaktif: filteredProv.filter((p: any) => p.status === "Nonaktif").length,
    totalPengurus: filteredProv.reduce((a: number, b: any) => a + (b.jumlahPengurus || 0), 0),
    totalKabupaten: filteredProv.reduce((a: number, b: any) => a + (b.jumlahKabupaten || 0), 0),
  } : {
    total: filteredKab.length,
    aktif: filteredKab.filter((k: any) => k.status === "Aktif").length,
    pembentukan: filteredKab.filter((k: any) => k.status === "Pembentukan").length,
    nonaktif: filteredKab.filter((k: any) => k.status === "Nonaktif").length,
    totalPengurus: filteredKab.reduce((a: number, b: any) => a + (b.jumlahPengurus || 0), 0),
    totalKabupaten: 0,
  };
  const hasActiveFilters = search !== "" || statusFilter !== "Semua" || provinsiFilter !== "Semua";

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortDir(sortDir === "asc" ? "desc" : sortDir === "desc" ? null : "asc");
      if (sortDir === "desc") {
        setSortBy(null);
        setSortDir(null);
      }
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

  const switchTab = (newTab: "provinsi" | "kabupaten") => {
    if (newTab === tab) return;
    setLoading(true);
    setTab(newTab);
    setPage(1);
    setTimeout(() => setLoading(false), 600);
  };

  const handleRefresh = () => {
    setLoading(true);
    setSearch("");
    setStatusFilter("Semua");
    setProvinsiFilter("Semua");
    setSortBy(null);
    setSortDir(null);
    setPage(1);
    setTimeout(() => setLoading(false), 600);
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Aktif: "bg-emerald-100 text-emerald-700 border-emerald-200",
      Pembentukan: "bg-amber-100 text-amber-700 border-amber-200",
      Nonaktif: "bg-slate-100 text-slate-600 border-slate-200",
      Dibekukan: "bg-rose-100 text-rose-700 border-rose-200",
    };
    return styles[status] || "bg-slate-100 text-slate-600 border-slate-200";
  };

  const showDetail = (item: any, type: "provinsi" | "kabupaten") => {
    setDetailType(type);
    setDetailId(item.id);
    setActionMenuId(null);
  };

  const handleSave = async (data: WilayahFormData) => {
    const method = data.id ? "PUT" : "POST";
    const json: any = await fetchJson("/api/wilayah", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    toast.success(json.message);
    fetchData();
  };

  const handleDelete = async (item: any) => {
    // Soft delete: ubah status menjadi Nonaktif (data tidak hilang)
    const res = await fetch("/api/wilayah", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, type: tab, nama: item.nama, status: "Nonaktif", ketua: item.ketua }),
    });
    const json = await res.json();
    if (json.success) {
      toast.success(`${item.nama} dinonaktifkan (data tidak dihapus)`);
      fetchData();
    } else {
      toast.error(json.error || "Gagal menonaktifkan");
    }
  };

  const handleToggleStatus = async (item: any) => {
    const newStatus = item.status === "Aktif" ? "Nonaktif" : "Aktif";
    const res = await fetch("/api/wilayah", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, type: tab, nama: item.nama, status: newStatus, ketua: item.ketua }),
    });
    const json = await res.json();
    if (json.success) {
      toast.success(`Status diubah menjadi ${newStatus}`);
      fetchData();
    } else {
      toast.error(json.error || "Gagal mengubah status");
    }
  };

  const openEditForm = (item: any) => {
    setFormData({
      id: item.id,
      type: tab,
      kode: item.kode,
      nama: item.nama,
      status: item.status,
      ketua: item.ketua || "",
      provinsiId: tab === "kabupaten" ? String(apiProvinsi.find((p: any) => p.nama === item.provinsiNama)?.id || "") : undefined,
      masterProvinsiKode: tab === "kabupaten" ? apiProvinsi.find((p: any) => p.nama === item.provinsiNama)?.kode : undefined,
      masterKabupatenKode: item.kode,
    });
    setShowFormDialog(true);
  };

  const actions = [
    { label: "Detail", icon: Eye, action: (item: any) => showDetail(item, tab), show: true },
    { label: "Edit", icon: Edit, action: (item: any) => {
      setActionMenuId(null);
      openEditForm(item);
    }, show: canEdit },
    { label: "Kelola Pengurus", icon: UserCog, action: (item: any) => {
      setActionMenuId(null);
      const filter: Record<string, string> = {};
      if (tab === "provinsi") filter.provinsiNama = item.nama;
      else filter.kabupatenNama = item.nama;
      onNavigate?.("pengurus", filter);
    }, show: true },
    { label: "Ubah Status", icon: Ban, action: (item: any) => {
      setActionMenuId(null);
      handleToggleStatus(item);
    }, show: canEdit, danger: false },
    { label: "Hapus (Nonaktifkan)", icon: Trash2, action: (item: any) => {
      setActionMenuId(null);
      if (window.confirm(`Yakin nonaktifkan ${item.nama}? Data tidak akan dihapus permanen, hanya status diubah menjadi Nonaktif.`)) {
        handleDelete(item);
      }
    }, show: canDelete, danger: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Master Wilayah</h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola data wilayah organisasi KIPAN: Nasional → Provinsi → Kabupaten/Kota
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, idx) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{ y: -3 }}
              onClick={() => s.targetPage && onNavigate?.(s.targetPage)}
              className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-100 ${s.targetPage ? "cursor-pointer hover:border-blue-200" : ""}`}
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-md mb-3`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-extrabold text-blue-950">
                {s.value.toLocaleString("id-ID")}
                {s.total && <span className="text-base text-slate-400">/{s.total}</span>}
              </div>
              <div className="text-sm text-slate-500 mt-1">{s.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => switchTab("provinsi")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "provinsi" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <MapPin className="w-4 h-4 inline mr-1.5" />
            Provinsi ({provData.length})
          </button>
          <button
            onClick={() => switchTab("kabupaten")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "kabupaten" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Building2 className="w-4 h-4 inline mr-1.5" />
            Kabupaten/Kota ({kabData.length})
          </button>
        </div>
        {/* Tambah Provinsi disabled — all 38 provinsi already registered */}
        {tab === "provinsi" && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 text-sm font-medium rounded-lg border border-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Semua 38 provinsi sudah terdaftar
          </div>
        )}
        {tab === "kabupaten" && canCreateKabupaten && (
          <button
            onClick={() => { setFormData({ type: "kabupaten", kode: "", nama: "", status: "Aktif", ketua: "" }); setShowFormDialog(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tambah Kabupaten/Kota
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={tab === "provinsi" ? "Cari nama, kode, atau ketua provinsi..." : "Cari nama atau kode kabupaten..."}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
          />
        </div>
        {tab === "kabupaten" && (
          <select
            value={provinsiFilter}
            onChange={(e) => { setProvinsiFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
          >
            <option value="Semua">Semua Provinsi</option>
            {[...new Set(kabData.map((k: any) => k.provinsiNama))].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        )}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
        >
          <option value="Semua">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Pembentukan">Pembentukan</option>
          <option value="Nonaktif">Nonaktif</option>
          <option value="Dibekukan">Dibekukan</option>
        </select>
        <div className="flex items-center gap-1">
          <button
            onClick={handleRefresh}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={autoFillKetua}
            className="p-2 text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
            title="Auto-fill Ketua dari Pengurus"
          >
            <UserCog className="w-4 h-4" />
          </button>
          {canEdit && (
            <button
              onClick={() => {
                if (window.confirm("Sinkronkan status wilayah otomatis? Wilayah yang ada pengurus aktif akan diset 'Aktif', dan wilayah tanpa pengurus akan diset 'Pembentukan'.")) {
                  syncStatusWilayah();
                }
              }}
              className="p-2 text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
              title="Sinkronkan Status Aktif/Pembentukan dari Keberadaan Pengurus"
            >
              <Activity className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => toast.info("Export Excel akan segera hadir")}
            className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Export Excel (segera hadir)"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              const dataToExport = tab === "provinsi" ? filteredProv : filteredKab;
              if (dataToExport.length === 0) {
                toast.error("Tidak ada data untuk di-export");
                return;
              }
              try {
                exportWilayahPdf(dataToExport, tab, { search, status: statusFilter, provinsi: provinsiFilter });
                toast.success(`PDF berhasil di-export (${dataToExport.length} data)`);
              } catch (e: any) {
                console.error(e);
                toast.error("Gagal export PDF: " + e.message);
              }
            }}
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Export PDF"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Summary */}
      {totalData > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-blue-600 rounded-full" />
            <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
              Ringkasan Hasil Filter
            </h3>
            {hasActiveFilters && (
              <span className="text-[10px] text-blue-500 bg-white px-2 py-0.5 rounded-full border border-blue-200">
                {totalData} dari {tab === "provinsi" ? provData.length : kabData.length} data
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            <SummaryCard label={`Total ${tab === "provinsi" ? "Provinsi" : "Kabupaten"}`} value={filterSummary.total} color="text-blue-600" bg="bg-blue-50" />
            <SummaryCard label="Aktif" value={filterSummary.aktif} color="text-emerald-600" bg="bg-emerald-50" />
            <SummaryCard label="Pembentukan" value={filterSummary.pembentukan} color="text-amber-600" bg="bg-amber-50" />
            <SummaryCard label="Nonaktif" value={filterSummary.nonaktif} color="text-slate-600" bg="bg-slate-100" />
            <SummaryCard label="Total Pengurus" value={filterSummary.totalPengurus} color="text-violet-600" bg="bg-violet-50" />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          /* Skeleton Loading */
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-4 bg-slate-200 animate-pulse rounded" />
                <div className="flex-1 h-4 bg-slate-200 animate-pulse rounded" />
                <div className="w-20 h-4 bg-slate-200 animate-pulse rounded" />
                <div className="w-16 h-4 bg-slate-200 animate-pulse rounded" />
                <div className="w-24 h-4 bg-slate-200 animate-pulse rounded" />
                <div className="w-20 h-4 bg-slate-200 animate-pulse rounded" />
                <div className="w-8 h-4 bg-slate-200 animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : pageData.length === 0 ? (
          /* Empty State */
          <div className="p-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">Belum ada data wilayah</h3>
            <p className="text-sm text-slate-500 mb-4">
              {search || statusFilter !== "Semua" || provinsiFilter !== "Semua"
                ? "Tidak ada data yang sesuai dengan filter. Coba ubah filter atau kata kunci pencarian."
                : `Belum ada ${tab === "provinsi" ? "provinsi" : "kabupaten/kota"} yang terdaftar.`}
            </p>
            {tab === "kabupaten" && canCreateKabupaten && !search && statusFilter === "Semua" && provinsiFilter === "Semua" && (
              <button
                onClick={() => { setFormData({ type: "kabupaten", kode: "", nama: "", status: "Aktif", ketua: "" }); setShowFormDialog(true); }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Tambah Kabupaten/Kota
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                {tab === "provinsi" ? (
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-12 text-center">No</th>
                    <Th onClick={() => handleSort("kode")} icon={getSortIcon("kode")}>Kode</Th>
                    <Th onClick={() => handleSort("nama")} icon={getSortIcon("nama")}>Nama Provinsi</Th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Jml. Kab/Kota</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Jml. Pengurus</th>
                    <Th onClick={() => handleSort("ketua")} icon={getSortIcon("ketua")}>Ketua</Th>
                    <Th onClick={() => handleSort("status")} icon={getSortIcon("status")}>Status</Th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Aksi</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider w-12 text-center">No</th>
                    <Th onClick={() => handleSort("kode")} icon={getSortIcon("kode")}>Kode</Th>
                    <Th onClick={() => handleSort("nama")} icon={getSortIcon("nama")}>Nama Kabupaten/Kota</Th>
                    <Th onClick={() => handleSort("provinsiNama")} icon={getSortIcon("provinsiNama")}>Provinsi</Th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Jml. Pengurus</th>
                    <Th onClick={() => handleSort("ketua")} icon={getSortIcon("ketua")}>Ketua</Th>
                    <Th onClick={() => handleSort("status")} icon={getSortIcon("status")}>Status</Th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Aksi</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageData.map((item: any, idx: number) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => showDetail(item, tab)}
                  >
                    <td className="px-4 py-3 text-sm text-slate-500 text-center">{startIdx + idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-mono text-slate-600">{item.kode}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-blue-950">{item.nama}</td>
                    {tab === "provinsi" && (
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            switchTab("kabupaten");
                            setProvinsiFilter(item.nama);
                            setPage(1);
                          }}
                          className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline"
                          title="Lihat kabupaten di provinsi ini"
                        >
                          {item.jumlahKabupaten}
                        </button>
                      </td>
                    )}
                    {tab === "kabupaten" && (
                      <td className="px-4 py-3 text-sm text-slate-600">{item.provinsiNama}</td>
                    )}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate?.("pengurus", { wilayah: item.nama });
                        }}
                        className="text-sm font-bold text-violet-600 hover:text-violet-700 hover:underline"
                        title="Lihat daftar pengurus"
                      >
                        {item.jumlahPengurus}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{item.ketua || "-"}</td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => canEdit && handleToggleStatus(item)}
                        disabled={!canEdit}
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all ${statusBadge(item.status)} ${canEdit ? "hover:opacity-80 hover:scale-105 cursor-pointer" : ""}`}
                        title={canEdit ? `Klik untuk ubah status (${item.status === "Aktif" ? "Ubah ke Nonaktif" : "Aktifkan"})` : item.status}
                      >
                        {item.status}
                      </button>
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
              <button
                onClick={() => setPage(1)}
                disabled={currentPage === 1}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                title="Halaman pertama"
              >
                <ChevronsUpDown className="w-4 h-4 rotate-90" />
              </button>
              <button
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                title="Halaman sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium text-slate-600 px-3 py-1">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                title="Halaman berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                title="Halaman terakhir"
              >
                <ChevronsUpDown className="w-4 h-4 -rotate-90" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <WilayahDetailDialog
        wilayahId={detailId}
        type={detailType}
        onClose={() => setDetailId(null)}
        onEdit={canEdit ? () => {
          // Cari data wilayah yang sedang ditampilkan untuk dibuka di form edit
          const currentList = detailType === "provinsi" ? provData : kabData;
          const item = currentList.find((i: any) => i.id === detailId);
          if (item) {
            setDetailId(null);
            // Set tab sesuai type sebelum buka form
            if (detailType !== tab) {
              setTab(detailType);
            }
            setTimeout(() => openEditForm(item), 100);
          } else {
            setDetailId(null);
            toast.error("Data tidak ditemukan untuk diedit");
          }
        } : undefined}
        onViewPengurus={(id) => {
          setDetailId(null);
          onNavigate?.("pengurus");
        }}
        onViewAnggota={(id) => {
          setDetailId(null);
          onNavigate?.("pengurus");
        }}
        onAddAnggota={() => {
          onNavigate?.("pengurus");
        }}
        onNavigateToPengurus={(filter) => {
          setDetailId(null);
          // Navigate to pengurus page with filter applied
          onNavigate?.("pengurus", filter);
        }}
      />

      {/* Form Dialog for Add/Edit */}
      <WilayahFormDialog
        open={showFormDialog}
        data={formData}
        provinsiList={apiProvinsi.map((p: any) => ({ id: p.id, nama: p.nama }))}
        existingKabupatenKodes={kabData.map((k: any) => k.kode)}
        onClose={() => setShowFormDialog(false)}
        onSave={handleSave}
      />

      {/* Backdrop for action menu */}
      {actionMenuId !== null && (
        <div
          className="fixed inset-0 z-[5]"
          onClick={() => setActionMenuId(null)}
        />
      )}
    </div>
  );
}

function SummaryCard({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <div className={`${bg} rounded-xl p-3 text-center`}>
      <div className={`text-xl font-extrabold ${color}`}>{value.toLocaleString("id-ID")}</div>
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
