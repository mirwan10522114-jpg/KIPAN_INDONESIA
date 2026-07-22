"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  COMPANY,
  SERVICES,
  TARGET_SEGMENTS,
  GALLERY_ITEMS,
  TESTIMONIALS,
  LEADER,
  STATS,
  TESTIMONIAL_STATS,
} from "@/lib/data";
import { PRODUCTS } from "@/lib/products-data";

// ============================================================
// TYPES — must match data.ts structure
// ============================================================

export interface CompanyInfo {
  name: string;
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
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  stats: { value: string; label: string }[];
}

export interface LeaderContent {
  name: string;
  role: string;
  photo: string;
  message: string;
  highlights: string[];
}

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  icon: string;
  image: string;
}

export interface TargetSegmentItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  icon: string;
  image: string;
}

export interface GalleryItem {
  id: number;
  title: string;
  category: string;
  image: string;
  location: string;
}

export interface TestimonialItem {
  id: number;
  clientName: string;
  clientRole: string;
  clientPhoto: string;
  projectTitle: string;
  projectLocation: string;
  projectType: string;
  projectImage: string;
  rating: number;
  testimonial: string;
  completionYear: string;
}

export interface ProductItem {
  id: number;
  name: string;
  shortDesc: string;
  longDesc: string;
  image: string;
  specs: { label: string; options: string[] }[];
  brands?: string[];
  category: string;
}

export interface ContentState {
  company: CompanyInfo;
  hero: HeroContent;
  about: AboutContent;
  leader: LeaderContent;
  services: ServiceItem[];
  targetSegments: TargetSegmentItem[];
  gallery: GalleryItem[];
  testimonials: TestimonialItem[];
  products: ProductItem[];

  // Actions
  updateCompany: (patch: Partial<CompanyInfo>) => void;
  updateHero: (patch: Partial<HeroContent>) => void;
  updateAbout: (patch: Partial<AboutContent>) => void;
  updateLeader: (patch: Partial<LeaderContent>) => void;

  updateService: (id: string, patch: Partial<ServiceItem>) => void;
  addTargetSegment: () => void;
  updateTargetSegment: (id: string, patch: Partial<TargetSegmentItem>) => void;
  deleteTargetSegment: (id: string) => void;

  addGalleryItem: () => void;
  updateGalleryItem: (id: number, patch: Partial<GalleryItem>) => void;
  deleteGalleryItem: (id: number) => void;

  addTestimonial: () => void;
  updateTestimonial: (id: number, patch: Partial<TestimonialItem>) => void;
  deleteTestimonial: (id: number) => void;

  addProduct: () => void;
  updateProduct: (id: number, patch: Partial<ProductItem>) => void;
  deleteProduct: (id: number) => void;

  resetAll: () => void;
  importData: (data: Partial<ContentState>) => void;
}

const initialState = {
  company: { ...COMPANY },
  hero: {
    backgroundImage:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1920&q=80",
    badge: "Mitra Resmi Astral Pool S.A. • Barcelona, Spanyol",
    headlinePrefix: "Mewujudkan Kolam Impian",
    headlineHighlight: "Sejak 1997",
    subheadline:
      "Spesialis konstruksi, renovasi, perawatan, dan sistem sirkulasi kolam renang dengan standar internasional. Lebih dari 1.000 proyek selesai di 34 provinsi seluruh Indonesia — dari rumah pribadi hingga resort bintang lima.",
  },
  about: {
    image:
      "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1200&q=80",
    paragraph1:
      "Dunia Pool & Pond lahir pada 10 Agustus 1997 di Cisarua, Kab. Bandung Barat — bermula dari tekad seorang pengusaha lokal untuk menghadirkan konstruksi kolam renang yang benar-benar berkualitas di tengah pasar yang saat itu masih minim standar.",
    paragraph2:
      "Selama lebih dari 25 tahun, kami bertumbuh dari kontraktor lokal menjadi solusi end-to-end berskala nasional: mulai dari konsultasi desain awal, pembangunan struktur, instalasi sistem sirkulasi, hingga perawatan berkala dan purna jual.",
    paragraph3:
      "Lebih dari 1.000 proyek kolam telah kami selesaikan di seluruh Indonesia — bukti nyata kepercayaan yang dibangun proyek demi proyek. Kemitraan resmi kami bersama Astral Pool S.A., Barcelona, Spanyol memastikan standar internasional hadir di setiap detail pekerjaan.",
    stats: [...STATS],
  },
  leader: {
    name: LEADER.name,
    role: LEADER.role,
    photo: LEADER.photo,
    message: LEADER.message,
    highlights: [...LEADER.highlights],
  },
  services: SERVICES.map((s) => ({ ...s })),
  targetSegments: TARGET_SEGMENTS.map((s) => ({ ...s })),
  gallery: GALLERY_ITEMS.map((g) => ({ ...g })),
  testimonials: TESTIMONIALS.map((t) => ({ ...t })),
  products: PRODUCTS.map((p) => ({ ...p })),
};

