import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { SPORTS_NAV } from '../data/nav';

export default function NotFoundPage() {
  const schema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: '404 - Page Not Found | SPORT25',
    description: "The page you're looking for doesn't exist. Browse the latest sports news.",
    url: typeof window !== 'undefined' ? window.location.href : 'https://sport25.news/404'
  }), []);

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink font-sans">
      <SEO
        title="404 - Page Not Found | SPORT25"
        description="The page you're looking for doesn't exist. Browse the latest football, basketball, tennis, and Formula 1 news."
        schema={schema}
      />
      <Header />

      <main id="main" tabIndex={-1} className="flex-1 max-w-[1200px] w-full mx-auto px-4 md:px-6 py-20 flex flex-col items-center justify-center text-center">
        <div className="text-6xl md:text-8xl font-extrabold font-display leading-none text-muted select-none mb-4">
          404
        </div>

        <h1 className="text-title-mobile md:text-title font-bold font-display text-ink mb-3">
          Page not found
        </h1>
        <p className="text-excerpt text-muted max-w-md mb-8 leading-relaxed">
          The page you are looking for does not exist or has been moved. Browse the latest sports news below.
        </p>

        <Link
          to="/"
          className="inline-flex items-center justify-center h-10 px-6 rounded-card bg-brand hover:bg-brand-600 text-white text-sm font-semibold transition-colors duration-150 mb-12"
        >
          Back to homepage
        </Link>

        <div className="w-full max-w-lg">
          <p className="text-sm font-semibold text-subtle mb-4">
            Explore sports categories
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SPORTS_NAV.map(({ label, href }) => (
              <Link
                key={href}
                to={href}
                className="flex items-center justify-center h-10 px-4 rounded-card bg-bg-soft border border-line hover:border-brand hover:text-brand transition-colors duration-150 text-sm font-medium text-ink"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
