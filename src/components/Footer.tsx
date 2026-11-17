import React from 'react';
import { Link } from 'react-router-dom';
import { SPORTS_NAV } from '../data/nav';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-ink-900 text-white/70 border-t border-line/20 py-12 md:py-16">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 pb-12">
          {/* Col 1: Brand */}
          <div className="space-y-4">
            <Link to="/" aria-label="SPORT25 Home" className="inline-block">
              <img
                src="/sport25_logo.svg"
                alt="SPORT25"
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-sm text-white/70 leading-relaxed font-normal">
              Real-time sports reporting, breaking transfers, and match updates from global sports journalism.
            </p>
          </div>

          {/* Col 2: Sports */}
          <div>
            <p className="text-sm font-semibold text-white mb-4">Sports</p>
            <ul className="space-y-2.5">
              {SPORTS_NAV.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    to={href}
                    className="block py-1 text-sm text-white/70 hover:text-white transition-colors duration-150"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Company */}
          <div>
            <p className="text-sm font-semibold text-white mb-4">Company</p>
            <ul className="space-y-2.5">
              <li>
                <Link to="/about" className="block py-1 text-sm text-white/70 hover:text-white transition-colors duration-150">
                  About us
                </Link>
              </li>
              <li>
                <Link to="/methodology" className="block py-1 text-sm text-white/70 hover:text-white transition-colors duration-150">
                  How we work
                </Link>
              </li>
              <li>
                <Link to="/help" className="block py-1 text-sm text-white/70 hover:text-white transition-colors duration-150">
                  Help &amp; FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="block py-1 text-sm text-white/70 hover:text-white transition-colors duration-150">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Follow */}
          <div>
            <p className="text-sm font-semibold text-white mb-4">Follow</p>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-1 text-sm text-white/70 hover:text-white transition-colors duration-150"
                >
                  X (Twitter)
                </a>
              </li>
              <li>
                <a
                  href="https://t.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-1 text-sm text-white/70 hover:text-white transition-colors duration-150"
                >
                  Telegram
                </a>
              </li>
              <li>
                <a
                  href="/rss.xml"
                  className="block py-1 text-sm text-white/70 hover:text-white transition-colors duration-150"
                >
                  RSS feed
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 border-t border-line/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-meta text-white/60">
          <p>© {currentYear} SPORT25. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors duration-150">
              Privacy policy
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors duration-150">
              Terms of service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
