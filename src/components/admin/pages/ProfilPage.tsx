"use client";

import { Building2, Save } from "lucide-react";

export default function ProfilPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-blue-950">Profil Organisasi</h1>
        <p className="text-slate-500 text-sm mt-1">Edit informasi profil organisasi KIPAN</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-3xl">
        {/* Logo */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center shadow-lg">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-blue-950">Logo Organisasi</div>
            <div className="text-xs text-slate-500 mt-0.5">PNG/JPG, max 1MB, ukuran 1:1</div>
            <button className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700">Ubah Logo</button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nama Organisasi" value="KIPAN Indonesia" />
          <Field label="Nama Lengkap" value="Kader Inti Pemuda Anti Narkoba" />
          <Field label="Tagline" value="Pemuda Indonesia Bersih dari Narkoba" />
          <Field label="Tahun Berdiri" value="2020" />
          <Field label="Email" value="sekretariat@kipan.id" type="email" />
          <Field label="Telepon" value="021-0000-0000" />
          <Field label="Instagram" value="@kipan.indonesia" />
          <Field label="Website" value="kipan.id" />
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Alamat Sekretariat</label>
            <textarea
              rows={2}
              defaultValue="Sekretariat KIPAN Pusat, Jakarta, Indonesia"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 resize-y"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Deskripsi Organisasi</label>
            <textarea
              rows={4}
              defaultValue="KIPAN (Kader Inti Pemuda Anti Narkoba) adalah komunitas dan program pembinaan pemuda yang dibentuk untuk mencegah penyalahgunaan narkoba di Indonesia."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500 resize-y"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
          <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Batal</button>
          <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">
            <Save className="w-4 h-4" /> Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, type = "text" }: { label: string; value: string; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
      <input
        type={type}
        defaultValue={value}
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-500"
      />
    </div>
  );
}
