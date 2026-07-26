"use client";

import { Plus, Image as ImageIcon, Trash2, Eye } from "lucide-react";
import { GALLERY_ITEMS } from "@/lib/kipan-data";

export default function GaleriPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Galeri</h1>
          <p className="text-slate-500 text-sm mt-1">{GALLERY_ITEMS.length} foto dalam galeri</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Upload Foto
        </button>
      </div>

      {/* Upload area */}
      <div className="border-2 border-dashed border-blue-200 rounded-2xl p-8 text-center bg-blue-50/30 hover:bg-blue-50 transition-colors cursor-pointer">
        <ImageIcon className="w-10 h-10 text-blue-400 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-700">Klik untuk upload atau drag & drop foto di sini</p>
        <p className="text-xs text-slate-500 mt-1">Format: JPG, PNG (max 2MB per file) — bisa upload banyak sekaligus</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {GALLERY_ITEMS.map((item) => (
          <div key={item.id} className="group relative bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="relative aspect-square overflow-hidden">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <div className="text-white text-xs font-semibold">{item.title}</div>
                <div className="text-blue-200 text-[10px]">{item.location}</div>
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-blue-600 hover:bg-white"><Eye className="w-3.5 h-3.5" /></button>
                <button className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-rose-600 hover:bg-white"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="p-2.5">
              <div className="text-xs font-semibold text-blue-950 truncate">{item.title}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{item.category} • {item.location}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
