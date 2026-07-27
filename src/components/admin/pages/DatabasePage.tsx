"use client";

import { useState, useEffect } from "react";
import { Database, Table, RefreshCw, Copy, Check } from "lucide-react";

interface TableInfo {
  name: string;
  count: number;
  columns: { name: string; type: string }[];
  sampleData?: any[];
}

const SCHEMA_INFO: Record<string, { name: string; description: string; columns: { name: string; type: string; description?: string }[] }> = {
  users: {
    name: "users",
    description: "Tabel user untuk autentikasi (admin, anggota, calon anggota)",
    columns: [
      { name: "id", type: "String (cuid)", description: "Primary key" },
      { name: "email", type: "String", description: "Email unik untuk login" },
      { name: "passwordHash", type: "String", description: "Password ter-hash (bcrypt)" },
      { name: "name", type: "String", description: "Nama lengkap user" },
      { name: "role", type: "String", description: "SUPER_ADMIN | ADMIN_NASIONAL | ADMIN_PROVINSI | ADMIN_KABUPATEN | ANGGOTA | CALON_ANGGOTA" },
      { name: "avatar", type: "String?", description: "URL foto profil" },
      { name: "anggotaId", type: "Int?", description: "FK ke anggota (jika role=ANGGOTA)" },
      { name: "lastLoginAt", type: "DateTime?", description: "Login terakhir" },
      { name: "createdAt", type: "DateTime", description: "Tanggal dibuat" },
      { name: "updatedAt", type: "DateTime", description: "Tanggal update" },
    ],
  },
  provinsi: {
    name: "provinsi",
    description: "Master data provinsi (38 provinsi Indonesia)",
    columns: [
      { name: "id", type: "Int", description: "Primary key (auto increment)" },
      { name: "kode", type: "String", description: "Kode unik (DKI, JBR, JT, dll)" },
      { name: "nama", type: "String", description: "Nama provinsi" },
      { name: "status", type: "String", description: "Aktif | Pembentukan" },
      { name: "ketua", type: "String?", description: "Nama ketua KIPAN provinsi" },
      { name: "createdAt", type: "DateTime" },
      { name: "updatedAt", type: "DateTime" },
    ],
  },
  kabupaten: {
    name: "kabupaten",
    description: "Master data kabupaten/kota (514 kab/kota)",
    columns: [
      { name: "id", type: "Int" },
      { name: "kode", type: "String", description: "Kode kabupaten (3204, 3174, dll)" },
      { name: "nama", type: "String" },
      { name: "provinsiId", type: "Int", description: "FK ke provinsi" },
      { name: "status", type: "String" },
      { name: "ketua", type: "String?" },
      { name: "createdAt", type: "DateTime" },
      { name: "updatedAt", type: "DateTime" },
    ],
  },
  pendaftaran: {
    name: "pendaftaran",
    description: "Data pendaftaran calon anggota",
    columns: [
      { name: "id", type: "Int" },
      { name: "namaLengkap", type: "String" },
      { name: "nik", type: "String", description: "NIK 16 digit" },
      { name: "tempatLahir", type: "String" },
      { name: "tanggalLahir", type: "DateTime" },
      { name: "jenisKelamin", type: "String", description: "L | P" },
      { name: "agama", type: "String?" },
      { name: "pendidikan", type: "String?" },
      { name: "pekerjaan", type: "String?" },
      { name: "alamat", type: "String" },
      { name: "provinsiId", type: "Int", description: "FK provinsi" },
      { name: "kabupatenId", type: "Int", description: "FK kabupaten" },
      { name: "kecamatan", type: "String?" },
      { name: "desa", type: "String?" },
      { name: "kodePos", type: "String?" },
      { name: "email", type: "String" },
      { name: "hp", type: "String" },
      { name: "whatsapp", type: "String?" },
      { name: "motivasi", type: "String?" },
      { name: "foto", type: "String?" },
      { name: "ktp", type: "String?" },
      { name: "cv", type: "String?" },
      { name: "suratPernyataan", type: "String?" },
      { name: "suratSehat", type: "String?" },
      { name: "persyaratan", type: "String", description: "JSON array checklist" },
      { name: "status", type: "String", description: "DRAFT | DIAJUKAN | DIVERIFIKASI | DISETUJUI | DITOLAK | PERBAIKAN" },
      { name: "catatan", type: "String?", description: "Catatan dari admin" },
      { name: "createdAt", type: "DateTime" },
      { name: "updatedAt", type: "DateTime" },
    ],
  },
  pendaftaran_riwayat: {
    name: "pendaftaran_riwayat",
    description: "Riwayat perubahan status pendaftaran (audit log)",
    columns: [
      { name: "id", type: "Int" },
      { name: "pendaftaranId", type: "Int", description: "FK pendaftaran" },
      { name: "aksi", type: "String", description: "Deskripsi aksi" },
      { name: "oleh", type: "String", description: "Pelaku (Calon Anggota, Admin, Sistem)" },
      { name: "catatan", type: "String?" },
      { name: "createdAt", type: "DateTime" },
    ],
  },
  anggota: {
    name: "anggota",
    description: "Data anggota KIPAN yang sudah disetujui",
    columns: [
      { name: "id", type: "Int" },
      { name: "nia", type: "String", description: "Nomor Induk Anggota, format: KIPAN-PROVKODE-KABKODE-YEAR-SEQ" },
      { name: "namaLengkap", type: "String" },
      { name: "nik", type: "String" },
      { name: "tempatLahir", type: "String" },
      { name: "tanggalLahir", type: "DateTime" },
      { name: "jenisKelamin", type: "String" },
      { name: "agama", type: "String?" },
      { name: "pendidikan", type: "String?" },
      { name: "pekerjaan", type: "String?" },
      { name: "alamat", type: "String" },
      { name: "provinsiId", type: "Int" },
      { name: "kabupatenId", type: "Int" },
      { name: "kecamatan", type: "String?" },
      { name: "desa", type: "String?" },
      { name: "kodePos", type: "String?" },
      { name: "email", type: "String" },
      { name: "hp", type: "String" },
      { name: "whatsapp", type: "String?" },
      { name: "foto", type: "String?" },
      { name: "status", type: "String", description: "AKTIF | NONAKTIF | MENGUNDURKAN_DIRI | DIBERHENTIKAN | MENINGGAL" },
      { name: "angkatan", type: "String?" },
      { name: "tanggalDaftar", type: "DateTime" },
      { name: "tanggalAngkat", type: "DateTime?" },
      { name: "userId", type: "String?", description: "FK user (untuk login anggota)" },
      { name: "createdAt", type: "DateTime" },
      { name: "updatedAt", type: "DateTime" },
    ],
  },
  pengurus: {
    name: "pengurus",
    description: "Data pengurus KIPAN (Nasional, Provinsi, Kabupaten)",
    columns: [
      { name: "id", type: "Int" },
      { name: "namaLengkap", type: "String" },
      { name: "jabatan", type: "String" },
      { name: "level", type: "String", description: "NASIONAL | PROVINSI | KABUPATEN | KECAMATAN" },
      { name: "provinsiId", type: "Int?" },
      { name: "kabupatenId", type: "Int?" },
      { name: "foto", type: "String?" },
      { name: "email", type: "String" },
      { name: "hp", type: "String?" },
      { name: "status", type: "String", description: "Aktif | Nonaktif" },
      { name: "tanggalMulai", type: "DateTime" },
      { name: "tanggalSelesai", type: "DateTime?" },
      { name: "createdAt", type: "DateTime" },
      { name: "updatedAt", type: "DateTime" },
    ],
  },
  berita: {
    name: "berita",
    description: "CMS berita & artikel",
    columns: [
      { name: "id", type: "Int" },
      { name: "judul", type: "String" },
      { name: "slug", type: "String", description: "URL slug unik" },
      { name: "kategori", type: "String", description: "Nasional | Provinsi | Kabupaten" },
      { name: "excerpt", type: "String", description: "Ringkasan" },
      { name: "konten", type: "String", description: "Isi lengkap" },
      { name: "thumbnail", type: "String?" },
      { name: "penulis", type: "String" },
      { name: "status", type: "String", description: "Draft | Published" },
      { name: "publishedAt", type: "DateTime?" },
      { name: "createdAt", type: "DateTime" },
      { name: "updatedAt", type: "DateTime" },
    ],
  },
  galeri: {
    name: "galeri",
    description: "CMS galeri foto",
    columns: [
      { name: "id", type: "Int" },
      { name: "judul", type: "String" },
      { name: "album", type: "String?" },
      { name: "foto", type: "String", description: "URL foto" },
      { name: "lokasi", type: "String?" },
      { name: "kategori", type: "String", description: "Kegiatan | Pelatihan | Sosialisasi | Rapat | Kampanye" },
      { name: "createdAt", type: "DateTime" },
      { name: "updatedAt", type: "DateTime" },
    ],
  },
  program_kerja: {
    name: "program_kerja",
    description: "Program kerja KIPAN",
    columns: [
      { name: "id", type: "Int" },
      { name: "nama", type: "String" },
      { name: "deskripsi", type: "String?" },
      { name: "tingkat", type: "String", description: "Nasional | Provinsi | Kabupaten" },
      { name: "pic", type: "String?", description: "Penanggung jawab" },
      { name: "tanggalMulai", type: "DateTime" },
      { name: "tanggalSelesai", type: "DateTime?" },
      { name: "status", type: "String", description: "Direncanakan | Berjalan | Selesai" },
      { name: "createdAt", type: "DateTime" },
      { name: "updatedAt", type: "DateTime" },
    ],
  },
  profil_organisasi: {
    name: "profil_organisasi",
    description: "Profil organisasi KIPAN (settings)",
    columns: [
      { name: "id", type: "Int" },
      { name: "nama", type: "String" },
      { name: "namaLengkap", type: "String" },
      { name: "tagline", type: "String?" },
      { name: "logo", type: "String?" },
      { name: "email", type: "String?" },
      { name: "telepon", type: "String?" },
      { name: "alamat", type: "String?" },
      { name: "instagram", type: "String?" },
      { name: "website", type: "String?" },
      { name: "deskripsi", type: "String?" },
      { name: "updatedAt", type: "DateTime" },
    ],
  },
};

