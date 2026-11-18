import React, { useState, useEffect } from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import { useAdInteraction } from '../utils/adInteraction';
import { trackBannerClick } from '../utils/xPixel';

interface AdPlacementProps {
  format: 'billboard' | 'native' | 'sticky-bottom' | 'in-article' | 'skyscraper';
  className?: string;
}

export default function AdPlacement({ format, className = '' }: AdPlacementProps) {
  const hasInteracted = useAdInteraction();
  const [adData, setAdData] = useState<any>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchAdsList = async () => {
      try {
        const res = await fetch('/api/ads');
        const data = await res.json();
        const allAds: any[] = Array.isArray(data?.ads) ? data.ads : [];

        if (!isMounted) return;

        // Strict format matching + active check on every fetch
        const match = allAds.find((a: any) => a.format === format && a.active === true);
        setAdData(match || null);
      } catch (err) {
        console.error('Error fetching ads for placement:', err);
      }
    };

    fetchAdsList();
    // Poll every 15 seconds so admin pause/unpause propagates quickly
    const interval = setInterval(fetchAdsList, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [format]);

  // Bot detection
  const isBot = () => {
    if (typeof window === 'undefined') return true;
    const ua = (navigator.userAgent || '').toLowerCase();
    const botIdentifiers = [
      'facebookexternalhit', 'facebot',
      'googlebot', 'adsbot-google', 'mediapartners-google',
      'twitterbot', 'spider', 'ping'
    ];
    return botIdentifiers.some(bot => ua.includes(bot));
  };

  if (!hasInteracted || isBot() || !adData) {
    return null;
  }

  const sizeStyles: Record<string, string> = {
    'billboard': 'w-full max-w-[1200px] mx-auto block',
    'native': 'w-full max-w-[1200px] mx-auto block',
    'sticky-bottom': 'w-full max-w-2xl mx-auto block',
    'in-article': 'w-full max-w-[340px] md:max-w-[400px] mx-auto block',
    'skyscraper': 'w-[160px] mx-auto block'
  };

  // If ad has a valid image, render banner image
  if (adData.image_url && !imageError) {
    return (
      <div className={`relative group my-4 ${sizeStyles[format] || 'w-full'} ${className}`}>
        <span className="text-[10px] uppercase font-bold tracking-wider text-muted/70 block mb-1 text-center">
          Advertisement
        </span>
        <a
          href={adData.target_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={trackBannerClick}
          className="block relative overflow-hidden rounded-card border border-line/30 bg-bg-soft hover:opacity-95 transition-opacity"
        >
          <img
            src={adData.image_url}
            alt={adData.cta_text || 'Sponsored advertisement'}
            onError={() => setImageError(true)}
            className="w-full h-auto object-contain block mx-auto rounded-card"
          />
          {adData.cta_text && (format === 'native' || format === 'in-article') && (
            <div className="p-3 bg-bg-soft border-t border-line/20 flex items-center justify-between">
              <span className="text-xs text-ink font-semibold truncate mr-2">Sponsored Partner</span>
              <span className="text-xs font-bold text-brand group-hover:underline shrink-0">
                {adData.cta_text} →
              </span>
            </div>
          )}
        </a>
      </div>
    );
  }

  // Fallback: If image is missing or failed to load, render styled text sponsor card
  if (adData.target_url && (adData.cta_text || adData.format)) {
    return (
      <div className={`relative group my-4 ${sizeStyles[format] || 'w-full'} ${className}`}>
        <span className="text-[10px] uppercase font-bold tracking-wider text-muted/70 block mb-1 text-center">
          Advertisement
        </span>
        <a
          href={adData.target_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={trackBannerClick}
          className="block p-4 sm:p-5 rounded-card bg-gradient-to-r from-ink-900 to-ink-800 border border-brand/40 text-white shadow-md hover:border-brand transition-all"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center shrink-0">
                <Sparkles size={18} className="text-brand" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand block">
                  Official Sponsor
                </span>
                <span className="text-sm font-bold text-white block">
                  {adData.cta_text || 'Exclusive Sports Promotion'}
                </span>
              </div>
            </div>
            <div className="h-9 px-4 rounded-card bg-brand hover:bg-brand-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shrink-0 transition-colors">
              <span>{adData.cta_text || 'Visit Sponsor'}</span>
              <ExternalLink size={13} />
            </div>
          </div>
        </a>
      </div>
    );
  }

  return null;
}
