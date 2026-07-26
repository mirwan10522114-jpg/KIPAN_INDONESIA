// ============================================================
// KIPAN ADMIN — Menu Configuration
// ============================================================

import {
  LayoutDashboard,
  MapPin,
  Users,
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
  Award,
  type LucideIcon,
} from "lucide-react";

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  group?: string;
}

export interface MenuGroup {
  label: string;
  items: MenuItem[];
}

export const MENU_GROUPS: MenuGroup[] = [
  {
    label: "",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Master Data",
    items: [
      { id: "wilayah", label: "Wilayah", icon: MapPin },
      { id: "pengurus", label: "Pengurus", icon: UserCog },
      { id: "anggota", label: "Anggota", icon: Users },
      { id: "jabatan", label: "Bidang & Jabatan", icon: Award },
    ],
  },
  {
    label: "Pendaftaran",
    items: [
      { id: "pendaftaran", label: "Pendaftaran Baru", icon: FileText },
      { id: "verifikasi", label: "Verifikasi Anggota", icon: ClipboardCheck },
    ],
  },
  {
    label: "Konten Website",
    items: [
      { id: "berita", label: "Berita", icon: Newspaper },
      { id: "galeri", label: "Galeri", icon: Image },
      { id: "program", label: "Program Kerja", icon: Calendar },
    ],
  },
  {
    label: "Laporan",
    items: [
      { id: "statistik", label: "Statistik Anggota", icon: BarChart3 },
      { id: "laporan", label: "Laporan Keanggotaan", icon: FileBarChart },
    ],
  },
  {
    label: "Sistem",
    items: [
      { id: "database", label: "Struktur Database", icon: Database },
      { id: "role", label: "Role & Permission", icon: Shield },
      { id: "profil", label: "Profil Organisasi", icon: Building2 },
      { id: "akun", label: "Akun Saya", icon: UserCheck },
    ],
  },
];

export const PAGE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  wilayah: "Master Wilayah",
  pengurus: "Manajemen Pengurus",
  anggota: "Manajemen Anggota",
  pendaftaran: "Pendaftaran Baru",
  verifikasi: "Verifikasi Anggota",
  berita: "Berita & Konten",
  galeri: "Galeri",
  program: "Program Kerja",
  statistik: "Statistik Anggota",
  laporan: "Laporan Keanggotaan",
  database: "Struktur Database",
  role: "Role & Permission",
  profil: "Profil Organisasi",
  akun: "Akun Saya",
  jabatan: "Bidang & Jabatan",
};
