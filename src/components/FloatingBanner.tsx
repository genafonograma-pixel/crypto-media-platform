import React, { useState, useEffect } from 'react';
import { useAdInteraction, isBotUser } from '../utils/adInteraction';
import { trackBannerClick } from '../utils/xPixel';

/**
 * FloatingBanner — Exact replica of the Bet25 Coinzilla sticky ad banner.
 */

interface FloatingBannerProps {
  defaultTargetUrl?: string;
}

export default function FloatingBanner({ defaultTargetUrl = 'https://bet25.com' }: FloatingBannerProps) {
  const hasInteracted = useAdInteraction();
  const [targetUrl, setTargetUrl] = useState(defaultTargetUrl);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [direction, setDirection] = useState<'bottom' | 'top'>('bottom');

  useEffect(() => {
    // 1. Bot & Crawler Detection
    const isBot = (): boolean => {
      if (typeof window === 'undefined') return true;
      if (navigator.webdriver) return true;

      const ua = (navigator.userAgent || '').toLowerCase();
      const botSignatures = [
        'googlebot', 'adsbot-google', 'mediapartners-google',
        'google-inspectiontool', 'storebot-google', 'googleother',
        'chrome-lighthouse', 'bingbot', 'slurp', 'duckduckbot',
        'baiduspider', 'yandexbot', 'facebot', 'facebookexternalhit',
        'twitterbot', 'linkedinbot', 'whatsapp', 'applebot',
        'semrushbot', 'ahrefsbot', 'mj12bot', 'dotbot', 'rogerbot',
        'ia_archiver', 'headlesschrome', 'phantomjs', 'selenium',
        'webdriver', 'crawler', 'spider', 'bot', 'ping', 'preview', 'screenshot',
      ];
      return botSignatures.some(sig => ua.includes(sig));
    };

    if (isBot()) return;

    // 2. Check active status — called on mount and every 15s
    const checkActive = () => {
      fetch('/api/ads')
        .then(res => res.json())
        .then(data => {
          if (data?.status === 'success' && Array.isArray(data.ads)) {
            const match = data.ads.find(
              (a: any) => (a.format === 'html-banner' || a.format === 'sticky-bottom' || a.format === 'floating')
            );
            if (match) {
              setIsEnabled(match.active === true);
              if (match.target_url) setTargetUrl(match.target_url);
              if (match.cta_text === 'top') setDirection('top');
              else setDirection('bottom');
            } else {
              setIsEnabled(false);
            }
          }
        })
        .catch(() => setIsEnabled(false));
    };

    checkActive();
    const interval = setInterval(checkActive, 15000);
    return () => clearInterval(interval);
  }, []);

  // Bot review, not interacted, disabled in admin, or dismissed -> render nothing
  if (!hasInteracted || isBotUser() || !isEnabled || isDismissed) {
    return null;
  }

  const isTop = direction === 'top';
  const bannerStyle: React.CSSProperties = {
    position: 'fixed',
    [isTop ? 'top' : 'bottom']: 0,
    left: 0,
    width: '100%',
    height: '48px',
    zIndex: 99999,
    background: '#0A021F',
    boxShadow: isTop ? '0 3px 18px rgba(0,0,0,0.45)' : '0 -3px 18px rgba(0,0,0,0.45)',
    borderBottom: isTop ? '1px solid rgba(124,76,229,0.35)' : undefined,
    borderTop: !isTop ? '1px solid rgba(124,76,229,0.35)' : undefined,
    animation: `${isTop ? 'bannerSlideDown' : 'bannerSlideUp'} 0.35s cubic-bezier(0.16,1,0.3,1) forwards`,
    userSelect: 'none',
  };

  return (
    <>
      <style>{`
        @keyframes bannerSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes bannerSlideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to   { transform: translateY(0);     opacity: 1; }
        }
      `}</style>

      <div style={bannerStyle} className="relative">
        {/* Dismiss Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsDismissed(true);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-5 h-5 flex items-center justify-center rounded-full bg-black/70 hover:bg-black text-white/80 hover:text-white transition-colors cursor-pointer text-xs"
          aria-label="Close sticky ad"
        >
          ✕
        </button>

        {/* Clickable Overlay Wrapping the Creative */}
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={trackBannerClick}
          style={{ display: 'block', width: '100%', height: '48px', position: 'relative', textDecoration: 'none', cursor: 'pointer' }}
        >
          {/* Click shield sits over iframe so clicks always trigger the anchor */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 10, cursor: 'pointer' }} aria-hidden="true" />

          <div style={{ width: '100%', height: '48px', position: 'relative', overflow: 'hidden' }}>
            <iframe
              title="Bet25 Desktop Banner"
              src="/ads/bet25/index.html"
              scrolling="no"
              style={{ width: '100%', height: '48px', border: 0, display: 'block', overflow: 'hidden', background: '#0A021F', pointerEvents: 'none' }}
            />
          </div>
        </a>
      </div>
    </>
  );
}
