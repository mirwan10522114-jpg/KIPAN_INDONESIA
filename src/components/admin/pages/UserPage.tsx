"use client";

import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Shield,
  Globe,
  MapPin,
  Building2,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  AlertTriangle,
  Lock,
  Mail,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN_NASIONAL" | "ADMIN_PROVINSI" | "ADMIN_KABUPATEN";
  status: "Aktif" | "Nonaktif";
  provinsiId: number | null;
  kabupatenId: number | null;
  lastLoginAt: string | null;
  createdAt: string;
  provinsi?: { id: number; nama: string; kode: string } | null;
  kabupaten?: { id: number; nama: string; kode: string } | null;
}

interface WilayahProvinsi {
  id: number;
  kode: string;
  nama: string;
}

interface WilayahKabupaten {
  id: number;
  kode: string;
  nama: string;
  provinsiId: number;
}

const ROLE_INFO = {
  SUPER_ADMIN: {
    label: "Super Admin",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
    gradient: "from-rose-500 to-pink-500",
    icon: Shield,
    desc: "Akses penuh sistem & seluruh wilayah nasional",
  },
  ADMIN_NASIONAL: {
    label: "Admin Nasional",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    gradient: "from-blue-600 to-sky-500",
    icon: Globe,
    desc: "Operasional DPP KIPAN tingkat pusat",
  },
  ADMIN_PROVINSI: {
    label: "Admin Provinsi",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    gradient: "from-emerald-500 to-teal-500",
    icon: MapPin,
    desc: "Pengelolaan tingkat DPW Provinsi terkait",
  },
  ADMIN_KABUPATEN: {
    label: "Admin Kota/Kabupaten",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    gradient: "from-amber-500 to-orange-500",
    icon: Building2,
    desc: "Pengelolaan tingkat DPD Kab/Kota terkait",
  },
};

