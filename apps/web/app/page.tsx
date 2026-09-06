'use client';
import { useState } from 'react';
import AnnouncementBar from '../components/landing/AnnouncementBar';
import Navbar from '../components/landing/Navbar';
import HeroSection from '../components/landing/HeroSection';
import ClientSlider from '../components/landing/ClientSlider';
import FourStageWorkflow from '../components/landing/FourStageWorkflow';
import ThreeTools from '../components/landing/ThreeTools';
import RealVoices from '../components/landing/RealVoices';
import FAQSection from '../components/landing/FAQSection';
import BlogSection from '../components/landing/BlogSection';
import CommonCTA from '../components/landing/CommonCTA';
import Footer from '../components/landing/Footer';
import FreeTrialModal from '../components/landing/FreeTrialModal';

export default function Home() {
  const [isTrialOpen, setIsTrialOpen] = useState(false);

  const openTrial = () => setIsTrialOpen(true);
  const closeTrial = () => setIsTrialOpen(false);

  return (
    <main className="min-h-screen bg-white text-[#1c1f27]">
      {/* Top Announcement Bar */}
      <AnnouncementBar />

      {/* Main Navigation Header */}
      <Navbar onOpenTrial={openTrial} />

      {/* Hero Section */}
      <HeroSection onOpenTrial={openTrial} />

      {/* Client Logos Marquee */}
      <ClientSlider />

      {/* 4-Stage Automated Bookkeeping Workflow */}
      <FourStageWorkflow onOpenTrial={openTrial} />

      {/* Three Interconnected Power Tools */}
      <ThreeTools onOpenTrial={openTrial} />

      {/* Real Voices & Performance Results */}
      <RealVoices onOpenTrial={openTrial} />

      {/* Frequently Asked Questions */}
      <FAQSection />

      {/* Industry Trends and Expert Blog */}
      <BlogSection onOpenTrial={openTrial} />

      {/* Call to Action Banner */}
      <CommonCTA onOpenTrial={openTrial} />

      {/* Comprehensive Footer */}
      <Footer onOpenTrial={openTrial} />

      {/* Free Trial / Lead Modal */}
      <FreeTrialModal isOpen={isTrialOpen} onClose={closeTrial} />
    </main>
  );
}
