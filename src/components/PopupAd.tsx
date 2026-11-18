import React, { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { useAdInteraction, isBotUser } from '../utils/adInteraction';
import { trackBannerClick } from '../utils/xPixel';

export default function PopupAd() {
  const hasInteracted = useAdInteraction();
  const [isDismissed, setIsDismissed] = useState(false);
  const [adData, setAdData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/ads')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success' && Array.isArray(data.ads)) {
          const popup = data.ads.find((a: any) => a.format === 'popup' && a.active);
          if (popup) setAdData(popup);
        }
      })
      .catch(console.error);
  }, []);

  // Listen for ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDismissed(true);
      }
    };
    if (hasInteracted && !isDismissed) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasInteracted, isDismissed]);

  if (!hasInteracted || isDismissed || isBotUser() || !adData || !adData.image_url) {
    return null;
  }

  const getButtonColorClass = (color?: string) => {
    switch (color) {
      case 'emerald':
      case 'green':
        return 'bg-emerald-600 hover:bg-emerald-500 text-white';
      case 'blue':
        return 'bg-blue-600 hover:bg-blue-500 text-white';
      case 'gold':
        return 'bg-brand hover:bg-brand-600 text-white font-bold';
      case 'purple':
        return 'bg-purple-600 hover:bg-purple-500 text-white';
      case 'brand':
      default:
        return 'bg-brand hover:bg-brand-600 text-white';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/80 backdrop-blur-sm transition-opacity duration-200"
      onClick={() => setIsDismissed(true)}
      role="dialog"
      aria-modal="true"
      aria-label="Promotional Announcement"
    >
      <div
        className="relative w-full max-w-sm bg-bg border border-line rounded-card overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Tag & Close */}
        <div className="absolute top-3 left-3 z-20">
          <span className="bg-ink-900/80 text-white/80 text-label font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
            Sponsored
          </span>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="absolute top-2.5 right-2.5 z-20 p-1.5 bg-ink-900/70 hover:bg-ink-900 rounded-full text-white/80 hover:text-white transition-colors duration-150 cursor-pointer shadow-md"
          aria-label="Close promotion"
        >
          <X size={16} />
        </button>

        {/* Ad Image Link */}
        <a
          href={adData.target_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={trackBannerClick}
          className="block w-full cursor-pointer relative bg-bg-soft aspect-[4/5] max-h-[380px] overflow-hidden group"
        >
          <img
            src={adData.image_url}
            alt={adData.cta_text || 'Sponsored advertisement'}
            className="w-full h-full object-contain p-2 group-hover:scale-[1.02] transition-transform duration-200"
          />
        </a>

        {/* Footer CTA Button */}
        <div className="p-3 bg-bg border-t border-line">
          <a
            href={adData.target_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={trackBannerClick}
            className={`flex items-center justify-center gap-2 text-center font-semibold h-11 px-6 rounded-card text-sm w-full transition-colors duration-150 shadow-md ${getButtonColorClass(adData.button_color)}`}
          >
            <span>{adData.cta_text || 'Learn more'}</span>
            <ExternalLink size={14} className="opacity-80" />
          </a>
        </div>
      </div>
    </div>
  );
}