export default function UserPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [provinsiList, setProvinsiList] = useState<WilayahProvinsi[]>([]);
  const [kabupatenList, setKabupatenList] = useState<WilayahKabupaten[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | "Semua">(10);

  // Modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form inputs
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "ADMIN_PROVINSI" as UserItem["role"],
    status: "Aktif" as "Aktif" | "Nonaktif",
    provinsiId: "",
    kabupatenId: "",
  });

  // Modal delete state
  const [deleteTarget, setDeleteTarget] = useState<UserItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch users & wilayah
  const loadData = async () => {
    try {
      setLoading(true);
      const [usersRes, wilayahRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/wilayah"),
      ]);

      const usersJson = await usersRes.json();
      const wilayahJson = await wilayahRes.json();

      if (usersJson.success && Array.isArray(usersJson.data)) {
        setUsers(usersJson.data);
      }
      if (wilayahJson.success && wilayahJson.data) {
        setProvinsiList(wilayahJson.data.provinsi || []);
        setKabupatenList(wilayahJson.data.kabupaten || []);
      }
    } catch (err) {
      console.error("Gagal memuat data:", err);
      toast.error("Gagal memuat data pengguna.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedRoleFilter, pageSize]);

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchRole =
      selectedRoleFilter === "Semua" || u.role === selectedRoleFilter;
    const matchSearch =
      !searchQuery.trim() ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.provinsi?.nama &&
        u.provinsi.nama.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.kabupaten?.nama &&
        u.kabupaten.nama.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchRole && matchSearch;
  });

  // Role summary counters
  const counts = {
    total: users.length,
    superAdmin: users.filter((u) => u.role === "SUPER_ADMIN").length,
    nasional: users.filter((u) => u.role === "ADMIN_NASIONAL").length,
    provinsi: users.filter((u) => u.role === "ADMIN_PROVINSI").length,
    kabupaten: users.filter((u) => u.role === "ADMIN_KABUPATEN").length,
  };

  // Open modal create
  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "ADMIN_PROVINSI",
      status: "Aktif",
      provinsiId: provinsiList[0]?.id ? String(provinsiList[0].id) : "",
      kabupatenId: "",
    });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  // Open modal edit
  const handleOpenEdit = (user: UserItem) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // kosong jika tidak diubah
      role: user.role,
      status: user.status,
      provinsiId: user.provinsiId ? String(user.provinsiId) : "",
      kabupatenId: user.kabupatenId ? String(user.kabupatenId) : "",
    });
    setShowPassword(false);
    setIsModalOpen(true);
  };

  // Filter kabupaten berdasarkan provinsi yang dipilih pada form
  const availableKabupaten = kabupatenList.filter(
    (k) => String(k.provinsiId) === formData.provinsiId
  );

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
      };

      if (!editingUser) {
        if (!formData.password) {
          toast.error("Password wajib diisi untuk pengguna baru.");
          setFormSubmitting(false);
          return;
        }
        payload.password = formData.password;
      } else if (formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      if (formData.role === "ADMIN_PROVINSI") {
        if (!formData.provinsiId) {
          toast.error("Pilih provinsi untuk Admin Provinsi.");
          setFormSubmitting(false);
          return;
        }
        payload.provinsiId = formData.provinsiId;
      } else if (formData.role === "ADMIN_KABUPATEN") {
        if (!formData.provinsiId || !formData.kabupatenId) {
          toast.error("Pilih provinsi dan kota/kabupaten untuk Admin Kota/Kabupaten.");
          setFormSubmitting(false);
          return;
        }
        payload.provinsiId = formData.provinsiId;
        payload.kabupatenId = formData.kabupatenId;
      }

      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";
      const method = editingUser ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || "Gagal menyimpan data pengguna.");
      }

      toast.success(
        editingUser
          ? "Pengguna berhasil diperbarui!"
          : "Pengguna baru berhasil ditambahkan!"
      );
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan saat menyimpan.");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete user
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/users/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || "Gagal menghapus pengguna.");
      }
      toast.success("Pengguna berhasil dihapus.");
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus pengguna.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Pagination Logic
  const totalItems = filteredUsers.length;
  const totalPages = pageSize === "Semua" ? 1 : Math.ceil(totalItems / (pageSize as number)) || 1;
  const paginatedUsers = pageSize === "Semua" 
    ? filteredUsers 
    : filteredUsers.slice((currentPage - 1) * (pageSize as number), currentPage * (pageSize as number));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Manajemen Pengguna</h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola hak akses Super Admin, Admin Nasional, Admin Provinsi, dan Admin Kota/Kabupaten
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Muat Ulang
          </button>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-sky-500 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Tambah Pengguna
          </button>
        </div>
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold text-blue-950">{counts.total}</span>
          </div>
          <div className="text-xs font-semibold text-slate-600 mt-2">Total Pengguna</div>
          <div className="text-[10px] text-slate-400">Seluruh level admin</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold text-rose-600">{counts.superAdmin}</span>
          </div>
          <div className="text-xs font-semibold text-slate-600 mt-2">Super Admin</div>
          <div className="text-[10px] text-slate-400">Akses penuh</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Globe className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold text-blue-600">{counts.nasional}</span>
          </div>
          <div className="text-xs font-semibold text-slate-600 mt-2">Admin Nasional</div>
          <div className="text-[10px] text-slate-400">Tingkat DPP</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold text-emerald-600">{counts.provinsi}</span>
          </div>
          <div className="text-xs font-semibold text-slate-600 mt-2">Admin Provinsi</div>
          <div className="text-[10px] text-slate-400">Tingkat DPW</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold text-amber-600">{counts.kabupaten}</span>
          </div>
          <div className="text-xs font-semibold text-slate-600 mt-2">Admin Kota/Kab</div>
          <div className="text-[10px] text-slate-400">Tingkat DPD</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, email, atau wilayah..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: "Semua", label: "Semua" },
              { id: "SUPER_ADMIN", label: "Super Admin" },
              { id: "ADMIN_NASIONAL", label: "Nasional" },
              { id: "ADMIN_PROVINSI", label: "Provinsi" },
              { id: "ADMIN_KABUPATEN", label: "Kota/Kab" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedRoleFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                  selectedRoleFilter === f.id
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5 text-left w-12 text-center">No</th>
                <th className="px-5 py-3.5 text-left">Nama & Email</th>
                <th className="px-4 py-3.5 text-left">Tingkatan / Role</th>
                <th className="px-4 py-3.5 text-left">Cakupan Wilayah</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-center">Terdaftar</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-slate-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-500" />
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm text-slate-400">
                    Tidak ada data pengguna yang sesuai dengan pencarian atau filter.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, idx) => {
                  const absoluteIdx = pageSize === "Semua" ? idx : (currentPage - 1) * (pageSize as number) + idx;
                  const roleConfig = ROLE_INFO[user.role] || ROLE_INFO.ADMIN_NASIONAL;
                  const RoleIcon = roleConfig.icon;

                  // Label wilayah
                  let wilayahText = "Nasional (Pusat)";
                  if (user.role === "ADMIN_PROVINSI") {
                    wilayahText = user.provinsi?.nama || "Provinsi Belum Diset";
                  } else if (user.role === "ADMIN_KABUPATEN") {
                    wilayahText = `${user.provinsi?.nama || "-"} / ${
                      user.kabupaten?.nama || "Kabupaten Belum Diset"
                    }`;
                  }

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 text-sm text-slate-500 text-center">{absoluteIdx + 1}</td>
                      {/* Name & Email */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full bg-gradient-to-br ${roleConfig.gradient} flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0`}
                          >
                            {user.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-blue-950 truncate">
                              {user.name}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${roleConfig.badgeColor}`}
                        >
                          <RoleIcon className="w-3.5 h-3.5" />
                          {roleConfig.label}
                        </span>
                      </td>

                      {/* Wilayah Scope */}
                      <td className="px-4 py-3.5">
                        <div className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                          {user.role === "SUPER_ADMIN" || user.role === "ADMIN_NASIONAL" ? (
                            <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                              <Globe className="w-3 h-3" />
                              Seluruh Indonesia
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-700">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              {wilayahText}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            user.status === "Aktif"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {user.status === "Aktif" ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-slate-400" />
                          )}
                          {user.status}
                        </span>
                      </td>

                      {/* Created At */}
                      <td className="px-4 py-3.5 text-center text-xs text-slate-500 whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Pengguna"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(user)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus Pengguna"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Tampilkan</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value === "Semua" ? "Semua" : Number(e.target.value))}
              className="px-2 py-1 bg-white border border-slate-300 rounded-md outline-none focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value="Semua">Semua</option>
            </select>
            <span>baris</span>
            <span className="ml-2 text-slate-400">
              (Total: {totalItems} pengguna)
            </span>
          </div>
          
          {pageSize !== "Semua" && totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Sebelumnya
              </button>
              <span className="px-3 py-1 text-sm font-medium text-slate-700">
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Selanjutnya
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Tambah / Edit Pengguna */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[250] bg-blue-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-sky-700 p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  {editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
                </h3>
                <p className="text-xs text-sky-100 mt-0.5">
                  Atur kredensial dan hak akses wilayah SIM-KIPAN
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Nama */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Budi Santoso, S.Kom"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Akun <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@kipan.id"
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Password {editingUser ? "(Opsional)" : <span className="text-rose-500">*</span>}
                  </label>
                  {editingUser && (
                    <span className="text-[10px] text-slate-400">
                      Kosongkan bila tidak diubah
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? "•••••••• (Tetap)" : "Minimal 6 karakter"}
                    className="w-full px-3.5 py-2 pr-10 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tingkatan Role <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as UserItem["role"],
                      // Reset wilayah jika ganti ke nasional/super
                      provinsiId:
                        e.target.value === "SUPER_ADMIN" || e.target.value === "ADMIN_NASIONAL"
                          ? ""
                          : formData.provinsiId || (provinsiList[0]?.id ? String(provinsiList[0].id) : ""),
                      kabupatenId:
                        e.target.value === "ADMIN_KABUPATEN" ? formData.kabupatenId : "",
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-white"
                >
                  <option value="SUPER_ADMIN">Super Admin (Akses Penuh Seluruh Sistem)</option>
                  <option value="ADMIN_NASIONAL">Admin Nasional (DPP KIPAN)</option>
                  <option value="ADMIN_PROVINSI">Admin Provinsi (DPW KIPAN)</option>
                  <option value="ADMIN_KABUPATEN">Admin Kota/Kabupaten (DPD KIPAN)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  {ROLE_INFO[formData.role]?.desc}
                </p>
              </div>

              {/* Dynamic Wilayah Selector */}
              {formData.role === "SUPER_ADMIN" || formData.role === "ADMIN_NASIONAL" ? (
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center gap-2.5">
                  <Globe className="w-5 h-5 text-blue-600 shrink-0" />
                  <div className="text-xs text-blue-950 font-medium">
                    Role ini memiliki cakupan wilayah <span className="font-bold">Nasional</span> (Semua DPW & DPD di Indonesia).
                  </div>
                </div>
              ) : null}

              {formData.role === "ADMIN_PROVINSI" && (
                <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl space-y-2">
                  <label className="block text-xs font-bold text-emerald-900">
                    Pilih Wilayah Provinsi (DPW) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.provinsiId}
                    onChange={(e) => setFormData({ ...formData, provinsiId: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-sm border border-emerald-200 rounded-lg outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="">-- Pilih Provinsi --</option>
                    {provinsiList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nama} ({p.kode})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.role === "ADMIN_KABUPATEN" && (
                <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">
                      1. Pilih Provinsi <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.provinsiId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          provinsiId: e.target.value,
                          kabupatenId: "", // reset kabupaten saat ganti provinsi
                        })
                      }
                      required
                      className="w-full px-3 py-2 text-sm border border-amber-200 rounded-lg outline-none focus:border-amber-500 bg-white"
                    >
                      <option value="">-- Pilih Provinsi --</option>
                      {provinsiList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-amber-900 mb-1">
                      2. Pilih Kota/Kabupaten (DPD) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.kabupatenId}
                      onChange={(e) => setFormData({ ...formData, kabupatenId: e.target.value })}
                      required
                      disabled={!formData.provinsiId}
                      className="w-full px-3 py-2 text-sm border border-amber-200 rounded-lg outline-none focus:border-amber-500 bg-white disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      <option value="">
                        {!formData.provinsiId
                          ? "-- Pilih Provinsi Terlebih Dahulu --"
                          : availableKabupaten.length === 0
                          ? "-- Belum ada data kabupaten terdaftar di provinsi ini --"
                          : "-- Pilih Kota / Kabupaten --"}
                      </option>
                      {availableKabupaten.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Akun
                </label>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                    <input
                      type="radio"
                      name="status"
                      value="Aktif"
                      checked={formData.status === "Aktif"}
                      onChange={() => setFormData({ ...formData, status: "Aktif" })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                    </span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                    <input
                      type="radio"
                      name="status"
                      value="Nonaktif"
                      checked={formData.status === "Nonaktif"}
                      onChange={() => setFormData({ ...formData, status: "Nonaktif" })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="flex items-center gap-1 text-slate-500">
                      <XCircle className="w-3.5 h-3.5" /> Nonaktif
                    </span>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={formSubmitting}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {formSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {editingUser ? "Simpan Perubahan" : "Buat Pengguna"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hapus Konfirmasi */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[260] bg-blue-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-blue-950">Konfirmasi Hapus Pengguna</h3>
            <p className="text-xs text-slate-500 mt-2">
              Apakah Anda yakin ingin menghapus akun{" "}
              <span className="font-bold text-slate-800">{deleteTarget.name}</span> (
              {deleteTarget.email})? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
              >
                {isDeleting ? "Menghapus..." : "Hapus Akun"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
