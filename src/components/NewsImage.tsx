import React, { useState } from 'react';
import { cleanImageUrl } from '../utils';

interface NewsImageProps {
  src?: string | null;
  alt?: string;
  isHero?: boolean;
  className?: string;
}

export default function NewsImage({ src, alt = '', isHero = false, className = '' }: NewsImageProps) {
  const cleaned = cleanImageUrl(src);
  const [currentSrc, setCurrentSrc] = useState<string | null>(cleaned || src || null);
  const [hasFailed, setHasFailed] = useState(false);

  const handleError = () => {
    // If the stripped/cleaned URL failed (e.g. signature error on external CDN), try the original once
    if (src && currentSrc !== src) {
      setCurrentSrc(src);
    } else {
      setHasFailed(true);
    }
  };

  if (!currentSrc || hasFailed) {
    return (
      <div
        className={`aspect-video w-full bg-bg-soft rounded-card flex items-center justify-center border border-line select-none ${className}`}
        aria-hidden="true"
      >
        <img
          src="/sport25_icon.svg"
          alt=""
          className="w-10 h-10 opacity-25 grayscale"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div className={`aspect-video w-full bg-bg-soft rounded-card overflow-hidden ${className}`}>
      <img
        src={currentSrc}
        alt={isHero ? alt : ''}
        loading={isHero ? 'eager' : 'lazy'}
        // @ts-ignore
        fetchpriority={isHero ? 'high' : undefined}
        decoding="async"
        className="w-full h-full object-cover"
        onError={handleError}
      />
    </div>
  );
}
