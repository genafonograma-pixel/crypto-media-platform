import React, { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  type?: string;
  canonical?: string; // Override canonical URL (e.g. point to original article source)
  schema?: any; // Structured JSON-LD schema
}

export default function SEO({ 
  title, 
  description = "Stay updated with the latest cryptocurrency news, insights, and market movements.", 
  image = "", 
  type = "website",
  canonical,
  schema
}: SEOProps) {
  useEffect(() => {
    // Set standard tags
    document.title = title;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    // Set Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', description);

    const ogType = document.querySelector('meta[property="og:type"]');
    if (ogType) ogType.setAttribute('content', type);

    if (image) {
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) ogImage.setAttribute('content', image);
    }

    // Dynamic Canonical URL
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    // If a canonical override is provided (e.g. original article URL), use it.
    // Otherwise fall back to the current page URL (removes query params).
    const canonicalUrl = canonical || (window.location.origin + window.location.pathname);
    canonicalEl.setAttribute('href', canonicalUrl);
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', canonicalUrl);

    // Dynamic JSON-LD Schema
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
      // Clean up schema on unmount or before running effect again
      const schemaScript = document.getElementById('jsonld-schema');
      if (schemaScript) {
        schemaScript.remove();
      }
    };

  }, [title, description, image, type, canonical, schema]);

  return null;
}
