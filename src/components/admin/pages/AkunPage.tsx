"use client";

import { Camera, Save, Lock, Mail, Calendar, Shield } from "lucide-react";

export default function AkunPage() {
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
              SA
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border-2 border-blue-500 flex items-center justify-center text-blue-600 hover:bg-blue-50">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <h3 className="font-bold text-blue-950 mt-4">Super Admin</h3>
          <p className="text-xs text-slate-500">admin@kipan.id</p>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-2 bg-rose-50 text-rose-600 rounded-full text-[10px] font-semibold">
            <Shield className="w-3 h-3" /> Super Admin
          </span>

          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-left">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> admin@kipan.id
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Bergabung: 15 Jan 2020
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Lock className="w-3.5 h-3.5 text-slate-400" /> Login terakhir: hari ini
            </div>
          </div>
        </div>

        {/* Edit forms */}
        <div className="lg:col-span-2 space-y-4">
          {/* Profil */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-blue-950 mb-4">Informasi Profil</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Lengkap</label>
                <input type="text" defaultValue="Super Admin" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
                <input type="email" defaultValue="admin@kipan.id" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nomor HP</label>
                <input type="tel" defaultValue="081234500001" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Jabatan</label>
                <input type="text" defaultValue="Super Admin" disabled className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-500" />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">
                <Save className="w-4 h-4" /> Simpan
              </button>
            </div>
          </div>

          {/* Password */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="font-bold text-blue-950 mb-4">Ubah Password</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password Saat Ini</label>
                <input type="password" placeholder="••••••••" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password Baru</label>
                  <input type="password" placeholder="••••••••" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Konfirmasi Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600">
                <Lock className="w-4 h-4" /> Update Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
