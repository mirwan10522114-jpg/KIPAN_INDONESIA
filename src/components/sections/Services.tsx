"use client";

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import {
  Megaphone,
  Presentation,
  GraduationCap,
  School,
  Radio,
  Users,
  ArrowUpRight,
  Check,
  type LucideIcon,
} from "lucide-react";
import { useContentStore } from "@/lib/content-store";
import SafeImage from "@/components/ui/safe-image";

const ICON_MAP: Record<string, LucideIcon> = {
  Megaphone,
  Presentation,
  GraduationCap,
  School,
  Radio,
  Users,
};

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
  const programs = useContentStore((s) => s.programs);

  return (
    <section
      id="program"
      className="relative py-20 lg:py-28 bg-gradient-to-b from-emerald-50/40 to-white overflow-hidden"
    >
      <div className="absolute top-20 left-0 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mb-14"
        >
          <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-semibold tracking-wider uppercase rounded-full mb-4">
            Program Kerja
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-emerald-950 leading-tight">
            Program Unggulan{" "}
            <span className="text-gradient-water">KIPAN</span>
          </h2>
          <p className="mt-5 text-slate-600 text-base lg:text-lg leading-relaxed">
            Beragam program pencegahan narkoba yang dijalankan KIPAN di seluruh
            Indonesia, dari sosialisasi sekolah hingga kampanye nasional.
          </p>
        </motion.div>

        {/* Programs grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {programs.map((program, idx) => {
            const Icon = ICON_MAP[program.icon] || Megaphone;
            return (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <TiltCard className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/10 transition-shadow duration-500 h-full">
                  {/* Top: image + number overlay */}
                  <div className="relative h-48 overflow-hidden">
                    <SafeImage
                      src={program.image}
                      alt={program.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="eager"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/85 via-emerald-900/40 to-transparent" />

                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg">
                      <div className="text-2xl font-extrabold text-gradient-water">
                        {program.number}
                      </div>
                    </div>

                    <div className="absolute top-4 right-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-emerald-400 rounded-xl animate-ping opacity-40" />
                        <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-lg font-bold text-white">
                        {program.title}
                      </h3>
                      <p className="text-emerald-300 text-xs font-medium mt-0.5">
                        {program.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-4">
                      {program.description}
                    </p>

                    <ul className="mt-5 space-y-2">
                      {program.features.slice(0, 4).map((feat, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: 0.2 + i * 0.08 }}
                          className="flex items-start gap-2 text-sm text-slate-700"
                        >
                          <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-emerald-600" />
                          </div>
                          <span>{feat}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/0 to-emerald-400/0 group-hover:from-emerald-400/10 group-hover:to-transparent transition-all rounded-bl-full" />
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
