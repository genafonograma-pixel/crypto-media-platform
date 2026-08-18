import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] text-[#F5F5F5] py-16 border-t border-[#222]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <a href="/" className="inline-block mb-6">
              <img
                src="/crypton_logo.svg"
                alt="Crypton"
                className="h-10 w-auto opacity-75 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
              />
            </a>
            <p className="text-[#888] max-w-sm text-sm leading-relaxed font-light">
              A landmark shift in digital asset reporting. In-depth analysis, market intelligence, and raw perspectives on the decentralized economy.
            </p>
          </div>
          <div>
            <h3 className="font-bold uppercase tracking-widest text-[10px] mb-6 text-[#555]">Sections</h3>
            <ul className="space-y-4 text-xs font-medium">
              <li><a href="#" className="text-[#AAA] hover:text-white transition-colors">Markets</a></li>
              <li><a href="#" className="text-[#AAA] hover:text-white transition-colors">Technology</a></li>
              <li><a href="#" className="text-[#AAA] hover:text-white transition-colors">Policy & Regulation</a></li>
              <li><a href="#" className="text-[#AAA] hover:text-white transition-colors">The Vault</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold uppercase tracking-widest text-[10px] mb-6 text-[#555]">Company</h3>
            <ul className="space-y-4 text-xs font-medium">
              <li><a href="#" className="text-[#AAA] hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="text-[#AAA] hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-[#AAA] hover:text-white transition-colors">Advertise</a></li>
              <li><a href="#" className="text-[#AAA] hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-[#222] flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-[9px] font-bold text-[#444] uppercase tracking-widest">
            &copy; {new Date().getFullYear()} CryptoStandard Media Group. All rights reserved.
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-[9px] font-bold text-[#444] uppercase hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-[9px] font-bold text-[#444] uppercase hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
