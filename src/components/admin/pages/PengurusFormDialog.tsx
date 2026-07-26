"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, UserCog, Search } from "lucide-react";
import { toast } from "sonner";

export default function PengurusFormDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}) {
  const [form, setForm] = useState({
    anggotaId: "",
    jabatanId: "",
    level: "KABUPATEN",
    provinsiId: "",
    kabupatenId: "",
    status: "Aktif",
    tanggalMulai: new Date().toISOString().split("T")[0],
    tanggalSelesai: "",
    nomorSK: "",
    fileSK: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [anggotaList, setAnggotaList] = useState<any[]>([]);
  const [jabatanList, setJabatanList] = useState<any[]>([]);
  const [searchAnggota, setSearchAnggota] = useState("");

  useEffect(() => {
    if (open) {
      setError("");
      setForm({
        anggotaId: "", jabatanId: "", level: "KABUPATEN", provinsiId: "", kabupatenId: "",
        status: "Aktif", tanggalMulai: new Date().toISOString().split("T")[0],
        tanggalSelesai: "", nomorSK: "", fileSK: "",
      });
      setSearchAnggota("");
      // Fetch anggota and jabatan
      Promise.all([
        fetch("/api/anggota", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/jabatan", { cache: "no-store" }).then((r) => r.json()),
      ]).then(([anggotaJson, jabatanJson]) => {
        if (anggotaJson.success) setAnggotaList(anggotaJson.data);
        if (jabatanJson.success) setJabatanList(jabatanJson.data);
      });
    }
  }, [open]);

  const filteredAnggota = anggotaList.filter((a) =>
    a.namaLengkap?.toLowerCase().includes(searchAnggota.toLowerCase()) ||
    a.nia?.toLowerCase().includes(searchAnggota.toLowerCase())
  );

  const filteredJabatan = jabatanList.filter((j) => {
    if (form.level === "NASIONAL") return j.level === "Nasional";
    if (form.level === "PROVINSI") return j.level === "Provinsi";
    if (form.level === "KABUPATEN") return j.level === "Kabupaten";
    return true;
  });

  // Group jabatan by bidang for the dropdown
  const jabatanGrouped: Record<string, any[]> = {};
  for (const j of filteredJabatan) {
    if (!jabatanGrouped[j.bidang]) jabatanGrouped[j.bidang] = [];
    jabatanGrouped[j.bidang].push(j);
  }
  const bidangNames = Object.keys(jabatanGrouped).sort();

  const handleSave = async () => {
    if (!form.anggotaId || !form.jabatanId) {
      setError("Anggota dan jabatan wajib dipilih");
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
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="relative bg-gradient-to-r from-blue-600 to-sky-500 p-5 text-white">
              <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <UserCog className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Tambah Pengurus</h2>
                  <p className="text-xs text-blue-100">Pilih anggota yang akan diberi jabatan</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2 rounded-lg">
                  ⚠️ {error}
                </div>
              )}

              {/* Pilih Anggota */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pilih Anggota *</label>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchAnggota}
                    onChange={(e) => setSearchAnggota(e.target.value)}
                    placeholder="Cari anggota..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                  />
                </div>
                <select
                  value={form.anggotaId}
                  onChange={(e) => {
                    const a = anggotaList.find((x) => x.id === parseInt(e.target.value));
                    setForm({
                      ...form,
                      anggotaId: e.target.value,
                      provinsiId: a?.provinsiId ? String(a.provinsiId) : "",
                      kabupatenId: a?.kabupatenId ? String(a.kabupatenId) : "",
                    });
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                  size={5}
                >
                  <option value="">— Pilih Anggota —</option>
                  {filteredAnggota.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nia} — {a.namaLengkap} ({a.kabupaten?.nama || "-"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Level */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Level Jabatan *</label>
                <select
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value, jabatanId: "" })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                >
                  <option value="NASIONAL">Nasional</option>
                  <option value="PROVINSI">Provinsi</option>
                  <option value="KABUPATEN">Kabupaten</option>
                </select>
              </div>

              {/* Pilih Jabatan — Grouped by Bidang */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Bidang & Jabatan *</label>
                <select
                  value={form.jabatanId}
                  onChange={(e) => setForm({ ...form, jabatanId: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                >
                  <option value="">— Pilih Bidang & Jabatan —</option>
                  {bidangNames.map((bidang) => (
                    <optgroup key={bidang} label={bidang}>
                      {jabatanGrouped[bidang]
                        .sort((a, b) => a.urutan - b.urutan)
                        .map((j) => (
                          <option key={j.id} value={j.id}>{j.nama}</option>
                        ))}
                    </optgroup>
                  ))}
                </select>
                {bidangNames.length === 0 && (
                  <p className="text-[10px] text-amber-600 mt-1">
                    Belum ada jabatan untuk level {form.level}. Tambahkan jabatan di halaman master data.
                  </p>
                )}
                {form.jabatanId && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    {(() => {
                      const sel = filteredJabatan.find((j) => j.id === parseInt(form.jabatanId));
                      return sel ? `Bidang: ${sel.bidang} • Level: ${sel.level}` : "";
                    })()}
                  </p>
                )}
              </div>

              {/* Status & Periode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Diberhentikan">Diberhentikan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nomor SK</label>
                  <input
                    type="text"
                    value={form.nomorSK}
                    onChange={(e) => setForm({ ...form, nomorSK: e.target.value })}
                    placeholder="SK-001/KIPAN/..."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mulai Menjabat</label>
                  <input
                    type="date"
                    value={form.tanggalMulai}
                    onChange={(e) => setForm({ ...form, tanggalMulai: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Selesai</label>
                  <input
                    type="date"
                    value={form.tanggalSelesai}
                    onChange={(e) => setForm({ ...form, tanggalSelesai: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Upload SK */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Upload SK (PDF/Image)</label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 1024 * 1024 * 2) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      setForm((prev) => ({ ...prev, fileSK: reader.result as string }));
                      toast.success("SK terupload");
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {form.fileSK && <span className="text-[10px] text-emerald-600 mt-0.5 block">✓ SK terupload</span>}
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
              <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {saving ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>
                ) : (
                  <><Save className="w-4 h-4" /> Simpan</>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
