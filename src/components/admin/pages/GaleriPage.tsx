"use client";

import { useState, useEffect } from "react";
import { Plus, Image as ImageIcon, Trash2, Eye, Search, X, RefreshCw } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "sonner";

const KATEGORI_LIST = ["Semua", "Kegiatan", "Pelatihan", "Sosialisasi", "Rapat", "Kampanye"];

export default function GaleriPage() {
  const { role, provinsiId, kabupatenId } = useAuthStore();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Semua");
  const [search, setSearch] = useState("");

  // Upload state
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadForm, setUploadForm] = useState({
    judul: "",
    deskripsi: "",
    album: "",
    lokasi: "",
    kategori: "Kegiatan",
  });
  const [saving, setSaving] = useState(false);

  // View state
  const [viewItem, setViewItem] = useState<any | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "Semua") params.set("kategori", filter);
      if (role) params.set("role", role);
      if (provinsiId) params.set("provinsiId", String(provinsiId));
      if (kabupatenId) params.set("kabupatenId", String(kabupatenId));

      const res = await fetch(`/api/galeri?${params.toString()}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        toast.error(json.error || "Gagal memuat galeri");
      }
    } catch (e) {
      toast.error("Terjadi kesalahan saat memuat galeri");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const filtered = data.filter((g) => {
    const matchSearch = !search ||
      g.judul.toLowerCase().includes(search.toLowerCase()) ||
      (g.lokasi || "").toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return toast.error("Pilih foto terlebih dahulu.");
    if (!uploadForm.judul) return toast.error("Judul foto wajib diisi.");

    setSaving(true);
    try {
      // 1. Upload file ke server
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadJson = await uploadRes.json();
      if (!uploadJson.success) {
        toast.error(uploadJson.error || "Gagal mengunggah foto");
        setSaving(false);
        return;
      }

      // 2. Simpan metadata ke database
      const payload = {
        ...uploadForm,
        foto: uploadJson.url,
        role,
        provinsiId: provinsiId ? String(provinsiId) : undefined,
        kabupatenId: kabupatenId ? String(kabupatenId) : undefined,
        penulis: "Admin",
      };

      const saveRes = await fetch("/api/galeri", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const saveJson = await saveRes.json();

      if (saveJson.success) {
        toast.success("Foto berhasil diunggah ke galeri!");
        setShowUploadDialog(false);
        setFile(null);
        setPreviewUrl(null);
        setUploadForm({ judul: "", deskripsi: "", album: "", lokasi: "", kategori: "Kegiatan" });
        fetchData();
      } else {
        toast.error(saveJson.error || "Gagal menyimpan foto");
      }
    } catch (e: any) {
      toast.error("Terjadi kesalahan: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, judul: string) => {
    if (!confirm(`Hapus foto "${judul}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      const res = await fetch(`/api/galeri/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        toast.success("Foto berhasil dihapus.");
        fetchData();
      } else {
        toast.error(json.error || "Gagal menghapus foto");
      }
    } catch (e: any) {
      toast.error("Terjadi kesalahan: " + e.message);
    }
  };

  const getLevelBadgeColor = (level: string) => {
    if (level === "Nasional") return "bg-purple-100 text-purple-700 border-purple-200";
    if (level === "Provinsi") return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Galeri Kegiatan</h1>
          <p className="text-slate-500 text-sm mt-1">
            {filtered.length} dari {data.length} foto dalam galeri
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowUploadDialog(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" /> Upload Foto
          </button>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2 flex-wrap">
          {KATEGORI_LIST.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === cat ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul atau lokasi..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin" />
          <p className="text-sm">Memuat galeri...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Belum ada foto di galeri</p>
          <p className="text-slate-400 text-sm mt-1">Klik "Upload Foto" untuk menambahkan foto kegiatan</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                <img
                  src={item.foto}
                  alt={item.judul}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23e2e8f0'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%2394a3b8' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  <div className="text-white text-xs font-semibold line-clamp-2">{item.judul}</div>
                  {item.lokasi && <div className="text-blue-200 text-[10px] mt-0.5">{item.lokasi}</div>}
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setViewItem(item)}
                    className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-blue-600 hover:bg-white shadow"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.judul)}
                    className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-rose-600 hover:bg-white shadow"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-2.5">
                <div className="text-xs font-semibold text-blue-950 truncate">{item.judul}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-slate-500">{item.kategori} {item.lokasi ? `• ${item.lokasi}` : ""}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold ${getLevelBadgeColor(item.level)}`}>
                    {item.level}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      {showUploadDialog && (
        <div
          className="fixed inset-0 z-[300] bg-blue-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowUploadDialog(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-blue-950">Upload Foto Kegiatan</h2>
              <button onClick={() => setShowUploadDialog(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* File Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Foto *</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-[10px] text-slate-400 mt-1">Format: JPG, PNG, WebP — Maks. 5 MB</p>
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Judul */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Foto *</label>
                <input
                  type="text"
                  value={uploadForm.judul}
                  onChange={(e) => setUploadForm({ ...uploadForm, judul: e.target.value })}
                  placeholder="Judul foto kegiatan..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              {/* Kategori & Lokasi */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={uploadForm.kategori}
                    onChange={(e) => setUploadForm({ ...uploadForm, kategori: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                  >
                    {["Kegiatan", "Pelatihan", "Sosialisasi", "Rapat", "Kampanye"].map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Lokasi</label>
                  <input
                    type="text"
                    value={uploadForm.lokasi}
                    onChange={(e) => setUploadForm({ ...uploadForm, lokasi: e.target.value })}
                    placeholder="Kota / tempat..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Album */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Album (opsional)</label>
                <input
                  type="text"
                  value={uploadForm.album}
                  onChange={(e) => setUploadForm({ ...uploadForm, album: e.target.value })}
                  placeholder="Nama album / event..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi (opsional)</label>
                <textarea
                  rows={2}
                  value={uploadForm.deskripsi}
                  onChange={(e) => setUploadForm({ ...uploadForm, deskripsi: e.target.value })}
                  placeholder="Keterangan singkat foto..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 resize-y"
                />
              </div>

              {/* Role info badge */}
              {(role === "ADMIN_KABUPATEN" || role === "ADMIN_PROVINSI") && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="text-[10px] font-semibold text-blue-700">
                    📍 Foto ini akan otomatis tersimpan untuk wilayah {role === "ADMIN_KABUPATEN" ? "Kabupaten/Kota" : "Provinsi"} Anda.
                  </span>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-slate-100 flex justify-end gap-2">
              <button
                disabled={saving}
                onClick={() => setShowUploadDialog(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                disabled={saving || !file}
                onClick={handleUpload}
                className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "Mengunggah..." : "Upload Foto"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Full Image Dialog */}
      {viewItem && (
        <div
          className="fixed inset-0 z-[400] bg-blue-950/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setViewItem(null)}
        >
          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-white text-lg">{viewItem.judul}</h3>
                {viewItem.lokasi && <p className="text-blue-300 text-sm">{viewItem.lokasi}</p>}
              </div>
              <button onClick={() => setViewItem(null)} className="p-2 text-white hover:bg-white/10 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <img
              src={viewItem.foto}
              alt={viewItem.judul}
              className="w-full rounded-2xl object-contain max-h-[70vh]"
            />
            {viewItem.deskripsi && (
              <p className="text-blue-200 text-sm mt-3 text-center">{viewItem.deskripsi}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