export default function DatabasePage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [activeTable, setActiveTable] = useState<string>("pendaftaran");
  const [copied, setCopied] = useState(false);

  const fetchCounts = async () => {
    setLoading(true);
    try {
      const [dash, pend, ang, peng, wil, ber, gal, prog] = await Promise.all([
        fetch("/api/dashboard", { cache: "no-store" }).then(r => r.json()),
        fetch("/api/pendaftaran", { cache: "no-store" }).then(r => r.json()),
        fetch("/api/anggota", { cache: "no-store" }).then(r => r.json()),
        fetch("/api/pengurus", { cache: "no-store" }).then(r => r.json()),
        fetch("/api/wilayah", { cache: "no-store" }).then(r => r.json()),
        fetch("/api/berita", { cache: "no-store" }).then(r => r.json()),
        fetch("/api/galeri", { cache: "no-store" }).then(r => r.json()),
        fetch("/api/program", { cache: "no-store" }).then(r => r.json()),
      ]);
      setCounts({
        users: 5,
        provinsi: dash.data?.stats?.totalProvinsi || 0,
        kabupaten: dash.data?.stats?.totalKabupaten || 0,
        pendaftaran: pend.total || 0,
        pendaftaran_riwayat: 0,
        anggota: ang.total || 0,
        pengurus: peng.total || 0,
        berita: ber.total || 0,
        galeri: gal.total || 0,
        program_kerja: prog.total || 0,
        profil_organisasi: 1,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  const copySchema = () => {
    const schemaText = Object.values(SCHEMA_INFO)
      .map(t => `-- ${t.name}: ${t.description}\n-- Columns: ${t.columns.map(c => c.name).join(", ")}`)
      .join("\n\n");
    navigator.clipboard.writeText(schemaText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalRecords = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Struktur Database</h1>
          <p className="text-slate-500 text-sm mt-1">
            Lihat struktur tabel database SIM-KIPAN (Prisma + SQLite)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copySchema}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? "Tersalin!" : "Copy Schema"}
          </button>
          <button
            onClick={fetchCounts}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Database info */}
      <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-blue-950">Konfigurasi Database</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-sm">
              <div>
                <div className="text-xs text-slate-500">Provider</div>
                <div className="font-semibold text-blue-950">SQLite</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">File</div>
                <div className="font-semibold text-blue-950 text-xs">db/custom.db</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">ORM</div>
                <div className="font-semibold text-blue-950">Prisma 6.19</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Total Records</div>
                <div className="font-semibold text-blue-950">{totalRecords}</div>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-3">
              💡 Database ini bukan localStorage — data tersimpan permanen di file <code className="bg-white px-1.5 py-0.5 rounded font-mono text-blue-700">db/custom.db</code> dan bisa di-migrate ke PostgreSQL/MySQL untuk production.
              Schema lengkap ada di <code className="bg-white px-1.5 py-0.5 rounded font-mono text-blue-700">prisma/schema.prisma</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Tables overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.entries(SCHEMA_INFO).map(([key, table]) => (
          <button
            key={key}
            onClick={() => setActiveTable(key)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              activeTable === key
                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
            }`}
          >
            <Table className={`w-5 h-5 mb-2 ${activeTable === key ? "text-white" : "text-blue-600"}`} />
            <div className="text-xs font-bold truncate">{table.name}</div>
            <div className={`text-2xl font-bold mt-1 ${activeTable === key ? "text-white" : "text-blue-950"}`}>
              {counts[key] ?? "-"}
            </div>
            <div className={`text-[10px] ${activeTable === key ? "text-blue-100" : "text-slate-500"}`}>
              records
            </div>
          </button>
        ))}
      </div>

      {/* Active table detail */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Table className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-blue-950 font-mono">{SCHEMA_INFO[activeTable].name}</h3>
            <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded-full">
              {SCHEMA_INFO[activeTable].columns.length} columns
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">{SCHEMA_INFO[activeTable].description}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Column</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {SCHEMA_INFO[activeTable].columns.map((col, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-mono font-semibold text-blue-950">{col.name}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-0.5 rounded font-mono text-xs bg-violet-50 text-violet-700">
                      {col.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{col.description || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Relational diagram (text) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h3 className="font-bold text-blue-950 mb-4">Relasi Antar Tabel</h3>
        <pre className="text-xs bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto font-mono leading-relaxed">
{`users (1) ────────────── (1) anggota
                              │
                              ├── (N) → provinsi (1)
                              └── (N) → kabupaten (1)

provinsi (1) ──── (N) kabupaten
    │                    │
    ├── (N) pengurus     ├── (N) pengurus
    ├── (N) pendaftaran  └── (N) pendaftaran
    └── (N) anggota           │
                             └── (N) pendaftaran_riwayat

pendaftaran ──(DISETUJUI)──→ anggota (auto-create NIP)
                             Format NIP: KIPAN-PROVKODE-KABKODE-YEAR-SEQ
                             Contoh: KIPAN-JBR-3204-2026-00012

berita, galeri, program_kerja, profil_organisasi → tabel independen (CMS)`}
        </pre>
      </div>

      {/* Quick actions */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5">
        <h3 className="font-bold text-amber-900 mb-2">🚀 Cara Akses Database Langsung</h3>
        <div className="space-y-2 text-sm text-amber-800">
          <p><strong>1. Via Prisma Studio</strong> (GUI database browser):</p>
          <pre className="bg-white p-2 rounded font-mono text-xs">bunx prisma studio</pre>
          <p className="mt-2"><strong>2. Via SQLite CLI</strong>:</p>
          <pre className="bg-white p-2 rounded font-mono text-xs">sqlite3 db/custom.db
.tables
SELECT * FROM anggota;
SELECT * FROM pendaftaran;</pre>
          <p className="mt-2"><strong>3. File database</strong>: <code className="bg-white px-1.5 py-0.5 rounded font-mono">db/custom.db</code></p>
          <p className="mt-2"><strong>4. Schema</strong>: <code className="bg-white px-1.5 py-0.5 rounded font-mono">prisma/schema.prisma</code></p>
        </div>
      </div>
    </div>
  );
}
