/**
 * @file Application router root for TallyBakery public website.
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { ScrollUpButton } from './components/layout/ScrollUpButton';
import { SmoothScrollProvider } from './components/motion/SmoothScroll';
import { ScrollRevealManager } from './components/motion/ScrollReveal';

import { Home } from './pages/Home';
import { About } from './pages/About';
import { Features } from './pages/Features';
import { HowItWorks } from './pages/HowItWorks';
import { Pricing } from './pages/Pricing';
import { Contact } from './pages/Contact';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';

/**
 * @description Master marketing application router providing layout shell and all public website routes.
 * @returns {React.ReactElement} The rendered React tree.
 */
export function App(): React.ReactElement {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <SmoothScrollProvider />
      <ScrollRevealManager />
      <div className="min-h-screen flex flex-col bg-[#F6F3EA] text-[#10201F] selection:bg-[#0B5C63] selection:text-[#F6F3EA] font-sans antialiased">
        {/* Global Navigation Header */}
        <Navbar />

        {/* Main Content View */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/features" element={<Features />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />

        {/* Floating Scroll-Up Button */}
        <ScrollUpButton />
      </div>
    </BrowserRouter>
  );
}

export default App;
