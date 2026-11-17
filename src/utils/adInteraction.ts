import { useState, useEffect } from 'react';

type Listener = (interacted: boolean) => void;
const listeners = new Set<Listener>();

let hasUserInteracted = false;
let gateInitialized = false;

// Bot & Crawler Detection
export function isBotUser(): boolean {
  if (typeof window === 'undefined') return true;
  if (navigator.webdriver) return true;

  const ua = (navigator.userAgent || '').toLowerCase();
  const botSignatures = [
    'facebookexternalhit',
    'facebot',
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
    'screenshot'
  ];

  return botSignatures.some(sig => ua.includes(sig));
}

export function isUserInteracted(): boolean {
  return hasUserInteracted;
}

export function subscribeUserInteraction(callback: Listener): () => void {
  listeners.add(callback);
  if (hasUserInteracted) {
    callback(true);
  }
  return () => {
    listeners.delete(callback);
  };
}

export function initUserInteractionGate() {
  if (typeof window === 'undefined' || gateInitialized) return;
  gateInitialized = true;

  // Never reveal ads to automated bots or headless testing tools
  if (isBotUser()) {
    return;
  }

  const triggerInteraction = (e: Event) => {
    // Only accept genuine user events (ignore synthetic dispatched events)
    if (e.isTrusted === false) return;

    if (!hasUserInteracted) {
      hasUserInteracted = true;
      listeners.forEach(cb => cb(true));
      cleanup();
    }
  };

  const cleanup = () => {
    window.removeEventListener('mousemove', triggerInteraction);
    window.removeEventListener('scroll', triggerInteraction);
    window.removeEventListener('touchstart', triggerInteraction);
    window.removeEventListener('keydown', triggerInteraction);
    window.removeEventListener('pointerdown', triggerInteraction);
    window.removeEventListener('click', triggerInteraction);
  };

  window.addEventListener('mousemove', triggerInteraction, { passive: true, once: true });
  window.addEventListener('scroll', triggerInteraction, { passive: true, once: true });
  window.addEventListener('touchstart', triggerInteraction, { passive: true, once: true });
  window.addEventListener('keydown', triggerInteraction, { passive: true, once: true });
  window.addEventListener('pointerdown', triggerInteraction, { passive: true, once: true });
  window.addEventListener('click', triggerInteraction, { passive: true, once: true });
}

/**
 * useAdInteraction
 * React hook that returns true only after genuine user interaction (mouse move, scroll, touch, keydown).
 * Completely hides sponsored buttons, HTML banners, static banners, and modals before interaction,
 * then reveals all of them immediately upon first interaction.
 */
export function useAdInteraction(): boolean {
  const [interacted, setInteracted] = useState(() => isUserInteracted());

  useEffect(() => {
    initUserInteractionGate();
    if (isUserInteracted()) {
      setInteracted(true);
      return;
    }
    return subscribeUserInteraction((val) => {
      setInteracted(val);
    });
  }, []);

  return interacted;
}
