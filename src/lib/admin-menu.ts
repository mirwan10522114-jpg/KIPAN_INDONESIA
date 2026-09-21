// ============================================================
// KIPAN ADMIN — Menu Configuration (v2 — tanpa Jabatan, tambah SK)
// ============================================================

import {
  LayoutDashboard,
  MapPin,
  UserCheck,
  FileText,
  ClipboardCheck,
  Newspaper,
  Image,
  Calendar,
  BarChart3,
  FileBarChart,
  Shield,
  Building2,
  UserCog,
  Database,
  Users,
  FileCheck,
  type LucideIcon,
} from "lucide-react";

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  group?: string;
  allowedRoles?: string[];
}

export interface MenuGroup {
  label: string;
  items: MenuItem[];
}

export const MENU_GROUPS: MenuGroup[] = [
  {
    label: "",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, allowedRoles: ["SUPER_ADMIN", "ADMIN_NASIONAL", "ADMIN_PROVINSI", "ADMIN_KABUPATEN"] },
    ],
  },
  {
    label: "Master Data",
    items: [
      { id: "wilayah", label: "Wilayah", icon: MapPin, allowedRoles: ["SUPER_ADMIN", "ADMIN_NASIONAL"] },
      { id: "anggota", label: "Data Anggota", icon: Users, allowedRoles: ["SUPER_ADMIN", "ADMIN_NASIONAL", "ADMIN_PROVINSI", "ADMIN_KABUPATEN"] },
      { id: "surat-keputusan", label: "Surat Keputusan", icon: FileCheck, allowedRoles: ["SUPER_ADMIN", "ADMIN_NASIONAL", "ADMIN_PROVINSI", "ADMIN_KABUPATEN"] },
      { id: "jabatan", label: "Jabatan", icon: UserCog, allowedRoles: ["SUPER_ADMIN", "ADMIN_NASIONAL"] },
      { id: "pengurus", label: "Pengurus", icon: UserCog, allowedRoles: ["SUPER_ADMIN", "ADMIN_NASIONAL", "ADMIN_PROVINSI", "ADMIN_KABUPATEN"] },
    ],
  },
  {
    label: "Pendaftaran",
    items: [
      { id: "pendaftaran", label: "Pendaftaran Baru", icon: FileText, allowedRoles: ["SUPER_ADMIN", "ADMIN_NASIONAL", "ADMIN_KABUPATEN"] },
      { id: "verifikasi", label: "Verifikasi Anggota", icon: ClipboardCheck, allowedRoles: ["SUPER_ADMIN", "ADMIN_NASIONAL", "ADMIN_KABUPATEN"] },
    ],
  },
  {
    label: "CMS Publikasi",
    items: [
      { id: "berita", label: "Berita & Artikel", icon: Newspaper, allowedRoles: ["SUPER_ADMIN", "ADMIN_NASIONAL"] },
      { id: "galeri", label: "Galeri Kegiatan", icon: Image, allowedRoles: ["SUPER_ADMIN", "ADMIN_NASIONAL"] },
      { id: "program", label: "Program Kerja", icon: Calendar, allowedRoles: ["SUPER_ADMIN", "ADMIN_NASIONAL"] },
    ],
  },
  {
    label: "Laporan",
    items: [
      { id: "statistik", label: "Statistik", icon: BarChart3, allowedRoles: ["SUPER_ADMIN", "ADMIN_NASIONAL"] },
      { id: "laporan", label: "Cetak Laporan", icon: FileBarChart, allowedRoles: ["SUPER_ADMIN", "ADMIN_NASIONAL", "ADMIN_PROVINSI"] },
    ],
  },
  {
    label: "Pengaturan",
    items: [
      { id: "role", label: "Role & Wewenang", icon: Shield, allowedRoles: ["SUPER_ADMIN"] },
      { id: "users", label: "Manajemen User", icon: Users, allowedRoles: ["SUPER_ADMIN"] },
      { id: "profil", label: "Profil Organisasi", icon: Building2, allowedRoles: ["SUPER_ADMIN"] },
      { id: "database", label: "Database Backup", icon: Database, allowedRoles: ["SUPER_ADMIN"] },
      { id: "akun", label: "Akun Saya", icon: UserCheck, allowedRoles: ["SUPER_ADMIN", "ADMIN_NASIONAL", "ADMIN_PROVINSI", "ADMIN_KABUPATEN"] },
    ],
  },
];

export const PAGE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  wilayah: "Master Wilayah",
  anggota: "Data Anggota (Relawan)",
  "surat-keputusan": "Surat Keputusan",
  jabatan: "Master Jabatan",
  pengurus: "Manajemen Pengurus",
  pendaftaran: "Pendaftaran Baru",
  verifikasi: "Verifikasi Anggota",
  berita: "Berita & Konten",
  galeri: "Galeri",
  program: "Program Kerja",
  statistik: "Statistik Anggota",
  laporan: "Laporan Keanggotaan",
  users: "Manajemen Pengguna",
  database: "Struktur Database",
  role: "Role & Permission",
  profil: "Profil Organisasi",
  akun: "Akun Saya",
};
