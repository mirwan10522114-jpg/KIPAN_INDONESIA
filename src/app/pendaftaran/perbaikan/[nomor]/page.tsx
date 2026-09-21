import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import PerbaikanDataForm from "@/components/sections/PerbaikanDataForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Perbaikan Data Pendaftaran | KIPAN",
  description: "Formulir perbaikan data pendaftaran KIPAN",
};

export default async function PerbaikanPage({ params }: { params: Promise<{ nomor: string }> }) {
  const { nomor } = await params;
  
  if (!nomor) {
    return notFound();
  }

  const pendaftaran = await db.pendaftaran.findUnique({
    where: { nomorPendaftaran: nomor.trim().toUpperCase() },
    include: {
      provinsi: true,
      kabupaten: true
    }
  });

  if (!pendaftaran) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Data Tidak Ditemukan</h1>
        <p className="text-slate-600 mb-6">Nomor pendaftaran {nomor} tidak ditemukan dalam sistem.</p>
        <Link href="/pendaftaran" className="text-blue-600 hover:underline">
          Kembali ke halaman pendaftaran
        </Link>
      </div>
    );
  }

  if (pendaftaran.status !== "PERBAIKAN") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Akses Ditolak</h1>
        <p className="text-slate-600 mb-6">
          Pendaftaran Anda saat ini berstatus <strong>{pendaftaran.status}</strong>, 
          bukan PERBAIKAN. Anda tidak dapat mengubah data saat ini.
        </p>
        <Link href="/pendaftaran#lacak-pendaftaran" className="text-blue-600 hover:underline">
          Lacak Status Pendaftaran
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/pendaftaran#lacak-pendaftaran" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Kembali ke Pelacakan
          </Link>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-bold text-amber-800 mb-2">Form Perbaikan Data</h2>
          <p className="text-sm text-amber-700 leading-relaxed mb-4">
            Silakan perbaiki data atau dokumen Anda sesuai dengan catatan dari Admin di bawah ini. Anda hanya perlu memperbarui bagian yang bermasalah. Dokumen yang tidak diubah akan tetap menggunakan versi sebelumnya.
          </p>
          <div className="bg-white rounded-xl p-4 border border-amber-200/60">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Catatan Admin:</div>
            <div className="text-sm font-medium text-slate-800 whitespace-pre-wrap">{pendaftaran.catatan || "-"}</div>
          </div>
        </div>

        <PerbaikanDataForm initialData={pendaftaran} />
      </div>
    </div>
  );
}
