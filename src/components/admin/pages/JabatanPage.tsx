"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  X,
  Save,
  ChevronDown,
  ChevronRight,
  Users,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

const LEVELS = ["Nasional", "Provinsi", "Kabupaten"] as const;

export default function JabatanPage() {
  const [jabatanList, setJabatanList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("Semua");
  const [expandedBidang, setExpandedBidang] = useState<Record<string, boolean>>({});
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showAddBidangDialog, setShowAddBidangDialog] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/jabatan", { cache: "no-store" });
      const json = await res.json();
      if (json.success) setJabatanList(json.data);
    } catch (e) {
      console.error(e);
      toast.error("Gagal memuat data jabatan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter
  const filtered = useMemo(() => {
    let result = jabatanList;
    if (levelFilter !== "Semua") {
      result = result.filter((j) => j.level === levelFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (j) => j.nama.toLowerCase().includes(q) || j.bidang.toLowerCase().includes(q)
      );
    }
    return result;
  }, [jabatanList, levelFilter, search]);

  // Group by bidang
  const grouped = useMemo(() => {
    const g: Record<string, any[]> = {};
    for (const j of filtered) {
      if (!g[j.bidang]) g[j.bidang] = [];
      g[j.bidang].push(j);
    }
    // Sort urutan in each bidang
    for (const b of Object.keys(g)) {
      g[b].sort((a, b2) => a.urutan - b2.urutan);
    }
    return g;
  }, [filtered]);

  const bidangNames = Object.keys(grouped).sort();

  // Stats
  const totalJabatan = filtered.length;
  const totalBidang = bidangNames.length;
  const totalPengurus = filtered.reduce((sum, j) => sum + (j._count?.pengurus || 0), 0);
  const totalAktif = filtered.filter((j) => j.status === "Aktif").length;

  const toggleBidang = (bidang: string) => {
    setExpandedBidang((prev) => ({ ...prev, [bidang]: !prev[bidang] }));
  };

  const handleDelete = async (id: number, nama: string, bidang: string) => {
    if (!confirm(`Yakin hapus jabatan "${nama}" dari bidang "${bidang}"?`)) return;
    try {
      const res = await fetch(`/api/jabatan/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        fetchData();
      } else {
        toast.error(json.error);
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleToggleStatus = async (item: any) => {
    const newStatus = item.status === "Aktif" ? "Nonaktif" : "Aktif";
    try {
      const res = await fetch(`/api/jabatan/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Jabatan ${newStatus === "Aktif" ? "diaktifkan" : "dinonaktifkan"}`);
        fetchData();
      } else {
        toast.error(json.error);
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Bidang & Jabatan</h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola struktur organisasi — Pengurus Harian, Divisi-divisi, dan jabatan di tiap level
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setShowFormDialog(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" /> Tambah Jabatan
          </button>
          <button
            onClick={() => setShowAddBidangDialog(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700"
          >
            <Plus className="w-4 h-4" /> Tambah Bidang Baru
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Bidang" value={totalBidang} color="text-violet-600" bg="bg-violet-50" />
        <StatCard label="Total Jabatan" value={totalJabatan} color="text-blue-600" bg="bg-blue-50" />
        <StatCard label="Jabatan Aktif" value={totalAktif} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard label="Dipakai Pengurus" value={totalPengurus} color="text-amber-600" bg="bg-amber-50" />
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari jabatan atau bidang..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
          />
        </div>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
        >
          <option value="Semua">Semua Level</option>
          {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {/* Bidang List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Memuat data...</p>
          </div>
        ) : bidangNames.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-3">Belum ada bidang & jabatan</p>
            <button
              onClick={() => setShowAddBidangDialog(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700"
            >
              <Plus className="w-4 h-4" /> Tambah Bidang Baru
            </button>
          </div>
        ) : (
          bidangNames.map((bidang) => {
            const items = grouped[bidang];
            const isExpanded = expandedBidang[bidang] !== false; // default expand
            const pengurusCount = items.reduce((s, j) => s + (j._count?.pengurus || 0), 0);
            return (
              <div key={bidang} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <button
                  onClick={() => toggleBidang(bidang)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-bold text-blue-950 truncate">{bidang}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {items.length} jabatan • {pengurusCount} pengurus terdaftar
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-100 divide-y divide-slate-50">
                        {items.map((j) => (
                          <div key={j.id} className="flex items-center gap-3 p-3 hover:bg-slate-50">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                              {j.urutan}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-slate-800">{j.nama}</div>
                              <div className="text-[10px] text-slate-400">
                                Level: {j.level} • ID: {j.id}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                <Users className="w-3 h-3" />
                                {j._count?.pengurus || 0}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                j.status === "Aktif" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                              }`}>
                                {j.status}
                              </span>
                              <button
                                onClick={() => {
                                  setEditingItem(j);
                                  setShowFormDialog(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleToggleStatus(j)}
                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded"
                                title={j.status === "Aktif" ? "Nonaktifkan" : "Aktifkan"}
                              >
                                <AlertCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(j.id, j.nama, j.bidang)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* Form Dialog — Tambah/Edit Jabatan */}
      <JabatanFormDialog
        open={showFormDialog}
        data={editingItem}
        existingBidang={bidangNames}
        onClose={() => {
          setShowFormDialog(false);
          setEditingItem(null);
        }}
        onSaved={() => {
          setShowFormDialog(false);
          setEditingItem(null);
          fetchData();
        }}
      />

      {/* Add Bidang Dialog */}
      <AddBidangDialog
        open={showAddBidangDialog}
        existingBidang={bidangNames}
        onClose={() => setShowAddBidangDialog(false)}
        onCreated={() => {
          setShowAddBidangDialog(false);
          fetchData();
        }}
      />
    </div>
  );
}

// ============================================================
// Sub-component: Stat Card
// ============================================================
function StatCard({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <div className={`rounded-xl p-4 ${bg} border border-white`}>
      <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
      <div className="text-[10px] text-slate-600 mt-0.5">{label}</div>
    </div>
  );
}

// ============================================================
// Sub-component: Jabatan Form Dialog (Tambah/Edit Jabatan)
// ============================================================
function JabatanFormDialog({
  open,
  data,
  existingBidang,
  onClose,
  onSaved,
}: {
  open: boolean;
  data: any;
  existingBidang: string[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    nama: "",
    bidang: "Pengurus Harian",
    level: "Nasional",
    urutan: 1,
    status: "Aktif",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [newBidangMode, setNewBidangMode] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        nama: data.nama,
        bidang: data.bidang,
        level: data.level,
        urutan: data.urutan,
        status: data.status,
      });
      setNewBidangMode(false);
    } else {
      setForm({
        nama: "",
        bidang: existingBidang[0] || "Pengurus Harian",
        level: "Nasional",
        urutan: 1,
        status: "Aktif",
      });
      setNewBidangMode(false);
    }
    setError("");
  }, [data, open, existingBidang]);

  const handleSave = async () => {
    if (!form.nama.trim()) {
      setError("Nama jabatan wajib diisi");
      return;
    }
    if (!form.bidang.trim()) {
      setError("Bidang wajib diisi");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const method = data ? "PATCH" : "POST";
      const url = data ? `/api/jabatan/${data.id}` : "/api/jabatan";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error);
      }
      toast.success(json.message);
      onSaved();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[300] bg-blue-950/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full"
          >
            <div className="relative bg-gradient-to-r from-blue-600 to-sky-500 p-5 text-white">
              <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">{data ? "Edit" : "Tambah"} Jabatan</h2>
                  <p className="text-xs text-blue-100">Isi data jabatan dengan benar</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2 rounded-lg">
                  ⚠️ {error}
                </div>
              )}

              {/* Bidang */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bidang *</label>
                {!newBidangMode ? (
                  <div className="flex gap-2">
                    <select
                      value={form.bidang}
                      onChange={(e) => setForm({ ...form, bidang: e.target.value })}
                      className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                    >
                      {existingBidang.length === 0 && <option value="Pengurus Harian">Pengurus Harian</option>}
                      {existingBidang.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        setNewBidangMode(true);
                        setForm({ ...form, bidang: "" });
                      }}
                      className="px-3 py-2 text-xs font-semibold text-violet-600 border border-violet-200 rounded-lg hover:bg-violet-50 whitespace-nowrap"
                    >
                      + Bidang Baru
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.bidang}
                      onChange={(e) => setForm({ ...form, bidang: e.target.value })}
                      placeholder="Contoh: Divisi Pemberdayaan Pemuda"
                      className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setNewBidangMode(false);
                        setForm({ ...form, bidang: existingBidang[0] || "Pengurus Harian" });
                      }}
                      className="px-3 py-2 text-xs font-semibold text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 whitespace-nowrap"
                    >
                      Pilih Existing
                    </button>
                  </div>
                )}
              </div>

              {/* Nama Jabatan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Jabatan *</label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Contoh: Ketua Divisi, Sekretaris, Anggota"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Level *</label>
                  <select
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                  >
                    {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Urutan</label>
                  <input
                    type="number"
                    min={1}
                    value={form.urutan}
                    onChange={(e) => setForm({ ...form, urutan: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>
                ) : (
                  <><Save className="w-4 h-4" /> Simpan</>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// Sub-component: Add Bidang Dialog — create new bidang with 3 default jabatan
// ============================================================
function AddBidangDialog({
  open,
  existingBidang,
  onClose,
  onCreated,
}: {
  open: boolean;
  existingBidang: string[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [bidangName, setBidangName] = useState("");
  const [levels, setLevels] = useState({ Nasional: true, Provinsi: true, Kabupaten: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setBidangName("");
      setLevels({ Nasional: true, Provinsi: true, Kabupaten: true });
      setError("");
    }
  }, [open]);

  const handleCreate = async () => {
    if (!bidangName.trim()) {
      setError("Nama bidang wajib diisi");
      return;
    }
    if (existingBidang.includes(bidangName.trim())) {
      setError("Bidang dengan nama ini sudah ada");
      return;
    }
    const selectedLevels = Object.keys(levels).filter((l) => (levels as any)[l]);
    if (selectedLevels.length === 0) {
      setError("Pilih minimal 1 level");
      return;
    }
    setSaving(true);
    setError("");
    try {
      // Create 3 default jabatan (Ketua Divisi, Sekretaris Divisi, Anggota) for each selected level
      const defaultJabatan = [
        { nama: "Ketua Divisi", urutan: 1 },
        { nama: "Sekretaris Divisi", urutan: 2 },
        { nama: "Anggota", urutan: 3 },
      ];
      let created = 0;
      for (const level of selectedLevels) {
        for (const dj of defaultJabatan) {
          const res = await fetch("/api/jabatan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nama: dj.nama,
              bidang: bidangName.trim(),
              level,
              urutan: dj.urutan,
            }),
          });
          const json = await res.json();
          if (json.success) created++;
        }
      }
      toast.success(`Bidang "${bidangName.trim()}" dibuat dengan ${created} jabatan di ${selectedLevels.length} level`);
      onCreated();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[300] bg-blue-950/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full"
          >
            <div className="relative bg-gradient-to-r from-violet-600 to-purple-500 p-5 text-white">
              <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Tambah Bidang Baru</h2>
                  <p className="text-xs text-violet-100">Otomatis dibuat 3 jabatan: Ketua Divisi, Sekretaris Divisi, Anggota</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2 rounded-lg">
                  ⚠️ {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Bidang *</label>
                <input
                  type="text"
                  value={bidangName}
                  onChange={(e) => setBidangName(e.target.value)}
                  placeholder="Contoh: Divisi Pemberdayaan Pemuda"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-violet-500 outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Contoh: "Divisi Pemberdayaan Pemuda", "Divisi Hukum dan Advokasi"
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Buat di Level *</label>
                <div className="space-y-2">
                  {LEVELS.map((l) => (
                    <label key={l} className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(levels as any)[l]}
                        onChange={(e) => setLevels({ ...levels, [l]: e.target.checked })}
                        className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500"
                      />
                      <span className="text-sm text-slate-700">{l}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-violet-50 border border-violet-100 rounded-lg p-3">
                <p className="text-xs text-violet-700">
                  ℹ️ Akan dibuat <strong>3 jabatan default</strong> (Ketua Divisi, Sekretaris Divisi, Anggota) di setiap level yang dipilih. Anda bisa menambah jabatan lain setelah bidang dibuat.
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
                Batal
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50"
              >
                {saving ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Membuat...</>
                ) : (
                  <><Plus className="w-4 h-4" /> Buat Bidang</>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
