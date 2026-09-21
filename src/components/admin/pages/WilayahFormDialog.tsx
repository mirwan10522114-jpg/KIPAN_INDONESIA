"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, MapPin, Building2 } from "lucide-react";
import {
  MASTER_PROVINSI,
  MASTER_KABUPATEN,
  getKabupatenByProvinsi,
} from "@/lib/master-wilayah";
import { CheckCircle2 } from "lucide-react";

export interface WilayahFormData {
  id?: number;
  type: "provinsi" | "kabupaten";
  kode: string;
  nama: string;
  status: string;
  ketua: string;
  provinsiId?: string;
  masterProvinsiKode?: string; // kode dari master data
  masterKabupatenKode?: string; // kode dari master data
}

export default function WilayahFormDialog({
  open,
  data,
  provinsiList,
  existingKabupatenKodes = [],
  onClose,
  onSave,
}: {
  open: boolean;
  data: WilayahFormData | null;
  provinsiList: { id: number; nama: string }[];
  existingKabupatenKodes?: string[];
  onClose: () => void;
  onSave: (data: WilayahFormData) => Promise<void>;
}) {
  const [form, setForm] = useState<WilayahFormData>({
    type: "provinsi",
    kode: "",
    nama: "",
    status: "Aktif",
    ketua: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedProvinsiKode, setSelectedProvinsiKode] = useState("");
  const [selectedKabupatenKode, setSelectedKabupatenKode] = useState("");
  const [pengurusList, setPengurusList] = useState<any[]>([]);
  const [loadingPengurus, setLoadingPengurus] = useState(false);

  useEffect(() => {
    if (data) {
      setForm(data);
      setSelectedProvinsiKode(data.masterProvinsiKode || "");
      setSelectedKabupatenKode(data.masterKabupatenKode || "");
      // Fetch pengurus for this wilayah
      if (data.id) {
        fetchPengurus(data.id, data.type);
      } else {
        setPengurusList([]);
      }
    } else {
      setForm({ type: "provinsi", kode: "", nama: "", status: "Aktif", ketua: "" });
      setSelectedProvinsiKode("");
      setSelectedKabupatenKode("");
      setPengurusList([]);
    }
    setError("");
  }, [data, open]);

  const fetchPengurus = async (wilayahId: number, type: "provinsi" | "kabupaten") => {
    setLoadingPengurus(true);
    try {
      const res = await fetch(`/api/wilayah/${wilayahId}/pengurus?type=${type}&all=true`, { cache: "no-store" });
      const json = await res.json();
      if (json.success) setPengurusList(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPengurus(false);
    }
  };

  // When selecting from master data, auto-fill kode & nama
  const handleProvinsiSelect = (kode: string) => {
    setSelectedProvinsiKode(kode);
    const provinsi = MASTER_PROVINSI.find((p) => p.kode === kode);
    if (provinsi) {
      setForm({ ...form, kode: provinsi.kode, nama: provinsi.nama });
    }
  };

  const handleKabupatenSelect = (kode: string) => {
    setSelectedKabupatenKode(kode);
    const kabupaten = MASTER_KABUPATEN.find((k) => k.kode === kode);
    if (kabupaten) {
      setForm({ ...form, kode: kabupaten.kode, nama: kabupaten.nama });
      // Also set provinsiId for the API
      const provinsi = provinsiList.find((p) => p.nama === MASTER_PROVINSI.find((mp) => mp.kode === kabupaten.provinsiKode)?.nama);
      if (provinsi) {
        setForm((prev) => ({ ...prev, kode: kabupaten.kode, nama: kabupaten.nama, provinsiId: String(provinsi.id) }));
      }
    }
  };

  const handleSave = async () => {
    if (!form.kode || !form.nama) {
      setError("Kode dan nama wajib diisi (pilih dari master data)");
      return;
    }
    if (form.type === "kabupaten" && !form.provinsiId) {
      setError("Provinsi wajib dipilih");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onSave(form);
      onClose();
    } catch (e: any) {
      setError(e.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const isProvinsi = form.type === "provinsi";
  // Filter out kabupaten that are already registered
  const allKabupatenOptions = selectedProvinsiKode ? getKabupatenByProvinsi(selectedProvinsiKode) : [];
  const kabupatenOptions = allKabupatenOptions.filter((k) => !existingKabupatenKodes.includes(k.kode));
  const registeredCount = allKabupatenOptions.length - kabupatenOptions.length;

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
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-blue-600 to-sky-500 p-5 text-white">
              <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  {isProvinsi ? <MapPin className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold">
                    {data?.id ? "Edit" : "Tambah"} {isProvinsi ? "Provinsi" : "Kabupaten/Kota"}
                  </h2>
                  <p className="text-xs text-blue-100">Pilih dari master data wilayah Indonesia</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2 rounded-lg">
                  ⚠️ {error}
                </div>
              )}

              {/* Type selector (only for new) */}
              {!data?.id && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setForm({ ...form, type: "provinsi" })}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${form.type === "provinsi" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}
                  >
                    Provinsi
                  </button>
                  <button
                    onClick={() => setForm({ ...form, type: "kabupaten" })}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${form.type === "kabupaten" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}
                  >
                    Kabupaten/Kota
                  </button>
                </div>
              )}

              {/* Select from master data — Provinsi */}
              {isProvinsi ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Pilih Provinsi dari Master Data *
                  </label>
                  <select
                    value={selectedProvinsiKode}
                    onChange={(e) => handleProvinsiSelect(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  >
                    <option value="">— Pilih Provinsi —</option>
                    {MASTER_PROVINSI.map((p) => (
                      <option key={p.kode} value={p.kode}>
                        {p.kode} — {p.nama}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">38 provinsi tersedia dari data Kemendagri</p>
                </div>
              ) : (
                <>
                  {/* Select Provinsi first (for kabupaten) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Pilih Provinsi *
                    </label>
                    <select
                      value={selectedProvinsiKode}
                      onChange={(e) => {
                        setSelectedProvinsiKode(e.target.value);
                        setSelectedKabupatenKode("");
                        setForm({ ...form, kode: "", nama: "", provinsiId: "" });
                      }}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    >
                      <option value="">— Pilih Provinsi —</option>
                      {MASTER_PROVINSI.map((p) => (
                        <option key={p.kode} value={p.kode}>
                          {p.kode} — {p.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Select Kabupaten from master data */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Pilih Kabupaten/Kota dari Master Data *
                    </label>
                    <select
                      value={selectedKabupatenKode}
                      onChange={(e) => handleKabupatenSelect(e.target.value)}
                      disabled={!selectedProvinsiKode}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      <option value="">— Pilih Kabupaten/Kota —</option>
                      {kabupatenOptions.map((k) => (
                        <option key={k.kode} value={k.kode}>
                          {k.kode} — {k.nama} ({k.jenis})
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {kabupatenOptions.length} kabupaten/kota tersedia
                      {registeredCount > 0 && (
                        <span className="text-emerald-500"> • {registeredCount} sudah terdaftar</span>
                      )}
                      {kabupatenOptions.length === 0 && registeredCount > 0 && (
                        <span className="text-amber-500"> • Semua sudah terdaftar</span>
                      )}
                    </p>
                  </div>
                </>
              )}

              {/* Auto-filled fields (read-only) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kode (otomatis)</label>
                  <input
                    type="text"
                    value={form.kode}
                    readOnly
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                    placeholder="Terisi otomatis"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama (otomatis)</label>
                  <input
                    type="text"
                    value={form.nama}
                    readOnly
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                    placeholder="Terisi otomatis"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Ketua {isProvinsi ? "Provinsi" : "Kabupaten/Kota"}
                  {!data?.id && <span className="text-slate-400 font-normal"> (akan tersedia setelah wilayah disimpan & punya pengurus)</span>}
                </label>
                {data?.id ? (
                  loadingPengurus ? (
                    <div className="w-full px-3 py-2 text-sm text-slate-400 bg-slate-50 border border-slate-200 rounded-lg">
                      Memuat daftar pengurus...
                    </div>
                  ) : pengurusList.length === 0 ? (
                    <div className="w-full px-3 py-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg">
                      Belum ada pengurus di {isProvinsi ? "provinsi" : "kabupaten"} ini. Tambah pengurus dahulu di menu Pengurus.
                    </div>
                  ) : (
                    <>
                      <select
                        value={form.ketua}
                        onChange={(e) => setForm({ ...form, ketua: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      >
                        <option value="">— Pilih Ketua dari Pengurus —</option>
                        {pengurusList.map((p) => (
                          <option key={p.id} value={p.namaLengkap}>
                            {p.namaLengkap} ({p.jabatan})
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {pengurusList.length} pengurus tersedia di wilayah ini
                      </p>
                    </>
                  )
                ) : (
                  <input
                    type="text"
                    value={form.ketua}
                    readOnly
                    placeholder="Simpan wilayah dulu, lalu edit untuk pilih ketua dari pengurus"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                )}
                {form.ketua && data?.id && (
                  <div className="mt-1.5 flex items-center gap-2 px-2 py-1 bg-blue-50 border border-blue-100 rounded-md">
                    <CheckCircle2 className="w-3 h-3 text-blue-600 shrink-0" />
                    <span className="text-[11px] text-blue-700">Ketua terpilih: <strong>{form.ketua}</strong></span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Pembentukan">Pembentukan</option>
                  <option value="Nonaktif">Nonaktif</option>
                  <option value="Dibekukan">Dibekukan</option>
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving || (!form.kode || !form.nama)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
