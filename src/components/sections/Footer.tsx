"use client";

import { Shield, MapPin, Phone, Mail, Instagram, Globe, Award } from "lucide-react";
import { useContentStore } from "@/lib/content-store";
import { NAV_LINKS } from "@/lib/kipan-data";

export default function Footer() {
  const company = useContentStore((s) => s.company);

  const waLink = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(
    "Halo " + company.name + ", saya ingin berkonsultasi."
  )}`;

  const targetUnits = [
    "Nasional",
    "Provinsi",
    "Kabupaten/Kota",
    "Kecamatan",
    "Pengurus Harian",
    "Anggota Divisi",
  ];

  return (
    <footer className="relative bg-blue-950 text-slate-300 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-cyan-500 to-sky-400" />

      <div className="absolute -top-20 -right-20 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid lg:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <div className="font-bold text-lg text-white">
                  {company.name} <span className="text-sky-400">Indonesia</span>
                </div>
                <div className="text-[10px] text-sky-300">
                  {company.fullName}
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {company.tagline}. Komunitas pemuda Indonesia yang berkomitmen
              mencegah penyalahgunaan narkoba di seluruh provinsi dan
              kabupaten/kota.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <Award className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="text-xs text-slate-400">Mitra Resmi</div>
                <div className="text-sm font-semibold text-white">
                  {company.partner}
                </div>
                <div className="text-[10px] text-sky-300">
                  {company.partnerOrigin}
                </div>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Navigasi
            </h4>
            <ul className="space-y-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-sky-300 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Target units */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Tingkatan
            </h4>
            <ul className="space-y-2">
              {targetUnits.map((u) => (
                <li
                  key={u}
                  className="text-sm text-slate-400 flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-sky-400 rounded-full" />
                  {u}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-4">
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Hubungi Kami
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                <span className="text-sm text-slate-400">
                  {company.currentAddress}
                </span>
              </li>
              <li>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-slate-400 hover:text-sky-300 transition-colors"
                >
                  <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                  {company.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${company.email}`}
                  className="flex items-center gap-3 text-sm text-slate-400 hover:text-sky-300 transition-colors"
                >
                  <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                  {company.email}
                </a>
              </li>
              <li>
                <a
                  href={company.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-slate-400 hover:text-sky-300 transition-colors"
                >
                  <Instagram className="w-4 h-4 text-sky-400 shrink-0" />
                  {company.instagram}
                </a>
              </li>
              <li>
                <a
                  href={company.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-slate-400 hover:text-sky-300 transition-colors"
                >
                  <Globe className="w-4 h-4 text-sky-400 shrink-0" />
                  {company.website}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            &copy; {new Date().getFullYear()} {company.name} Indonesia. All
            Rights Reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" />
            Melayani 38 provinsi &amp; 514 kabupaten/kota
          </div>
        </div>
      </div>
    </footer>
  );
}
