"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, UserPlus } from "lucide-react";
import { useContentStore } from "@/lib/content-store";

export default function CTASection() {
  const company = useContentStore((s) => s.company);
  const waLink = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(
    "Halo " + company.name + ", saya ingin informasi pendaftaran anggota."
  )}`;

  return (
    <section className="relative py-16 lg:py-20 overflow-hidden bg-emerald-950">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=1920&q=80"
          alt="Kegiatan KIPAN"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/90 to-emerald-900/70" />
      </div>

      <div className="absolute -top-10 -left-10 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-wave" />
      <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span className="text-emerald-200 text-xs font-semibold tracking-wider uppercase">
              Bergabung Sekarang
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-white leading-tight">
            Jadilah Bagian dari{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-teal-500 bg-clip-text text-transparent">
              Gerakan Nasional
            </span>
          </h2>

          <p className="mt-6 text-emerald-100 text-base lg:text-lg leading-relaxed">
            KIPAN Indonesia membuka pendaftaran anggota baru di seluruh{" "}
            <span className="font-semibold text-white">38 provinsi</span> dan{" "}
            <span className="font-semibold text-white">514 kabupaten/kota</span>.
            Mari bersama mewujudkan generasi muda Indonesia yang bersih dari narkoba.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#pendaftaran"
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-semibold px-8 py-4 rounded-full shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60 hover:-translate-y-1 transition-all"
            >
              <UserPlus className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Daftar Menjadi Anggota
            </a>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md border border-white/30 text-white font-semibold px-8 py-4 rounded-full hover:bg-white/20 transition-all"
            >
              Tanya via WhatsApp
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
