"use client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import HumanizerTool from "@/components/home/HumanizerTool";
import HowItWorks from "@/components/home/HowItWorks";
import Features from "@/components/home/Features";
import Testimonials from "@/components/home/Testimonials";
import FAQ from "@/components/home/FAQ";
import CTABanner from "@/components/home/CTABanner";
import AIDetectors from "@/components/home/AIDetectors";
import TrustedInstitutions from "@/components/home/TrustedInstitutions";
import ParticleBackground from "@/components/home/ParticleBackground";
import AnnouncementBar from "@/components/home/AnnouncementBar";
import BeforeAfterShowcase from "@/components/home/BeforeAfterShowcase";
const Home = () => {
  return (
    <div className="min-h-screen bg-background relative">
      <ParticleBackground />
      <AnnouncementBar />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <HumanizerTool />
        <BeforeAfterShowcase />
        <HowItWorks />
        <AIDetectors />
        <Features />
        <TrustedInstitutions />
        <Testimonials />
        <FAQ />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
