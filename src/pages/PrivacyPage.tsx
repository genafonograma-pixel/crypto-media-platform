import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#F5F5F5] font-sans">
      <SEO title="Privacy Policy | Crypton" description="Crypton Privacy Policy — how we collect, use, and protect your data." />
      <Header />
      <main className="flex-1 max-w-[800px] w-full mx-auto px-4 py-12">
        <nav className="flex items-center gap-2 text-xs text-[#555] mb-8">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#888]">Privacy Policy</span>
        </nav>
        <h1 className="text-4xl font-black mb-6 text-white">Privacy Policy</h1>
        <p className="text-[#555] text-sm mb-8">Last updated: {new Date().getFullYear()}</p>
        <div className="prose prose-invert prose-p:text-[#CCC] prose-p:leading-relaxed max-w-none">
          <p>This Privacy Policy describes how Crypton ("we", "us", or "our") collects, uses, and protects information when you use our website.</p>
          <h3>Information We Collect</h3>
          <p>We may collect anonymous usage data (page views, referral sources) via standard analytics tools to improve our service. We do not sell personal data to third parties.</p>
          <h3>Cookies</h3>
          <p>We use cookies for analytics and to improve user experience. By continuing to use our site, you consent to our use of cookies.</p>
          <h3>Third-Party Services</h3>
          <p>We use third-party services including TradingView (charts) and advertising partners. These services have their own privacy policies.</p>
          <h3>Contact</h3>
          <p>For privacy-related questions, contact <a href="mailto:hello@crypton.news" className="text-[#3B82F6] hover:underline">hello@crypton.news</a>.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
