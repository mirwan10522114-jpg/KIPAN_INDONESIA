"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import { useContentStore } from "@/lib/content-store";

export default function CTASection() {
  const company = useContentStore((s) => s.company);
  const waLink = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(
    "Halo " + company.name + ", saya ingin mewujudkan kolam impian saya. Mohon info konsultasi."
  )}`;

  return (
    <section className="relative py-16 lg:py-20 overflow-hidden bg-sky-950">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1601823984263-b87b59798b70?auto=format&fit=crop&w=1920&q=80"
          alt="Infinity pool dengan view"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-sky-950 via-sky-950/90 to-sky-900/70" />
      </div>

      {/* Decorative blobs */}
      <div className="absolute -top-10 -left-10 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-wave" />
      <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 bg-cyan-500/20 backdrop-blur-sm border border-cyan-400/30 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span className="text-cyan-200 text-xs font-semibold tracking-wider uppercase">
              Konsultasi Sistem Sirkulasi Gratis
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-white leading-tight">
            Wujudkan Kolam{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-cyan-500 bg-clip-text text-transparent">
              Impian Anda
            </span>
          </h2>

          <p className="mt-6 text-sky-100 text-base lg:text-lg leading-relaxed">
            Dunia Pool & Pond melayani proyek kolam renang dan kolam hias di
            seluruh Indonesia, dari{" "}
            <span className="font-semibold text-white">Sabang sampai Merauke</span>.
            Konsultasikan proyek Anda sekarang — termasuk perancangan sistem
            sirkulasi kolam secara gratis.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-400 to-cyan-600 text-white font-semibold px-8 py-4 rounded-full shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-500/60 hover:-translate-y-1 transition-all"
            >
              Chat WhatsApp Sekarang
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#kontak"
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md border border-white/30 text-white font-semibold px-8 py-4 rounded-full hover:bg-white/20 transition-all"
            >
              Kirim Pesan via Form
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
