import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustStrip from "@/components/TrustStrip";
import ProductsSection from "@/components/ProductsSection";
import PlatformSection from "@/components/PlatformSection";
import HowItWorks from "@/components/HowItWorks";
import DeveloperSection from "@/components/DeveloperSection";
import SecuritySection from "@/components/SecuritySection";
import Testimonials from "@/components/Testimonials";
import Faq from "@/components/Faq";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustStrip />
        <ProductsSection />
        <PlatformSection />
        <HowItWorks />
        <DeveloperSection />
        <SecuritySection />
        <Testimonials />
        <Faq />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
