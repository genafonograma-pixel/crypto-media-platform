import React, { useState, useEffect } from 'react';
import { useAdInteraction, isBotUser } from '../utils/adInteraction';

/**
 * FloatingBanner — Exact replica of the Bet25 Coinzilla sticky ad banner.
 */

interface FloatingBannerProps {
  defaultTargetUrl?: string;
}

export default function FloatingBanner({ defaultTargetUrl = 'https://bet25.com' }: FloatingBannerProps) {
  const hasInteracted = useAdInteraction();
  const [targetUrl, setTargetUrl] = useState(defaultTargetUrl);

  useEffect(() => {
    // 1. Bot & Crawler Detection
    const isBot = (): boolean => {
      if (typeof window === 'undefined') return true;
      if (navigator.webdriver) return true;

      const ua = (navigator.userAgent || '').toLowerCase();
      const botSignatures = [
        'googlebot',
        'adsbot-google',
        'mediapartners-google',
        'google-inspectiontool',
        'storebot-google',
        'googleother',
        'chrome-lighthouse',
        'bingbot',
        'slurp',
        'duckduckbot',
        'baiduspider',
        'yandexbot',
        'facebot',
        'facebookexternalhit',
        'twitterbot',
        'linkedinbot',
        'whatsapp',
        'applebot',
        'semrushbot',
        'ahrefsbot',
        'mj12bot',
        'dotbot',
        'rogerbot',
        'ia_archiver',
        'headlesschrome',
        'phantomjs',
        'selenium',
        'webdriver',
        'crawler',
        'spider',
        'bot',
        'ping',
        'preview',
        'screenshot',
      ];

      return botSignatures.some(sig => ua.includes(sig));
    };

    if (isBot()) {
      return;
    }

    // 2. Optional: check if an active sticky-bottom or floating ad is configured in database
    fetch('/api/ads')
      .then(res => res.json())
      .then(data => {
        if (data?.status === 'success' && Array.isArray(data.ads)) {
          const match = data.ads.find(
            (a: any) => (a.format === 'sticky-bottom' || a.format === 'floating') && a.active
          );
          if (match?.target_url) {
            setTargetUrl(match.target_url);
          }
        }
      })
      .catch(() => {
        // Fall back to defaultTargetUrl
      });
  }, []);

  // Bot review or not interacted yet -> render nothing
  if (!hasInteracted || isBotUser()) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes coinzillaStickySlideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .preview-zone-STICKY {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 48px;
          z-index: 99999;
          background: #0A021F;
          box-shadow: 0 -3px 18px rgba(0, 0, 0, 0.45);
          border-top: 1px solid rgba(124, 76, 229, 0.35);
          animation: coinzillaStickySlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          user-select: none;
          -webkit-user-select: none;
        }
        .preview-zone-STICKY .ad-overlay {
          display: block;
          width: 100%;
          height: 48px;
          position: relative;
          text-decoration: none;
          cursor: pointer;
        }
        .preview-zone-STICKY .display-placeholder {
          width: 100%;
          height: 48px;
          position: relative;
          overflow: hidden;
        }
        .preview-zone-STICKY .preview-creative {
          width: 100%;
          height: 48px;
        }
        .preview-zone-STICKY .preview-creative iframe {
          width: 100%;
          height: 48px;
          border: 0;
          display: block;
          overflow: hidden;
          background: #0A021F;
          pointer-events: none;
        }
        .preview-zone-STICKY .click-shield {
          position: absolute;
          inset: 0;
          z-index: 10;
          cursor: pointer;
        }
      `}</style>

      <div className="preview-zone-STICKY">
        {/* Clickable Overlay Wrapping the Creative */}
        <a
          className="ad-overlay"
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {/* Click shield sits over iframe so clicks always trigger the anchor */}
          <div className="click-shield" aria-hidden="true" />

          <div className="display-placeholder">
            <div className="preview-creative">
              <iframe
                title="Bet25 Desktop Banner"
                src="/ads/bet25/index.html"
                scrolling="no"
              />
            </div>
          </div>
        </a>
      </div>
    </>
  );
}
