import React, { useState, useEffect } from 'react';
import { Search, Rss, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '/news', label: 'All News' },
  { href: '/news/bitcoin', label: 'Bitcoin' },
  { href: '/news/altcoins', label: 'Altcoins' },
  { href: '/news/defi', label: 'DeFi' },
  { href: '/news/web3', label: 'Web3 & NFT' },
  { href: '/news/markets', label: 'Markets' },
  { href: '/news/tech', label: 'Tech' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change / resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 h-14 flex items-center border-b border-[#1a1a1a] bg-[#080808]/95 backdrop-blur-sm">
        <div className="max-w-[1280px] w-full mx-auto px-4 md:px-6 flex items-center justify-between h-full">

          {/* Logo */}
          <a href="/" className="shrink-0 flex items-center">
            <img
              src="/crypton_logo.svg"
              alt="Crypton"
              className="h-12 w-auto"
            />
          </a>

          {/* Categories (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-[#888]">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className={`hover:text-[#F5F5F5] transition-colors${href === '/news' ? ' text-[#F5F5F5]' : ''}`}
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-1 sm:gap-3">
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
              href="https://t.me/crypton"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#555] hover:text-[#229ED9] transition-colors"
            >
              Telegram
            </a>
            <a
              href="https://x.com/crypton"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#555] hover:text-[#F5F5F5] transition-colors"
            >
              X / Twitter
            </a>

            {/* Hamburger — mobile only */}
            <button
              className="lg:hidden p-2 text-[#888] hover:text-[#F5F5F5] transition-colors"
              onClick={() => setMenuOpen(v => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed top-14 left-0 right-0 z-40 bg-[#0a0a0a] border-b border-[#1f1f1f] shadow-2xl lg:hidden">
            <nav className="flex flex-col px-4 py-4 gap-1">
              {NAV_LINKS.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm font-bold uppercase tracking-widest text-[#aaa] hover:text-[#F5F5F5] hover:bg-[#141414] px-3 py-3 rounded-lg transition-colors"
                >
                  {label}
                </a>
              ))}

              {/* Divider */}
              <div className="h-px bg-[#1a1a1a] my-2" />

              {/* Social links */}
              <div className="flex gap-4 px-3 py-2">
                <a
                  href="/rss"
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#555] hover:text-[#F97316] transition-colors"
                >
                  <Rss size={13} /> RSS
                </a>
                <a
                  href="https://t.me/crypton"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold uppercase tracking-widest text-[#555] hover:text-[#229ED9] transition-colors"
                >
                  Telegram
                </a>
                <a
                  href="https://x.com/crypton"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold uppercase tracking-widest text-[#555] hover:text-[#F5F5F5] transition-colors"
                >
                  X / Twitter
                </a>
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
