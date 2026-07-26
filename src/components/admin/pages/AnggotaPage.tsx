"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Eye, Download, X, QrCode, CreditCard, RefreshCw, Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function AnggotaPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [provFilter, setProvFilter] = useState("Semua");
  const [selected, setSelected] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [provinsiList, setProvinsiList] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addForm, setAddForm] = useState({
    namaLengkap: "", nik: "", tempatLahir: "", tanggalLahir: "",
    jenisKelamin: "L", alamat: "", provinsiId: "", kabupatenId: "",
    email: "", hp: "", pekerjaan: "",
  });
  const [kabupatenList, setKabupatenList] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [anggotaRes, wilayahRes] = await Promise.all([
        fetch("/api/anggota", { cache: "no-store" }),
        fetch("/api/wilayah?type=provinsi", { cache: "no-store" }),
      ]);
      const anggotaJson = await anggotaRes.json();
      const wilayahJson = await wilayahRes.json();
      if (anggotaJson.success) setData(anggotaJson.data);
      if (wilayahJson.success) setProvinsiList(wilayahJson.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = data.filter((a) => {
    const matchSearch = a.namaLengkap.toLowerCase().includes(search.toLowerCase()) ||
      a.nia.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "Semua" || a.status === statusFilter;
    const matchProv = provFilter === "Semua" || a.provinsi?.nama === provFilter;
    return matchSearch && matchStatus && matchProv;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Manajemen Anggota</h1>
          <p className="text-slate-500 text-sm mt-1">Total {data.length} anggota ditampilkan</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            onClick={() => setShowAddDialog(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4" /> Tambah Anggota
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

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
          <option>Semua</option>
          {provinsiList.map((p) => <option key={p.id}>{p.nama}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
        >
          {["Semua", "AKTIF", "NONAKTIF", "MENGUNDURKAN_DIRI", "DIBERHENTIKAN"].map((s) => (
            <option key={s} value={s}>
              {s === "AKTIF" ? "Aktif" : s === "NONAKTIF" ? "Nonaktif" :
               s === "MENGUNDURKAN_DIRI" ? "Mengundurkan Diri" :
               s === "DIBERHENTIKAN" ? "Diberhentikan" : "Semua"}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Memuat data anggota...</p>
          </div>
        ) : (
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
                    <div className="text-sm font-semibold text-blue-950">{a.namaLengkap}</div>
                    <div className="text-xs text-slate-500">{a.pekerjaan}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    <div>{a.kabupaten?.nama}</div>
                    <div className="text-xs text-slate-400">{a.provinsi?.nama}</div>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-slate-600">{a.angkatan || "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      a.status === "AKTIF" ? "bg-emerald-100 text-emerald-700" :
                      a.status === "NONAKTIF" ? "bg-slate-100 text-slate-600" :
                      "bg-rose-100 text-rose-700"
                    }`}>
                      {a.status === "AKTIF" ? "Aktif" : a.status === "NONAKTIF" ? "Nonaktif" : a.status}
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
        )}
      </div>

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
                  <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold">
                    {selected.namaLengkap.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selected.namaLengkap}</h2>
                    <p className="text-blue-100 text-sm">NIA: {selected.nia}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">{selected.status}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Biodata</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <InfoRow label="Tempat Lahir" value={selected.tempatLahir} />
                    <InfoRow label="Tanggal Lahir" value={new Date(selected.tanggalLahir).toLocaleDateString("id-ID")} />
                    <InfoRow label="Jenis Kelamin" value={selected.jenisKelamin === "L" ? "Laki-laki" : "Perempuan"} />
                    <InfoRow label="Pendidikan" value={selected.pendidikan || "-"} />
                    <InfoRow label="Pekerjaan" value={selected.pekerjaan || "-"} />
                    <InfoRow label="Angkatan" value={selected.angkatan || "-"} />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Alamat</h3>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>{selected.alamat}</p>
                    <p>Kec. {selected.kecamatan || "-"}, {selected.kabupaten?.nama}</p>
                    <p>Prov. {selected.provinsi?.nama}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Kontak</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <InfoRow label="Email" value={selected.email} />
                    <InfoRow label="HP" value={selected.hp} />
                    <InfoRow label="WhatsApp" value={selected.whatsapp || "-"} />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Riwayat Keanggotaan</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span>Daftar: {new Date(selected.tanggalDaftar).toLocaleDateString("id-ID")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      <span>Diangkat: {selected.tanggalAngkat ? new Date(selected.tanggalAngkat).toLocaleDateString("id-ID") : "-"}</span>
                    </div>
                  </div>
                </div>

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

      {/* Add Anggota Dialog */}
      <AnimatePresence>
        {showAddDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddDialog(false)}
            className="fixed inset-0 z-[300] bg-blue-950/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="relative bg-gradient-to-r from-emerald-600 to-teal-500 p-5 text-white">
                <button onClick={() => setShowAddDialog(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Tambah Anggota</h2>
                    <p className="text-xs text-emerald-100">NIA akan dibuat otomatis</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Lengkap *</label>
                    <input type="text" value={addForm.namaLengkap} onChange={(e) => setAddForm({ ...addForm, namaLengkap: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">NIK (16 digit) *</label>
                    <input type="text" maxLength={16} value={addForm.nik} onChange={(e) => setAddForm({ ...addForm, nik: e.target.value.replace(/\D/g, "") })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tempat Lahir</label>
                    <input type="text" value={addForm.tempatLahir} onChange={(e) => setAddForm({ ...addForm, tempatLahir: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tanggal Lahir</label>
                    <input type="date" value={addForm.tanggalLahir} onChange={(e) => setAddForm({ ...addForm, tanggalLahir: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Jenis Kelamin</label>
                    <select value={addForm.jenisKelamin} onChange={(e) => setAddForm({ ...addForm, jenisKelamin: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none">
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pekerjaan</label>
                    <input type="text" value={addForm.pekerjaan} onChange={(e) => setAddForm({ ...addForm, pekerjaan: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Alamat</label>
                  <input type="text" value={addForm.alamat} onChange={(e) => setAddForm({ ...addForm, alamat: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Provinsi *</label>
                    <select
                      value={addForm.provinsiId}
                      onChange={async (e) => {
                        setAddForm({ ...addForm, provinsiId: e.target.value, kabupatenId: "" });
                        const res = await fetch(`/api/wilayah?type=kabupaten`, { cache: "no-store" });
                        const json = await res.json();
                        if (json.success) setKabupatenList(json.data.filter((k: any) => k.provinsiId === parseInt(e.target.value)));
                      }}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                    >
                      <option value="">Pilih...</option>
                      {provinsiList.map((p) => <option key={p.id} value={p.id}>{p.nama}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kabupaten *</label>
                    <select value={addForm.kabupatenId} onChange={(e) => setAddForm({ ...addForm, kabupatenId: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" disabled={!addForm.provinsiId}>
                      <option value="">Pilih...</option>
                      {kabupatenList.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
                    <input type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">No. HP</label>
                    <input type="tel" value={addForm.hp} onChange={(e) => setAddForm({ ...addForm, hp: e.target.value })} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 flex justify-end gap-2">
                <button onClick={() => setShowAddDialog(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
                <button
                  onClick={async () => {
                    if (!addForm.namaLengkap || !addForm.nik || !addForm.provinsiId || !addForm.kabupatenId) {
                      toast.error("Nama, NIK, provinsi, dan kabupaten wajib diisi");
                      return;
                    }
                    setSaving(true);
                    try {
                      const res = await fetch("/api/anggota", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(addForm),
                      });
                      const json = await res.json();
                      if (json.success) {
                        toast.success(json.message);
                        setShowAddDialog(false);
                        fetchData();
                        setAddForm({ namaLengkap: "", nik: "", tempatLahir: "", tanggalLahir: "", jenisKelamin: "L", alamat: "", provinsiId: "", kabupatenId: "", email: "", hp: "", pekerjaan: "" });
                      } else {
                        toast.error(json.error);
                      }
                    } catch (e) {
                      toast.error("Gagal menambahkan anggota");
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  {saving ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menyimpan...</>
                  ) : (
                    <><UserPlus className="w-4 h-4" /> Tambah Anggota</>
                  )}
                </button>
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
