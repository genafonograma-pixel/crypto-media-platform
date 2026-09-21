import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#F5F5F5] font-sans">
      <SEO title="Terms of Service | Wild West Crypto Show" description="Wild West Crypto Show Terms of Service — the rules and conditions for using our platform." />
      <Header />
      <main className="flex-1 max-w-[800px] w-full mx-auto px-4 py-12">
        <nav className="flex items-center gap-2 text-xs text-[#555] mb-8">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#888]">Terms of Service</span>
        </nav>
        <h1 className="text-4xl font-black mb-6 text-white">Terms of Service</h1>
        <p className="text-[#555] text-sm mb-8">Last updated: {new Date().getFullYear()}</p>
        <div className="prose prose-invert prose-p:text-[#CCC] prose-p:leading-relaxed max-w-none">
          <p>By using Wild West Crypto Show ("the Service"), you agree to these Terms of Service. Please read them carefully.</p>
          <h3>No Financial Advice</h3>
          <p>All content on Wild West Crypto Show is for informational purposes only. Nothing on this site constitutes financial, investment, legal, or tax advice. Cryptocurrency markets are volatile and high-risk. Always conduct your own research and consult a qualified professional before making investment decisions.</p>
          <h3>Content Accuracy</h3>
          <p>While we strive for accuracy, Wild West Crypto Show does not guarantee the completeness or accuracy of AI-generated summaries or market data. Always verify critical information with primary sources.</p>
          <h3>Intellectual Property</h3>
          <p>Content produced by Wild West Crypto Show's AI system is the property of Wild West Crypto Show. Third-party article summaries are provided under fair use and are clearly attributed to their original sources.</p>
          <h3>Contact</h3>
          <p>For terms-related questions, contact <a href="mailto:info@wildwestcryptoshow.com" className="text-[#F4A917] hover:underline">info@wildwestcryptoshow.com</a>.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
