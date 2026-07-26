"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Check,
  X,
  History,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { PERSYARATAN } from "@/lib/kipan-data";

export default function VerifikasiPage() {
  const [list, setList] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("data-diri");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [jabatanList, setJabatanList] = useState<any[]>([]);
  const [selectedJabatanId, setSelectedJabatanId] = useState<string>("");
  const [showApproveDialog, setShowApproveDialog] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendRes, jabRes] = await Promise.all([
        fetch("/api/pendaftaran", { cache: "no-store" }),
        fetch("/api/jabatan?level=Kabupaten", { cache: "no-store" }),
      ]);
      const pendJson = await pendRes.json();
      const jabJson = await jabRes.json();
      if (pendJson.success) {
        setList(pendJson.data);
        if (pendJson.data.length > 0 && selectedId === null) {
          setSelectedId(pendJson.data[0].id);
        }
      }
      if (jabJson.success) {
        // Filter hanya yang nama "Anggota" atau semua jabatan level Kabupaten
        setJabatanList(jabJson.data);
        // Default: pilih "Anggota" di "Divisi Organisasi dan Keanggotaan"
        const defaultJab = jabJson.data.find(
          (j: any) => j.nama === "Anggota" && j.bidang === "Divisi Organisasi dan Keanggotaan"
        ) || jabJson.data.find((j: any) => j.nama === "Anggota");
        if (defaultJab) setSelectedJabatanId(String(defaultJab.id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selected = list.find((p) => p.id === selectedId);

  const updateStatus = async (newStatus: string, catatan?: string, jabatanId?: string) => {
    if (!selectedId) return;
    setActing(true);
    try {
      const payload: any = { status: newStatus, catatan };
      if (newStatus === "DISETUJUI" && jabatanId) {
        payload.jabatanId = parseInt(jabatanId);
      }
      const res = await fetch(`/api/pendaftaran/${selectedId}/verifikasi`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        setShowApproveDialog(false);
        fetchData();
      } else {
        alert(json.error || "Gagal update status");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActing(false);
    }
  };

  const persyaratanList = selected?.persyaratan ? JSON.parse(selected.persyaratan) : [];
  const dokumenList = selected ? [
    { nama: "KTP", uploaded: !!selected.ktp, url: selected.ktp },
    { nama: "Pas Foto", uploaded: !!selected.foto, url: selected.foto },
    { nama: "CV/Resume", uploaded: !!selected.cv, url: selected.cv },
    { nama: "Surat Pernyataan", uploaded: !!selected.suratPernyataan, url: selected.suratPernyataan },
    { nama: "Surat Sehat", uploaded: !!selected.suratSehat, url: selected.suratSehat },
  ] : [];

  const openDoc = (url: string, nama: string) => {
    if (!url) return;
    if (url.startsWith("data:")) {
      const w = window.open();
      if (w) {
        if (url.startsWith("data:image/")) {
          w.document.write(`<html><head><title>${nama}</title></head><body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#1e293b"><img src="${url}" style="max-width:100%;max-height:100vh;object-fit:contain" /></body></html>`);
        } else if (url.startsWith("data:application/pdf")) {
          w.document.write(`<html><head><title>${nama}</title></head><body style="margin:0"><iframe src="${url}" style="width:100vw;height:100vh;border:0"></iframe></body></html>`);
        } else {
          w.document.write(`<html><head><title>${nama}</title></head><body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh"><a href="${url}" download="${nama}" style="padding:12px 24px;background:#0ea5e9;color:white;text-decoration:none;border-radius:8px">Download ${nama}</a></body></html>`);
        }
        w.document.close();
      }
    } else {
      window.open(url, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-blue-950">Verifikasi Pengurus</h1>
        <div className="bg-white rounded-2xl p-12 text-center">
          <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Verifikasi Pengurus</h1>
          <p className="text-slate-500 text-sm mt-1">Verifikasi berkas dan persyaratan calon pengurus</p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-blue-950 text-sm">Calon Pengurus ({list.length})</h3>
          </div>
          <ul className="max-h-[600px] overflow-y-auto">
            {list.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 ${
                    selectedId === p.id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {p.namaLengkap.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-blue-950 truncate">{p.namaLengkap}</div>
                    <div className="text-xs text-slate-500 truncate">{p.kabupaten?.nama || "-"}</div>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold shrink-0 ${
                    p.status === "DISETUJUI" ? "bg-emerald-100 text-emerald-700" :
                    p.status === "DITOLAK" ? "bg-rose-100 text-rose-700" :
                    p.status === "DIVERIFIKASI" ? "bg-blue-100 text-blue-700" :
                    p.status === "PERBAIKAN" ? "bg-amber-100 text-amber-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {p.status === "DIAJUKAN" ? "Diajukan" :
                     p.status === "DIVERIFIKASI" ? "Diverifikasi" :
                     p.status === "DISETUJUI" ? "Disetujui" :
                     p.status === "DITOLAK" ? "Ditolak" :
                     p.status === "PERBAIKAN" ? "Perbaikan" : "Draft"}
                  </span>
                </button>
              </li>
            ))}
            {list.length === 0 && (
              <li className="p-8 text-center text-sm text-slate-500">Belum ada pendaftaran</li>
            )}
          </ul>
        </div>

        {/* Detail */}
        <div className="lg:col-span-2 space-y-4">
          {selected ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-sky-500 p-5 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
                    {selected.namaLengkap.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold">{selected.namaLengkap}</h2>
                    <p className="text-blue-100 text-sm">
                      {selected.kabupaten?.nama}, {selected.provinsi?.nama}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold">
                      Status: {selected.status}
                    </span>
                  </div>
                </div>
              </div>

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

              <div className="p-5">
                {activeTab === "data-diri" && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <Info label="NIK" value={selected.nik} />
                    <Info label="Tempat Lahir" value={selected.tempatLahir} />
                    <Info label="Tanggal Lahir" value={new Date(selected.tanggalLahir).toLocaleDateString("id-ID")} />
                    <Info label="Jenis Kelamin" value={selected.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"} />
                    <Info label="Agama" value={selected.agama || "-"} />
                    <Info label="Pendidikan" value={selected.pendidikan || "-"} />
                    <Info label="Pekerjaan" value={selected.pekerjaan || "-"} />
                    <Info label="Email" value={selected.email} />
                    <Info label="HP" value={selected.hp} />
                    <Info label="WhatsApp" value={selected.whatsapp || "-"} />
                    <div className="col-span-2">
                      <Info label="Alamat" value={`${selected.alamat}, Kec. ${selected.kecamatan || "-"}, ${selected.kabupaten?.nama}, ${selected.provinsi?.nama}`} />
                    </div>
                    <div className="col-span-2">
                      <Info label="Motivasi" value={selected.motivasi || "-"} />
                    </div>
                  </div>
                )}

                {activeTab === "dokumen" && (
                  <div className="space-y-2">
                    {dokumenList.map((d, idx) => (
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
                        <div className="flex items-center gap-2">
                          {d.uploaded && (
                            <button
                              onClick={() => openDoc(d.url, d.nama)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-white px-2 py-1 rounded border border-blue-200"
                            >
                              <ExternalLink className="w-3 h-3" /> Lihat
                            </button>
                          )}
                          {d.uploaded ? (
                            <Check className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <X className="w-5 h-5 text-rose-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "persyaratan" && (
                  <div className="space-y-2">
                    {PERSYARATAN.map((req, idx) => {
                      const checked = persyaratanList[idx];
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
                          <div>
                            <div className="text-sm font-medium text-slate-800">{req.title}</div>
                            <div className="text-xs text-slate-500">{req.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === "riwayat" && (
                  <div className="space-y-3">
                    {selected.riwayat?.map((r: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                          <History className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-800">{r.aksi}</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {new Date(r.createdAt).toLocaleString("id-ID")} • oleh {r.oleh}
                          </div>
                          {r.catatan && (
                            <div className="text-xs text-slate-600 mt-1 italic">"{r.catatan}"</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="p-5 border-t border-slate-100 flex flex-wrap gap-2">
                <button
                  onClick={() => setShowApproveDialog(true)}
                  disabled={acting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Setujui & Jadikan Pengurus
                </button>
                <button
                  onClick={() => {
                    const catatan = prompt("Masukkan catatan perbaikan:");
                    if (catatan) updateStatus("PERBAIKAN", catatan);
                  }}
                  disabled={acting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-50"
                >
                  <AlertCircle className="w-4 h-4" />
                  Minta Perbaikan
                </button>
                <button
                  onClick={() => {
                    const catatan = prompt("Masukkan alasan penolakan:");
                    if (catatan) updateStatus("DITOLAK", catatan);
                  }}
                  disabled={acting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white text-sm font-semibold rounded-lg hover:bg-rose-700 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  Tolak
                </button>
                <button
                  onClick={() => updateStatus("DIVERIFIKASI")}
                  disabled={acting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  Mulai Verifikasi
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-500">
              Pilih calon pengurus dari daftar untuk verifikasi
            </div>
          )}
        </div>
      </div>

      {/* Approve Dialog — Pilih Bidang & Jabatan */}
      {showApproveDialog && selected && (
        <div
          className="fixed inset-0 z-[300] bg-blue-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowApproveDialog(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-gradient-to-r from-emerald-600 to-teal-500 p-5 text-white">
              <button
                onClick={() => setShowApproveDialog(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
              >
                <XCircle className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Setujui & Jadikan Pengurus</h2>
                  <p className="text-xs text-emerald-100">{selected.namaLengkap}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800">
                ℹ️ Saat disetujui, sistem akan otomatis membuat:
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  <li>Record data person (NIA auto-generate)</li>
                  <li>Record Pengurus dengan jabatan "Anggota" di divisi yang Anda pilih</li>
                  <li>Level default: <strong>Kabupaten</strong> sesuai wilayah pendaftaran</li>
                </ul>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pilih Bidang & Jabatan *
                </label>
                <select
                  value={selectedJabatanId}
                  onChange={(e) => setSelectedJabatanId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                >
                  {/* Group by bidang */}
                  {Object.entries(
                    jabatanList.reduce((acc: any, j: any) => {
                      if (!acc[j.bidang]) acc[j.bidang] = [];
                      acc[j.bidang].push(j);
                      return acc;
                    }, {})
                  ).sort(([a], [b]) => a.localeCompare(b)).map(([bidang, items]: [string, any]) => (
                    <optgroup key={bidang} label={bidang}>
                      {items
                        .sort((a: any, b: any) => a.urutan - b.urutan)
                        .map((j: any) => (
                          <option key={j.id} value={j.id}>
                            {j.nama}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Default: jabatan "Anggota" di "Divisi Organisasi dan Keanggotaan". Anda bisa pilih jabatan lain jika perlu.
                </p>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setShowApproveDialog(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => updateStatus("DISETUJUI", undefined, selectedJabatanId)}
                disabled={acting || !selectedJabatanId}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {acting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Setujui & Buat Pengurus
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
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
