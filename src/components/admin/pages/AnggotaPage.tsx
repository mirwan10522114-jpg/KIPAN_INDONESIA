"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Eye, Download, X, QrCode, CreditCard, RefreshCw, Plus, UserPlus, FileText, Edit2 } from "lucide-react";
import { toast } from "sonner";
import AnggotaDetailDialog from "./AnggotaDetailDialog";
import { exportAnggotaPdf } from "@/lib/pdf-export";
import { fetchJsonSafe } from "@/lib/fetch-helper";
import { useAuthStore } from "@/lib/auth-store";

// Fix React hydration issues by adding a consistent row index (1, 2, 3...)

export default function AnggotaPage({
  initialFilter,
  onNavigate,
}: {
  initialFilter?: Record<string, string> | null;
  onNavigate?: (page: string) => void;
}) {
  const { role, wilayah } = useAuthStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [provFilter, setProvFilter] = useState("Semua");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [provinsiList, setProvinsiList] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addForm, setAddForm] = useState({
    namaLengkap: "", nik: "", tempatLahir: "", tanggalLahir: "",
    jenisKelamin: "L", alamat: "", provinsiId: "", kabupatenId: "",
    email: "", whatsapp: "", pekerjaan: "",
  });
  const [kabupatenList, setKabupatenList] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  // Promote states
  const [showPromoteDialog, setShowPromoteDialog] = useState(false);
  const [promoteTarget, setPromoteTarget] = useState<any>(null);
  const [skList, setSkList] = useState<any[]>([]);
  const [jabatanList, setJabatanList] = useState<any[]>([]);
  const [promoteForm, setPromoteForm] = useState({
    suratKeputusanId: "",
    jabatanId: "",
    level: "KABUPATEN",
    status: "Aktif",
    tanggalMulai: new Date().toISOString().split("T")[0],
  });
  const [promoting, setPromoting] = useState(false);

  // Edit Anggota states
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editAnggotaTarget, setEditAnggotaTarget] = useState<any>(null);
  const [editAnggotaForm, setEditAnggotaForm] = useState({
    namaLengkap: "",
    status: "Aktif",
    keteranganStatus: "",
    pekerjaan: "",
    alamat: "",
    email: "",
    whatsapp: "",
  });
  const [editAnggotaSaving, setEditAnggotaSaving] = useState(false);

  const openEditAnggota = (anggota: any) => {
    setEditAnggotaTarget(anggota);
    setEditAnggotaForm({
      namaLengkap: anggota.namaLengkap || "",
      status: anggota.status || "AKTIF",
      keteranganStatus: anggota.keteranganStatus || "",
      pekerjaan: anggota.pekerjaan || "",
      alamat: anggota.alamat || "",
      email: anggota.email || "",
      whatsapp: anggota.whatsapp || "",
    });
    setShowEditDialog(true);
  };

  const handleSaveEditAnggota = async () => {
    if (!editAnggotaTarget) return;
    if (editAnggotaForm.status !== "Aktif" && !editAnggotaForm.keteranganStatus.trim()) {
      toast.error("Keterangan/Alasan wajib diisi jika status diubah.");
      return;
    }
    setEditAnggotaSaving(true);
    try {
      const res = await fetch(`/api/anggota/${editAnggotaTarget.id}?role=${role}&wilayah=${wilayah || ""}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editAnggotaForm),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Data anggota berhasil diperbarui");
        setShowEditDialog(false);
        setEditAnggotaTarget(null);
        fetchData();
      } else {
        toast.error(json.error || "Gagal menyimpan");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setEditAnggotaSaving(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (role) params.append("role", role);
      if (wilayah) params.append("wilayah", wilayah);

      const [anggotaRes, wilayahRes] = await Promise.all([
        fetch(`/api/anggota?${params.toString()}`, { cache: "no-store" }),
        fetch("/api/wilayah?type=provinsi", { cache: "no-store" }),
      ]);
      const anggotaJson = await anggotaRes.json();
      const wilayahJson = await wilayahRes.json();
      if (anggotaJson.success) setData(anggotaJson.data);
      if (wilayahJson.success) setProvinsiList(wilayahJson.data.filter((p: any) => p.status === "Aktif"));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialFilter) {
      if (initialFilter.provinsiNama) setProvFilter(initialFilter.provinsiNama);
      if (initialFilter.kabupatenNama) {
        // Set kabupaten filter — we need to also set provinsi first
        // For now, set search to the kabupaten name as a workaround
        setSearch(initialFilter.kabupatenNama);
      }
    }
    fetchData();
  }, []);

  const filtered = data.filter((a) => {
    const matchSearch = a.namaLengkap.toLowerCase().includes(search.toLowerCase()) ||
      a.nia.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "Semua" || a.status === statusFilter;
    const matchProv = provFilter === "Semua" || a.provinsi?.nama === provFilter;
    return matchSearch && matchStatus && matchProv;
  });

  // Summary stats from filtered data
  const filterSummary = {
    total: filtered.length,
    aktif: filtered.filter((a) => a.status === "Aktif").length,
    nonaktif: filtered.filter((a) => a.status !== "Aktif").length,
    provinsiCount: new Set(filtered.map((a) => a.provinsi?.nama).filter(Boolean)).size,
    kabupatenCount: new Set(filtered.map((a) => a.kabupaten?.nama).filter(Boolean)).size,
  };
  const hasActiveFilters = search !== "" || statusFilter !== "Semua" || provFilter !== "Semua";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Manajemen Anggota</h1>
          <p className="text-slate-500 text-sm mt-1">Total {data.length} anggota ditampilkan</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            onClick={() => setShowAddDialog(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4" /> Tambah Anggota
          </button>
          <button
            onClick={() => {
              if (filtered.length === 0) {
                toast.error("Tidak ada data untuk di-export");
                return;
              }
              try {
                exportAnggotaPdf(filtered, {
                  search,
                  status: statusFilter,
                  provinsi: provFilter,
                });
                toast.success(`PDF berhasil di-export (${filtered.length} anggota)`);
              } catch (e: any) {
                console.error(e);
                toast.error("Gagal export PDF: " + e.message);
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white text-sm font-semibold rounded-lg hover:bg-rose-700"
          >
            <FileText className="w-4 h-4" /> Export PDF
          </button>
          <button
            onClick={() => toast.info("Export Excel akan segera hadir")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700"
          >
            <Download className="w-4 h-4" /> Excel
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau NIP..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
          />
        </div>
        <select
          value={provFilter}
          onChange={(e) => setProvFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
        >
          <option>Semua</option>
          {provinsiList.map((p) => <option key={p.id}>{p.nama}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
        >
          {["Semua", "Aktif", "Nonaktif", "Mengundurkan Diri", "Diberhentikan", "Meninggal"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Filter Summary */}
      {filtered.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-emerald-600 rounded-full" />
            <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">Ringkasan Hasil Filter</h3>
            {hasActiveFilters && (
              <span className="text-[10px] text-emerald-600 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                {filtered.length} dari {data.length} anggota
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white rounded-xl p-3 text-center">
              <div className="text-xl font-extrabold text-blue-600">{filterSummary.total}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Total Anggota</div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center">
              <div className="text-xl font-extrabold text-emerald-600">{filterSummary.aktif}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Aktif</div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center">
              <div className="text-xl font-extrabold text-slate-500">{filterSummary.nonaktif}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Nonaktif</div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center">
              <div className="text-xl font-extrabold text-violet-600">{filterSummary.provinsiCount}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Provinsi</div>
            </div>
            <div className="bg-white rounded-xl p-3 text-center">
              <div className="text-xl font-extrabold text-cyan-600">{filterSummary.kabupatenCount}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Kabupaten</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Memuat data anggota...</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase w-12 text-center">No</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">NIP</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Provinsi</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Kab/Kota</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Kecamatan</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Status</th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((a, idx) => (
                <tr key={a.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedId(a.id)}>
                  <td className="px-4 py-3 text-sm text-slate-500 text-center">{idx + 1}</td>
                  <td className="px-4 py-3 text-sm font-mono text-blue-600">{a.nia}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-blue-950">{a.namaLengkap}</div>
                    <div className="text-xs text-slate-500">{a.pekerjaan}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{a.provinsi?.nama || "-"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{a.kabupaten?.nama || "-"}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{a.kecamatan || "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      a.status === "Aktif" ? "bg-emerald-100 text-emerald-700" :
                      a.status === "Nonaktif" ? "bg-slate-100 text-slate-600" :
                      a.status === "Mengundurkan Diri" ? "bg-amber-100 text-amber-700" :
                      a.status === "Diberhentikan" ? "bg-rose-100 text-rose-700" :
                      a.status === "Meninggal" ? "bg-slate-200 text-slate-800" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Dialog */}
      <AnggotaDetailDialog
        anggotaId={selectedId}
        onClose={() => setSelectedId(null)}
        onEdit={() => {
          setSelectedId(null);
          const target = data.find((a) => a.id === selectedId);
          if (target) openEditAnggota(target);
        }}
        onPromote={(id) => {
          setSelectedId(null);
          const target = data.find((a) => a.id === id);
          if (target) {
            setPromoteTarget(target);
            // Fetch SKs & Jabatan
            Promise.all([
              fetch("/api/surat-keputusan", { cache: "no-store" }).then((r) => r.json()),
              fetch("/api/jabatan", { cache: "no-store" }).then((r) => r.json()),
            ]).then(([skRes, jabRes]) => {
              if (skRes.success) setSkList(skRes.data.filter((sk: any) => sk.status === "Aktif"));
              if (jabRes.success) setJabatanList(jabRes.data);
              setShowPromoteDialog(true);
            }).catch(() => {
              toast.error("Gagal mengambil data SK / Jabatan");
            });
          }
        }}
      />

      {/* Edit Anggota Dialog */}
      <AnimatePresence>
        {showEditDialog && editAnggotaTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEditDialog(false)}
            className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
            >
              <div className="bg-gradient-to-r from-blue-600 to-sky-500 p-5 rounded-t-2xl flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <Edit2 className="w-5 h-5" />
                  <div>
                    <h3 className="font-bold text-lg">Edit Data Anggota</h3>
                    <p className="text-blue-100 text-xs">{editAnggotaTarget.nia} — {editAnggotaTarget.namaLengkap}</p>
                  </div>
                </div>
                <button onClick={() => setShowEditDialog(false)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Status — field terpenting */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Status Keanggotaan</label>
                  <select
                    value={editAnggotaForm.status}
                    onChange={(e) => setEditAnggotaForm({ ...editAnggotaForm, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none bg-white font-semibold"
                  >
                    <option value="Aktif">✅ Aktif</option>
                    <option value="Nonaktif">⬜ Nonaktif</option>
                    <option value="Mengundurkan Diri">🔶 Mengundurkan Diri</option>
                    <option value="Diberhentikan">🔴 Diberhentikan</option>
                    <option value="Meninggal">⚫ Meninggal Dunia</option>
                  </select>
                </div>

                {editAnggotaForm.status !== "Aktif" && (
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Keterangan / Alasan <span className="text-rose-500">*</span></label>
                    <textarea
                      required
                      rows={2}
                      value={editAnggotaForm.keteranganStatus}
                      onChange={(e) => setEditAnggotaForm({ ...editAnggotaForm, keteranganStatus: e.target.value })}
                      placeholder="Wajib diisi jika status diubah..."
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none resize-none"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Lengkap</label>
                    <input
                      type="text"
                      value={editAnggotaForm.namaLengkap}
                      onChange={(e) => setEditAnggotaForm({ ...editAnggotaForm, namaLengkap: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pekerjaan</label>
                    <input
                      type="text"
                      value={editAnggotaForm.pekerjaan}
                      onChange={(e) => setEditAnggotaForm({ ...editAnggotaForm, pekerjaan: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Alamat</label>
                    <textarea
                      rows={2}
                      value={editAnggotaForm.alamat}
                      onChange={(e) => setEditAnggotaForm({ ...editAnggotaForm, alamat: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
                      <input
                        type="email"
                        value={editAnggotaForm.email}
                        onChange={(e) => setEditAnggotaForm({ ...editAnggotaForm, email: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">WhatsApp</label>
                      <input
                        type="tel"
                        value={editAnggotaForm.whatsapp}
                        onChange={(e) => setEditAnggotaForm({ ...editAnggotaForm, whatsapp: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setShowEditDialog(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleSaveEditAnggota}
                    disabled={editAnggotaSaving}
                    className="px-5 py-2 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {editAnggotaSaving ? (
                      <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Menyimpan...</>
                    ) : (
                      <><Edit2 className="w-3.5 h-3.5" /> Simpan Perubahan</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Promote Dialog */}
      <AnimatePresence>
        {showPromoteDialog && promoteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPromoteDialog(false)}
            className="fixed inset-0 z-[300] bg-blue-950/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <div className="relative bg-gradient-to-r from-violet-600 to-purple-500 p-5 text-white">
                <button onClick={() => setShowPromoteDialog(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Jadikan Pengurus</h2>
                    <p className="text-xs text-violet-100">{promoteTarget.namaLengkap} - {promoteTarget.nia}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pilih Surat Keputusan (SK) *</label>
                  <select
                    value={promoteForm.suratKeputusanId}
                    onChange={(e) => {
                      const skId = e.target.value;
                      const sk = skList.find((s) => s.id.toString() === skId);
                      setPromoteForm({ ...promoteForm, suratKeputusanId: skId, level: sk?.level || "KABUPATEN" });
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                  >
                    <option value="">Pilih SK Aktif...</option>
                    {skList.map((sk) => (
                      <option key={sk.id} value={sk.id}>{sk.nomorSK} - {sk.judul}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Jabatan *</label>
                  <select
                    value={promoteForm.jabatanId}
                    onChange={(e) => setPromoteForm({ ...promoteForm, jabatanId: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                  >
                    <option value="">Pilih Jabatan...</option>
                    {jabatanList.map((j) => (
                      <option key={j.id} value={j.id}>{j.nama} ({j.level})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Level Kepengurusan</label>
                    <input
                      type="text"
                      value={promoteForm.level}
                      readOnly
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-500 outline-none cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tanggal Mulai Jabatan *</label>
                    <input
                      type="date"
                      value={promoteForm.tanggalMulai}
                      onChange={(e) => setPromoteForm({ ...promoteForm, tanggalMulai: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 flex justify-end gap-2">
                <button onClick={() => setShowPromoteDialog(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                <button
                  onClick={async () => {
                    if (!promoteForm.suratKeputusanId || !promoteForm.jabatanId) {
                      toast.error("Surat Keputusan dan Jabatan wajib dipilih");
                      return;
                    }
                    setPromoting(true);
                    try {
                      const res = await fetch(`/api/pengurus?role=${role}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          anggotaId: promoteTarget.id,
                          suratKeputusanId: promoteForm.suratKeputusanId,
                          jabatanId: promoteForm.jabatanId,
                          level: promoteForm.level,
                          status: promoteForm.status,
                          tanggalMulai: promoteForm.tanggalMulai,
                          provinsiId: promoteTarget.provinsi?.id ? String(promoteTarget.provinsi.id) : undefined,
                          kabupatenId: promoteTarget.kabupaten?.id ? String(promoteTarget.kabupaten.id) : undefined,
                        }),
                      });
                      const json = await res.json();
                      if (json.success) {
                        toast.success(json.message || `Berhasil menjadikan ${promoteTarget.namaLengkap} sebagai pengurus`);
                        setShowPromoteDialog(false);
                      } else {
                        toast.error(json.error || "Gagal menjadikan pengurus");
                      }
                    } catch (e: any) {
                      toast.error("Terjadi kesalahan: " + e.message);
                    } finally {
                      setPromoting(false);
                    }
                  }}
                  disabled={promoting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50"
                >
                  {promoting ? "Memproses..." : "Simpan Pengurus"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Anggota Dialog */}
      <AnimatePresence>
        {showAddDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddDialog(false)}
            className="fixed inset-0 z-[300] bg-blue-950/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="relative bg-gradient-to-r from-emerald-600 to-teal-500 p-5 text-white">
                <button onClick={() => setShowAddDialog(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Tambah Anggota</h2>
                    <p className="text-xs text-emerald-100">NIP akan dibuat otomatis</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Lengkap *</label>
                    <input type="text" value={addForm.namaLengkap} onChange={(e) => setAddForm({ ...addForm, namaLengkap: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">NIK (16 digit) *</label>
                    <input type="text" maxLength={16} value={addForm.nik} onChange={(e) => setAddForm({ ...addForm, nik: e.target.value.replace(/\D/g, "") })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tempat Lahir</label>
                    <input type="text" value={addForm.tempatLahir} onChange={(e) => setAddForm({ ...addForm, tempatLahir: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tanggal Lahir</label>
                    <input type="date" value={addForm.tanggalLahir} onChange={(e) => setAddForm({ ...addForm, tanggalLahir: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Jenis Kelamin</label>
                    <select value={addForm.jenisKelamin} onChange={(e) => setAddForm({ ...addForm, jenisKelamin: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none">
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pekerjaan</label>
                    <input type="text" value={addForm.pekerjaan} onChange={(e) => setAddForm({ ...addForm, pekerjaan: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Alamat</label>
                  <input type="text" value={addForm.alamat} onChange={(e) => setAddForm({ ...addForm, alamat: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Provinsi *</label>
                    <select
                      value={addForm.provinsiId}
                      onChange={async (e) => {
                        setAddForm({ ...addForm, provinsiId: e.target.value, kabupatenId: "" });
                        const res = await fetch(`/api/wilayah?type=kabupaten`, { cache: "no-store" });
                        const json = await res.json();
                        if (json.success) setKabupatenList(json.data.filter((k: any) => k.provinsiId === parseInt(e.target.value) && k.status === "Aktif"));
                      }}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                    >
                      <option value="">Pilih...</option>
                      {provinsiList.map((p) => <option key={p.id} value={p.id}>{p.nama}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kabupaten *</label>
                    <select value={addForm.kabupatenId} onChange={(e) => setAddForm({ ...addForm, kabupatenId: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" disabled={!addForm.provinsiId}>
                      <option value="">Pilih...</option>
                      {kabupatenList.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
                    <input type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">No. WhatsApp</label>
                    <input type="tel" value={addForm.whatsapp} onChange={(e) => setAddForm({ ...addForm, whatsapp: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                  </div>
                </div>

                {/* Upload Dokumen */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Upload Dokumen</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: "foto", label: "Pas Foto" },
                      { key: "ktp", label: "KTP" },
                      { key: "cv", label: "CV/Resume" },
                      { key: "suratPernyataan", label: "Surat Pernyataan" },
                      { key: "suratSehat", label: "Surat Sehat" },
                    ].map((doc) => (
                      <div key={doc.key}>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">{doc.label}</label>
                        <input
                          type="file"
                          accept={
                            doc.key === "foto" ? "image/jpeg,image/png,image/jpg" :
                            doc.key === "ktp" ? "image/jpeg,image/png,image/jpg,.pdf" :
                            ".pdf"
                          }
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 1024 * 1024 * 2) {
                              toast.error("File maksimal 2MB");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = () => {
                              setAddForm((prev) => ({ ...prev, [doc.key]: reader.result }));
                              toast.success(`${doc.label} uploaded`);
                            };
                            reader.readAsDataURL(file);
                          }}
                          className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {(addForm as any)[doc.key] && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-emerald-600">✓ {doc.label} terupload</span>
                            <button
                              type="button"
                              onClick={() => {
                                const url = (addForm as any)[doc.key];
                                const parts = url.split(",");
                                const header = parts[0];
                                const base64 = parts[1];
                                const mimeMatch = header.match(/:(.*?);/);
                                if (mimeMatch && base64) {
                                  const mimeType = mimeMatch[1];
                                  try {
                                    const binary = atob(base64);
                                    const array = new Uint8Array(binary.length);
                                    for (let i = 0; i < binary.length; i++) {
                                      array[i] = binary.charCodeAt(i);
                                    }
                                    const blob = new Blob([array], { type: mimeType });
                                    const objectUrl = URL.createObjectURL(blob);
                                    window.open(objectUrl, "_blank");
                                  } catch (e) {
                                    console.error("Failed to decode base64", e);
                                    alert("Gagal membuka dokumen. Format file tidak valid.");
                                  }
                                }
                              }}
                              className="text-[10px] text-blue-600 hover:text-blue-700 underline"
                            >
                              Lihat
                            </button>
                            <button
                              type="button"
                              onClick={() => setAddForm((prev) => ({ ...prev, [doc.key]: undefined }))}
                              className="text-[10px] text-rose-500 hover:text-rose-700 underline"
                            >
                              Hapus
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 flex justify-end gap-2">
                <button onClick={() => setShowAddDialog(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                <button
                  onClick={async () => {
                    if (!addForm.namaLengkap || !addForm.nik || !addForm.provinsiId || !addForm.kabupatenId) {
                      toast.error("Nama, NIK, provinsi, dan kabupaten wajib diisi");
                      return;
                    }
                    setSaving(true);
                    try {
                      const result = await fetchJsonSafe<any>(`/api/anggota?role=${role}&wilayah=${wilayah || ""}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(addForm),
                      });
                      if (result.ok) {
                        toast.success(result.data.message);
                        setShowAddDialog(false);
                        fetchData();
                        setAddForm({ namaLengkap: "", nik: "", tempatLahir: "", tanggalLahir: "", jenisKelamin: "L", alamat: "", provinsiId: "", kabupatenId: "", email: "", whatsapp: "", pekerjaan: "" });
                      } else {
                        toast.error(result.error || "Gagal menambahkan anggota");
                      }
                    } catch (e: any) {
                      toast.error(e?.message || "Gagal menambahkan anggota");
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>
                  ) : (
                    <><UserPlus className="w-4 h-4" /> Tambah Anggota</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-medium text-slate-800">{value}</div>
    </div>
  );
}
