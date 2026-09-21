"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Send,
  ShieldCheck,
  Upload,
  IdCard,
  Calendar,
  HeartPulse,
  GraduationCap,
  ScrollText,
  HandHeart,
  Copy,
  Check,
  ArrowRight,
  ChevronDown,
  Lock,
  Shield,
  Cpu,
} from "lucide-react";
import { useContentStore } from "@/lib/content-store";
import {
  MASTER_PROVINSI,
  MASTER_KABUPATEN,
  MASTER_KECAMATAN,
  getKabupatenByProvinsi,
  getKecamatanByKabupaten,
} from "@/lib/master-wilayah";

const PERSYARATAN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  IdCard,
  Calendar,
  HeartPulse,
  GraduationCap,
  ScrollText,
  HandHeart,
};

const PEKERJAAN_OPTIONS = [
  "Pelajar/Mahasiswa",
  "Pegawai Negeri Sipil (PNS)",
  "TNI/Polri",
  "Karyawan Swasta",
  "Wiraswasta/Pengusaha",
  "Guru/Dosen",
  "Pegawai BUMN/BUMD",
  "Tenaga Medis",
  "Buruh/Pekerja Harian",
  "Mengurus Rumah Tangga",
  "Belum/Tidak Bekerja",
];

interface FormData {
  // Data Diri
  namaLengkap: string;
  nik: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  agama: string;
  pendidikan: string;
  pekerjaan: string;
  status: string;
  alamat: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  kodePos: string;
  // Kontak
  email: string;
  whatsapp: string;
  // Persyaratan checklist
  persyaratan: boolean[];
  // Motivasi
  motivasi: string;
  // Dokumen upload (base64 data URL)
  foto?: string;
  ktp?: string;
  cv?: string;
  suratPernyataan?: string;
  suratSehat?: string;
  sk?: string;
}

const STEPS = [
  { id: 1, label: "Data Diri", icon: User },
  { id: 2, label: "Kontak", icon: Mail },
  { id: 3, label: "Persyaratan", icon: CheckCircle2 },
  { id: 4, label: "Konfirmasi", icon: Send },
];

