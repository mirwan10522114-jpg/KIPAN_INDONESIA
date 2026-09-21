import Navbar from "@/components/sections/Navbar";
import PendaftaranAnggota from "@/components/sections/PendaftaranAnggota";
import Footer from "@/components/sections/Footer";
import FloatingWhatsApp from "@/components/sections/FloatingWhatsApp";
import AdminPanel from "@/components/admin/AdminPanel";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pendaftaran Pengurus & Anggota | KIPAN Indonesia",
  description: "Daftar menjadi pengurus atau anggota KIPAN Indonesia.",
};

export default function PendaftaranPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-20">
        <PendaftaranAnggota />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <AdminPanel />
    </div>
  );
}
