import React, { useState, useEffect } from 'react';

interface AdPlacementProps {
  format: 'billboard' | 'native' | 'sticky-bottom' | 'in-article' | 'skyscraper';
  className?: string;
}

// Simple global cache to prevent spamming the API on page load
let cachedAds: any[] | null = null;
let fetchingAds: Promise<any[]> | null = null;

export default function AdPlacement({ format, className = '' }: AdPlacementProps) {
  const [shouldShowAd, setShouldShowAd] = useState(false);
  const [adData, setAdData] = useState<any>(null);

  useEffect(() => {
    // 1. Fetch Ad Content
    const getAd = async () => {
      try {
        let adsList = cachedAds;
        if (!adsList) {
          if (!fetchingAds) {
            fetchingAds = fetch('/api/ads').then(res => res.json()).then(data => data.ads || []);
          }
          adsList = await fetchingAds;
          cachedAds = adsList;
        }
        
        // Find an active ad matching the format
        if (adsList) {
           const match = adsList.find(a => a.format === format && a.active);
           if (match) setAdData(match);
        }
      } catch (err) {
        console.error("Error loading ad:", err);
      }
    };
    getAd();

    // 2. Bot Detection via User-Agent
    const isBot = () => {
      const ua = navigator.userAgent.toLowerCase();
      const botIdentifiers = [
        'facebookexternalhit', 'facebot', 
        'googlebot', 'adsbot-google', 'mediapartners-google', 
        'twitterbot', 'bot', 'crawler', 'spider', 'ping'
      ];
      return botIdentifiers.some(bot => ua.includes(bot));
    };

    if (isBot()) {
      return; 
    }

    // 3. Interaction Check
    const handleInteraction = () => {
      setShouldShowAd(true);
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
  }, [format]);

  // If we haven't interacted OR we don't have ad data for this format, render nothing.
  if (!shouldShowAd || !adData) {
    return null;
  }

  const sizeStyles = {
    // Billboard: full width on mobile (like a leaderboard), wider on desktop
    'billboard': 'w-full h-[60px] sm:h-[90px] md:h-[90px] lg:max-w-[970px] lg:h-[250px] mx-auto',
    'native': 'w-full min-h-[150px]',
    // Sticky-bottom: always full width
    'sticky-bottom': 'w-full h-[50px] md:h-[90px]',
    // In-article: full width on mobile, fixed 300x250 on larger screens
    'in-article': 'w-full h-[120px] sm:w-[300px] sm:h-[250px] mx-auto',
    // Skyscraper: hidden on mobile, shown only on large screens
    'skyscraper': 'hidden lg:block w-[160px] h-[600px] mx-auto'
  };

  return (
    <a 
      href={adData.target_url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block bg-black/50 overflow-hidden relative group ${sizeStyles[format]} ${className}`}
    >
      <span className="text-[9px] text-white/50 absolute top-1 right-1 z-10 bg-black/50 px-1 rounded">Ad</span>
      <img 
        src={adData.image_url} 
        alt="Advertisement"
        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
      />
    </a>
  );
}
