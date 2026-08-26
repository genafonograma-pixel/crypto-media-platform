import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#F5F5F5] font-sans">
      <SEO title="About Crypton | Crypto News & Market Intelligence" description="About Crypton — AI-powered cryptocurrency news and market intelligence platform." />
      <Header />
      <main className="flex-1 max-w-[800px] w-full mx-auto px-4 py-12">
        <nav className="flex items-center gap-2 text-xs text-[#555] mb-8">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#888]">About</span>
        </nav>
        <h1 className="text-4xl font-black mb-6 text-white">About Crypton</h1>
        <div className="prose prose-invert prose-p:text-[#CCC] prose-p:leading-relaxed max-w-none">
          <p>Crypton is an AI-powered cryptocurrency news and market intelligence platform. We aggregate, analyze, and synthesize information from across the crypto ecosystem to give readers a clear, unbiased view of what is happening in digital asset markets.</p>
          <p>Our platform monitors dozens of leading crypto and financial news sources, clusters related stories to eliminate duplication, and uses advanced AI to explain the significance of major developments — without sensationalism or financial advice.</p>
          <h3>Our Mission</h3>
          <p>To be the most useful Bitcoin and cryptocurrency information hub on the internet. Not just another news aggregator — but a continuous intelligence feed that helps readers understand what is actually happening and why it matters.</p>
          <h3>How We Work</h3>
          <p>See our <Link to="/methodology" className="text-[#3B82F6] hover:underline">AI Methodology page</Link> for a detailed explanation of how Crypton ingests, processes, and presents information.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
