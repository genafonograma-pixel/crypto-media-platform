import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function NotFoundPage() {
  const schema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "404 - Page Not Found | Crypton",
    "description": "The page you're looking for doesn't exist. Browse the latest cryptocurrency and Bitcoin news on Crypton.",
    "url": window.location.href
  }), []);

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#F5F5F5] font-sans">
      <SEO
        title="404 - Page Not Found | Crypton"
        description="The page you're looking for doesn't exist. Browse the latest cryptocurrency and Bitcoin news on Crypton."
        schema={schema}
      />
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
        <div className="text-[120px] md:text-[180px] font-black leading-none tracking-tighter text-[#111] select-none mb-4">
          404
        </div>

        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tighter uppercase text-[#F5F5F5] mb-4">
          Page Not Found
        </h1>
        <p className="text-[#666] text-sm md:text-base max-w-md mb-12 leading-relaxed">
          The page you are looking for does not exist or has been moved. Browse the latest crypto news below.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-[#3B82F6] hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest px-8 py-4 rounded transition-colors mb-12"
        >
          Back to Homepage
        </Link>

        <div className="w-full max-w-2xl">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#444] mb-6">
            Explore by Category
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'All News', to: '/news' },
              { label: 'Bitcoin', to: '/news/bitcoin' },
              { label: 'Altcoins', to: '/news/altcoins' },
              { label: 'DeFi', to: '/news/defi' },
              { label: 'Web3 & NFT', to: '/news/web3' },
              { label: 'Markets', to: '/news/markets' },
            ].map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center justify-center py-3 px-4 rounded-lg bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#3B82F6] hover:text-[#3B82F6] transition-colors text-xs font-bold uppercase tracking-widest text-[#888]"
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
