import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function PopupAd() {
  const [shouldShowAd, setShouldShowAd] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [adData, setAdData] = useState<any>(null);

  useEffect(() => {
    // Fetch active popup ad
    fetch('/api/ads')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          const popup = data.ads.find((a: any) => a.format === 'popup' && a.active);
          if (popup) setAdData(popup);
        }
      })
      .catch(console.error);

    // 1. Bot Detection via User-Agent
    const isBot = () => {
      const ua = navigator.userAgent.toLowerCase();
      const botIdentifiers = [
        'facebookexternalhit', 'facebot',
        'googlebot', 'adsbot-google', 'mediapartners-google',
        'twitterbot',
        'bot', 'crawler', 'spider', 'ping'
      ];
      return botIdentifiers.some(bot => ua.includes(bot));
    };

    if (isBot()) {
      return; // Never show popup to bots
    }

    // 2. Interaction Check + Delay
    const handleInteraction = () => {
      setTimeout(() => {
        setShouldShowAd(true);
      }, 2000);
      
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

  // If no popup ad is configured or it's dismissed, render nothing
  if (!shouldShowAd || isDismissed || !adData) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-[400px] bg-[#0a0a0a] border border-[#222] rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 flex flex-col">
        {/* Close Button */}
        <button 
          onClick={() => setIsDismissed(true)}
          className="absolute top-3 right-3 z-20 p-2 bg-black/60 hover:bg-black/90 rounded-full text-white/70 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
        
        {/* Ad Image Area */}
        <a href={adData.target_url} target="_blank" rel="noopener noreferrer" className="block w-full cursor-pointer relative bg-black aspect-[4/5] sm:aspect-square flex-1">
           <img 
             src={adData.image_url} 
             alt="Sponsored"
             className="w-full h-full object-contain"
           />
        </a>

        {/* Dynamic CTA Area below image */}
        <div className="p-4 bg-[#111] border-t border-[#222]">
           <a 
             href={adData.target_url} 
             target="_blank" 
             rel="noopener noreferrer"
             className="block text-center bg-[#E91E63] hover:bg-[#D81B60] text-white font-bold py-3.5 px-8 rounded-full text-lg w-full shadow-[0_0_15px_rgba(233,30,99,0.3)] transition-transform active:scale-95 uppercase tracking-wide"
           >
             {adData.cta_text || 'CLICK HERE'}
           </a>
        </div>
      </div>
    </div>
  );
}