export default function PendaftaranAnggota() {
  const persyaratan = useContentStore((s) => s.persyaratan);
  const [openSteps, setOpenSteps] = useState<number[]>([]); // All closed by default
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [nomorPendaftaran, setNomorPendaftaran] = useState("");
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState<FormData>({
    namaLengkap: "",
    nik: "",
    tempatLahir: "",
    tanggalLahir: "",
    jenisKelamin: "",
    agama: "",
    pendidikan: "",
    pekerjaan: "",
    status: "",
    alamat: "",
    provinsi: "",
    kabupaten: "",
    kecamatan: "",
    kodePos: "",
    email: "",
    whatsapp: "",
    persyaratan: persyaratan.map(() => false),
    motivasi: "",
  });

  const update = (field: keyof FormData, value: string | boolean[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const [kecamatanList, setKecamatanList] = useState<{kode: string, nama: string}[]>([]);
  const [loadingKecamatan, setLoadingKecamatan] = useState(false);
  const [isCustomPekerjaan, setIsCustomPekerjaan] = useState(false);

  useEffect(() => {
    if (!form.kabupaten || !form.provinsi) {
      setKecamatanList([]);
      return;
    }
    const prov = MASTER_PROVINSI.find((p) => p.nama === form.provinsi);
    if (!prov) return;
    const kab = MASTER_KABUPATEN.find((k) => k.nama === form.kabupaten && k.provinsiKode === prov.kode);
    if (!kab) return;

    const localKec = getKecamatanByKabupaten(kab.kode);
    if (localKec.length > 0) {
      setKecamatanList(localKec);
      return;
    }

    setLoadingKecamatan(true);
    setKecamatanList([]);
    fetch(`/api/wilayah/kecamatan?kabupatenKode=${kab.kode}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setKecamatanList(json.data);
        }
      })
      .catch((err) => {
        console.error("Gagal memuat kecamatan:", err);
        setKecamatanList([]);
      })
      .finally(() => setLoadingKecamatan(false));
  }, [form.kabupaten, form.provinsi]);

  useEffect(() => {
    if (form.kecamatan) {
      fetch(`/api/wilayah/kodepos?kecamatan=${encodeURIComponent(form.kecamatan)}&kabupaten=${encodeURIComponent(form.kabupaten || "")}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            update("kodePos", json.data);
          }
        })
        .catch((err) => console.error("Gagal memuat kodepos:", err));
    }
  }, [form.kecamatan]);

  const nextStep = () => setStep((s) => Math.min(s + 1, STEPS.length));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      // Validasi semua field wajib
      const requiredFields = [
        { key: "namaLengkap", label: "Nama Lengkap" },
        { key: "nik", label: "NIK" },
        { key: "tempatLahir", label: "Tempat Lahir" },
        { key: "tanggalLahir", label: "Tanggal Lahir" },
        { key: "jenisKelamin", label: "Jenis Kelamin" },
        { key: "agama", label: "Agama" },
        { key: "pendidikan", label: "Pendidikan" },
        { key: "pekerjaan", label: "Pekerjaan" },
        { key: "alamat", label: "Alamat Lengkap" },
        { key: "provinsi", label: "Provinsi" },
        { key: "kabupaten", label: "Kabupaten/Kota" },
        { key: "kecamatan", label: "Kecamatan" },
        { key: "kodePos", label: "Kode Pos" },
        { key: "email", label: "Email" },
        { key: "whatsapp", label: "WhatsApp" },
      ] as const;
      
      for (const f of requiredFields) {
        const val = form[f.key];
        if (!val || !String(val).trim()) {
          setSubmitError(`${f.label} wajib diisi`);
          setSubmitting(false);
          // Scroll ke form jika error (optional)
          window.scrollTo({ top: document.getElementById("pendaftaran")?.offsetTop || 0, behavior: "smooth" });
          return;
        }
      }
      
      // Validasi semua persyaratan harus dicentang
      if (!form.persyaratan.every(Boolean)) {
        setSubmitError("Semua persyaratan kepengurusan harus dicentang");
        setSubmitting(false);
        return;
      }

      // Lookup kode Kemendagri dari master-wilayah berdasarkan nama yang dipilih
      const provMaster = MASTER_PROVINSI.find((p) => p.nama === form.provinsi);
      const kabMaster = provMaster
        ? MASTER_KABUPATEN.find((k) => k.nama === form.kabupaten && k.provinsiKode === provMaster.kode)
        : undefined;

      if (!provMaster || !kabMaster) {
        setSubmitError("Provinsi/Kabupaten tidak valid. Silakan pilih ulang.");
        setStep(1);
        setSubmitting(false);
        return;
      }

      const payload = {
        namaLengkap: form.namaLengkap,
        nik: form.nik,
        tempatLahir: form.tempatLahir,
        tanggalLahir: form.tanggalLahir,
        jenisKelamin: form.jenisKelamin,
        agama: form.agama,
        pendidikan: form.pendidikan,
        pekerjaan: form.pekerjaan,
        statusPribadi: form.status,
        alamat: form.alamat,
        // Kirim kode Kemendagri (2-digit provinsi, 4-digit kabupaten)
        // API akan lookup ke DB untuk dapatkan id asli
        provinsiKode: provMaster.kode,
        kabupatenKode: kabMaster.kode,
        provinsiNama: provMaster.nama,
        kabupatenNama: kabMaster.nama,
        kecamatan: form.kecamatan,
        kodePos: form.kodePos,
        email: form.email,
        whatsapp: form.whatsapp,
        motivasi: form.motivasi,
        persyaratan: form.persyaratan,
        // Dokumen upload (base64 data URL)
        foto: form.foto || null,
        ktp: form.ktp || null,
        cv: form.cv || null,
        sk: form.sk || null,
        suratPernyataan: form.suratPernyataan || null,
        suratSehat: form.suratSehat || null,
      };

      const res = await fetch("/api/pendaftaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      let data: any;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error(`Server merespons HTTP ${res.status} (body bukan JSON). Coba refresh halaman dan ulangi.`);
      }

      if (!data.success) {
        throw new Error(data.error || `Gagal submit pendaftaran (HTTP ${res.status})`);
      }
      if (data.data?.nomorPendaftaran) {
        setNomorPendaftaran(data.data.nomorPendaftaran);
      }
      setSubmitted(true);
    } catch (e: any) {
      setSubmitError(e.message || "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  const copyNomor = () => {
    if (!nomorPendaftaran) return;
    navigator.clipboard.writeText(nomorPendaftaran);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const allPersyaratanChecked = form.persyaratan.every(Boolean);

  if (submitted) {
    return (
      <section id="pendaftaran" className="relative py-20 lg:py-28 bg-gradient-to-br from-sky-50 to-cyan-50 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-200/40 rounded-full blur-3xl" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl text-center"
        >
          <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-sky-100">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-xl shadow-sky-500/30 mb-6"
            >
              <CheckCircle2 className="w-12 h-12 text-white" />
            </motion.div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-blue-950 mb-3">
              Pendaftaran Berhasil Dikirim!
            </h2>
            <p className="text-slate-600 text-sm lg:text-base leading-relaxed mb-6">
              Halo <strong>{form.namaLengkap}</strong>, formulir pendaftaran Anda telah berhasil kami terima.
              Silakan simpan <strong>Nomor Pendaftaran</strong> resmi berikut untuk memantau status seleksi dan verifikasi berkas Anda:
            </p>

            {/* Card Nomor Pendaftaran */}
            {nomorPendaftaran && (
              <div className="bg-gradient-to-br from-blue-600 to-sky-600 text-white rounded-2xl p-5 sm:p-6 mb-6 shadow-lg shadow-sky-500/25 text-left">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-100">
                    Nomor Pendaftaran Resmi
                  </span>
                  <span className="text-[11px] bg-white/20 backdrop-blur-sm px-2.5 py-0.5 rounded-full font-medium">
                    Simpan & Catat
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 bg-black/15 backdrop-blur-md rounded-xl px-4 py-3 border border-white/10">
                  <span className="font-mono text-xl sm:text-2xl font-extrabold tracking-wider">
                    {nomorPendaftaran}
                  </span>
                  <button
                    type="button"
                    onClick={copyNomor}
                    className="inline-flex items-center gap-1.5 bg-white text-blue-700 hover:bg-sky-50 text-xs font-bold px-3 py-2 rounded-lg shadow transition-all active:scale-95"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Tersalin!" : "Salin"}
                  </button>
                </div>
                <p className="text-xs text-sky-100 mt-3 leading-relaxed">
                  Gunakan nomor ini pada fitur <strong>Lacak Pendaftaran</strong> di halaman depan untuk memantau progres verifikasi berkas Anda secara berkala.
                </p>
              </div>
            )}

            {/* Status preview */}
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 text-left mb-6">
              <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">
                Tahapan Verifikasi
              </div>
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="w-5 h-5 text-sky-500" />
                <span className="text-sm font-medium text-slate-800">Berkas pendaftaran diterima</span>
              </div>
              <div className="flex items-center gap-3 mb-2 opacity-60">
                <div className="w-5 h-5 rounded-full border-2 border-slate-400 flex items-center justify-center text-[10px] font-bold text-slate-500">2</div>
                <span className="text-sm text-slate-600">Verifikasi dokumen oleh admin wilayah</span>
              </div>
              <div className="flex items-center gap-3 opacity-60">
                <div className="w-5 h-5 rounded-full border-2 border-slate-400 flex items-center justify-center text-[10px] font-bold text-slate-500">3</div>
                <span className="text-sm text-slate-600">Pengangkatan & penerbitan NIP resmi</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="#lacak-pendaftaran"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold text-sm px-6 py-3 rounded-full shadow-lg shadow-sky-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Lacak Status Pendaftaran
                <ArrowRight className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setNomorPendaftaran("");
                  setStep(1);
                  setForm({
                    namaLengkap: "",
                    nik: "",
                    tempatLahir: "",
                    tanggalLahir: "",
                    jenisKelamin: "",
                    agama: "",
                    pendidikan: "",
                    pekerjaan: "",
                    status: "",
                    alamat: "",
                    provinsi: "",
                    kabupaten: "",
                    kecamatan: "",
                    kodePos: "",
                    email: "",

                    whatsapp: "",
                    persyaratan: persyaratan.map(() => false),
                    motivasi: "",
                  });
                }}
                className="w-full sm:w-auto text-sm font-medium text-slate-600 hover:text-blue-700 px-5 py-3 transition-colors"
              >
                ← Kembali ke Form Baru
              </button>
            </div>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section
      id="pendaftaran"
      className="relative py-20 lg:py-28 bg-gradient-to-br from-sky-50 via-white to-cyan-50 overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-200/40 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-100/50 rounded-full blur-3xl" />

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
            <ShieldCheck className="w-3.5 h-3.5" />
            Pendaftaran Pengurus
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-blue-950 leading-tight">
            Bergabung Menjadi{" "}
            <span className="text-gradient-water">Pengurus KIPAN</span>
          </h2>
          <p className="mt-5 text-slate-600 text-base lg:text-lg leading-relaxed">
            Daftarkan diri Anda sebagai kader pemuda anti narkoba. Ikuti 4
            langkah pendaftaran online di bawah ini.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Vertical Form List */}
          <div className="space-y-8 mb-6">
            {STEPS.map((s) => {
              const Icon = s.icon;
              const isActive = openSteps.includes(s.id);
              
              return (
                <div key={s.id} className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenSteps(prev => 
                        prev.includes(s.id) 
                          ? prev.filter(id => id !== s.id) 
                          : [...prev, s.id]
                      );
                    }}
                    className="w-full flex items-center justify-between px-6 py-4 sm:px-8 sm:py-5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 transition-all rounded-full shadow-lg shadow-sky-500/30"
                  >
                    <div className="flex items-center gap-4 sm:gap-5">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2} />
                      <h3 className="font-bold text-white text-sm sm:text-base tracking-wide">
                        {s.label}
                      </h3>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-white/90 transition-transform duration-300 ${
                        isActive ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 lg:p-10 shadow-xl shadow-sky-900/5 mt-4">

          {/* Security Guarantee Banner (Only in Step 1) */}
          {s.id === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-8 bg-blue-950 rounded-2xl p-6 sm:p-8 border border-sky-500/20 shadow-xl"
            >
            <div className="flex gap-4 sm:gap-6 items-start">
              <div className="w-12 h-16 bg-emerald-600 rounded-b-full rounded-t flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                <Lock className="w-6 h-6 text-emerald-100" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="flex items-center gap-2 text-emerald-400 font-bold text-sm sm:text-base mb-3">
                  <CheckCircle2 className="w-4 h-4" />
                  Jaminan Keamanan & Kerahasiaan Data (Standar UU PDP)
                </h4>
                <p className="text-sky-200/80 text-sm leading-relaxed mb-6 text-justify">
                  Seluruh data identitas, NIK, dan dokumen KTP Anda dienkripsi secara aman dengan standar protokol enkripsi tingkat tinggi (AES-256) dan hanya digunakan untuk keperluan verifikasi keanggotaan resmi organisasi. Data Anda terlindungi dan tidak akan dialihkan ke pihak ketiga tanpa izin.
                </p>
                <div className="flex items-center justify-between gap-1 sm:gap-4 text-[9px] sm:text-xs font-medium border-t border-sky-500/10 pt-4 w-full whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-emerald-500 shrink-0">
                    <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>SSL 256-bit Encrypted</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-sky-500/30 shrink-0" />
                  <div className="flex items-center gap-1.5 text-sky-400 shrink-0">
                    <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>UU Perlindungan Data Pribadi</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-sky-500/30 shrink-0" />
                  <div className="flex items-center gap-1.5 text-amber-400 shrink-0">
                    <Cpu className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Verifikasi e-KYC Otentik</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          )}

          {/* Form Content is now inside the Accordion body */}
              {/* STEP 1: Data Diri */}
              {s.id === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-bold text-blue-950 mb-4">
                    Data Diri
                  </h3>

                  <Field label="Nama Lengkap (sesuai KTP)" required>
                    <input
                      type="text"
                      value={form.namaLengkap}
                      onChange={(e) => update("namaLengkap", e.target.value.replace(/[^a-zA-Z\s'.-]/g, ""))}
                      className="form-input"
                      placeholder="Nama lengkap sesuai KTP"
                    />
                  </Field>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="NIK" required>
                      <input
                        type="text"
                        maxLength={16}
                        value={form.nik}
                        onChange={(e) => update("nik", e.target.value.replace(/\D/g, ""))}
                        className="form-input"
                        placeholder="16 digit NIK"
                      />
                    </Field>
                    <Field label="Tempat Lahir" required>
                      <input
                        type="text"
                        value={form.tempatLahir}
                        onChange={(e) => update("tempatLahir", e.target.value.replace(/[^a-zA-Z\s'.-]/g, ""))}
                        className="form-input"
                        placeholder="Tempat lahir"
                      />
                    </Field>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Tanggal Lahir" required>
                      <input
                        type="date"
                        value={form.tanggalLahir}
                        onChange={(e) => update("tanggalLahir", e.target.value)}
                        className="form-input"
                      />
                    </Field>
                    <Field label="Jenis Kelamin" required>
                      <select
                        value={form.jenisKelamin}
                        onChange={(e) => update("jenisKelamin", e.target.value)}
                        className="form-input"
                      >
                        <option value="">Pilih...</option>
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </Field>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <Field label="Agama" required>
                      <select
                        value={form.agama}
                        onChange={(e) => update("agama", e.target.value)}
                        className="form-input"
                        required
                      >
                        <option value="">Pilih...</option>
                        <option>Islam</option>
                        <option>Kristen</option>
                        <option>Katolik</option>
                        <option>Hindu</option>
                        <option>Buddha</option>
                        <option>Konghucu</option>
                      </select>
                    </Field>
                    <Field label="Pendidikan Terakhir" required>
                      <select
                        value={form.pendidikan}
                        onChange={(e) => update("pendidikan", e.target.value)}
                        className="form-input"
                        required
                      >
                        <option value="">Pilih...</option>
                        <option>SMP</option>
                        <option>SMA/SMK</option>
                        <option>D3</option>
                        <option>S1</option>
                        <option>S2</option>
                        <option>S3</option>
                      </select>
                    </Field>
                    <Field label="Pekerjaan" required>
                      <div className="flex flex-col gap-2">
                        <select
                          value={isCustomPekerjaan ? "Lainnya" : form.pekerjaan}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "Lainnya") {
                              setIsCustomPekerjaan(true);
                              update("pekerjaan", "");
                            } else {
                              setIsCustomPekerjaan(false);
                              update("pekerjaan", val);
                            }
                          }}
                          className="form-input"
                          required={!isCustomPekerjaan}
                        >
                          <option value="">Pilih...</option>
                          {PEKERJAAN_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                          <option value="Lainnya">Lainnya (Ketik Manual)</option>
                        </select>
                        {isCustomPekerjaan && (
                          <input
                            type="text"
                            value={form.pekerjaan}
                            onChange={(e) => update("pekerjaan", e.target.value.replace(/[^a-zA-Z\s'.-]/g, ""))}
                            className="form-input"
                            placeholder="Ketik pekerjaan Anda"
                            required
                            autoFocus
                          />
                        )}
                      </div>
                    </Field>
                  </div>

                  <Field label="Alamat Lengkap" required>
                    <textarea
                      value={form.alamat}
                      onChange={(e) => update("alamat", e.target.value)}
                      className="form-input"
                      rows={2}
                      placeholder="Alamat lengkap sesuai KTP"
                    />
                  </Field>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Field label="Provinsi" required>
                      <select
                        value={form.provinsi}
                        onChange={(e) => {
                          const prov = MASTER_PROVINSI.find((p) => p.nama === e.target.value);
                          update("provinsi", e.target.value);
                          update("kabupaten", "");
                          update("kecamatan", "");
                        }}
                        className="form-input"
                      >
                        <option value="">Pilih Provinsi...</option>
                        {MASTER_PROVINSI.map((p) => (
                          <option key={p.kode} value={p.nama}>{p.nama}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Kabupaten/Kota" required>
                      <select
                        value={form.kabupaten}
                        onChange={(e) => {
                          update("kabupaten", e.target.value);
                          update("kecamatan", "");
                        }}
                        disabled={!form.provinsi}
                        className="form-input disabled:bg-slate-50 disabled:text-slate-400"
                      >
                        <option value="">Pilih Kabupaten...</option>
                        {form.provinsi && (() => {
                          const prov = MASTER_PROVINSI.find((p) => p.nama === form.provinsi);
                          if (!prov) return null;
                          return getKabupatenByProvinsi(prov.kode).map((k) => (
                            <option key={k.kode} value={k.nama}>{k.nama} ({k.jenis})</option>
                          ));
                        })()}
                      </select>
                    </Field>
                    <Field label="Kecamatan" required>
                      <select
                        value={form.kecamatan}
                        onChange={(e) => update("kecamatan", e.target.value)}
                        disabled={!form.kabupaten || loadingKecamatan}
                        className="form-input disabled:bg-slate-50 disabled:text-slate-400"
                        required
                      >
                        <option value="">
                          {loadingKecamatan ? "Memuat Kecamatan..." : "Pilih Kecamatan..."}
                        </option>
                        {kecamatanList.map((kec) => (
                          <option key={kec.kode} value={kec.nama}>
                            {kec.nama}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Kode Pos" required>
                      <input
                        type="text"
                        maxLength={5}
                        value={form.kodePos}
                        onChange={(e) => update("kodePos", e.target.value.replace(/\D/g, ""))}
                        className="form-input"
                        placeholder="Kode pos"
                        required
                      />
                    </Field>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Kontak & Media Sosial */}
              {s.id === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-bold text-blue-950 mb-4">
                    Informasi Kontak
                  </h3>

                  <Field label="Email" required>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      className="form-input"
                      placeholder="email@contoh.com"
                    />
                  </Field>

                  <Field label="Nomor WhatsApp" required>
                    <input
                      type="tel"
                      value={form.whatsapp}
                      onChange={(e) => update("whatsapp", e.target.value.replace(/\D/g, ""))}
                      className="form-input"
                      placeholder="08xxxxxxxxxx (Aktif & Valid)"
                    />
                  </Field>

                  <Field label="Motivasi Bergabung dengan KIPAN">
                    <textarea
                      value={form.motivasi}
                      onChange={(e) => update("motivasi", e.target.value)}
                      className="form-input"
                      rows={5}
                      placeholder="Ceritakan motivasi Anda bergabung dengan KIPAN..."
                    />
                  </Field>

                  {/* Upload dokumen — 5 dokumen wajib */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      Upload Dokumen Persyaratan
                    </label>
                    <p className="text-xs text-slate-500 mb-3">
                      Format: JPG, PNG, PDF (max 2MB per file)
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        { key: "ktp", label: "KTP", icon: IdCard },
                        { key: "foto", label: "Pas Foto", icon: User },
                        { key: "cv", label: "CV/Resume", icon: FileText },
                        { key: "sk", label: "SK (Surat Keputusan)", icon: FileText },
                        { key: "suratPernyataan", label: "Surat Pernyataan", icon: ScrollText },
                        { key: "suratSehat", label: "Surat Sehat", icon: HeartPulse },
                      ].map((doc) => {
                        const Icon = doc.icon;
                        const value = (form as any)[doc.key] as string | undefined;
                        return (
                          <div key={doc.key} className={`p-3 rounded-xl border-2 transition-all ${value ? "border-emerald-300 bg-emerald-50/50" : "border-slate-200 bg-white"}`}>
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${value ? "bg-emerald-100" : "bg-sky-100"}`}>
                                <Icon className={`w-4 h-4 ${value ? "text-emerald-600" : "text-sky-600"}`} />
                              </div>
                              <span className="text-xs font-semibold text-slate-700">{doc.label}</span>
                              {value && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />}
                            </div>
                            <input
                              type="file"
                              accept={
                                doc.key === "foto" ? "image/jpeg,image/png,image/jpg" :
                                doc.key === "ktp" ? "image/jpeg,image/png,image/jpg,.pdf" :
                                ".pdf"
                              }
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                if (file.size > 1024 * 1024 * 2) {
                                  alert("File maksimal 2MB");
                                  return;
                                }
                                const reader = new FileReader();
                                reader.onload = () => {
                                  setForm((prev) => ({ ...prev, [doc.key]: reader.result as string }));
                                };
                                reader.readAsDataURL(file);
                              }}
                              className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                            />
                            {value && (
                              <div className="flex items-center gap-2 mt-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const w = window.open();
                                    if (w) {
                                      if (value.startsWith("data:image/")) {
                                        w.document.write(`<html><head><title>${doc.label}</title></head><body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#1e293b"><img src="${value}" style="max-width:100%;max-height:100vh;object-fit:contain" /></body></html>`);
                                      } else if (value.startsWith("data:application/pdf")) {
                                        w.document.write(`<html><head><title>${doc.label}</title></head><body style="margin:0"><iframe src="${value}" style="width:100vw;height:100vh;border:0"></iframe></body></html>`);
                                      } else {
                                        w.document.write(`<html><head><title>${doc.label}</title></head><body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh"><a href="${value}" download="${doc.label}" style="padding:12px 24px;background:#0ea5e9;color:white;text-decoration:none;border-radius:8px">Download ${doc.label}</a></body></html>`);
                                      }
                                      w.document.close();
                                    }
                                  }}
                                  className="text-[10px] text-blue-600 hover:text-blue-700 underline"
                                >
                                  Lihat
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setForm((prev) => ({ ...prev, [doc.key]: undefined }))}
                                  className="text-[10px] text-rose-500 hover:text-rose-700 underline"
                                >
                                  Hapus
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Persyaratan */}
              {s.id === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-bold text-blue-950 mb-2">
                    Persyaratan Kepengurusan
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Centang seluruh persyaratan di bawah ini untuk melanjutkan.
                  </p>

                  <div className="space-y-3">
                    {persyaratan.map((p, idx) => {
                      const Icon = PERSYARATAN_ICONS[p.icon] || CheckCircle2;
                      const checked = form.persyaratan[idx];
                      return (
                        <motion.label
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            checked
                              ? "border-sky-400 bg-sky-50"
                              : "border-slate-200 hover:border-sky-300"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...form.persyaratan];
                              next[idx] = !next[idx];
                              update("persyaratan", next);
                            }}
                            className={`shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                              checked
                                ? "bg-sky-500 border-sky-500"
                                : "border-slate-300"
                            }`}
                          >
                            {checked && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </button>
                          <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-slate-800 text-sm">
                              {p.title}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {p.desc}
                            </div>
                          </div>
                        </motion.label>
                      );
                    })}
                  </div>

                  {!allPersyaratanChecked && (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                      ⚠️ Semua persyaratan harus dicentang untuk melanjutkan ke tahap konfirmasi.
                    </p>
                  )}
                </motion.div>
              )}

              {/* STEP 4: Konfirmasi */}
              {s.id === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <h3 className="text-xl font-bold text-blue-950 mb-4">
                    Konfirmasi Data
                  </h3>

                  <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 space-y-3">
                    <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                      Data Diri
                    </div>
                    <Row label="Nama" value={form.namaLengkap} />
                    <Row label="NIK" value={form.nik} />
                    <Row label="TTL" value={`${form.tempatLahir}, ${form.tanggalLahir}`} />
                    <Row label="Jenis Kelamin" value={form.jenisKelamin === "L" ? "Laki-laki" : form.jenisKelamin === "P" ? "Perempuan" : "-"} />
                    <Row label="Alamat" value={`${form.alamat}, ${form.kecamatan}, ${form.kabupaten}, ${form.provinsi} ${form.kodePos}`} />
                  </div>

                  <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 space-y-3">
                    <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                      Kontak
                    </div>
                    <Row label="Email" value={form.email} />
                    <Row label="WhatsApp" value={form.whatsapp} />
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <p className="text-xs text-amber-800 leading-relaxed">
                      <strong>Pernyataan:</strong> Saya menyatakan bahwa data yang
                      saya isi adalah benar dan dapat dipertanggungjawabkan. Saya
                      bersedia mengikuti seluruh rangkaian verifikasi dan pelatihan
                      yang diselenggarakan KIPAN.
                    </p>
                  </div>
                </motion.div>
              )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Submit Button Section */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 overflow-hidden shadow-xl p-6 sm:p-10">
            <div className="flex flex-col items-center text-center max-w-md mx-auto">
              <h3 className="text-xl font-bold text-blue-950 mb-3">
                Kirim Pendaftaran
              </h3>
              <p className="text-sm text-slate-600 mb-8">
                Pastikan seluruh data yang Anda isikan sudah benar dan sesuai dengan identitas resmi.
              </p>
              
              {submitError && (
                <div className="w-full text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6 text-left flex items-start gap-3">
                  <span className="text-xl leading-none">⚠️</span>
                  <span>{submitError}</span>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting || !allPersyaratanChecked}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-lg rounded-2xl shadow-[0_8px_30px_rgb(14,165,233,0.3)] hover:shadow-[0_8px_30px_rgb(14,165,233,0.5)] hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memproses Data...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Kirim Pendaftaran
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Inline style for form inputs */}
      <style jsx global>{`
        .form-input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          font-size: 16px; /* 16px on mobile prevents iOS Safari auto-zoom! */
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          background: white;
          outline: none;
          transition: all 0.2s;
          -webkit-appearance: none;
        }
        @media (min-width: 640px) {
          .form-input {
            font-size: 0.875rem;
          }
        }
        .form-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }
      `}</style>
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="text-slate-500 min-w-[100px]">{label}</span>
      <span className="text-slate-800 font-medium flex-1">{value || "-"}</span>
    </div>
  );
}