export const useContentStore = create<ContentState>()(
  persist(
    (set, get) => ({
      ...initialState,

      updateCompany: (patch) =>
        set((state) => ({ company: { ...state.company, ...patch } })),

      updateHero: (patch) =>
        set((state) => ({ hero: { ...state.hero, ...patch } })),

      updateAbout: (patch) =>
        set((state) => ({ about: { ...state.about, ...patch } })),

      updateLeader: (patch) =>
        set((state) => ({ leader: { ...state.leader, ...patch } })),

      updateService: (id, patch) =>
        set((state) => ({
          services: state.services.map((s) =>
            s.id === id ? { ...s, ...patch } : s
          ),
        })),

      addTargetSegment: () =>
        set((state) => ({
          targetSegments: [
            ...state.targetSegments,
            {
              id: `seg-${Date.now()}`,
              title: "Segmen Baru",
              description: "Deskripsi segmen target baru...",
              tags: ["Tag 1", "Tag 2"],
              icon: "Home",
              image:
                "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1200&q=80",
            },
          ],
        })),

      updateTargetSegment: (id, patch) =>
        set((state) => ({
          targetSegments: state.targetSegments.map((s) =>
            s.id === id ? { ...s, ...patch } : s
          ),
        })),

      deleteTargetSegment: (id) =>
        set((state) => ({
          targetSegments: state.targetSegments.filter((s) => s.id !== id),
        })),

      addGalleryItem: () =>
        set((state) => ({
          gallery: [
            ...state.gallery,
            {
              id: Date.now(),
              title: "Proyek Baru",
              category: "Hunian",
              image:
                "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=900&q=80",
              location: "Lokasi Proyek",
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

      addTestimonial: () =>
        set((state) => ({
          testimonials: [
            ...state.testimonials,
            {
              id: Date.now(),
              clientName: "Nama Klien",
              clientRole: "Jabatan / Perusahaan",
              clientPhoto:
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
              projectTitle: "Judul Proyek",
              projectLocation: "Lokasi",
              projectType: "Hunian",
              projectImage:
                "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=900&q=80",
              rating: 5,
              testimonial: "Tulis testimoni klien di sini...",
              completionYear: "2024",
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

      addProduct: () =>
        set((state) => ({
          products: [
            ...state.products,
            {
              id: Date.now(),
              name: "Produk Baru",
              shortDesc: "Deskripsi singkat produk...",
              longDesc: "Deskripsi lengkap produk...",
              image:
                "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=900&q=80",
              category: "Aksesoris",
              brands: [],
              specs: [],
            },
          ],
        })),

      updateProduct: (id, patch) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...patch } : p
          ),
        })),

      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),

      resetAll: () => set({ ...initialState }),
      importData: (data) => set((state) => ({ ...state, ...data })),
    }),
    {
      name: "dpp-content",
    }
  )
);
