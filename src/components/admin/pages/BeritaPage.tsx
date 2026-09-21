"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Eye, Edit, Trash2, Newspaper, X } from "lucide-react";
import { fetchJsonSafe } from "@/lib/fetch-helper";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth-store";

export default function BeritaPage() {
  const { role, wilayah, provinsiId: authProvinsiId, kabupatenId: authKabupatenId } = useAuthStore();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showEditor, setShowEditor] = useState(false);
  const [jenisFilter, setJenisFilter] = useState("INTERNAL");
  const [filter, setFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [search, setSearch] = useState("");

  const [provinsiList, setProvinsiList] = useState<any[]>([]);
  const [kabupatenList, setKabupatenList] = useState<any[]>([]);

  const [form, setForm] = useState({
    judul: "",
    jenis: "INTERNAL",
    kategori: "Nasional",
    status: "Draft",
    thumbnail: "",
    excerpt: "",
    konten: "",
    provinsiId: "",
    kabupatenId: "",
  });

  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchData();
    fetchWilayah();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (role) params.set("role", role);
    if (authProvinsiId) params.set("provinsiId", String(authProvinsiId));
    if (authKabupatenId) params.set("kabupatenId", String(authKabupatenId));
    const res = await fetchJsonSafe(`/api/berita?${params.toString()}`);
    if (res.ok) {
      setData((res.data as any)?.data || []);
    } else {
      toast.error(res.error || "Gagal memuat berita");
    }
    setLoading(false);
  };

  const fetchWilayah = async () => {
    const res = await fetchJsonSafe("/api/wilayah");
    if (res.ok && res.data) {
      setProvinsiList((res.data as any).provinsi || []);
      setKabupatenList((res.data as any).kabupaten || []);
    }
  };

  const filtered = data.filter((b) => {
    const matchJenis = jenisFilter === "Semua" || b.jenis === jenisFilter;
    const matchKategori = filter === "Semua" || (b.jenis === "INTERNAL" && b.kategori === filter);
    const matchStatus = statusFilter === "Semua" || b.status === statusFilter;
    const matchSearch = b.judul.toLowerCase().includes(search.toLowerCase()) ||
      b.penulis.toLowerCase().includes(search.toLowerCase());
    return matchJenis && matchKategori && matchStatus && matchSearch;
  });

  const handleSave = async () => {
    if (!form.judul) {
      return toast.error("Judul wajib diisi");
    }

    setSaving(true);
    let finalThumbnail = form.thumbnail;

    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadJson = await uploadRes.json();
        if (uploadJson.success) {
          finalThumbnail = uploadJson.url;
        } else {
          toast.error(uploadJson.error || "Gagal mengupload thumbnail");
          setSaving(false);
          return;
        }
      } catch (err) {
        toast.error("Terjadi kesalahan saat mengupload thumbnail");
        setSaving(false);
        return;
      }
    }

    const payload = {
      ...form,
      thumbnail: finalThumbnail,
      role,
      provinsiId: authProvinsiId ? String(authProvinsiId) : form.provinsiId,
      kabupatenId: authKabupatenId ? String(authKabupatenId) : form.kabupatenId,
    };
    const res = await fetchJsonSafe("/api/berita", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);

    if (res.ok) {
      toast.success("Berita berhasil ditambahkan");
      setShowEditor(false);
      setForm({
        judul: "", jenis: "INTERNAL", kategori: "Nasional", status: "Draft", 
        thumbnail: "", excerpt: "", konten: "", provinsiId: "", kabupatenId: ""
      });
      setFile(null);
      fetchData();
    } else {
      toast.error(res.error || "Gagal menyimpan");
    }
  };

  const openEditor = () => {
    let initialKategori = "Nasional";
    // Gunakan ID numerik langsung dari auth-store (lebih reliable dari pencarian nama)
    let initialProvinsiId = authProvinsiId ? String(authProvinsiId) : "";
    let initialKabupatenId = authKabupatenId ? String(authKabupatenId) : "";
    
    if (role === "ADMIN_PROVINSI") {
      initialKategori = "Provinsi";
      initialKabupatenId = "";
    } else if (role === "ADMIN_KABUPATEN") {
      initialKategori = "Kabupaten";
    }

    setForm({
      judul: "",
      jenis: "INTERNAL",
      kategori: initialKategori,
      status: "Draft",
      thumbnail: "",
      excerpt: "",
      konten: "",
      provinsiId: initialProvinsiId,
      kabupatenId: initialKabupatenId,
    });
    setFile(null);
    setShowEditor(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Berita & Konten</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola berita Internal KIPAN dan Berita Umum</p>
        </div>
        <button
          onClick={openEditor}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Tambah Berita
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={jenisFilter}
          onChange={(e) => setJenisFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-500 outline-none font-medium text-slate-700"
        >
          <option value="Semua">Semua Jenis Berita</option>
          <option value="INTERNAL">Internal KIPAN</option>
          <option value="UMUM">Berita Umum (Terkini)</option>
        </select>
        
        {jenisFilter !== "UMUM" && (
          <div className="flex gap-2">
            {["Semua", "Nasional", "Provinsi", "Kabupaten"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  filter === f ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
        >
          <option value="Semua">Semua Status</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
        </select>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul atau penulis..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
          />
        </div>
        <span className="text-xs text-slate-500">{filtered.length} dari {data.length} berita</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Judul</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Jenis & Kategori</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Tanggal</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Status</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">Memuat...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">Tidak ada berita</td></tr>
            ) : (
              filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 max-w-xs">
                    <div className="text-sm font-semibold text-blue-950 truncate">{b.judul}</div>
                    <div className="text-xs text-slate-500 truncate">{b.excerpt || "-"}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {b.jenis === "UMUM" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        Umum
                      </span>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
                          {b.kategori}
                        </span>
                        {b.provinsi && <span className="text-[10px] text-slate-500">{b.provinsi.nama}</span>}
                        {b.kabupaten && <span className="text-[10px] text-slate-500">{b.kabupaten.nama}</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{new Date(b.createdAt).toLocaleDateString("id-ID")}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      b.status === "Published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showEditor && (
        <div className="fixed inset-0 z-[300] bg-blue-950/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowEditor(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-blue-950">Tambah Berita Baru</h2>
              <button onClick={() => setShowEditor(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Judul</label>
                <input 
                  type="text" 
                  value={form.judul}
                  onChange={(e) => setForm({...form, judul: e.target.value})}
                  placeholder="Judul berita..." 
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Berita</label>
                  <select 
                    value={form.jenis}
                    onChange={(e) => setForm({...form, jenis: e.target.value})}
                    disabled={role === "ADMIN_PROVINSI" || role === "ADMIN_KABUPATEN"}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 disabled:bg-slate-100"
                  >
                    <option value="INTERNAL">Internal KIPAN</option>
                    <option value="UMUM">Berita Umum (Sosialisasi)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status Publikasi</label>
                  <select 
                    value={form.status}
                    onChange={(e) => setForm({...form, status: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </select>
                </div>
              </div>

              {form.jenis === "INTERNAL" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori Internal</label>
                    <select 
                      value={form.kategori}
                      onChange={(e) => setForm({...form, kategori: e.target.value})}
                      disabled={role === "ADMIN_PROVINSI" || role === "ADMIN_KABUPATEN"}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 disabled:bg-slate-100"
                    >
                      <option value="Nasional">Nasional</option>
                      <option value="Provinsi">Provinsi</option>
                      <option value="Kabupaten">Kabupaten/Kota</option>
                    </select>
                  </div>
                  
                  {form.kategori === "Provinsi" && (
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Provinsi</label>
                      <select 
                        value={form.provinsiId}
                        onChange={(e) => setForm({...form, provinsiId: e.target.value})}
                        disabled={role === "ADMIN_PROVINSI"}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 disabled:bg-slate-100"
                      >
                        <option value="">Pilih Provinsi...</option>
                        {provinsiList.map(p => <option key={p.id} value={p.id}>{p.nama}</option>)}
                      </select>
                    </div>
                  )}

                  {form.kategori === "Kabupaten" && (
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Kabupaten/Kota</label>
                      <select 
                        value={form.kabupatenId}
                        onChange={(e) => setForm({...form, kabupatenId: e.target.value})}
                        disabled={role === "ADMIN_KABUPATEN"}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 disabled:bg-slate-100"
                      >
                        <option value="">Pilih Kabupaten...</option>
                        {kabupatenList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Thumbnail (Upload Gambar)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                />
                {file && <p className="text-xs text-slate-500 mt-1">File terpilih: {file.name}</p>}
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ringkasan (Excerpt)</label>
                <textarea 
                  rows={2} 
                  value={form.excerpt}
                  onChange={(e) => setForm({...form, excerpt: e.target.value})}
                  placeholder="Ringkasan berita..." 
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 resize-y" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Isi Berita Lengkap</label>
                <textarea 
                  rows={4} 
                  value={form.konten}
                  onChange={(e) => setForm({...form, konten: e.target.value})}
                  placeholder="Tulis isi berita..." 
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 resize-y" 
                />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 flex justify-end gap-2">
              <button disabled={saving} onClick={() => setShowEditor(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
              <button disabled={saving} onClick={handleSave} className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {saving ? "Menyimpan..." : "Simpan Berita"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
