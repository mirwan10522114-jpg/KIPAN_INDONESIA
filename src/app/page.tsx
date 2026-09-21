import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import StrukturOrganisasi from "@/components/sections/StrukturOrganisasi";
import Services from "@/components/sections/Services";
import TargetMarket from "@/components/sections/TargetMarket";
import Testimonials from "@/components/sections/Testimonials";
import BeritaUmum from "@/components/sections/BeritaUmum";
import Footer from "@/components/sections/Footer";
import FloatingWhatsApp from "@/components/sections/FloatingWhatsApp";
import AdminPanel from "@/components/admin/AdminPanel";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <About />
        <StrukturOrganisasi />
        <Testimonials />
        <TargetMarket />
        <BeritaUmum />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <AdminPanel />
    </div>
  );
}
