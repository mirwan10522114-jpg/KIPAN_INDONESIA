"use client";

import { useState } from "react";
import { Plus, Search, Eye, Edit, Trash2, Newspaper, X } from "lucide-react";
import { BERITA_ADMIN_LIST } from "@/lib/admin-data";

export default function BeritaPage() {
  const [showEditor, setShowEditor] = useState(false);
  const [filter, setFilter] = useState("Semua");

  const filtered = BERITA_ADMIN_LIST.filter((b) =>
    filter === "Semua" || b.kategori === filter
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Berita & Konten</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola berita dan artikel KIPAN</p>
        </div>
        <button
          onClick={() => setShowEditor(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Tambah Berita
        </button>
      </div>

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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Thumbnail</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Judul</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Kategori</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Penulis</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Tanggal</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Status</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <img src={b.thumbnail} alt={b.judul} className="w-16 h-10 rounded object-cover" />
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <div className="text-sm font-semibold text-blue-950 truncate">{b.judul}</div>
                  <div className="text-xs text-slate-500 truncate">{b.excerpt}</div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
                    {b.kategori}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">{b.penulis}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{b.tanggal}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    b.status === "Published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Eye className="w-4 h-4" /></button>
                    <button className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded"><Edit className="w-4 h-4" /></button>
                    <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Editor Modal */}
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
                <input type="text" placeholder="Judul berita..." className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori</label>
                  <select className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500">
                    <option>Nasional</option><option>Provinsi</option><option>Kabupaten</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500">
                    <option>Draft</option><option>Published</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Thumbnail (URL)</label>
                <input type="text" placeholder="https://..." className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Isi Berita</label>
                <textarea rows={6} placeholder="Tulis isi berita..." className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 resize-y" />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setShowEditor(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
              <button onClick={() => setShowEditor(false)} className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700">Simpan & Publish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
