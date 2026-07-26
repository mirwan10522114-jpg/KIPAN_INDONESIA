"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Check,
  X,
  History,
} from "lucide-react";
import { PENDAFTARAN_LIST } from "@/lib/admin-data";

export default function VerifikasiPage() {
  const [selectedId, setSelectedId] = useState(PENDAFTARAN_LIST[0].id);
  const [activeTab, setActiveTab] = useState("data-diri");

  const selected = PENDAFTARAN_LIST.find((p) => p.id === selectedId) || PENDAFTARAN_LIST[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-blue-950">Verifikasi Anggota</h1>
        <p className="text-slate-500 text-sm mt-1">Verifikasi berkas dan persyaratan calon anggota</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-blue-950 text-sm">
              Calon Anggota ({PENDAFTARAN_LIST.length})
            </h3>
          </div>
          <ul className="max-h-[600px] overflow-y-auto">
            {PENDAFTARAN_LIST.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 ${
                    selectedId === p.id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
                  }`}
                >
                  <img src={p.foto} alt={p.nama} className="w-9 h-9 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-blue-950 truncate">{p.nama}</div>
                    <div className="text-xs text-slate-500 truncate">{p.kabupaten}</div>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold shrink-0 ${
                    p.status === "Disetujui" ? "bg-emerald-100 text-emerald-700" :
                    p.status === "Ditolak" ? "bg-rose-100 text-rose-700" :
                    p.status === "Diverifikasi" ? "bg-blue-100 text-blue-700" :
                    p.status === "Perbaikan" ? "bg-amber-100 text-amber-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {p.status}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Detail */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-sky-500 p-5 text-white">
              <div className="flex items-center gap-4">
                <img src={selected.foto} alt={selected.nama} className="w-16 h-16 rounded-2xl object-cover border-4 border-white/30" />
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{selected.nama}</h2>
                  <p className="text-blue-100 text-sm">{selected.kabupaten}, {selected.provinsi}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold">
                    Status: {selected.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100">
              {[
                { id: "data-diri", label: "Data Diri" },
                { id: "dokumen", label: "Dokumen" },
                { id: "persyaratan", label: "Persyaratan" },
                { id: "riwayat", label: "Riwayat" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === t.id
                      ? "text-blue-600 border-blue-600"
                      : "text-slate-500 border-transparent hover:text-blue-600"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-5">
              {activeTab === "data-diri" && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <Info label="NIK" value={selected.nik} />
                  <Info label="Tempat Lahir" value={selected.tempatLahir} />
                  <Info label="Tanggal Lahir" value={selected.tanggalLahir} />
                  <Info label="Jenis Kelamin" value={selected.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"} />
                  <Info label="Agama" value={selected.agama} />
                  <Info label="Pendidikan" value={selected.pendidikan} />
                  <Info label="Pekerjaan" value={selected.pekerjaan} />
                  <Info label="Email" value={selected.email} />
                  <Info label="HP" value={selected.hp} />
                  <Info label="WhatsApp" value={selected.whatsapp} />
                  <div className="col-span-2">
                    <Info label="Alamat" value={`${selected.alamat}, Kec. ${selected.kecamatan}, ${selected.kabupaten}, ${selected.provinsi}`} />
                  </div>
                  <div className="col-span-2">
                    <Info label="Motivasi" value={selected.motivasi} />
                  </div>
                </div>
              )}

              {activeTab === "dokumen" && (
                <div className="space-y-2">
                  {selected.dokumen.map((d, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        d.uploaded ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          d.uploaded ? "bg-emerald-100" : "bg-rose-100"
                        }`}>
                          <FileText className={`w-5 h-5 ${d.uploaded ? "text-emerald-600" : "text-rose-600"}`} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-800">{d.nama}</div>
                          <div className="text-xs text-slate-500">
                            {d.uploaded ? "Sudah diupload" : "Belum diupload"}
                          </div>
                        </div>
                      </div>
                      {d.uploaded ? (
                        <Check className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <X className="w-5 h-5 text-rose-600" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "persyaratan" && (
                <div className="space-y-2">
                  {[
                    "Warga Negara Indonesia",
                    "Usia 16-30 tahun",
                    "Sehat Jasmani & Rohani",
                    "Bersedia Mengikuti Pelatihan",
                    "Mematuhi AD/ART",
                    "Menjadi Relawan Aktif",
                  ].map((req, idx) => {
                    const checked = selected.persyaratan[idx];
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          checked ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${
                          checked ? "bg-emerald-500" : "bg-rose-500"
                        }`}>
                          {checked ? <Check className="w-4 h-4 text-white" /> : <X className="w-4 h-4 text-white" />}
                        </div>
                        <span className="text-sm text-slate-800">{req}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === "riwayat" && (
                <div className="space-y-3">
                  {selected.riwayat.map((r, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                        <History className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-800">{r.aksi}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {r.tanggal} • oleh {r.oleh}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="p-5 border-t border-slate-100 flex flex-wrap gap-2">
              <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                Setujui
              </button>
              <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600">
                <AlertCircle className="w-4 h-4" />
                Minta Perbaikan
              </button>
              <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white text-sm font-semibold rounded-lg hover:bg-rose-700">
                <XCircle className="w-4 h-4" />
                Tolak
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-500 mb-0.5">{label}</div>
      <div className="text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}
