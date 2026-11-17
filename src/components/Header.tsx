import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { SPORTS_NAV } from '../data/nav';
import { useAdInteraction } from '../utils/adInteraction';

interface HeaderAd {
  id: string;
  target_url: string;
  cta_text: string;
  button_color?: string;
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [headerAd, setHeaderAd] = useState<HeaderAd | null>(null);
  const hasInteracted = useAdInteraction();
  const moreRef = useRef<HTMLDivElement>(null);

  const primaryLinks = SPORTS_NAV.filter(item => !item.inMore);
  const moreLinks = SPORTS_NAV.filter(item => item.inMore);

  // Close menus on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Click outside to close More dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch optional header button ad if configured in admin
  useEffect(() => {
    fetch('/api/ads')
      .then(res => res.json())
      .then(data => {
        if (data?.status === 'success' && Array.isArray(data.ads)) {
          const match = data.ads.find((a: any) => a.format === 'header-button' && a.active);
          if (match) setHeaderAd(match);
        }
      })
      .catch(() => {});
  }, []);

  const getButtonColorClass = (color?: string) => {
    switch (color) {
      case 'emerald':
      case 'green':
        return 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20';
      case 'blue':
        return 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20';
      case 'gold':
        return 'bg-brand hover:bg-brand-600 text-white font-bold shadow-brand/20';
      case 'purple':
        return 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20';
      case 'dark':
        return 'bg-white/10 hover:bg-white/20 text-white border border-white/20';
      case 'brand':
      default:
        return 'bg-brand hover:bg-brand-600 text-white shadow-brand/20';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 h-16 bg-ink-900 border-b border-line/20">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 flex items-center justify-between h-full gap-4">
          {/* Logo */}
          <Link to="/" className="shrink-0 flex items-center" aria-label="SPORT25 Home">
            <img
              src="/sport25_logo.svg"
              alt="SPORT25"
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6 h-full" aria-label="Main Navigation">
            {primaryLinks.map(({ href, label }) => (
              <NavLink
                key={href}
                to={href}
                className={({ isActive }) =>
                  `h-full flex items-center text-sm font-semibold transition-colors duration-150 relative ${
                    isActive
                      ? 'text-white after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-brand'
                      : 'text-white/75 hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}

            {/* More Dropdown */}
            <div className="relative h-full flex items-center" ref={moreRef}>
              <button
                type="button"
                onClick={() => setMoreOpen(prev => !prev)}
                className="h-full flex items-center gap-1 text-sm font-semibold text-white/75 hover:text-white transition-colors duration-150 cursor-pointer"
                aria-expanded={moreOpen}
                aria-haspopup="true"
              >
                <span>More</span>
                <ChevronDown size={16} className={`transition-transform duration-150 ${moreOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreOpen && (
                <div className="absolute top-full left-0 mt-1 w-44 bg-ink-900 border border-line/20 rounded-card py-2 shadow-lg z-50">
                  {moreLinks.map(({ href, label }) => (
                    <NavLink
                      key={href}
                      to={href}
                      onClick={() => setMoreOpen(false)}
                      className={({ isActive }) =>
                        `block px-4 py-2 text-sm font-semibold transition-colors duration-150 ${
                          isActive ? 'text-brand bg-white/5' : 'text-white/75 hover:text-white hover:bg-white/5'
                        }`
                      }
                    >
                      {label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Dynamic Sponsor / Action Button (Revealed on mouse move/scroll) */}
            {hasInteracted && headerAd && (
              <a
                href={headerAd.target_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`h-9 px-4 rounded-card text-xs md:text-sm font-semibold flex items-center justify-center transition-all duration-150 shadow-sm shrink-0 ${getButtonColorClass(headerAd.button_color)}`}
              >
                {headerAd.cta_text || 'Sponsored'}
              </a>
            )}

            {/* Mobile Hamburger */}
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
              className="lg:hidden w-10 h-10 flex items-center justify-center text-white/75 hover:text-white transition-colors duration-150"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Panel (Full screen) */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] bg-ink-900 flex flex-col">
          <div className="h-16 max-w-[1200px] w-full mx-auto px-4 md:px-6 flex items-center justify-between border-b border-line/20 shrink-0">
            <Link to="/" onClick={() => setMenuOpen(false)}>
              <img src="/sport25_logo.svg" alt="SPORT25" className="h-8 w-auto" />
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="w-10 h-10 flex items-center justify-center text-white/75 hover:text-white transition-colors duration-150"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8">
            <nav className="flex flex-col gap-4" aria-label="Mobile Navigation">
              {SPORTS_NAV.map(({ href, label }) => (
                <NavLink
                  key={href}
                  to={href}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `text-card font-semibold py-3 transition-colors duration-150 ${
                      isActive ? 'text-brand' : 'text-white/75 hover:text-white'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            {hasInteracted && headerAd && (
              <div className="mt-8 pt-8 border-t border-line/20">
                <a
                  href={headerAd.target_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className={`w-full h-12 rounded-card text-sm font-semibold flex items-center justify-center transition-colors duration-150 ${getButtonColorClass(headerAd.button_color)}`}
                >
                  {headerAd.cta_text || 'Sponsored'}
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
