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
  desa: string;
  kodePos: string;
  // Kontak
  email: string;
  nomorHP: string;
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
}

const STEPS = [
  { id: 1, label: "Data Diri", icon: User },
  { id: 2, label: "Kontak", icon: Mail },
  { id: 3, label: "Persyaratan", icon: CheckCircle2 },
  { id: 4, label: "Konfirmasi", icon: Send },
];

export default function PendaftaranAnggota() {
  const persyaratan = useContentStore((s) => s.persyaratan);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
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
    desa: "",
    kodePos: "",
    email: "",
    nomorHP: "",
    whatsapp: "",
    persyaratan: persyaratan.map(() => false),
    motivasi: "",
  });

  const update = (field: keyof FormData, value: string | boolean[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, STEPS.length));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      // Validasi semua field biodata & kontak wajib
      const requiredFields = [
        { key: "namaLengkap", label: "Nama Lengkap" },
        { key: "nik", label: "NIK" },
        { key: "tempatLahir", label: "Tempat Lahir" },
        { key: "tanggalLahir", label: "Tanggal Lahir" },
        { key: "jenisKelamin", label: "Jenis Kelamin" },
        { key: "alamat", label: "Alamat" },
        { key: "provinsi", label: "Provinsi" },
        { key: "kabupaten", label: "Kabupaten/Kota" },
        { key: "email", label: "Email" },
        { key: "nomorHP", label: "Nomor HP" },
        { key: "whatsapp", label: "WhatsApp" },
      ] as const;
      for (const f of requiredFields) {
        const val = form[f.key];
        if (!val || !String(val).trim()) {
          setSubmitError(`${f.label} wajib diisi`);
          setSubmitting(false);
          // Navigate to step 1 if biodata field, step 2 if kontak
          const step1Fields = ["namaLengkap", "nik", "tempatLahir", "tanggalLahir", "jenisKelamin", "alamat", "provinsi", "kabupaten"];
          if (step1Fields.includes(f.key)) setStep(1);
          else setStep(2);
          return;
        }
      }
      // Validasi semua persyaratan harus dicentang
      if (!form.persyaratan.every(Boolean)) {
        setSubmitError("Semua persyaratan kepengurusan harus dicentang");
        setStep(3);
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
        provinsiId: form.provinsi, // akan di-map ke id di API jika perlu
        kabupatenId: form.kabupaten,
        kecamatan: form.kecamatan,
        desa: form.desa,
        kodePos: form.kodePos,
        email: form.email,
        hp: form.nomorHP,
        whatsapp: form.whatsapp,
        motivasi: form.motivasi,
        persyaratan: form.persyaratan,
        // Dokumen upload (base64 data URL)
        foto: form.foto || null,
        ktp: form.ktp || null,
        cv: form.cv || null,
        suratPernyataan: form.suratPernyataan || null,
        suratSehat: form.suratSehat || null,
      };

      const res = await fetch("/api/pendaftaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Gagal submit pendaftaran");
      }
      setSubmitted(true);
    } catch (e: any) {
      setSubmitError(e.message || "Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
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
          <div className="bg-white rounded-3xl shadow-2xl p-10 border border-sky-100">
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
              Halo <strong>{form.namaLengkap}</strong>, pendaftaran Anda telah kami
              terima. Tim pengurus KIPAN {form.kabupaten || "wilayah Anda"} akan
              memverifikasi berkas dalam 3-5 hari kerja. Anda akan dihubungi via
              WhatsApp <strong>{form.whatsapp}</strong>.
            </p>

            {/* Status preview */}
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 text-left mb-6">
              <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">
                Status Pendaftaran
              </div>
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="w-5 h-5 text-sky-500" />
                <span className="text-sm text-slate-700">Berkas diterima</span>
              </div>
              <div className="flex items-center gap-3 mb-2 opacity-50">
                <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                <span className="text-sm text-slate-500">Verifikasi admin kabupaten</span>
              </div>
              <div className="flex items-center gap-3 opacity-50">
                <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                <span className="text-sm text-slate-500">Jadwal pelatihan</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSubmitted(false);
                setStep(1);
                setForm({
                  ...form,
                  namaLengkap: "",
                  nik: "",
                  // reset other fields
                });
              }}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              ← Kembali ke Form Pendaftaran
            </button>
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

        <div className="max-w-3xl mx-auto">
          {/* Stepper */}
          <div className="flex items-center justify-between mb-8 px-2">
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isCompleted = step > s.id;
              return (
                <div key={s.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center gap-2">
                    <motion.div
                      initial={false}
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        backgroundColor: isCompleted
                          ? "#10b981"
                          : isActive
                          ? "#047857"
                          : "#e2e8f0",
                      }}
                      className={`w-10 h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center shadow-md ${
                        isActive ? "shadow-sky-500/30" : ""
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                      ) : (
                        <Icon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                      )}
                    </motion.div>
                    <span
                      className={`text-[10px] lg:text-xs font-semibold ${
                        isActive ? "text-blue-700" : "text-slate-400"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className="flex-1 h-1 mx-2 rounded-full bg-slate-200 overflow-hidden">
                      <motion.div
                        initial={false}
                        animate={{ width: step > s.id ? "100%" : "0%" }}
                        transition={{ duration: 0.3 }}
                        className="h-full bg-gradient-to-r from-sky-500 to-blue-600"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl shadow-2xl border border-sky-100 p-6 lg:p-10"
          >
            <AnimatePresence mode="wait">
              {/* STEP 1: Data Diri */}
              {step === 1 && (
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
                      onChange={(e) => update("namaLengkap", e.target.value)}
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
                        onChange={(e) => update("tempatLahir", e.target.value)}
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
                    <Field label="Agama">
                      <select
                        value={form.agama}
                        onChange={(e) => update("agama", e.target.value)}
                        className="form-input"
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
                    <Field label="Pendidikan">
                      <select
                        value={form.pendidikan}
                        onChange={(e) => update("pendidikan", e.target.value)}
                        className="form-input"
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
                    <Field label="Pekerjaan">
                      <input
                        type="text"
                        value={form.pekerjaan}
                        onChange={(e) => update("pekerjaan", e.target.value)}
                        className="form-input"
                        placeholder="Pekerjaan"
                      />
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
                    <Field label="Kecamatan">
                      <select
                        value={form.kecamatan}
                        onChange={(e) => update("kecamatan", e.target.value)}
                        disabled={!form.kabupaten}
                        className="form-input disabled:bg-slate-50 disabled:text-slate-400"
                      >
                        <option value="">Pilih Kecamatan...</option>
                        {form.kabupaten && (() => {
                          const prov = MASTER_PROVINSI.find((p) => p.nama === form.provinsi);
                          if (!prov) return null;
                          const kab = MASTER_KABUPATEN.find((k) => k.nama === form.kabupaten && k.provinsiKode === prov.kode);
                          if (!kab) return null;
                          return getKecamatanByKabupaten(kab.kode).map((kec) => (
                            <option key={kec.kode} value={kec.nama}>{kec.nama}</option>
                          ));
                        })()}
                      </select>
                    </Field>
                    <Field label="Kode Pos">
                      <input
                        type="text"
                        maxLength={5}
                        value={form.kodePos}
                        onChange={(e) => update("kodePos", e.target.value.replace(/\D/g, ""))}
                        className="form-input"
                        placeholder="Kode pos"
                      />
                    </Field>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Kontak */}
              {step === 2 && (
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

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Nomor HP" required>
                      <input
                        type="tel"
                        value={form.nomorHP}
                        onChange={(e) => update("nomorHP", e.target.value)}
                        className="form-input"
                        placeholder="08xxxxxxxxxx"
                      />
                    </Field>
                    <Field label="Nomor WhatsApp" required>
                      <input
                        type="tel"
                        value={form.whatsapp}
                        onChange={(e) => update("whatsapp", e.target.value)}
                        className="form-input"
                        placeholder="08xxxxxxxxxx"
                      />
                    </Field>
                  </div>

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
                              accept="image/*,.pdf"
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
              {step === 3 && (
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
              {step === 4 && (
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
                    <Row label="HP" value={form.nomorHP} />
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
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={prevStep}
                disabled={step === 1}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Kembali
              </button>

              {step < STEPS.length ? (
                <button
                  onClick={nextStep}
                  disabled={(step === 3 && !allPersyaratanChecked)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-full shadow-lg shadow-sky-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  Lanjut
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex flex-col items-end gap-2">
                  {submitError && (
                    <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 max-w-xs">
                      ⚠️ {submitError}
                    </div>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-full shadow-lg shadow-sky-500/30 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Kirim Pendaftaran
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Inline style for form inputs */}
      <style jsx global>{`
        .form-input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          background: white;
          outline: none;
          transition: all 0.2s;
        }
        .form-input:focus {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
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
