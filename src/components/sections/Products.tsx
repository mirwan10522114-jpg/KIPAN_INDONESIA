"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Newspaper,
  MapPin,
  Calendar,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import SafeImage from "@/components/ui/safe-image";
import { Search, ChevronDown } from "lucide-react";

function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: { id: string | number; nama: string }[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = options.filter((o) => o.nama.toLowerCase().includes(search.toLowerCase()));
  const selectedObj = options.find((o) => String(o.id) === String(value));

  return (
    <div className="relative w-full text-sm">
      <div
        className="w-full px-4 py-2 border border-slate-200 rounded-xl bg-white shadow-sm flex items-center justify-between cursor-pointer focus-within:border-blue-500 hover:border-blue-300 transition-colors"
        onClick={() => {
          setOpen(!open);
          setSearch("");
        }}
      >
        <span className={selectedObj ? "text-slate-800 font-medium" : "text-slate-500"}>
          {selectedObj ? selectedObj.nama : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </div>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="absolute z-50 top-full mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
            >
              <div className="flex items-center px-3 py-2 border-b border-slate-100 bg-slate-50/50">
                <Search className="w-4 h-4 text-slate-400 mr-2" />
                <input
                  type="text"
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent outline-none text-sm text-slate-700"
                  placeholder="Ketik untuk mencari..."
                />
              </div>
              <div className="max-h-56 overflow-y-auto">
                <div
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                  className="px-4 py-2.5 hover:bg-sky-50 cursor-pointer text-slate-500 font-medium transition-colors"
                >
                  {placeholder}
                </div>
                {filtered.length === 0 ? (
                  <div className="px-4 py-3 text-slate-400 text-center italic">Tidak ditemukan</div>
                ) : (
                  filtered.map((o) => (
                    <div
                      key={o.id}
                      onClick={() => {
                        onChange(String(o.id));
                        setOpen(false);
                      }}
                      className={`px-4 py-2.5 cursor-pointer transition-colors ${
                        String(o.id) === String(value)
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      {o.nama}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Products() {
  const [apiBerita, setApiBerita] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [wilayahData, setWilayahData] = useState({ provinsi: [], kabupaten: [] });
  const [filter, setFilter] = useState<string>("Semua");
  const [selectedProvId, setSelectedProvId] = useState<string>("");
  const [selectedKabId, setSelectedKabId] = useState<string>("");

  useEffect(() => {
    fetch("/api/wilayah")
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setWilayahData({ 
            provinsi: json.data.provinsi || [], 
            kabupaten: json.data.kabupaten || [] 
          });
        }
      })
      .catch(err => console.error("Error fetching wilayah:", err));
  }, []);

  useEffect(() => {
    setLoading(true);
    let url = "/api/berita?status=Published&jenis=INTERNAL";
    if (filter === "Provinsi" && selectedProvId) url += `&kategori=Provinsi&provinsiId=${selectedProvId}`;
    else if (filter === "Kabupaten" && selectedKabId) url += `&kategori=Kabupaten&kabupatenId=${selectedKabId}`;
    else if (filter !== "Semua") url += `&kategori=${filter}`;

    fetch(url, { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          const mapped = json.data.map((b: any) => ({
            id: b.id,
            title: b.judul,
            category: b.kategori,
            image: b.thumbnail || "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80",
            excerpt: b.excerpt,
            konten: b.konten,
            date: b.publishedAt ? new Date(b.publishedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : new Date(b.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
            location: b.kabupaten ? b.kabupaten.nama : b.provinsi ? b.provinsi.nama : "Indonesia",
          }));
          setApiBerita(mapped);
        } else {
          setApiBerita([]);
        }
      })
      .catch(() => setApiBerita([]))
      .finally(() => setLoading(false));
  }, [filter, selectedProvId, selectedKabId]);

  const [selected, setSelected] = useState<any | null>(null);

  const handleFilterClick = (cat: string) => {
    setFilter(cat);
    setSelectedProvId("");
    setSelectedKabId("");
  };

  return (
    <section
      id="berita"
      className="relative py-20 lg:py-28 bg-gradient-to-b from-white to-sky-50/30 overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-sky-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-100/40 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-sky-100 text-blue-700 text-xs font-semibold tracking-wider uppercase rounded-full mb-4">
            <Newspaper className="w-3.5 h-3.5" />
            Berita & Kegiatan Internal
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-950 leading-tight">
            Kabar Terbaru <span className="text-gradient-water">KIPAN</span>
          </h2>
          <p className="mt-5 text-slate-600 text-base lg:text-lg leading-relaxed">
            Ikuti perkembangan kegiatan KIPAN di seluruh Indonesia — dari tingkat
            nasional, provinsi, hingga kabupaten/kota.
          </p>
        </motion.div>

        {/* Filter pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center gap-4 mb-10"
        >
          <div className="flex flex-wrap justify-center gap-2">
            <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 mr-2">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </div>
            {["Semua", "Nasional", "Provinsi", "Kabupaten"].map((cat) => (
              <button
                key={cat}
                onClick={() => handleFilterClick(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filter === cat
                    ? "bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-md shadow-sky-500/30"
                    : "bg-white text-slate-600 hover:bg-sky-50 border border-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          {/* Sub Filters */}
          <AnimatePresence>
            {filter === "Provinsi" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="w-full max-w-sm">
                <SearchableSelect 
                  options={wilayahData.provinsi}
                  value={selectedProvId}
                  onChange={setSelectedProvId}
                  placeholder="-- Pilih Provinsi --"
                />
              </motion.div>
            )}
            
            {filter === "Kabupaten" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="w-full max-w-sm">
                <SearchableSelect 
                  options={wilayahData.kabupaten}
                  value={selectedKabId}
                  onChange={setSelectedKabId}
                  placeholder="-- Pilih Kabupaten/Kota --"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Berita grid */}
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : apiBerita.length === 0 ? (
          <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-100">
            <div className="bg-sky-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Newspaper className="w-8 h-8 text-sky-400" />
            </div>
            <p className="text-slate-500 font-medium text-lg">Belum ada berita yang dipublikasikan.</p>
            <p className="text-slate-400 text-sm mt-1">Berita akan muncul setelah admin mempublikasikan konten.</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {apiBerita.map((b, idx) => (
                <motion.article
                  key={b.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  whileHover={{ y: -5 }}
                  onClick={() => setSelected(b)}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow cursor-pointer border border-slate-100 flex flex-col"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    <SafeImage src={b.image} alt={b.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="absolute top-3 left-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-md">
                      {b.category}
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-2">
                      <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3 text-sky-500" /> {b.date}</span>
                      <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3 text-sky-500" /> {b.location}</span>
                    </div>
                    <h3 className="font-bold text-blue-950 text-base leading-tight mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">{b.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-3 flex-1">{b.excerpt}</p>
                    <div className="flex items-center text-blue-600 text-xs font-semibold group-hover:gap-1.5 transition-all">
                      Baca selengkapnya <ArrowUpRight className="w-3.5 h-3.5 ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Modal / Dialog Berita */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} className="absolute inset-0 bg-blue-950/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-3xl overflow-hidden w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
              <div className="relative w-full h-48 sm:h-64 md:h-80 shrink-0">
                <SafeImage src={selected.image} alt={selected.title} className="w-full h-full object-cover" />
                <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-rose-500 text-white rounded-full backdrop-blur-md transition-colors shadow-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 mb-4">
                  <span className="bg-sky-100 text-blue-700 px-3 py-1 rounded-full">{selected.category}</span>
                  <span className="inline-flex items-center gap-1.5"><Calendar className="w-4 h-4 text-sky-500" /> {selected.date}</span>
                  <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4 text-sky-500" /> {selected.location}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-blue-950 mb-6 leading-tight break-words">{selected.title}</h2>
                <div 
                  className="prose prose-sm md:prose-base prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap break-words"
                  dangerouslySetInnerHTML={{ __html: selected.konten || selected.excerpt }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
