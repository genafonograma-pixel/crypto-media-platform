import React, { useState, useEffect } from 'react';
import { Search, Rss, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '/news', label: 'All News' },
  { href: '/news/bitcoin', label: 'Bitcoin' },
  { href: '/news/altcoins', label: 'Altcoins' },
  { href: '/news/defi', label: 'DeFi' },
  { href: '/news/web3', label: 'Web3 & NFT' }
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shouldShowAd, setShouldShowAd] = useState(false);
  const [adData, setAdData] = useState<any>(null);

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

  // Load cloaked header button
  useEffect(() => {
    fetch('/api/ads')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          const btn = data.ads.find((a: any) => a.format === 'header-button' && a.active);
          if (btn) setAdData(btn);
        }
      })
      .catch(console.error);

    const isBot = () => {
      const ua = navigator.userAgent.toLowerCase();
      const botIdentifiers = [
        'facebookexternalhit', 'facebot',
        'googlebot', 'adsbot-google', 'mediapartners-google',
        'twitterbot', 'bot', 'crawler', 'spider', 'ping'
      ];
      return botIdentifiers.some(bot => ua.includes(bot));
    };

    if (isBot()) return;

    const handleInteraction = () => {
      setTimeout(() => setShouldShowAd(true), 500); // slight delay to avoid layout shift pop
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };

    window.addEventListener('scroll', handleInteraction, { once: true, passive: true });
    window.addEventListener('mousemove', handleInteraction, { once: true, passive: true });
    window.addEventListener('touchstart', handleInteraction, { once: true, passive: true });
    window.addEventListener('keydown', handleInteraction, { once: true, passive: true });

    return () => {
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 h-14 flex items-center border-b border-[#1a1a1a] bg-[#080808]/95 backdrop-blur-sm">
        <div className="max-w-[1280px] w-full mx-auto px-3 md:px-6 flex items-center justify-between gap-2 h-full">

          {/* Left section: Logo + Mobile Header Button */}
          <div className="flex items-center gap-2 min-w-0 flex-1 lg:flex-none">
            <a href="/" className="shrink-0 flex items-center">
              <img
                src="/crypton_logo.svg"
                alt="Crypton"
                className="h-9 sm:h-11 w-auto"
              />
            </a>
            
            {/* Mobile Header Button - Only shows next to logo on mobile */}
            {shouldShowAd && adData && (
              <a 
                href={adData.target_url}
                target="_blank"
                rel="noopener noreferrer"
                className="lg:hidden shrink-0 text-[10px] sm:text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg text-white animate-in fade-in zoom-in duration-300 max-w-[120px] sm:max-w-[160px] truncate shadow-[0_4px_0_rgba(0,0,0,0.6)] active:translate-y-[4px] active:shadow-none transition-all"
                style={{ backgroundColor: adData.button_color || '#3B82F6' }}
              >
                {adData.cta_text}
              </a>
            )}
          </div>

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
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Desktop Header Button */}
            {shouldShowAd && adData && (
              <a 
                href={adData.target_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:block text-xs font-black uppercase tracking-widest px-5 py-2 rounded-lg text-white mr-2 animate-in fade-in zoom-in duration-300 shadow-[0_5px_0_rgba(0,0,0,0.6)] hover:-translate-y-0.5 hover:shadow-[0_6px_0_rgba(0,0,0,0.6)] active:translate-y-[5px] active:shadow-none transition-all"
                style={{ backgroundColor: adData.button_color || '#3B82F6' }}
              >
                {adData.cta_text}
              </a>
            )}

            <button
              className="p-2 text-[#555] hover:text-[#F5F5F5] transition-colors"
              title="Search"
            >
              <Search size={18} />
            </button>
            <a
              href="#"
              className="hidden sm:flex p-2 text-[#555] hover:text-[#F5F5F5] transition-colors"
              title="RSS Feed"
            >
              <Rss size={18} />
            </a>
            
            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 text-[#555] hover:text-[#F5F5F5] transition-colors"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] bg-[#050505] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-[#1a1a1a]">
            <a href="/" className="shrink-0 flex items-center" onClick={() => setMenuOpen(false)}>
              <img src="/crypton_logo.svg" alt="Crypton" className="h-8 w-auto" />
            </a>
            <button
              className="p-2 text-[#888] hover:text-[#F5F5F5] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto py-8 px-6">
            <nav className="flex flex-col gap-6">
              {NAV_LINKS.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="text-2xl font-black uppercase tracking-tight text-[#888] hover:text-[#F5F5F5] transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </a>
              ))}
            </nav>
            
            <div className="mt-12 flex items-center gap-4 border-t border-[#1a1a1a] pt-8">
              <button className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#888] hover:text-[#F5F5F5]">
                <Search size={16} /> Search
              </button>
              <a href="#" className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#888] hover:text-[#F5F5F5]">
                <Rss size={16} /> RSS
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
