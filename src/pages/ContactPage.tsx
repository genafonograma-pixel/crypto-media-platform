import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#F5F5F5] font-sans">
      <SEO title="Contact Wild West Crypto Show | Get In Touch" description="Contact Wild West Crypto Show for advertising, editorial inquiries, or general information." />
      <Header />
      <main className="flex-1 max-w-[800px] w-full mx-auto px-4 py-12">
        <nav className="flex items-center gap-2 text-xs text-[#555] mb-8">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#888]">Contact</span>
        </nav>
        <h1 className="text-4xl font-black mb-6 text-white">Contact Us</h1>
        <div className="prose prose-invert prose-p:text-[#CCC] prose-p:leading-relaxed max-w-none">
          <p>We'd love to hear from you. Whether you have a news tip, advertising inquiry, or general feedback about Wild West Crypto Show, reach out via the details below.</p>
          <h3>General Inquiries</h3>
          <p>Email: <a href="mailto:info@wildwestcryptoshow.com" className="text-[#F4A917] hover:underline">info@wildwestcryptoshow.com</a></p>
          <h3>Advertising</h3>
          <p>For advertising and partnership opportunities, email: <a href="mailto:info@wildwestcryptoshow.com" className="text-[#F4A917] hover:underline">info@wildwestcryptoshow.com</a></p>
          <h3>Editorial</h3>
          <p>For corrections or news tips: <a href="mailto:info@wildwestcryptoshow.com" className="text-[#F4A917] hover:underline">info@wildwestcryptoshow.com</a></p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
