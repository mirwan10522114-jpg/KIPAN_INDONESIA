"use client";

import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  Target,
  Eye,
  Heart,
  CheckCircle2,
  Sparkles,
  MapPin,
  Award,
  ShieldCheck,
} from "lucide-react";
import { useContentStore } from "@/lib/content-store";
import SafeImage from "@/components/ui/safe-image";

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));

  useEffect(() => {
    if (inView) {
      const controls = animate(motionValue, value, {
        duration: 2,
        ease: "easeOut",
      });
      return controls.stop;
    }
  }, [inView, value, motionValue]);

  useEffect(() => {
    return rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = v.toLocaleString("id-ID") + suffix;
    });
  }, [rounded, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export default function About() {
  const about = useContentStore((s) => s.about);
  const company = useContentStore((s) => s.company);
  const [totalPengurus, setTotalPengurus] = useState(0);
  const [totalProvinsi, setTotalProvinsi] = useState(0);

  // Fetch real stats from API
  useEffect(() => {
    fetch("/api/dashboard", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.stats) {
          setTotalPengurus(json.data.stats.totalPengurus || 0);
          setTotalProvinsi(json.data.stats.totalProvinsi || 0);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section
      id="tentang"
      className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-900"
    >
      {/* Decorative shapes */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-3xl" />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-sky-400/10 rounded-full blur-3xl animate-wave" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-sky-500/20 backdrop-blur-sm border border-sky-400/30 text-sky-300 text-xs font-semibold tracking-wider uppercase rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Tentang KIPAN
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            Gerakan Pemuda{" "}
            <span className="bg-gradient-to-r from-sky-300 via-cyan-400 to-sky-400 bg-clip-text text-transparent">
              Anti Narkoba
            </span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start mt-8">
          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="relative order-2 lg:order-1"
          >
            <div className="flex flex-col gap-4 sm:gap-6">
              {/* Main Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-sky-500/20 aspect-[4/3] sm:aspect-[5/4] border-4 border-white/10">
                <SafeImage
                  src={about.image}
                  alt="Kegiatan KIPAN Indonesia"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-blue-950/20 to-transparent" />

                <div className="absolute top-4 left-4 bg-sky-500/90 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  Bersama BNN RI
                </div>

                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <p className="text-lg font-bold">KIPAN Indonesia</p>
                  <p className="text-sm text-sky-200">{company.tagline}</p>
                </div>
                
                {/* Pengurus Aktif Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
                  className="absolute -top-2 right-2 sm:-top-4 sm:-right-4 bg-white rounded-2xl shadow-2xl p-4 sm:p-5 border border-sky-100 max-w-[170px] sm:max-w-[200px] hover:scale-105 transition-transform z-10"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
                    <div className="text-2xl sm:text-3xl font-extrabold text-gradient-water">
                      <Counter value={totalPengurus} suffix="" />
                    </div>
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-600 font-medium leading-tight">
                    Pengurus Aktif di {totalProvinsi} Provinsi
                  </div>
                </motion.div>
              </div>

              {/* Smaller Images Row */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-square sm:aspect-[4/3] border-4 border-white/10">
                  <SafeImage
                    src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80"
                    alt="Pelatihan KIPAN"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-blue-950/20" />
                </div>
                
                <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-square sm:aspect-[4/3] border-4 border-white/10">
                  <SafeImage
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
                    alt="Komunitas KIPAN"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-blue-950/20" />
                </div>
              </div>

              {/* Highlight Card to fill space and balance the layout */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-white/5 backdrop-blur-md border border-sky-400/30 rounded-3xl p-6 sm:p-8 mt-2 shadow-2xl shadow-sky-500/10"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-sky-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg mb-1.5">Komitmen Kami</h4>
                    <p className="text-sky-100/80 text-sm leading-relaxed">
                      KIPAN hadir sebagai garda terdepan dalam mewujudkan generasi muda Indonesia yang tangguh, produktif, dan bersih dari bahaya narkoba melalui aksi nyata dan pemberdayaan berkelanjutan.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="order-1 lg:order-2"
          >
            {about.paragraphs.map((p, i) => (
              <p
                key={i}
                className="text-sky-100/90 text-base lg:text-lg leading-relaxed mt-4 first:mt-0"
              >
                {p}
              </p>
            ))}

            {/* Visi */}
            <div className="mt-8 bg-white/5 backdrop-blur-sm border border-sky-400/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Visi</h3>
              </div>
              <p className="text-sky-50 text-sm lg:text-base italic leading-relaxed">
                &ldquo;{about.visi}&rdquo;
              </p>
            </div>

            {/* Misi */}
            <div className="mt-4 bg-white/5 backdrop-blur-sm border border-sky-400/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Misi</h3>
              </div>
              <ul className="space-y-2">
                {about.misi.map((m, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className="flex items-start gap-2 text-sky-100 text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <span>{m}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Nilai Organisasi */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="mt-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-white">
              Nilai{" "}
              <span className="text-sky-300">Organisasi</span>
            </h3>
            <p className="text-sky-200/70 text-sm mt-2">
              Prinsip yang menjadi pegangan setiap kader KIPAN
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {about.nilai.map((n, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white/5 backdrop-blur-sm border border-sky-400/20 rounded-2xl p-5 hover:bg-white/10 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mb-3 shadow-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-bold text-white mb-1">{n.title}</h4>
                <p className="text-sm text-sky-100/70 leading-relaxed">{n.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tujuan */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="mt-16"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl lg:text-3xl font-bold text-white">
              Tujuan{" "}
              <span className="text-sky-300">KIPAN</span>
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {about.tujuan.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="flex items-start gap-3 bg-white/5 border border-sky-400/20 rounded-xl p-4"
              >
                <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-sky-300">{idx + 1}</span>
                </div>
                <span className="text-sky-50 text-sm">{t}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
