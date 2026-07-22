"use client";

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import {
  HardHat,
  Droplets,
  Settings2,
  Wrench,
  ArrowUpRight,
  Check,
  type LucideIcon,
} from "lucide-react";
import { SERVICES, COMPANY } from "@/lib/data";
import { useContentStore } from "@/lib/content-store";
import SafeImage from "@/components/ui/safe-image";

const ICON_MAP: Record<string, LucideIcon> = {
  HardHat,
  Droplets,
  Settings2,
  Wrench,
};

// Tilt card wrapper
function TiltCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-50, 50], [8, -8]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(x, [-50, 50], [-8, 8]), {
    stiffness: 200,
    damping: 20,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Services() {
  const services = useContentStore((s) => s.services);
  const company = useContentStore((s) => s.company);

  const waLink = (service: string) =>
    `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(
      `Halo Dunia Pool & Pond, saya tertarik dengan layanan "${service}". Mohon info lebih lanjut.`
    )}`;

  return (
    <section
      id="layanan"
      className="relative py-20 lg:py-28 bg-white overflow-hidden"
    >
      <div className="absolute top-20 left-0 w-96 h-96 bg-sky-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-cyan-100/40 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-14"
        >
          <span className="inline-block px-4 py-1.5 bg-cyan-100 text-cyan-700 text-xs font-semibold tracking-wider uppercase rounded-full mb-4">
            Layanan Kami
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-sky-950 leading-tight">
            Solusi End-to-End untuk{" "}
            <span className="text-gradient-water">Kolam Anda</span>
          </h2>
          <p className="mt-5 text-slate-600 text-base lg:text-lg leading-relaxed">
            Empat pilar layanan terintegrasi — dari pembangunan hingga perawatan
            harian, semua ditangani oleh satu mitra terpercaya.
          </p>
        </motion.div>

        {/* Services grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {services.map((service, idx) => {
            const Icon = ICON_MAP[service.icon] || HardHat;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <TiltCard className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-sky-900/10 transition-shadow duration-500 h-full">
                  {/* Top: image + number overlay */}
                  <div className="relative h-56 overflow-hidden">
                    <SafeImage
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-sky-950/85 via-sky-900/40 to-transparent" />

                    {/* Number badge */}
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg">
                      <div className="text-2xl font-extrabold text-gradient-water">
                        {service.number}
                      </div>
                    </div>

                    {/* Icon with pulse effect */}
                    <div className="absolute top-4 right-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-cyan-400 rounded-xl animate-ping opacity-40" />
                        <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Title overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-xl font-bold text-white">
                        {service.title}
                      </h3>
                      <p className="text-cyan-300 text-sm font-medium mt-0.5">
                        {service.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {service.description}
                    </p>

                    {/* Features with staggered animation */}
                    <ul className="mt-5 space-y-2">
                      {service.features.map((feat, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: 0.2 + i * 0.08 }}
                          className="flex items-start gap-2 text-sm text-slate-700 group/feat"
                        >
                          <div className="w-5 h-5 rounded-full bg-cyan-50 flex items-center justify-center shrink-0 mt-0.5 group-hover/feat:bg-cyan-100 transition-colors">
                            <Check className="w-3 h-3 text-cyan-600" />
                          </div>
                          <span>{feat}</span>
                        </motion.li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <a
                      href={waLink(service.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex items-center gap-2 text-sky-700 font-semibold text-sm group/cta hover:gap-3 transition-all"
                    >
                      Konsultasi Layanan Ini
                      <ArrowUpRight className="w-4 h-4 group-hover/cta:rotate-12 transition-transform" />
                    </a>
                  </div>

                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-400/0 to-cyan-400/0 group-hover:from-cyan-400/10 group-hover:to-transparent transition-all rounded-bl-full" />
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
