"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, MapPin, Building2 } from "lucide-react";

export interface WilayahFormData {
  id?: number;
  type: "provinsi" | "kabupaten";
  kode: string;
  nama: string;
  status: string;
  ketua: string;
  provinsiId?: string;
}

export default function WilayahFormDialog({
  open,
  data,
  provinsiList,
  onClose,
  onSave,
}: {
  open: boolean;
  data: WilayahFormData | null;
  provinsiList: { id: number; nama: string }[];
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

  useEffect(() => {
    if (data) {
      setForm(data);
    } else {
      setForm({ type: "provinsi", kode: "", nama: "", status: "Aktif", ketua: "" });
    }
    setError("");
  }, [data, open]);

  const handleSave = async () => {
    if (!form.kode || !form.nama) {
      setError("Kode dan nama wajib diisi");
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
                  <p className="text-xs text-blue-100">Isi data wilayah dengan lengkap</p>
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kode {isProvinsi ? "Provinsi" : "Kabupaten"} *</label>
                <input
                  type="text"
                  value={form.kode}
                  onChange={(e) => setForm({ ...form, kode: e.target.value.toUpperCase() })}
                  placeholder={isProvinsi ? "cth: JBR" : "cth: 3204"}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama {isProvinsi ? "Provinsi" : "Kabupaten/Kota"} *</label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder={isProvinsi ? "cth: Jawa Barat" : "cth: Bandung Barat"}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              {!isProvinsi && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Provinsi *</label>
                  <select
                    value={form.provinsiId || ""}
                    onChange={(e) => setForm({ ...form, provinsiId: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                  >
                    <option value="">Pilih Provinsi...</option>
                    {provinsiList.map((p) => (
                      <option key={p.id} value={p.id}>{p.nama}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ketua</label>
                <input
                  type="text"
                  value={form.ketua}
                  onChange={(e) => setForm({ ...form, ketua: e.target.value })}
                  placeholder="Nama ketua wilayah"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
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
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
