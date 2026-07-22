import Navbar from "@/components/sections/Navbar";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import LeaderMessage from "@/components/sections/LeaderMessage";
import Services from "@/components/sections/Services";
import TargetMarket from "@/components/sections/TargetMarket";
import Gallery from "@/components/sections/Gallery";
import Products from "@/components/sections/Products";
import Testimonials from "@/components/sections/Testimonials";
import CTASection from "@/components/sections/CTASection";
import Contact from "@/components/sections/Contact";
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
        <LeaderMessage />
        <Services />
        <TargetMarket />
        <Gallery />
        <Products />
        <Testimonials />
        <CTASection />
        <Contact />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <AdminPanel />
    </div>
  );
}
