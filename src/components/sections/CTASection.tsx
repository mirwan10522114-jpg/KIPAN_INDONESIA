"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, UserPlus } from "lucide-react";
import { useContentStore } from "@/lib/content-store";

export default function CTASection() {
  const company = useContentStore((s) => s.company);
  const [totalProvinsi, setTotalProvinsi] = useState(0);
  const [totalKabupaten, setTotalKabupaten] = useState(0);

  useEffect(() => {
    fetch("/api/dashboard", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.stats) {
          setTotalProvinsi(json.data.stats.totalProvinsi || 0);
          setTotalKabupaten(json.data.stats.totalKabupaten || 0);
        }
      })
      .catch(() => {});
  }, []);

  const waLink = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(
    "Halo " + company.name + ", saya ingin informasi pendaftaran pengurus."
  )}`;

  return (
    <section className="relative py-16 lg:py-20 overflow-hidden bg-blue-950">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=1920&q=80"
          alt="Kegiatan KIPAN"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-blue-950/90 to-blue-900/70" />
      </div>

      <div className="absolute -top-10 -left-10 w-80 h-80 bg-sky-500/20 rounded-full blur-3xl animate-wave" />
      <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 bg-sky-500/20 backdrop-blur-sm border border-sky-400/30 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="w-4 h-4 text-sky-300" />
            <span className="text-sky-200 text-xs font-semibold tracking-wider uppercase">
              Bergabung Sekarang
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-white leading-tight">
            Jadilah Bagian dari{" "}
            <span className="bg-gradient-to-r from-sky-300 to-cyan-500 bg-clip-text text-transparent">
              Gerakan Nasional
            </span>
          </h2>

          <p className="mt-6 text-sky-100 text-base lg:text-lg leading-relaxed">
            KIPAN Indonesia membuka pendaftaran pengurus baru di seluruh{" "}
            <span className="font-semibold text-white">{totalProvinsi} provinsi</span> dan{" "}
            <span className="font-semibold text-white">{totalKabupaten} kabupaten/kota</span>.
            Mari bersama mewujudkan generasi muda Indonesia yang bersih dari narkoba.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/pendaftaran"
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-400 to-blue-600 text-white font-semibold px-8 py-4 rounded-full shadow-2xl shadow-sky-500/40 hover:shadow-sky-500/60 hover:-translate-y-1 transition-all"
            >
              <UserPlus className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Daftar Menjadi Pengurus
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
