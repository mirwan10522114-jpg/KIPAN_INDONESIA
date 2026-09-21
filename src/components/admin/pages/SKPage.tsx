// Force TS Server re-parse
"use client";

import { useState, useEffect } from "react";
import {
  FileCheck,
  Plus,
  Search,
  RefreshCw,
  ChevronDown,
  XCircle,
  Eye,
  UserPlus,
  Power,
  Trash2,
  Calendar,
  MapPin,
  Users,
  Download,
  ExternalLink,
  CheckCircle,
  Clock3,
} from "lucide-react";

import { useAuthStore } from "@/lib/auth-store";

export default function SKPage() {
  const [skList, setSKList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [filterApproval, setFilterApproval] = useState("Semua");
  const { role: activeRole, wilayah, provinsiId: authProvinsiId, kabupatenId: authKabupatenId } = useAuthStore();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showAddPengurusDialog, setShowAddPengurusDialog] = useState(false);
  const [showNonaktifDialog, setShowNonaktifDialog] = useState(false);
  const [targetNonaktifSk, setTargetNonaktifSk] = useState<any>(null);
  const [nonaktifForm, setNonaktifForm] = useState({ keterangan: "", statusPengurus: "Demisioner" });
  
  const canNonaktifkan = (sk: any) => {
    if (activeRole === "SUPER_ADMIN" || activeRole === "ADMIN_NASIONAL") return true;
    if (activeRole === "ADMIN_PROVINSI" && (sk.level === "PROVINSI" || sk.level === "KABUPATEN")) return true;
    if (activeRole === "ADMIN_KABUPATEN" && sk.level === "KABUPATEN") return true;
    return false;
  };
  const [selectedSK, setSelectedSK] = useState<any>(null);
  const [skDetail, setSKDetail] = useState<any>(null);
  const [provinsiList, setProvinsiList] = useState<any[]>([]);
  const [kabupatenList, setKabupatenList] = useState<any[]>([]);

  // Form state
  const [form, setForm] = useState({
    nomorSK: "", judul: "", level: "NASIONAL",
    provinsiId: "", kabupatenId: "",
    tanggalTerbit: "", tanggalBerakhir: "", fileSK: "",
  });

  // Add pengurus state
  const [anggotaSearch, setAnggotaSearch] = useState("");
  const [pengurusSearchMode, setPengurusSearchMode] = useState<"anggota" | "pengurus">("anggota");
  const [anggotaResults, setAnggotaResults] = useState<any[]>([]);
  const [searchingAnggota, setSearchingAnggota] = useState(false);
  const [jabatanList, setJabatanList] = useState<any[]>([]);
  const [selectedJabatan, setSelectedJabatan] = useState("");
  const [filterPromosiKabupaten, setFilterPromosiKabupaten] = useState("");

  const fetchSKList = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filterLevel !== "Semua") params.set("level", filterLevel);
      if (filterStatus !== "Semua") params.set("status", filterStatus);
      if (filterApproval !== "Semua") params.set("approvalStatus", filterApproval);
      params.set("limit", "100");
      if (activeRole) params.append("role", activeRole);
      if (wilayah) params.append("wilayah", wilayah);
      
      const res = await fetch(`/api/surat-keputusan?${params.toString()}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success) setSKList(json.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const openDoc = (url: string) => {
    if (!url) return;
    try {
      if (url.startsWith("data:")) {
        const arr = url.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || "application/pdf";
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
      } else {
        window.open(url, "_blank");
      }
    } catch (e) {
      alert("Gagal membuka file. Format file tidak valid.");
    }
  };

  const fetchProvinsi = async () => {
    try {
      const res = await fetch("/api/wilayah?type=provinsi&limit=100");
      const json = await res.json();
      if (json.success) setProvinsiList(json.data);
    } catch (e) { console.error(e); }
  };

  const fetchKabupaten = async (provId: string) => {
    if (!provId) { setKabupatenList([]); return; }
    try {
      const res = await fetch(`/api/wilayah?type=kabupaten&provinsiId=${provId}&limit=600`);
      const json = await res.json();
      if (json.success) setKabupatenList(json.data);
    } catch (e) { console.error(e); }
  };

  const fetchJabatan = async (level: string) => {
    try {
      const res = await fetch(`/api/jabatan?level=${level}`);
      const json = await res.json();
      if (json.success) setJabatanList(json.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchSKList(); fetchProvinsi(); }, []);
  useEffect(() => { fetchSKList(); }, [search, filterLevel, filterStatus, filterApproval]);

  // Populate kabupatenList for filter
  useEffect(() => {
    if (provinsiList.length > 0) {
      if (activeRole === "ADMIN_PROVINSI" && wilayah) {
        const w = wilayah.replace("Provinsi ", "").trim();
        const prov = provinsiList.find((p: any) => p.nama === w);
        if (prov) fetchKabupaten(String(prov.id));
      } else if (activeRole === "SUPER_ADMIN" || activeRole === "ADMIN_NASIONAL") {
        fetch("/api/wilayah?type=kabupaten&limit=600")
          .then(res => res.json())
          .then(json => { if (json.success) setKabupatenList(json.data); })
          .catch(e => console.error(e));
      }
    }
  }, [provinsiList, activeRole, wilayah]);

  const fetchSKDetail = async (id: number) => {
    try {
      const res = await fetch(`/api/surat-keputusan/${id}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success) setSKDetail(json.data);
    } catch (e) { console.error(e); }
  };

  const handleApprove = async (action: "APPROVE" | "REJECT") => {
    if (!skDetail) return;
    let catatan = "";
    if (action === "REJECT") {
      catatan = prompt("Masukkan alasan penolakan:") || "";
      if (!catatan) return; // cancel
    } else {
      if (!confirm("Apakah Anda yakin ingin menyetujui SK ini?")) return;
    }
    
    try {
      const res = await fetch(`/api/surat-keputusan/${skDetail.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, role: activeRole, catatan }),
      });
      const json = await res.json();
      if (json.success) {
        alert("Status persetujuan berhasil diperbarui!");
        fetchSKDetail(skDetail.id);
        fetchSKList();
      } else {
        alert("Gagal: " + json.error);
      }
    } catch (e) { console.error(e); }
  };

  const openDetail = async (sk: any) => {
    setSelectedSK(sk);
    await fetchSKDetail(sk.id);
    setShowDetailDialog(true);
  };

  const handleOpenCreateDialog = async () => {
    let defaultLevel = "NASIONAL";
    let defaultProvId = "";
    let defaultKabId = "";

    if (activeRole === "ADMIN_PROVINSI" && authProvinsiId) {
      defaultLevel = "PROVINSI";
      defaultProvId = String(authProvinsiId);
      // Fetch kabupaten list untuk provinsi ini
      fetchKabupaten(defaultProvId);
    } else if (activeRole === "ADMIN_KABUPATEN" && authKabupatenId) {
      defaultLevel = "KABUPATEN";
      defaultKabId = String(authKabupatenId);
      // Cari provinsiId dari kabupaten menggunakan kabupatenId yang diketahui
      if (authProvinsiId) {
        defaultProvId = String(authProvinsiId);
      } else {
        // Fallback: fetch kabupaten detail untuk mendapatkan provinsiId
        try {
          const res = await fetch(`/api/wilayah?type=kabupaten&id=${authKabupatenId}`);
          const json = await res.json();
          if (json.success && json.data?.[0]?.provinsiId) {
            defaultProvId = String(json.data[0].provinsiId);
          }
        } catch (e) {}
      }
    }

    setForm({
      nomorSK: "", judul: "", level: defaultLevel,
      provinsiId: defaultProvId, kabupatenId: defaultKabId,
      tanggalTerbit: "", tanggalBerakhir: "", fileSK: ""
    });

    setShowCreateDialog(true);
  };

  const handleCreate = async () => {
    if (!form.nomorSK || !form.judul || !form.tanggalTerbit) {
      alert("Nomor SK, Judul, dan Tanggal Terbit wajib diisi.");
      return;
    }
    try {
      const res = await fetch("/api/surat-keputusan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, creatorRole: activeRole }),
      });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        setShowCreateDialog(false);
        setForm({ nomorSK: "", judul: "", level: "NASIONAL", provinsiId: "", kabupatenId: "", tanggalTerbit: "", tanggalBerakhir: "", fileSK: "" });
        fetchSKList();
      } else {
        alert(json.error);
      }
    } catch (e: any) { alert(e.message); }
  };

  const initiateNonaktifkan = (sk: any) => {
    setTargetNonaktifSk(sk);
    setNonaktifForm({ keterangan: "", statusPengurus: "Demisioner" });
    setShowNonaktifDialog(true);
  };

  const executeNonaktifkan = async () => {
    if (!targetNonaktifSk) return;
    if (!nonaktifForm.keterangan.trim()) {
      alert("Keterangan wajib diisi.");
      return;
    }
    
    try {
      const res = await fetch(`/api/surat-keputusan/${targetNonaktifSk.id}/nonaktifkan`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...nonaktifForm, role: activeRole })
      });
      const json = await res.json();
      alert(json.message || json.error);
      fetchSKList();
      if (skDetail?.id === targetNonaktifSk.id) fetchSKDetail(targetNonaktifSk.id);
      setShowNonaktifDialog(false);
    } catch (e: any) { alert(e.message); }
  };

  const handleDeleteSK = async (sk: any) => {
    if (!confirm(`Hapus SK "${sk.nomorSK}"? Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      const res = await fetch(`/api/surat-keputusan/${sk.id}`, { method: "DELETE" });
      const json = await res.json();
      alert(json.message || json.error);
      fetchSKList();
      if (showDetailDialog && skDetail?.id === sk.id) setShowDetailDialog(false);
    } catch (e: any) { alert(e.message); }
  };

  // Search anggota or pengurus for adding to SK
  const searchAnggota = async (query: string, mode = pengurusSearchMode) => {
    setAnggotaSearch(query);
    if (query.length < 2) { setAnggotaResults([]); return; }
    setSearchingAnggota(true);
    try {
      if (mode === "anggota") {
        const params = new URLSearchParams({
          search: query,
          limit: "10",
        });
        if (activeRole) params.append("role", activeRole);
        if (wilayah) params.append("wilayah", wilayah);
        const res = await fetch(`/api/anggota?${params.toString()}`);
        const json = await res.json();
        if (json.success) setAnggotaResults(json.data);
      } else {
        const params = new URLSearchParams({
          search: query,
        });
        if (activeRole) params.append("role", activeRole);
        if (wilayah) params.append("wilayah", wilayah);
        if (skDetail?.level) params.append("skLevel", skDetail.level);
        if (filterPromosiKabupaten) params.append("filterKabupaten", filterPromosiKabupaten);
        
        const res = await fetch(`/api/pengurus/list-promosi?${params.toString()}`);
        const json = await res.json();
        if (json.success) {
          // Format data to match anggotaResults structure slightly so the UI doesn't break
          const formatted = json.data.map((p: any) => ({
            ...p.anggota,
            provinsi: p.provinsi,
            kabupaten: p.kabupaten,
            _pengurusInfo: p // To show extra info in UI
          }));
          setAnggotaResults(formatted);
        }
      }
    } catch (e) { console.error(e); }
    finally { setSearchingAnggota(true); setSearchingAnggota(false); }
  };

  useEffect(() => {
    if (anggotaSearch || filterPromosiKabupaten) {
      searchAnggota(anggotaSearch, pengurusSearchMode);
    } else {
      setAnggotaResults([]);
    }
  }, [pengurusSearchMode, filterPromosiKabupaten]);

  const handleAddPengurus = async (anggotaId: number) => {
    if (!skDetail) return;
    if (!selectedJabatan) {
      alert("Harap pilih jabatan terlebih dahulu!");
      return;
    }
    try {
      const res = await fetch(`/api/surat-keputusan/${skDetail.id}/pengurus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anggotaId, jabatanId: selectedJabatan || null }),
      });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        setAnggotaSearch("");
        setAnggotaResults([]);
        fetchSKDetail(skDetail.id);
        fetchSKList();
      } else {
        alert(json.error);
      }
    } catch (e: any) { alert(e.message); }
  };

  const handleRemovePengurus = async (pengurusId: number, nama: string) => {
    if (!skDetail) return;
    if (!confirm(`Hapus ${nama} dari SK ini?`)) return;
    try {
      const res = await fetch(`/api/surat-keputusan/${skDetail.id}/pengurus?pengurusId=${pengurusId}`, { method: "DELETE" });
      const json = await res.json();
      alert(json.message || json.error);
      fetchSKDetail(skDetail.id);
      fetchSKList();
    } catch (e: any) { alert(e.message); }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Surat Keputusan (SK)</h1>
          <p className="text-sm text-slate-500">Pusat penerbitan dan database SK kepengurusan.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleOpenCreateDialog}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Buat SK Baru
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nomor SK atau judul..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
          />
        </div>
        <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg">
          <option value="Semua">Semua Level</option>
          <option value="NASIONAL">Nasional</option>
          <option value="PROVINSI">Provinsi</option>
          <option value="KABUPATEN">Kabupaten</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg">
          <option value="Semua">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="TidakAktif">Tidak Aktif</option>
        </select>
        <select value={filterApproval} onChange={(e) => setFilterApproval(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg">
          <option value="Semua">Semua Approval</option>
          <option value="DRAFT">DRAFT</option>
          <option value="MENUNGGU_PROVINSI">Menunggu Provinsi</option>
          <option value="MENUNGGU_NASIONAL">Menunggu Nasional</option>
          <option value="DISETUJUI">Disetujui</option>
          <option value="DITOLAK">Ditolak</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500">Memuat data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold w-12 text-center">No</th>
                  <th className="text-left px-4 py-3 font-semibold">Nomor SK</th>
                  <th className="text-left px-4 py-3 font-semibold">Judul</th>
                  <th className="text-left px-4 py-3 font-semibold">Level</th>
                  <th className="text-left px-4 py-3 font-semibold">Wilayah</th>
                  <th className="text-center px-4 py-3 font-semibold">Pengurus</th>
                  <th className="text-center px-4 py-3 font-semibold">Approval</th>
                  <th className="text-center px-4 py-3 font-semibold">Status SK</th>
                  <th className="text-left px-4 py-3 font-semibold">Masa Berlaku</th>
                  <th className="text-center px-4 py-3 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {skList.map((sk, idx) => (
                  <tr key={sk.id} className="border-t border-slate-50 hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 text-sm text-slate-500 text-center">{idx + 1}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-blue-700 text-xs">{sk.nomorSK}</td>
                    <td className="px-4 py-3 text-slate-800 max-w-[250px] truncate">{sk.judul}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        sk.level === "NASIONAL" ? "bg-purple-100 text-purple-700" :
                        sk.level === "PROVINSI" ? "bg-blue-100 text-blue-700" :
                        "bg-sky-100 text-sky-700"
                      }`}>{sk.level}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {sk.level === "NASIONAL" ? "Pusat" :
                       sk.provinsi?.nama || "-"}
                      {sk.kabupaten ? `, ${sk.kabupaten.nama}` : ""}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                        <Users className="w-3 h-3" />
                        {sk._count?.pengurus || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sk.approvalStatus === "DISETUJUI" ? "bg-emerald-100 text-emerald-700" :
                        sk.approvalStatus === "DITOLAK" ? "bg-rose-100 text-rose-700" :
                        sk.approvalStatus === "DRAFT" ? "bg-slate-100 text-slate-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {sk.approvalStatus?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {(() => {
                        const isExpired = sk.tanggalBerakhir && new Date(sk.tanggalBerakhir).getTime() < new Date().setHours(0,0,0,0);
                        if (sk.status !== "Aktif") {
                          return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">Tidak Aktif</span>;
                        }
                        if (isExpired) {
                          return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700">SK Sudah Habis</span>;
                        }
                        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">Aktif</span>;
                      })()}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      <div>Mulai: <span className="font-medium text-slate-700">{new Date(sk.tanggalTerbit).toLocaleDateString("id-ID")}</span></div>
                      <div>Akhir: <span className="font-medium text-slate-700">{sk.tanggalBerakhir ? new Date(sk.tanggalBerakhir).toLocaleDateString("id-ID") : "-"}</span></div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openDetail(sk)} title="Detail"
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-blue-600">
                          <Eye className="w-4 h-4" />
                        </button>
                        {sk.status === "Aktif" && canNonaktifkan(sk) && (
                          <button onClick={() => initiateNonaktifkan(sk)} title="Nonaktifkan"
                            className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-500 hover:text-amber-600">
                            <Power className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleDeleteSK(sk)} title="Hapus"
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {skList.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-500">Belum ada Surat Keputusan</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create SK Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-[300] bg-blue-950/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowCreateDialog(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-sky-500 p-5 text-white relative">
              <button onClick={() => setShowCreateDialog(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Buat Surat Keputusan Baru</h2>
                  <p className="text-xs text-blue-100">Isi detail SK kepengurusan</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nomor SK *</label>
                <input type="text" value={form.nomorSK} onChange={(e) => setForm({...form, nomorSK: e.target.value})}
                  placeholder="SK-001/DPP-KIPAN/IX/2026"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Judul SK *</label>
                <input type="text" value={form.judul} onChange={(e) => setForm({...form, judul: e.target.value})}
                  placeholder="SK Pengurus DPD KIPAN Jawa Barat Periode 2026-2029"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Level *</label>
                <select value={form.level} onChange={(e) => {
                  setForm({...form, level: e.target.value, provinsiId: "", kabupatenId: ""});
                  setKabupatenList([]);
                }} 
                disabled={activeRole === "ADMIN_PROVINSI" || activeRole === "ADMIN_KABUPATEN"}
                className={`w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none ${activeRole === "ADMIN_PROVINSI" || activeRole === "ADMIN_KABUPATEN" ? "bg-slate-100 cursor-not-allowed text-slate-500" : ""}`}>
                  <option value="NASIONAL">Nasional</option>
                  <option value="PROVINSI">Provinsi</option>
                  <option value="KABUPATEN">Kabupaten</option>
                </select>
              </div>
              {(form.level === "PROVINSI" || form.level === "KABUPATEN") && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Provinsi</label>
                  <select value={form.provinsiId} onChange={(e) => {
                    setForm({...form, provinsiId: e.target.value, kabupatenId: ""});
                    fetchKabupaten(e.target.value);
                  }} 
                  disabled={activeRole === "ADMIN_PROVINSI" || activeRole === "ADMIN_KABUPATEN"}
                  className={`w-full px-3 py-2 text-sm border border-slate-200 rounded-lg ${(activeRole === "ADMIN_PROVINSI" || activeRole === "ADMIN_KABUPATEN") ? "bg-slate-100 cursor-not-allowed text-slate-500" : ""}`}>
                    <option value="">Pilih Provinsi</option>
                    {provinsiList.map((p: any) => <option key={p.id} value={p.id}>{p.nama}</option>)}
                  </select>
                </div>
              )}
              {form.level === "KABUPATEN" && form.provinsiId && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kabupaten/Kota</label>
                  <select value={form.kabupatenId} onChange={(e) => setForm({...form, kabupatenId: e.target.value})}
                    disabled={activeRole === "ADMIN_KABUPATEN"}
                    className={`w-full px-3 py-2 text-sm border border-slate-200 rounded-lg ${activeRole === "ADMIN_KABUPATEN" ? "bg-slate-100 cursor-not-allowed text-slate-500" : ""}`}>
                    <option value="">Pilih Kabupaten/Kota</option>
                    {kabupatenList.map((k: any) => <option key={k.id} value={k.id}>{k.nama}</option>)}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tanggal Terbit *</label>
                  <input type="date" value={form.tanggalTerbit} onChange={(e) => setForm({...form, tanggalTerbit: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tanggal Berakhir</label>
                  <input type="date" value={form.tanggalBerakhir} onChange={(e) => setForm({...form, tanggalBerakhir: e.target.value})}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">File SK (PDF, Opsional)</label>
                <input type="file" accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setForm({...form, fileSK: reader.result as string});
                      };
                      reader.readAsDataURL(file);
                    } else {
                      setForm({...form, fileSK: ""});
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:border-blue-500 outline-none" />
                  {form.fileSK && <div className="text-xs text-emerald-600 mt-1">✓ File siap diupload</div>}
              </div>
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-lg flex items-start gap-2 mt-2">
                <div className="shrink-0 mt-0.5">⚠️</div>
                <p><strong>Penting (Aturan SK Tunggal):</strong> Mengajukan dan menyetujui SK baru ini akan <strong>otomatis menonaktifkan SK lama</strong> yang masih aktif di wilayah ini beserta seluruh pengurusnya (menjadi Demisioner).</p>
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setShowCreateDialog(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
              <button onClick={handleCreate}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">
                <FileCheck className="w-4 h-4" /> Simpan SK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail SK Dialog */}
      {showDetailDialog && skDetail && (
        <div className="fixed inset-0 z-[300] bg-blue-950/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowDetailDialog(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-sky-500 p-5 text-white relative">
              <button onClick={() => setShowDetailDialog(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold">{skDetail.judul}</h2>
                  <p className="text-sm font-mono text-blue-100">{skDetail.nomorSK}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  skDetail.status === "Aktif" ? "bg-emerald-500/20 text-emerald-100" : "bg-white/20 text-white/80"
                }`}>{skDetail.status === "Aktif" ? "✓ Aktif" : "Tidak Aktif"}</span>
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-blue-100">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {skDetail.level === "NASIONAL" ? "Nasional (Pusat)" : `${skDetail.provinsi?.nama || ""}${skDetail.kabupaten ? `, ${skDetail.kabupaten.nama}` : ""}`}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Terbit: {new Date(skDetail.tanggalTerbit).toLocaleDateString("id-ID")}</span>
                {skDetail.tanggalBerakhir && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Berakhir: {new Date(skDetail.tanggalBerakhir).toLocaleDateString("id-ID")}</span>}
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {skDetail.pengurus?.length || 0} Pengurus</span>
                {skDetail.fileSK && (
                  <button onClick={() => openDoc(skDetail.fileSK)} className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded transition-colors text-white font-semibold cursor-pointer">
                    <ExternalLink className="w-3 h-3" /> Lihat Lampiran SK
                  </button>
                )}
              </div>
            </div>

            {/* Panel Aksi Approval (jika butuh persetujuan) */}
            {((activeRole === "ADMIN_PROVINSI" && skDetail.approvalStatus === "MENUNGGU_PROVINSI") ||
             ((activeRole === "ADMIN_NASIONAL" || activeRole === "SUPER_ADMIN") && skDetail.approvalStatus === "MENUNGGU_NASIONAL")) && (
              <div className="bg-amber-50 border-b border-amber-100 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-amber-800 text-sm flex items-center gap-2"><Clock3 className="w-4 h-4" /> Membutuhkan Persetujuan Anda</h4>
                  <p className="text-xs text-amber-700 mt-1">Silakan periksa daftar pengurus sebelum menyetujui SK ini.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleApprove("REJECT")} className="px-4 py-2 bg-white text-rose-600 text-xs font-bold border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors">Tolak SK</button>
                  <button onClick={() => handleApprove("APPROVE")} className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> {activeRole === "ADMIN_PROVINSI" ? "Teruskan ke Nasional" : "Setujui Final"}</button>
                </div>
              </div>
            )}
            {skDetail.approvalStatus === "DITOLAK" && skDetail.catatanPenolakan && (
              <div className="bg-rose-50 border-b border-rose-100 p-4">
                <h4 className="font-bold text-rose-800 text-sm flex items-center gap-2"><XCircle className="w-4 h-4" /> SK Ini Ditolak</h4>
                <p className="text-xs text-rose-700 mt-1">Alasan: {skDetail.catatanPenolakan}</p>
              </div>
            )}

            {/* Pengurus List */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-blue-950">Daftar Pengurus di SK ini</h3>
                {skDetail.status === "Aktif" && skDetail.approvalStatus !== "DISETUJUI" && (
                  <button onClick={() => { setShowAddPengurusDialog(true); fetchJabatan(skDetail.level); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700">
                    <UserPlus className="w-3.5 h-3.5" /> Tambah Pengurus
                  </button>
                )}
              </div>

              {skDetail.approvalStatus === "DISETUJUI" && (
                <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-800 text-xs px-4 py-3 rounded-xl flex items-center gap-2 font-medium">
                  <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                  SK ini telah disetujui secara final. Susunan pengurus telah terkunci dan tidak dapat diubah lagi.
                </div>
              )}

              {skDetail.pengurus?.length > 0 ? (
                <div className="space-y-2">
                  {skDetail.pengurus.map((p: any, idx: number) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {p.anggota?.namaLengkap?.charAt(0) || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-800 truncate">{p.anggota?.namaLengkap}</div>
                        <div className="text-xs text-slate-500 font-mono">Jabatan: <span className="font-medium text-blue-600">{p.jabatan?.nama || "-"}</span></div>
                      </div>
                      <div className="text-xs text-slate-500">
                        {p.anggota?.provinsi?.nama}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        p.status === "Aktif" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                      }`}>{p.status}</span>
                      {skDetail.status === "Aktif" && skDetail.approvalStatus !== "DISETUJUI" && (
                        <button onClick={() => handleRemovePengurus(p.id, p.anggota?.namaLengkap)}
                          className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600" title="Hapus dari SK">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm">
                  Belum ada pengurus di SK ini. Klik "Tambah Pengurus" untuk menambahkan.
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-5 border-t border-slate-100 flex justify-between">
              <div className="flex gap-2">
                {skDetail.status === "Aktif" && canNonaktifkan(skDetail) && (
                  <button onClick={() => initiateNonaktifkan(skDetail)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600">
                    <Power className="w-3.5 h-3.5" /> Nonaktifkan SK
                  </button>
                )}
                <button onClick={() => handleDeleteSK(skDetail)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700">
                  <Trash2 className="w-3.5 h-3.5" /> Hapus SK
                </button>
              </div>
              <button onClick={() => setShowDetailDialog(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Pengurus Dialog */}
      {showAddPengurusDialog && skDetail && (
        <div className="fixed inset-0 z-[350] bg-blue-950/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowAddPengurusDialog(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-5 text-white relative">
              <button onClick={() => setShowAddPengurusDialog(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Tambah Pengurus ke SK</h2>
                  <p className="text-xs text-emerald-100 font-mono">{skDetail.nomorSK}</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                💡 Pilih jabatan terlebih dahulu, kemudian cari anggota berdasarkan <strong>nama</strong> atau <strong>NIA</strong>, lalu klik untuk menambahkannya sebagai pengurus di SK ini.
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Jabatan *</label>
                <div className="relative">
                  <select
                    value={selectedJabatan}
                    onChange={(e) => setSelectedJabatan(e.target.value)}
                    className="w-full appearance-none pl-3 pr-10 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="">-- Tidak ada / Default --</option>
                    {jabatanList.map((j) => (
                      <option key={j.id} value={j.id}>{j.nama}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              {/* Tab Mode */}
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setPengurusSearchMode("anggota")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${pengurusSearchMode === "anggota" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Dari Anggota (Baru)
                </button>
                <button
                  type="button"
                  onClick={() => setPengurusSearchMode("pengurus")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${pengurusSearchMode === "pengurus" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Promosi Pengurus
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={anggotaSearch}
                  onChange={(e) => searchAnggota(e.target.value)}
                  placeholder={pengurusSearchMode === "anggota" ? "Ketik nama atau NIA anggota..." : "Ketik nama Pengurus..."}
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                  autoFocus />
              </div>
              
              {pengurusSearchMode === "pengurus" && (activeRole === "ADMIN_PROVINSI" || activeRole === "SUPER_ADMIN" || activeRole === "ADMIN_NASIONAL") && (
                <div className="mt-2">
                  <select 
                    value={filterPromosiKabupaten} 
                    onChange={(e) => setFilterPromosiKabupaten(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                  >
                    <option value="">Semua Kabupaten / Kota</option>
                    {kabupatenList.map((k: any) => (
                      <option key={k.id} value={k.id}>{k.nama}</option>
                    ))}
                  </select>
                </div>
              )}
              {searchingAnggota && (
                <div className="text-center py-3">
                  <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                </div>
              )}
              {anggotaResults.length > 0 && (
                <div className="max-h-[300px] overflow-y-auto space-y-1">
                  {anggotaResults.map((a: any) => (
                    <button key={a.id} onClick={() => handleAddPengurus(a.id)}
                      className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {a.namaLengkap.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-800 truncate">{a.namaLengkap}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{a.nia}</div>
                        {(() => {
                          if (a._pengurusInfo) {
                            return (
                              <div className="text-[10px] font-semibold text-amber-600 mt-0.5">
                                {a._pengurusInfo.status === "Aktif" ? "Menjabat:" : a._pengurusInfo.status} {a._pengurusInfo.jabatan?.nama || "-"} ({a._pengurusInfo.level === "KABUPATEN" ? a._pengurusInfo.kabupaten?.nama : a._pengurusInfo.level === "PROVINSI" ? a._pengurusInfo.provinsi?.nama : "Nasional"})
                              </div>
                            );
                          } else if (a.pengurus && a.pengurus.length > 0) {
                            const activeP = a.pengurus.find((p: any) => p.status === "Aktif");
                            const latestP = activeP || a.pengurus[0];
                            return (
                              <div className="text-[10px] font-semibold text-amber-600 mt-0.5">
                                {latestP.status === "Aktif" ? "Pengurus Aktif" : latestP.status === "Demisioner" ? "Demisioner" : latestP.status} {latestP.jabatan?.nama || "-"} ({latestP.level === "KABUPATEN" ? latestP.kabupaten?.nama : latestP.level === "PROVINSI" ? latestP.provinsi?.nama : "Nasional"})
                              </div>
                            );
                          } else {
                            return (
                              <div className="text-[10px] font-medium text-slate-400 mt-0.5">
                                - (Belum ada riwayat pengurus)
                              </div>
                            );
                          }
                        })()}
                      </div>
                      <div className="text-[10px] text-slate-400 text-right">
                        <div>{a.provinsi?.nama}</div>
                        <div>{a.kabupaten?.nama}</div>
                      </div>
                      <UserPlus className="w-4 h-4 text-emerald-500 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
              {anggotaSearch.length >= 2 && !searchingAnggota && anggotaResults.length === 0 && (
                <div className="text-center py-4 text-sm text-slate-500">Tidak ditemukan anggota dengan kata kunci tersebut.</div>
              )}
            </div>
            <div className="p-5 border-t border-slate-100 flex justify-end">
              <button onClick={() => { setShowAddPengurusDialog(false); setAnggotaSearch(""); setAnggotaResults([]); setSelectedJabatan(""); }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Nonaktif Dialog */}
      {showNonaktifDialog && targetNonaktifSk && (
        <div className="fixed inset-0 z-[400] bg-blue-950/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowNonaktifDialog(false)}>
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                <Power className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Nonaktifkan SK</h3>
                <p className="text-xs text-slate-500">{targetNonaktifSk.nomorSK}</p>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status Pengurus Akhir</label>
              <select 
                value={nonaktifForm.statusPengurus}
                onChange={(e) => setNonaktifForm({ ...nonaktifForm, statusPengurus: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none"
              >
                <option value="Demisioner">Demisioner</option>
                <option value="Diberhentikan">Diberhentikan</option>
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Keterangan / Alasan <span className="text-rose-500">*</span></label>
              <textarea
                value={nonaktifForm.keterangan}
                onChange={(e) => setNonaktifForm({ ...nonaktifForm, keterangan: e.target.value })}
                placeholder="Misal: Dibekukan, Masa Jabatan Selesai, dll..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none resize-none h-24"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowNonaktifDialog(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
              <button onClick={executeNonaktifkan} className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-lg">Nonaktifkan</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
