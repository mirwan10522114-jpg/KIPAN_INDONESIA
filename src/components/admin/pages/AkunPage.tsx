"use client";

import { useState } from "react";
import { Camera, Save, Lock, Mail, Calendar, Shield, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "sonner";

export default function AkunPage() {
  const { username, displayName, role, wilayah } = useAuthStore();
  
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Semua field password wajib diisi.");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Password baru dan konfirmasi tidak cocok.");
      return;
    }

    if (newPassword.length < 3) {
      toast.error("Password baru minimal 3 karakter.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username, // email
          oldPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Password berhasil diubah.");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "Gagal mengubah password.");
      }
    } catch (e) {
      toast.error("Kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (!displayName) return "SA";
    const names = displayName.split(" ");
    if (names.length > 1) return names[0][0] + names[1][0];
    return names[0][0];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-blue-950">Akun Saya</h1>
        <p className="text-slate-500 text-sm mt-1">Kelola profil dan keamanan akun Anda</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 text-center">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center text-white text-3xl font-bold mx-auto">
              {getInitials().toUpperCase()}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center text-blue-600 hover:bg-blue-50">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <h3 className="font-bold text-blue-950 mt-4">{displayName || "Admin"}</h3>
          <p className="text-xs text-slate-500">{username}</p>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-2 bg-rose-50 text-rose-600 rounded-full text-[10px] font-semibold">
            <Shield className="w-3 h-3" /> {role?.replace("_", " ") || "Admin"}
          </span>

          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-left">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> {username}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Lock className="w-3.5 h-3.5 text-slate-400" /> Wilayah: {wilayah}
            </div>
          </div>
        </div>

        {/* Edit forms */}
        <div className="lg:col-span-2 space-y-4">
          {/* Profil */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 opacity-60">
            <h3 className="font-bold text-blue-950 mb-4">Informasi Profil</h3>
            <p className="text-xs text-slate-500 mb-4">Pembaruan profil hanya dapat dilakukan oleh Super Admin untuk saat ini.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Lengkap</label>
                <input type="text" defaultValue={displayName || ""} disabled className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email / Username</label>
                <input type="email" defaultValue={username || ""} disabled className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Wilayah</label>
                <input type="text" defaultValue={wilayah || ""} disabled className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Peran</label>
                <input type="text" defaultValue={role || ""} disabled className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-500" />
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-blue-950 mb-4">Ubah Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password Saat Ini</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500" 
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password Baru</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Konfirmasi Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500" 
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button 
                onClick={handleUpdatePassword}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-70 disabled:hover:bg-amber-500"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />} 
                {loading ? "Menyimpan..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
