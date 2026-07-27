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
  // Toggle mode: "database" = pilih dari existing, "manual" = input orang baru
  const [inputMode, setInputMode] = useState<"database" | "manual">("database");
  // Data untuk mode manual (orang baru)
  const [manualData, setManualData] = useState({
    namaLengkap: "",
    nik: "",
    email: "",
    hp: "",
    tempatLahir: "",
    tanggalLahir: "",
    jenisKelamin: "L",
    alamat: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [anggotaList, setAnggotaList] = useState<any[]>([]);
  const [jabatanList, setJabatanList] = useState<any[]>([]);
  const [provinsiList, setProvinsiList] = useState<any[]>([]);
  const [kabupatenList, setKabupatenList] = useState<any[]>([]);
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
      setInputMode("database");
      setManualData({
        namaLengkap: "", nik: "", email: "", hp: "", tempatLahir: "",
        tanggalLahir: "", jenisKelamin: "L", alamat: "",
      });
      // Fetch anggota, jabatan, wilayah
      Promise.all([
        fetch("/api/anggota", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/jabatan", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/wilayah?type=provinsi", { cache: "no-store" }).then((r) => r.json()),
        fetch("/api/wilayah?type=kabupaten", { cache: "no-store" }).then((r) => r.json()),
      ]).then(([anggotaJson, jabatanJson, provJson, kabJson]) => {
        if (anggotaJson.success) setAnggotaList(anggotaJson.data);
        if (jabatanJson.success) setJabatanList(jabatanJson.data);
        if (provJson.success) setProvinsiList(provJson.data);
        if (kabJson.success) setKabupatenList(kabJson.data);
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
    if (!form.jabatanId) {
      setError("Jabatan wajib dipilih");
      return;
    }
    // Validasi anggota berdasarkan mode
    if (inputMode === "database") {
      if (!form.anggotaId) {
        setError("Anggota wajib dipilih dari database");
        return;
      }
    } else {
      // Mode manual: nama wajib
      if (!manualData.namaLengkap.trim()) {
        setError("Nama lengkap wajib diisi untuk orang baru");
        return;
      }
    }
    if (form.level === "PROVINSI" && !form.provinsiId) {
      setError("Provinsi penempatan wajib dipilih untuk level Provinsi");
      return;
    }
    if (form.level === "KABUPATEN" && (!form.provinsiId || !form.kabupatenId)) {
      setError("Provinsi & Kabupaten/Kota penempatan wajib dipilih untuk level Kabupaten");
      return;
    }
    setSaving(true);
    setError("");
    try {
      // Kirim data sesuai mode
      const payload: any = { ...form };
      if (inputMode === "manual") {
        // Tandai bahwa ini orang baru, kirim data manual juga
        payload.isNewAnggota = true;
        payload.newAnggotaData = manualData;
        payload.anggotaId = null; // clear anggotaId
      }
      await onSave(payload);
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

              {/* Pilih Anggota — Toggle Mode */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-700">Pilih Anggota *</label>
                  <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setInputMode("database")}
                      className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-all ${
                        inputMode === "database" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      📋 Dari Database
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode("manual")}
                      className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-all ${
                        inputMode === "manual" ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      ✏️ Input Manual (Orang Baru)
                    </button>
                  </div>
                </div>

                {/* MODE DATABASE: pilih dari existing anggota */}
                {inputMode === "database" && (
                  <>
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchAnggota}
                        onChange={(e) => setSearchAnggota(e.target.value)}
                        placeholder="Cari nama atau NIA anggota yang sudah terdaftar..."
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
                    <p className="text-[10px] text-slate-500 mt-1">
                      💡 Pilih anggota yang sudah terdaftar di database. Jika orang belum terdaftar, gunakan mode "Input Manual".
                    </p>
                  </>
                )}

                {/* MODE MANUAL: input orang baru */}
                {inputMode === "manual" && (
                  <div className="space-y-3 bg-emerald-50/50 border border-emerald-200 rounded-lg p-3">
                    <p className="text-[11px] text-emerald-700 font-medium">
                      ✨ Input data orang baru — sistem akan otomatis membuat record anggota saat disimpan
                    </p>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
                      <input
                        type="text"
                        value={manualData.namaLengkap}
                        onChange={(e) => setManualData({ ...manualData, namaLengkap: e.target.value })}
                        placeholder="Contoh: Mirwan Kholid"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">NIK</label>
                        <input
                          type="text"
                          maxLength={16}
                          value={manualData.nik}
                          onChange={(e) => setManualData({ ...manualData, nik: e.target.value.replace(/\D/g, "") })}
                          placeholder="16 digit NIK"
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-emerald-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                        <select
                          value={manualData.jenisKelamin}
                          onChange={(e) => setManualData({ ...manualData, jenisKelamin: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-emerald-500 outline-none"
                        >
                          <option value="L">Laki-laki</option>
                          <option value="P">Perempuan</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tempat Lahir</label>
                        <input
                          type="text"
                          value={manualData.tempatLahir}
                          onChange={(e) => setManualData({ ...manualData, tempatLahir: e.target.value })}
                          placeholder="Contoh: Bandung"
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-emerald-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
                        <input
                          type="date"
                          value={manualData.tanggalLahir}
                          onChange={(e) => setManualData({ ...manualData, tanggalLahir: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-emerald-500 outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={manualData.email}
                          onChange={(e) => setManualData({ ...manualData, email: e.target.value })}
                          placeholder="email@contoh.com"
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-emerald-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">No. HP</label>
                        <input
                          type="tel"
                          value={manualData.hp}
                          onChange={(e) => setManualData({ ...manualData, hp: e.target.value })}
                          placeholder="08xxxxxxxxxx"
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-emerald-500 outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Alamat</label>
                      <input
                        type="text"
                        value={manualData.alamat}
                        onChange={(e) => setManualData({ ...manualData, alamat: e.target.value })}
                        placeholder="Alamat lengkap"
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Level — Card-style selector with clear placement info */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Level Penempatan * <span className="text-slate-400 font-normal">(akan ditempatkan di pengurus level ini)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "NASIONAL", label: "Nasional", desc: "Indonesia", color: "violet", icon: "🏛️" },
                    { value: "PROVINSI", label: "Provinsi", desc: "Tingkat Provinsi", color: "blue", icon: "📍" },
                    { value: "KABUPATEN", label: "Kabupaten/Kota", desc: "Tingkat Daerah", color: "cyan", icon: "🏙️" },
                  ].map((opt) => {
                    const isActive = form.level === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm({ ...form, level: opt.value, jabatanId: "", provinsiId: "", kabupatenId: "" })}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          isActive
                            ? opt.color === "violet"
                              ? "border-violet-500 bg-violet-50"
                              : opt.color === "blue"
                              ? "border-blue-500 bg-blue-50"
                              : "border-cyan-500 bg-cyan-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <div className="text-lg mb-0.5">{opt.icon}</div>
                        <div className={`text-xs font-bold ${
                          isActive
                            ? opt.color === "violet" ? "text-violet-700"
                              : opt.color === "blue" ? "text-blue-700"
                              : "text-cyan-700"
                            : "text-slate-700"
                        }`}>{opt.label}</div>
                        <div className="text-[9px] text-slate-500 mt-0.5">{opt.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Wilayah Penempatan — conditional on level */}
              {form.level === "NASIONAL" && (
                <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 text-xs text-violet-800">
                  📌 <strong>Penempatan:</strong> Pengurus Tingkat Nasional (Indonesia). Tidak perlu pilih wilayah.
                </div>
              )}
              {form.level === "PROVINSI" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Provinsi Penempatan *</label>
                  <select
                    value={form.provinsiId}
                    onChange={(e) => setForm({ ...form, provinsiId: e.target.value, kabupatenId: "" })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                  >
                    <option value="">— Pilih Provinsi —</option>
                    {provinsiList.map((p) => (
                      <option key={p.id} value={p.id}>{p.nama}</option>
                    ))}
                  </select>
                  {form.provinsiId && (
                    <p className="text-[10px] text-blue-600 mt-1">
                      📌 Akan ditempatkan sebagai pengurus di provinsi <strong>{provinsiList.find(p => p.id === parseInt(form.provinsiId))?.nama}</strong>
                    </p>
                  )}
                </div>
              )}
              {form.level === "KABUPATEN" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Provinsi *</label>
                    <select
                      value={form.provinsiId}
                      onChange={(e) => setForm({ ...form, provinsiId: e.target.value, kabupatenId: "" })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                    >
                      <option value="">— Pilih —</option>
                      {provinsiList.map((p) => (
                        <option key={p.id} value={p.id}>{p.nama}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kabupaten/Kota *</label>
                    <select
                      value={form.kabupatenId}
                      onChange={(e) => setForm({ ...form, kabupatenId: e.target.value })}
                      disabled={!form.provinsiId}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none disabled:bg-slate-50"
                    >
                      <option value="">— Pilih —</option>
                      {kabupatenList
                        .filter(k => !form.provinsiId || k.provinsiId === parseInt(form.provinsiId))
                        .map((k) => (
                          <option key={k.id} value={k.id}>{k.nama}</option>
                        ))}
                    </select>
                  </div>
                  {form.kabupatenId && (
                    <div className="col-span-2 bg-cyan-50 border border-cyan-200 rounded-lg p-2 text-[11px] text-cyan-800">
                      📌 Akan ditempatkan sebagai pengurus di <strong>
                        {kabupatenList.find(k => k.id === parseInt(form.kabupatenId))?.nama}
                      </strong>, {provinsiList.find(p => p.id === parseInt(form.provinsiId))?.nama}
                    </div>
                  )}
                </div>
              )}

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
