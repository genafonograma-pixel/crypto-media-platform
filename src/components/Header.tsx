import React from 'react';
import { Search, Rss } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 h-14 flex items-center border-b border-[#1a1a1a] bg-[#080808]/95 backdrop-blur-sm">
      <div className="max-w-[1280px] w-full mx-auto px-4 md:px-6 flex items-center justify-between h-full">
        
        {/* Logo */}
        <a href="/" className="text-xl font-black tracking-tighter uppercase italic text-[#F5F5F5] shrink-0">
          Crypto<span className="text-[#3B82F6]">Standard</span>
        </a>

        {/* Categories (Desktop) */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-[#888]">
          <a href="/news" className="hover:text-[#F5F5F5] transition-colors text-[#F5F5F5]">All News</a>
          <a href="/news/bitcoin" className="hover:text-[#F5F5F5] transition-colors">Bitcoin</a>
          <a href="/news/altcoins" className="hover:text-[#F5F5F5] transition-colors">Altcoins</a>
          <a href="/news/defi" className="hover:text-[#F5F5F5] transition-colors">DeFi</a>
          <a href="/news/web3" className="hover:text-[#F5F5F5] transition-colors">Web3 & NFT</a>
          <a href="/news/markets" className="hover:text-[#F5F5F5] transition-colors">Markets</a>
          <a href="/news/tech" className="hover:text-[#F5F5F5] transition-colors">Tech</a>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          <button
            className="p-2 text-[#555] hover:text-[#F5F5F5] transition-colors"
            title="Search"
          >
            <Search size={18} />
          </button>
          <a
            href="/rss"
            className="hidden md:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#555] hover:text-[#F97316] transition-colors"
            title="RSS Feed"
          >
            <Rss size={14} />
            RSS
          </a>
          <a
            href="https://t.me/cryptostandard"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#555] hover:text-[#229ED9] transition-colors"
          >
            Telegram
          </a>
          <a
            href="https://x.com/cryptostandard"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#555] hover:text-[#F5F5F5] transition-colors"
          >
            X / Twitter
          </a>
        </div>
      </div>
    </header>
  );
}
