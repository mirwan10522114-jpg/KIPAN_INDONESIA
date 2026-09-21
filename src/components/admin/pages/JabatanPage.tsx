"use client";

import { useState, useEffect } from "react";
import { UserCog, Plus, Search, RefreshCw, ChevronDown, Edit, Trash2 } from "lucide-react";

export default function JabatanPage() {
  const [jabatanList, setJabatanList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("Semua");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Form state
  const [form, setForm] = useState({ id: 0, nama: "", level: "NASIONAL" });
  const [isEditing, setIsEditing] = useState(false);

  const fetchJabatan = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterLevel !== "Semua") params.set("level", filterLevel);
      const res = await fetch(`/api/jabatan?${params}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success) setJabatanList(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJabatan();
  }, [filterLevel]);

  const filteredJabatan = jabatanList.filter((j) =>
    j.nama.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = isEditing ? `/api/jabatan/${form.id}` : `/api/jabatan`;
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        setShowCreateDialog(false);
        fetchJabatan();
      } else {
        alert(json.error);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus jabatan ini? Jika masih ada pengurus yang menggunakan jabatan ini, proses akan gagal.")) return;
    try {
      const res = await fetch(`/api/jabatan/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        fetchJabatan();
      } else {
        alert(json.error);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <UserCog className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Master Jabatan</h1>
            <p className="text-sm text-slate-500">Kelola daftar jabatan untuk pengurus</p>
          </div>
        </div>
        <button
          onClick={() => {
            setForm({ id: 0, nama: "", level: "NASIONAL" });
            setIsEditing(false);
            setShowCreateDialog(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Jabatan
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama jabatan..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative min-w-[150px]">
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full appearance-none pl-4 pr-10 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
            >
              <option value="Semua">Semua Level</option>
              <option value="NASIONAL">Nasional</option>
              <option value="PROVINSI">Provinsi</option>
              <option value="KABUPATEN">Kabupaten/Kota</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          <button
            onClick={fetchJabatan}
            className="p-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3 text-xs font-semibold text-slate-600">No.</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-600">Nama Jabatan</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-600">Level</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-600 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-sm">
                    Memuat data jabatan...
                  </td>
                </tr>
              ) : filteredJabatan.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500 text-sm">
                    Tidak ada data jabatan ditemukan.
                  </td>
                </tr>
              ) : (
                filteredJabatan.map((j, index) => (
                  <tr key={j.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-500 font-mono">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-800">{j.nama}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        j.level === "NASIONAL" ? "bg-purple-100 text-purple-700" :
                        j.level === "PROVINSI" ? "bg-amber-100 text-amber-700" :
                        "bg-teal-100 text-teal-700"
                      }`}>
                        {j.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <button
                        onClick={() => {
                          setForm({ id: j.id, nama: j.nama, level: j.level });
                          setIsEditing(true);
                          setShowCreateDialog(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded mx-1"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(j.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded mx-1"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-[300] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-semibold text-slate-800">{isEditing ? "Edit Jabatan" : "Tambah Jabatan Baru"}</h3>
              <button
                onClick={() => setShowCreateDialog(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Jabatan</label>
                <input
                  type="text"
                  required
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Misal: Ketua Umum"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tingkatan (Level)</label>
                <div className="relative">
                  <select
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                    className="w-full appearance-none px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="NASIONAL">Nasional</option>
                    <option value="PROVINSI">Provinsi</option>
                    <option value="KABUPATEN">Kabupaten/Kota</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="pt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateDialog(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  {isEditing ? "Simpan Perubahan" : "Simpan Jabatan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
