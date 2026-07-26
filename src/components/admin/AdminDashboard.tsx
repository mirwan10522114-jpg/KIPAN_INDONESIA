"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Home,
  type LucideIcon,
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { MENU_GROUPS, PAGE_TITLES } from "@/lib/admin-menu";
import { COMPANY } from "@/lib/kipan-data";

// Import page components
import DashboardPage from "@/components/admin/pages/DashboardPage";
import WilayahPage from "@/components/admin/pages/WilayahPage";
import PengurusPage from "@/components/admin/pages/PengurusPage";
import AnggotaPage from "@/components/admin/pages/AnggotaPage";
import PendaftaranPage from "@/components/admin/pages/PendaftaranPage";
import VerifikasiPage from "@/components/admin/pages/VerifikasiPage";
import BeritaPage from "@/components/admin/pages/BeritaPage";
import GaleriPage from "@/components/admin/pages/GaleriPage";
import ProgramPage from "@/components/admin/pages/ProgramPage";
import StatistikPage from "@/components/admin/pages/StatistikPage";
import LaporanPage from "@/components/admin/pages/LaporanPage";
import RolePage from "@/components/admin/pages/RolePage";
import ProfilPage from "@/components/admin/pages/ProfilPage";
import AkunPage from "@/components/admin/pages/AkunPage";
import DatabasePage from "@/components/admin/pages/DatabasePage";

export default function AdminDashboard({ onClose }: { onClose: () => void }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [pageFilter, setPageFilter] = useState<Record<string, string> | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const logout = useAuthStore((s) => s.logout);

  const navigateWithFilter = (page: string, filter?: Record<string, string>) => {
    setActivePage(page);
    setPageFilter(filter || null);
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleViewSite = () => {
    onClose();
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <DashboardPage onNavigate={(p) => navigateWithFilter(p)} />;
      case "wilayah": return <WilayahPage onNavigate={(p, f) => navigateWithFilter(p, f)} />;
      case "pengurus": return <PengurusPage onNavigate={(p) => navigateWithFilter(p)} initialFilter={pageFilter} />;
      case "anggota": return <AnggotaPage initialFilter={pageFilter} onNavigate={(p) => navigateWithFilter(p)} />;
      case "pendaftaran": return <PendaftaranPage onVerify={(id) => setActivePage("verifikasi")} />;
      case "verifikasi": return <VerifikasiPage />;
      case "berita": return <BeritaPage />;
      case "galeri": return <GaleriPage />;
      case "program": return <ProgramPage />;
      case "statistik": return <StatistikPage />;
      case "laporan": return <LaporanPage />;
      case "database": return <DatabasePage />;
      case "role": return <RolePage />;
      case "profil": return <ProfilPage />;
      case "akun": return <AkunPage />;
      default: return <DashboardPage onNavigate={setActivePage} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-slate-50 flex"
    >
      {/* SIDEBAR */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-slate-200 flex flex-col transition-all duration-300 shrink-0 overflow-hidden`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center shadow-md shrink-0">
              <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            {sidebarOpen && (
              <div className="overflow-hidden">
                <div className="font-bold text-blue-950 text-sm leading-tight">KIPAN Admin</div>
                <div className="text-[10px] text-slate-500 leading-tight">SIM Keanggotaan</div>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
          {MENU_GROUPS.map((group, gIdx) => (
            <div key={gIdx}>
              {group.label && sidebarOpen && (
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                  {group.label}
                </div>
              )}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => setActivePage(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md shadow-blue-500/20"
                            : "text-slate-600 hover:bg-slate-100"
                        } ${!sidebarOpen ? "justify-center" : ""}`}
                        title={!sidebarOpen ? item.label : ""}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        {sidebarOpen && <span className="truncate">{item.label}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User info bottom */}
        {sidebarOpen && (
          <div className="p-3 border-t border-slate-100 shrink-0">
            <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center text-white text-xs font-bold">
                  SA
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-blue-950 truncate">Super Admin</div>
                  <div className="text-[10px] text-slate-500 truncate">admin@kipan.id</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-rose-600 bg-white hover:bg-rose-50 rounded-lg py-1.5 transition-colors"
              >
                <LogOut className="w-3 h-3" />
                Logout
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Admin</span>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-blue-950">
              {PAGE_TITLES[activePage] || "Dashboard"}
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari anggota, pengurus..."
                className="pl-9 pr-4 py-2 w-64 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>

            {/* View Site */}
            <button
              onClick={handleViewSite}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              title="Lihat Website"
            >
              <Home className="w-4 h-4" />
              <span className="hidden lg:inline">Lihat Situs</span>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50"
                  >
                    <div className="p-3 border-b border-slate-100 bg-slate-50">
                      <div className="font-semibold text-blue-950 text-sm">Notifikasi</div>
                      <div className="text-xs text-slate-500">3 baru</div>
                    </div>
                    <ul className="max-h-72 overflow-y-auto">
                      {[
                        { title: "Pendaftaran baru", desc: "Indra Kusuma mendaftar", time: "5 menit lalu" },
                        { title: "Verifikasi menunggu", desc: "Putri Maharani siap diverifikasi", time: "1 jam lalu" },
                        { title: "Pelatihan dimulai", desc: "Pelatihan Angkatan XII di Bandung", time: "3 jam lalu" },
                      ].map((n, i) => (
                        <li key={i} className="p-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
                          <div className="text-sm font-medium text-slate-800">{n.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{n.desc}</div>
                          <div className="text-[10px] text-slate-400 mt-1">{n.time}</div>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center text-white text-xs font-bold">
                  SA
                </div>
                <div className="hidden sm:block text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-800">Super Admin</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-rose-100 text-rose-700">
                      SUPER
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Wilayah: <span className="font-medium">Nasional</span>
                  </div>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-slate-100 bg-gradient-to-br from-blue-50 to-sky-50">
                      <div className="font-semibold text-blue-950">Super Admin</div>
                      <div className="text-xs text-slate-500">admin@kipan.id</div>
                    </div>
                    <ul className="py-1">
                      <li>
                        <button
                          onClick={() => { setActivePage("akun"); setProfileOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          Akun Saya
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => { setActivePage("profil"); setProfileOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          Profil Organisasi
                        </button>
                      </li>
                      <li className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              aria-label="Close admin"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  );
}
