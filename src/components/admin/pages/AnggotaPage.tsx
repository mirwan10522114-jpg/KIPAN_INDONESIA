"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Eye, Download, X, QrCode, CreditCard } from "lucide-react";
import { ANGGOTA_LIST } from "@/lib/admin-data";
import type { Anggota } from "@/lib/admin-data";

export default function AnggotaPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [provFilter, setProvFilter] = useState("Semua");
  const [selected, setSelected] = useState<Anggota | null>(null);

  const provinsiOptions = ["Semua", ...new Set(ANGGOTA_LIST.map((a) => a.provinsi))];

  const filtered = ANGGOTA_LIST.filter((a) => {
    const matchSearch = a.nama.toLowerCase().includes(search.toLowerCase()) ||
      a.nia.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "Semua" || a.status === statusFilter;
    const matchProv = provFilter === "Semua" || a.provinsi === provFilter;
    return matchSearch && matchStatus && matchProv;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Manajemen Anggota</h1>
          <p className="text-slate-500 text-sm mt-1">Total {ANGGOTA_LIST.length} anggota ditampilkan (dari 12.580 nasional)</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau NIA..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
          />
        </div>
        <select
          value={provFilter}
          onChange={(e) => setProvFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
        >
          {provinsiOptions.map((p) => <option key={p}>{p}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
        >
          {["Semua", "Aktif", "Nonaktif", "Mengundurkan Diri", "Diberhentikan"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">NIA</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Nama</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Wilayah</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Angkatan</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Status</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setSelected(a)}>
                <td className="px-4 py-3 text-sm font-mono text-blue-600">{a.nia}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <img src={a.foto} alt={a.nama} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <div className="text-sm font-semibold text-blue-950">{a.nama}</div>
                      <div className="text-xs text-slate-500">{a.pekerjaan}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  <div>{a.kabupaten}</div>
                  <div className="text-xs text-slate-400">{a.provinsi}</div>
                </td>
                <td className="px-4 py-3 text-center text-sm text-slate-600">{a.angkatan}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    a.status === "Aktif" ? "bg-emerald-100 text-emerald-700" :
                    a.status === "Nonaktif" ? "bg-slate-100 text-slate-600" :
                    "bg-rose-100 text-rose-700"
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
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-[300] bg-blue-950/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="relative bg-gradient-to-br from-blue-600 to-sky-500 p-6 text-white">
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-4">
                  <img src={selected.foto} alt={selected.nama} className="w-20 h-20 rounded-2xl object-cover border-4 border-white/30" />
                  <div>
                    <h2 className="text-2xl font-bold">{selected.nama}</h2>
                    <p className="text-blue-100 text-sm">NIA: {selected.nia}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">{selected.status}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Biodata */}
                <div>
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Biodata</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <InfoRow label="Tempat Lahir" value={selected.tempatLahir} />
                    <InfoRow label="Tanggal Lahir" value={selected.tanggalLahir} />
                    <InfoRow label="Jenis Kelamin" value={selected.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"} />
                    <InfoRow label="Pendidikan" value={selected.pendidikan} />
                    <InfoRow label="Pekerjaan" value={selected.pekerjaan} />
                    <InfoRow label="Angkatan" value={selected.angkatan} />
                  </div>
                </div>

                {/* Alamat */}
                <div>
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Alamat</h3>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>{selected.alamat}</p>
                    <p>Kec. {selected.kecamatan}, {selected.kabupaten}</p>
                    <p>Prov. {selected.provinsi}</p>
                  </div>
                </div>

                {/* Kontak */}
                <div>
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Kontak</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <InfoRow label="Email" value={selected.email} />
                    <InfoRow label="HP" value={selected.hp} />
                    <InfoRow label="WhatsApp" value={selected.whatsapp} />
                  </div>
                </div>

                {/* Riwayat */}
                <div>
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Riwayat Keanggotaan</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span>Daftar: {selected.tanggalDaftar}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      <span>Diangkat: {selected.tanggalAngkat}</span>
                    </div>
                  </div>
                </div>

                {/* Kartu Anggota */}
                <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-blue-950">Kartu Anggota Digital</h3>
                  </div>
                  <div className="bg-white rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-500">Nomor Anggota</div>
                      <div className="font-mono font-bold text-blue-950">{selected.nia}</div>
                      <div className="text-xs text-slate-500 mt-2">Masa Berlaku</div>
                      <div className="text-sm font-semibold">Seumur hidup</div>
                    </div>
                    <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                      <QrCode className="w-10 h-10 text-slate-700" />
                    </div>
                  </div>
                </div>
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
