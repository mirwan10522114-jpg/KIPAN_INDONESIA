"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Building2,
  Image as ImageIcon,
  User,
  Wrench,
  Target,
  Camera,
  MessageSquare,
  LogOut,
  RotateCcw,
  Download,
  Upload,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Package,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth-store";
import { useContentStore } from "@/lib/content-store";
import {
  TextInput,
  TextArea,
  ImageInput,
  StringListEditor,
  FieldGroup,
} from "@/components/admin/FormFields";

// ============================================================
// ICONS for tabs
// ============================================================
const TAB_ICONS: Record<string, LucideIcon> = {
  company: Building2,
  hero: ImageIcon,
  leader: User,
  services: Wrench,
  target: Target,
  gallery: Camera,
  products: Package,
  testimonials: MessageSquare,
};

const TABS = [
  { id: "company", label: "Perusahaan" },
  { id: "hero", label: "Hero" },
  { id: "leader", label: "Pimpinan" },
  { id: "services", label: "Layanan" },
  { id: "target", label: "Target Pasar" },
  { id: "gallery", label: "Galeri" },
  { id: "products", label: "Produk" },
  { id: "testimonials", label: "Testimoni" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ============================================================
// MAIN DASHBOARD
// ============================================================
export default function AdminDashboard({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<TabId>("company");
  const logout = useAuthStore((s) => s.logout);
  const resetAll = useContentStore((s) => s.resetAll);

  const handleLogout = () => {
    logout();
    toast.success("Anda telah logout");
    onClose();
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Yakin ingin reset SEMUA konten ke default? Perubahan Anda akan hilang."
      )
    ) {
      resetAll();
      toast.success("Konten telah direset ke default");
    }
  };

  const handleExport = () => {
    const data = useContentStore.getState();
    const exportData = {
      company: data.company,
      hero: data.hero,
      about: data.about,
      leader: data.leader,
      services: data.services,
      targetSegments: data.targetSegments,
      gallery: data.gallery,
      testimonials: data.testimonials,
      products: data.products,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dpp-content-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Konten berhasil diexport");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        useContentStore.getState().importData(data);
        toast.success("Konten berhasil diimport");
      } catch {
        toast.error("File JSON tidak valid");
      }
    };
    reader.readAsText(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-slate-100 flex flex-col"
    >
      {/* Top Bar */}
      <header className="bg-gradient-to-r from-sky-900 to-cyan-700 text-white px-4 sm:px-6 py-3 flex items-center justify-between shadow-lg shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold leading-tight">
              Admin Dashboard
            </h1>
            <p className="text-[10px] sm:text-xs text-sky-100">
              Dunia Pool & Pond — Content Management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="application/json"
            onChange={handleImport}
            className="hidden"
            id="import-json"
          />
          <button
            onClick={() => document.getElementById("import-json")?.click()}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Import
          </button>
          <button
            onClick={handleExport}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-rose-500/80 hover:bg-rose-500 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close admin"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Auto-save indicator */}
      <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-1.5 flex items-center justify-center gap-2 shrink-0">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span className="text-[11px] text-emerald-700 font-medium">
          Perubahan tersimpan otomatis ke browser (localStorage)
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar tabs */}
        <nav className="lg:w-56 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-2 shrink-0 overflow-x-auto lg:overflow-y-auto">
          <ul className="flex lg:flex-col gap-1">
            {TABS.map((tab) => {
              const Icon = TAB_ICONS[tab.id] || Building2;
              const isActive = activeTab === tab.id;
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-50 to-sky-50 text-sky-700 border border-cyan-200"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {tab.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Editor area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl mx-auto"
            >
              {activeTab === "company" && <CompanyTab />}
              {activeTab === "hero" && <HeroTab />}
              {activeTab === "leader" && <LeaderTab />}
              {activeTab === "services" && <ServicesTab />}
              {activeTab === "target" && <TargetTab />}
              {activeTab === "gallery" && <GalleryTab />}
              {activeTab === "products" && <ProductsTab />}
              {activeTab === "testimonials" && <TestimonialsTab />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  );
}

// import ShieldCheck (missing in main imports)
import { ShieldCheck } from "lucide-react";

// ============================================================
// TAB 1: COMPANY INFO
// ============================================================
function CompanyTab() {
  const company = useContentStore((s) => s.company);
  const updateCompany = useContentStore((s) => s.updateCompany);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-sky-950">Informasi Perusahaan</h2>
        <p className="text-sm text-slate-500 mt-1">
          Data dasar perusahaan yang tampil di header, footer, dan section kontak.
        </p>
      </div>

      <FieldGroup title="Identitas" description="Nama, pendiri, dan tanggal berdiri">
        <TextInput
          label="Nama Perusahaan"
          value={company.name}
          onChange={(v) => updateCompany({ name: v })}
        />
        <TextInput
          label="Nama Pendiri"
          value={company.founder}
          onChange={(v) => updateCompany({ founder: v })}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextInput
            label="Tahun Berdiri"
            type="number"
            value={String(company.establishedYear)}
            onChange={(v) =>
              updateCompany({ establishedYear: parseInt(v) || 1997 })
            }
          />
          <TextInput
            label="Tanggal Berdiri"
            value={company.establishedDate}
            onChange={(v) => updateCompany({ establishedDate: v })}
          />
        </div>
        <TextInput
          label="Lokasi Pendirian"
          value={company.establishedLocation}
          onChange={(v) => updateCompany({ establishedLocation: v })}
        />
      </FieldGroup>

      <FieldGroup title="Kontak" description="Informasi kontak yang tampil di footer & section kontak">
        <TextArea
          label="Alamat Lengkap"
          value={company.currentAddress}
          onChange={(v) => updateCompany({ currentAddress: v })}
          rows={2}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextInput
            label="Telepon"
            value={company.phone}
            onChange={(v) => updateCompany({ phone: v })}
          />
          <TextInput
            label="WhatsApp (format: 628xxx)"
            value={company.whatsapp}
            onChange={(v) => updateCompany({ whatsapp: v })}
          />
        </div>
        <TextInput
          label="Email"
          type="email"
          value={company.email}
          onChange={(v) => updateCompany({ email: v })}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextInput
            label="Instagram (handle)"
            value={company.instagram}
            onChange={(v) => updateCompany({ instagram: v })}
          />
          <TextInput
            label="URL Instagram"
            value={company.instagramUrl}
            onChange={(v) => updateCompany({ instagramUrl: v })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextInput
            label="Website (display)"
            value={company.website}
            onChange={(v) => updateCompany({ website: v })}
          />
          <TextInput
            label="URL Website"
            value={company.websiteUrl}
            onChange={(v) => updateCompany({ websiteUrl: v })}
          />
        </div>
      </FieldGroup>

      <FieldGroup title="Mitra Internasional" description="Badge partner di section About & Footer">
        <TextInput
          label="Nama Mitra"
          value={company.partner}
          onChange={(v) => updateCompany({ partner: v })}
        />
        <TextInput
          label="Asal Mitra"
          value={company.partnerOrigin}
          onChange={(v) => updateCompany({ partnerOrigin: v })}
        />
      </FieldGroup>
    </div>
  );
}

// ============================================================
// TAB 2: HERO
// ============================================================
function HeroTab() {
  const hero = useContentStore((s) => s.hero);
  const updateHero = useContentStore((s) => s.updateHero);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-sky-950">Section Hero</h2>
        <p className="text-sm text-slate-500 mt-1">
          Tampilan utama di bagian atas landing page.
        </p>
      </div>

      <FieldGroup title="Background & Badge">
        <ImageInput
          label="Gambar Background"
          value={hero.backgroundImage}
          onChange={(v) => updateHero({ backgroundImage: v })}
          aspect="wide"
        />
        <TextInput
          label="Teks Badge (di atas headline)"
          value={hero.badge}
          onChange={(v) => updateHero({ badge: v })}
        />
      </FieldGroup>

      <FieldGroup title="Headline & Sub-headline">
        <TextInput
          label="Headline (bagian depan)"
          value={hero.headlinePrefix}
          onChange={(v) => updateHero({ headlinePrefix: v })}
        />
        <TextInput
          label="Headline (bagian highlight - berwarna)"
          value={hero.headlineHighlight}
          onChange={(v) => updateHero({ headlineHighlight: v })}
        />
        <TextArea
          label="Sub-headline"
          value={hero.subheadline}
          onChange={(v) => updateHero({ subheadline: v })}
          rows={4}
        />
      </FieldGroup>
    </div>
  );
}

// ============================================================
// TAB 3: LEADER
// ============================================================
function LeaderTab() {
  const leader = useContentStore((s) => s.leader);
  const updateLeader = useContentStore((s) => s.updateLeader);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-sky-950">Pesan Pimpinan</h2>
        <p className="text-sm text-slate-500 mt-1">
          Foto dan pesan dari founder di section "Pimpinan".
        </p>
      </div>

      <FieldGroup title="Identitas Pimpinan">
        <TextInput
          label="Nama"
          value={leader.name}
          onChange={(v) => updateLeader({ name: v })}
        />
        <TextInput
          label="Jabatan"
          value={leader.role}
          onChange={(v) => updateLeader({ role: v })}
        />
        <ImageInput
          label="Foto Pimpinan"
          value={leader.photo}
          onChange={(v) => updateLeader({ photo: v })}
          aspect="portrait"
        />
      </FieldGroup>

      <FieldGroup title="Pesan / Sambutan">
        <TextArea
          label="Isi Pesan"
          value={leader.message}
          onChange={(v) => updateLeader({ message: v })}
          rows={10}
        />
        <StringListEditor
          label="Poin-poin Highlight"
          values={leader.highlights}
          onChange={(v) => updateLeader({ highlights: v })}
          placeholder="Tulis poin highlight..."
        />
      </FieldGroup>
    </div>
  );
}

// ============================================================
// TAB 4: SERVICES
// ============================================================
function ServicesTab() {
  const services = useContentStore((s) => s.services);
  const updateService = useContentStore((s) => s.updateService);
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-sky-950">Layanan</h2>
        <p className="text-sm text-slate-500 mt-1">
          4 pilar layanan end-to-end. Klik untuk expand tiap layanan.
        </p>
      </div>

      {services.map((service, idx) => (
        <div
          key={service.id}
          className="bg-white rounded-xl border border-slate-200 overflow-hidden"
        >
          <button
            onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}
            className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-sky-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {service.number}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-sky-950">{service.title}</div>
              <div className="text-xs text-slate-500 truncate">{service.subtitle}</div>
            </div>
            <span className="text-slate-400 text-xs">
              {openIdx === idx ? "▲" : "▼"}
            </span>
          </button>

          {openIdx === idx && (
            <div className="p-4 pt-0 space-y-3 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-3">
                <TextInput
                  label="Nomor"
                  value={service.number}
                  onChange={(v) => updateService(service.id, { number: v })}
                />
                <TextInput
                  label="Icon (HardHat/Droplets/Settings2/Wrench)"
                  value={service.icon}
                  onChange={(v) => updateService(service.id, { icon: v })}
                />
              </div>
              <TextInput
                label="Judul Layanan"
                value={service.title}
                onChange={(v) => updateService(service.id, { title: v })}
              />
              <TextInput
                label="Sub-judul"
                value={service.subtitle}
                onChange={(v) => updateService(service.id, { subtitle: v })}
              />
              <TextArea
                label="Deskripsi"
                value={service.description}
                onChange={(v) => updateService(service.id, { description: v })}
                rows={4}
              />
              <ImageInput
                label="Gambar Layanan"
                value={service.image}
                onChange={(v) => updateService(service.id, { image: v })}
                aspect="wide"
              />
              <StringListEditor
                label="Fitur-fitur"
                values={service.features}
                onChange={(v) => updateService(service.id, { features: v })}
                placeholder="Fitur layanan..."
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// TAB 5: TARGET MARKET
// ============================================================
function TargetTab() {
  const segments = useContentStore((s) => s.targetSegments);
  const addSegment = useContentStore((s) => s.addTargetSegment);
  const updateSegment = useContentStore((s) => s.updateTargetSegment);
  const deleteSegment = useContentStore((s) => s.deleteTargetSegment);
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-sky-950">Target Pasar</h2>
          <p className="text-sm text-slate-500 mt-1">
            Segmen klien yang dilayani.
          </p>
        </div>
        <button
          onClick={() => {
            addSegment();
            setOpenIdx(segments.length);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah
        </button>
      </div>

      {segments.map((seg, idx) => (
        <div
          key={seg.id}
          className="bg-white rounded-xl border border-slate-200 overflow-hidden"
        >
          <div className="flex items-center">
            <button
              onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}
              className="flex-1 flex items-center gap-3 p-3 text-left hover:bg-slate-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-sky-950">{seg.title}</div>
                <div className="text-xs text-slate-500 truncate">
                  {seg.description.slice(0, 60)}...
                </div>
              </div>
              <span className="text-slate-400 text-xs">
                {openIdx === idx ? "▲" : "▼"}
              </span>
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Hapus segmen "${seg.title}"?`)) {
                  deleteSegment(seg.id);
                  toast.success("Segmen dihapus");
                }
              }}
              className="shrink-0 p-3 text-rose-500 hover:bg-rose-50 transition-colors"
              aria-label="Hapus"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {openIdx === idx && (
            <div className="p-4 pt-0 space-y-3 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-3">
                <TextInput
                  label="Judul Segmen"
                  value={seg.title}
                  onChange={(v) => updateSegment(seg.id, { title: v })}
                />
                <TextInput
                  label="Icon (Home/Building2/Landmark/Building)"
                  value={seg.icon}
                  onChange={(v) => updateSegment(seg.id, { icon: v })}
                />
              </div>
              <TextArea
                label="Deskripsi"
                value={seg.description}
                onChange={(v) => updateSegment(seg.id, { description: v })}
                rows={4}
              />
              <ImageInput
                label="Gambar Segmen"
                value={seg.image}
                onChange={(v) => updateSegment(seg.id, { image: v })}
                aspect="wide"
              />
              <StringListEditor
                label="Tags"
                values={seg.tags}
                onChange={(v) => updateSegment(seg.id, { tags: v })}
                placeholder="Tag keunggulan..."
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// TAB 6: GALLERY
// ============================================================
function GalleryTab() {
  const gallery = useContentStore((s) => s.gallery);
  const addItem = useContentStore((s) => s.addGalleryItem);
  const updateItem = useContentStore((s) => s.updateGalleryItem);
  const deleteItem = useContentStore((s) => s.deleteGalleryItem);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-sky-950">Galeri Proyek</h2>
          <p className="text-sm text-slate-500 mt-1">
            {gallery.length} foto proyek ditampilkan.
          </p>
        </div>
        <button
          onClick={() => {
            addItem();
            toast.success("Item galeri ditambahkan");
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Foto
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {gallery.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-slate-200 p-3 space-y-3"
          >
            <ImageInput
              label="Foto Proyek"
              value={item.image}
              onChange={(v) => updateItem(item.id, { image: v })}
              aspect="square"
            />
            <TextInput
              label="Judul"
              value={item.title}
              onChange={(v) => updateItem(item.id, { title: v })}
            />
            <div className="grid grid-cols-2 gap-3">
              <TextInput
                label="Kategori"
                value={item.category}
                onChange={(v) => updateItem(item.id, { category: v })}
              />
              <TextInput
                label="Lokasi"
                value={item.location}
                onChange={(v) => updateItem(item.id, { location: v })}
              />
            </div>
            <button
              onClick={() => {
                if (window.confirm(`Hapus "${item.title}"?`)) {
                  deleteItem(item.id);
                  toast.success("Foto dihapus");
                }
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus Foto
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// TAB 7: TESTIMONIALS
// ============================================================
function TestimonialsTab() {
  const testimonials = useContentStore((s) => s.testimonials);
  const add = useContentStore((s) => s.addTestimonial);
  const update = useContentStore((s) => s.updateTestimonial);
  const remove = useContentStore((s) => s.deleteTestimonial);
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-sky-950">Testimoni Klien</h2>
          <p className="text-sm text-slate-500 mt-1">
            {testimonials.length} testimoni ditampilkan di carousel.
          </p>
        </div>
        <button
          onClick={() => {
            add();
            setOpenIdx(testimonials.length);
            toast.success("Testimoni ditambahkan");
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah
        </button>
      </div>

      {testimonials.map((t, idx) => (
        <div
          key={t.id}
          className="bg-white rounded-xl border border-slate-200 overflow-hidden"
        >
          <div className="flex items-center">
            <button
              onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}
              className="flex-1 flex items-center gap-3 p-3 text-left hover:bg-slate-50 transition-colors"
            >
              <img
                src={t.clientPhoto}
                alt={t.clientName}
                className="w-10 h-10 rounded-full object-cover border-2 border-cyan-100 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-sky-950">{t.clientName}</div>
                <div className="text-xs text-slate-500 truncate">
                  {t.projectTitle}
                </div>
              </div>
              <span className="text-slate-400 text-xs">
                {openIdx === idx ? "▲" : "▼"}
              </span>
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Hapus testimoni "${t.clientName}"?`)) {
                  remove(t.id);
                  toast.success("Testimoni dihapus");
                }
              }}
              className="shrink-0 p-3 text-rose-500 hover:bg-rose-50 transition-colors"
              aria-label="Hapus"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {openIdx === idx && (
            <div className="p-4 pt-0 space-y-3 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-3">
                <TextInput
                  label="Nama Klien"
                  value={t.clientName}
                  onChange={(v) => update(t.id, { clientName: v })}
                />
                <TextInput
                  label="Jabatan / Perusahaan"
                  value={t.clientRole}
                  onChange={(v) => update(t.id, { clientRole: v })}
                />
              </div>
              <ImageInput
                label="Foto Klien"
                value={t.clientPhoto}
                onChange={(v) => update(t.id, { clientPhoto: v })}
                aspect="square"
              />
              <div className="grid grid-cols-2 gap-3">
                <TextInput
                  label="Judul Proyek"
                  value={t.projectTitle}
                  onChange={(v) => update(t.id, { projectTitle: v })}
                />
                <TextInput
                  label="Lokasi Proyek"
                  value={t.projectLocation}
                  onChange={(v) => update(t.id, { projectLocation: v })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TextInput
                  label="Tipe Proyek"
                  value={t.projectType}
                  onChange={(v) => update(t.id, { projectType: v })}
                />
                <TextInput
                  label="Tahun Selesai"
                  value={t.completionYear}
                  onChange={(v) => update(t.id, { completionYear: v })}
                />
              </div>
              <ImageInput
                label="Foto Proyek"
                value={t.projectImage}
                onChange={(v) => update(t.id, { projectImage: v })}
                aspect="wide"
              />
              <TextArea
                label="Testimoni"
                value={t.testimonial}
                onChange={(v) => update(t.id, { testimonial: v })}
                rows={4}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// TAB: PRODUCTS
// ============================================================
function ProductsTab() {
  const products = useContentStore((s) => s.products);
  const add = useContentStore((s) => s.addProduct);
  const update = useContentStore((s) => s.updateProduct);
  const remove = useContentStore((s) => s.deleteProduct);
  const [openIdx, setOpenIdx] = useState(-1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-sky-950">Katalog Produk</h2>
          <p className="text-sm text-slate-500 mt-1">
            {products.length} produk ditampilkan. Klik untuk edit detail.
          </p>
        </div>
        <button
          onClick={() => {
            add();
            setOpenIdx(products.length);
            toast.success("Produk ditambahkan");
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Tambah Produk
        </button>
      </div>

      {products.map((p, idx) => (
        <div
          key={p.id}
          className="bg-white rounded-xl border border-slate-200 overflow-hidden"
        >
          <div className="flex items-center">
            <button
              onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}
              className="flex-1 flex items-center gap-3 p-3 text-left hover:bg-slate-50 transition-colors"
            >
              <img
                src={p.image}
                alt={p.name}
                className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-sky-950 line-clamp-1">
                  {p.name}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  [{p.category}] {p.shortDesc}
                </div>
              </div>
              <span className="text-slate-400 text-xs">
                {openIdx === idx ? "▲" : "▼"}
              </span>
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Hapus produk "${p.name}"?`)) {
                  remove(p.id);
                  toast.success("Produk dihapus");
                }
              }}
              className="shrink-0 p-3 text-rose-500 hover:bg-rose-50 transition-colors"
              aria-label="Hapus"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {openIdx === idx && (
            <div className="p-4 pt-0 space-y-3 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-3">
                <TextInput
                  label="Nama Produk"
                  value={p.name}
                  onChange={(v) => update(p.id, { name: v })}
                />
                <TextInput
                  label="Kategori"
                  value={p.category}
                  onChange={(v) => update(p.id, { category: v })}
                />
              </div>
              <TextInput
                label="Deskripsi Singkat"
                value={p.shortDesc}
                onChange={(v) => update(p.id, { shortDesc: v })}
              />
              <TextArea
                label="Deskripsi Lengkap"
                value={p.longDesc}
                onChange={(v) => update(p.id, { longDesc: v })}
                rows={4}
              />
              <ImageInput
                label="Gambar Produk"
                value={p.image}
                onChange={(v) => update(p.id, { image: v })}
                aspect="square"
              />
              <StringListEditor
                label="Merek (opsional)"
                values={p.brands || []}
                onChange={(v) => update(p.id, { brands: v })}
                placeholder="Nama merek..."
              />

              {/* Specs editor */}
              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Spesifikasi & Pilihan
                </span>
                <div className="space-y-2">
                  {(p.specs || []).map((spec, sIdx) => (
                    <div
                      key={sIdx}
                      className="bg-slate-50 rounded-lg p-2.5 space-y-2"
                    >
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={spec.label}
                          onChange={(e) => {
                            const next = [...p.specs];
                            next[sIdx] = { ...spec, label: e.target.value };
                            update(p.id, { specs: next });
                          }}
                          placeholder="Label spec (mis. Kapasitas)"
                          className="flex-1 px-2.5 py-1.5 text-xs rounded-md border border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const next = p.specs.filter(
                              (_, i) => i !== sIdx
                            );
                            update(p.id, { specs: next });
                          }}
                          className="shrink-0 inline-flex items-center px-2 py-1.5 text-xs rounded-md bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <StringListEditor
                        label=""
                        values={spec.options}
                        onChange={(opts) => {
                          const next = [...p.specs];
                          next[sIdx] = { ...spec, options: opts };
                          update(p.id, { specs: next });
                        }}
                        placeholder="Pilihan (mis. 1 HP, 2 HP)"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const next = [
                        ...p.specs,
                        { label: "Spec Baru", options: [] },
                      ];
                      update(p.id, { specs: next });
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Tambah Spec Group
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
