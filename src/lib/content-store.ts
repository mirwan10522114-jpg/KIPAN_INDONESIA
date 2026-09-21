"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  COMPANY,
  HERO,
  ABOUT,
  PROGRAMS,
  PENDAFTARAN_FLOW,
  PERSYARATAN,
  BERITA,
  GALLERY_ITEMS,
  GALLERY_CATEGORIES,
  PENGURUS,
  TESTIMONIALS,
  TESTIMONIAL_STATS,
  STATS,
  STRUKTUR_LEVELS,
  type Program,
  type Berita,
  type GalleryItem,
  type Pengurus,
  type Testimonial,
} from "@/lib/kipan-data";

// ============================================================
// TYPES
// ============================================================

export interface CompanyInfo {
  name: string;
  fullName: string;
  tagline: string;
  founder: string;
  establishedYear: number;
  establishedDate: string;
  establishedLocation: string;
  currentAddress: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  instagramUrl: string;
  website: string;
  websiteUrl: string;
  partner: string;
  partnerOrigin: string;
}

export interface HeroContent {
  backgroundImage: string;
  badge: string;
  headlinePrefix: string;
  headlineHighlight: string;
  subheadline: string;
}

export interface AboutContent {
  image: string;
  paragraphs: string[];
  visi: string;
  misi: string[];
  nilai: { title: string; desc: string }[];
  tujuan: string[];
}

export interface ContentState {
  company: CompanyInfo;
  hero: HeroContent;
  about: typeof ABOUT;
  strukturLevels: typeof STRUKTUR_LEVELS;
  programs: Program[];
  pendaftaranFlow: typeof PENDAFTARAN_FLOW;
  persyaratan: typeof PERSYARATAN;
  berita: Berita[];
  gallery: GalleryItem[];
  galleryCategories: readonly string[];
  pengurus: Pengurus[];
  testimonials: Testimonial[];
  stats: typeof STATS;
  testimonialStats: typeof TESTIMONIAL_STATS;

  // Actions
  updateCompany: (patch: Partial<CompanyInfo>) => void;
  updateHero: (patch: Partial<HeroContent>) => void;
  updateAbout: (patch: Partial<typeof ABOUT>) => void;

  updateProgram: (id: string, patch: Partial<Program>) => void;

  addBerita: () => void;
  updateBerita: (id: number, patch: Partial<Berita>) => void;
  deleteBerita: (id: number) => void;

  addGalleryItem: () => void;
  updateGalleryItem: (id: number, patch: Partial<GalleryItem>) => void;
  deleteGalleryItem: (id: number) => void;

  addPengurus: () => void;
  updatePengurus: (id: number, patch: Partial<Pengurus>) => void;
  deletePengurus: (id: number) => void;

  addTestimonial: () => void;
  updateTestimonial: (id: number, patch: Partial<Testimonial>) => void;
  deleteTestimonial: (id: number) => void;

  resetAll: () => void;
}

const initialState = {
  company: { ...COMPANY },
  hero: { ...HERO },
  about: { ...ABOUT, paragraphs: [...ABOUT.paragraphs], misi: [...ABOUT.misi], nilai: [...ABOUT.nilai], tujuan: [...ABOUT.tujuan] },
  strukturLevels: [...STRUKTUR_LEVELS],
  programs: PROGRAMS.map((p) => ({ ...p })),
  pendaftaranFlow: [...PENDAFTARAN_FLOW],
  persyaratan: [...PERSYARATAN],
  berita: BERITA.map((b) => ({ ...b })),
  gallery: GALLERY_ITEMS.map((g) => ({ ...g })),
  galleryCategories: GALLERY_CATEGORIES,
  pengurus: PENGURUS.map((p) => ({ ...p })),
  testimonials: TESTIMONIALS.map((t) => ({ ...t })),
  stats: [...STATS],
  testimonialStats: [...TESTIMONIAL_STATS],
};

export const useContentStore = create<ContentState>()(
  persist(
    (set) => ({
      ...initialState,

      updateCompany: (patch) =>
        set((state) => ({ company: { ...state.company, ...patch } })),

      updateHero: (patch) =>
        set((state) => ({ hero: { ...state.hero, ...patch } })),

      updateAbout: (patch) =>
        set((state) => ({ about: { ...state.about, ...patch } })),

      updateProgram: (id, patch) =>
        set((state) => ({
          programs: state.programs.map((p) =>
            p.id === id ? { ...p, ...patch } : p
          ),
        })),

      addBerita: () =>
        set((state) => ({
          berita: [
            ...state.berita,
            {
              id: Date.now(),
              title: "Berita Baru",
              category: "Nasional",
              image:
                "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80",
              excerpt: "Ringkasan berita...",
              date: new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
              location: "Lokasi",
            },
          ],
        })),

      updateBerita: (id, patch) =>
        set((state) => ({
          berita: state.berita.map((b) =>
            b.id === id ? { ...b, ...patch } : b
          ),
        })),

      deleteBerita: (id) =>
        set((state) => ({
          berita: state.berita.filter((b) => b.id !== id),
        })),

      addGalleryItem: () =>
        set((state) => ({
          gallery: [
            ...state.gallery,
            {
              id: Date.now(),
              title: "Foto Baru",
              category: "Kegiatan",
              image:
                "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=900&q=80",
              location: "Lokasi",
            },
          ],
        })),

      updateGalleryItem: (id, patch) =>
        set((state) => ({
          gallery: state.gallery.map((g) =>
            g.id === id ? { ...g, ...patch } : g
          ),
        })),

      deleteGalleryItem: (id) =>
        set((state) => ({
          gallery: state.gallery.filter((g) => g.id !== id),
        })),

      addPengurus: () =>
        set((state) => ({
          pengurus: [
            ...state.pengurus,
            {
              id: Date.now(),
              name: "Nama Pengurus",
              role: "Jabatan",
              level: "Kabupaten",
              wilayah: "Wilayah",
              photo:
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
              kontak: "email@kipan.id",
            },
          ],
        })),

      updatePengurus: (id, patch) =>
        set((state) => ({
          pengurus: state.pengurus.map((p) =>
            p.id === id ? { ...p, ...patch } : p
          ),
        })),

      deletePengurus: (id) =>
        set((state) => ({
          pengurus: state.pengurus.filter((p) => p.id !== id),
        })),

      addTestimonial: () =>
        set((state) => ({
          testimonials: [
            ...state.testimonials,
            {
              id: Date.now(),
              clientName: "Nama Anggota",
              clientRole: "Anggota KIPAN",
              clientPhoto:
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
              projectTitle: "Program KIPAN",
              projectLocation: "Lokasi",
              projectType: "Kegiatan",
              projectImage:
                "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=900&q=80",
              rating: 5,
              testimonial: "Testimoni anggota...",
              completionYear: "2025",
            },
          ],
        })),

      updateTestimonial: (id, patch) =>
        set((state) => ({
          testimonials: state.testimonials.map((t) =>
            t.id === id ? { ...t, ...patch } : t
          ),
        })),

      deleteTestimonial: (id) =>
        set((state) => ({
          testimonials: state.testimonials.filter((t) => t.id !== id),
        })),

      resetAll: () => set({ ...initialState }),
    }),
    {
      name: "kipan-content",
    }
  )
);
