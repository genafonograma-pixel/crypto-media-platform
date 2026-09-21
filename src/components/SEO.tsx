import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  type?: string;
  canonical?: string; // Override canonical URL (e.g. point to original article source)
  schema?: any; // Structured JSON-LD schema
}

const SITE_NAME = 'Wild West Crypto Show';
const SITE_URL = 'https://wildwestcryptoshow.com';
const DEFAULT_IMAGE = `${SITE_URL}/wildwest_logo.svg`;

function setMeta(selector: string, attribute: string, value: string) {
  let el = document.querySelector(selector);
  if (!el) {
    const tag = selector.startsWith('meta') ? 'meta' : 'link';
    el = document.createElement(tag);
    const parts = selector.match(/\[([^\]]+)="([^"]+)"\]/g);
    if (parts) {
      parts.forEach(part => {
        const m = part.match(/\[([^\]]+)="([^"]+)"\]/);
        if (m) el!.setAttribute(m[1], m[2]);
      });
    }
    document.head.appendChild(el);
  }
  el.setAttribute(attribute, value);
}

export default function SEO({ 
  title, 
  description = "Stay updated with the latest cryptocurrency news, insights, and market movements on Wild West Crypto Show.", 
  image = DEFAULT_IMAGE, 
  type = "website",
  canonical,
  schema
}: SEOProps) {
  useEffect(() => {
    // Canonical URL
    const canonicalUrl = canonical || (window.location.origin + window.location.pathname);

    // Clamp title to ≤ 60 characters (Google SERP limit)
    const clampTitle = (t: string) => t.length > 60 ? t.slice(0, 57).trimEnd() + '…' : t;
    const safeTitle = clampTitle(title);

    // Standard tags
    document.title = safeTitle;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[name="robots"]', 'content', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');

    // Open Graph
    setMeta('meta[property="og:title"]', 'content', safeTitle);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:type"]', 'content', type);
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);
    setMeta('meta[property="og:image"]', 'content', image || DEFAULT_IMAGE);
    setMeta('meta[property="og:site_name"]', 'content', SITE_NAME);

    // Twitter Card
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'content', safeTitle);
    setMeta('meta[name="twitter:description"]', 'content', description);
    setMeta('meta[name="twitter:image"]', 'content', image || DEFAULT_IMAGE);

    // Canonical link
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', canonicalUrl);

    // JSON-LD Schema
    if (schema) {
      let schemaScript = document.getElementById('jsonld-schema');
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'jsonld-schema';
        schemaScript.setAttribute('type', 'application/ld+json');
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(schema);
    }

    return () => {
      const schemaScript = document.getElementById('jsonld-schema');
      if (schemaScript) schemaScript.remove();
    };

  }, [title, description, image, type, canonical, schema]);

  return null;
}
