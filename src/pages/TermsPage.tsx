import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink font-sans">
      <SEO title="Terms of Service | SPORT25" description="SPORT25 Terms of Service — terms and conditions for using our platform." />
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 max-w-[1200px] w-full mx-auto px-4 md:px-6 py-12">
        <nav className="flex items-center gap-2 text-sm text-subtle mb-8">
          <Link to="/" className="text-brand hover:underline">Home</Link>
          <span>/</span>
          <span>Terms of service</span>
        </nav>
        <div className="max-w-3xl">
          <h1 className="text-hero-mobile md:text-hero font-extrabold font-display text-ink mb-4">Terms of service</h1>
          <p className="text-subtle text-sm mb-8">Last updated: {new Date().getFullYear()}</p>
          <div className="space-y-6 text-excerpt text-muted leading-relaxed">
            <p>By using the SPORT25 sports news service, you agree to these Terms of Service.</p>
            <h2 className="text-title-mobile md:text-title font-bold font-display text-ink pt-2">Editorial disclaimer</h2>
            <p>All content on this platform is for informational and journalistic purposes only. Our sports summaries do not constitute betting advice, fantasy sports tips, or official club communications.</p>
            <h2 className="text-title-mobile md:text-title font-bold font-display text-ink pt-2">Attribution &amp; sources</h2>
            <p>Third-party news reporting is credited to original publishers including Sky Sports, BBC Sport, The Guardian, CBS Sports, ESPN, and Marca.</p>
            <h2 className="text-title-mobile md:text-title font-bold font-display text-ink pt-2">Contact</h2>
            <p>For terms-related questions, contact <a href="mailto:terms@sport25.news" className="text-brand hover:underline">terms@sport25.news</a>.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
