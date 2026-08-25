import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-[#F5F5F5] py-10 md:py-16 border-t border-[#222]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <img
                src="/crypton_logo.svg"
                alt="Crypton Cryptocurrency News"
                className="h-10 w-auto opacity-75 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
              />
            </Link>
            <p className="text-[#888] max-w-sm text-sm leading-relaxed font-light">
              A landmark shift in digital asset reporting. In-depth analysis, market intelligence, and raw perspectives on the decentralized economy.
            </p>
          </div>
          <div>
            <h2 className="font-bold uppercase tracking-widest text-[10px] mb-6 text-[#555]" title="Cryptocurrency News Sections">Sections</h2>
            <ul className="space-y-4 text-xs font-medium">
              <li><Link to="/news" className="text-[#AAA] hover:text-white transition-colors">All News</Link></li>
              <li><Link to="/news/bitcoin" className="text-[#AAA] hover:text-white transition-colors">Bitcoin</Link></li>
              <li><Link to="/news/markets" className="text-[#AAA] hover:text-white transition-colors">Markets</Link></li>
              <li><Link to="/news/defi" className="text-[#AAA] hover:text-white transition-colors">DeFi</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="font-bold uppercase tracking-widest text-[10px] mb-6 text-[#555]" title="Crypton Company Information">Company</h2>
            <ul className="space-y-4 text-xs font-medium">
              <li><Link to="/about" className="text-[#AAA] hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/methodology" className="text-[#AAA] hover:text-white transition-colors">AI Methodology</Link></li>
              <li><Link to="/contact" className="text-[#AAA] hover:text-white transition-colors">Advertise</Link></li>
              <li><Link to="/contact" className="text-[#AAA] hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-[#222] flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[9px] font-bold text-[#444] uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Crypton Media Group. All rights reserved.
          </div>
          <div className="flex gap-8">
            <Link to="/privacy" className="text-[9px] font-bold text-[#444] uppercase hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-[9px] font-bold text-[#444] uppercase hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
