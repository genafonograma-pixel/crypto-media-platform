import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink font-sans">
      <SEO title="Privacy Policy | SPORT25" description="SPORT25 Privacy Policy — how we collect, use, and protect your data." />
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 max-w-[1200px] w-full mx-auto px-4 md:px-6 py-12">
        <nav className="flex items-center gap-2 text-sm text-subtle mb-8">
          <Link to="/" className="text-brand hover:underline">Home</Link>
          <span>/</span>
          <span>Privacy policy</span>
        </nav>
        <div className="max-w-3xl">
          <h1 className="text-hero-mobile md:text-hero font-extrabold font-display text-ink mb-4">Privacy policy</h1>
          <p className="text-subtle text-sm mb-8">Last updated: {new Date().getFullYear()}</p>
          <div className="space-y-6 text-excerpt text-muted leading-relaxed">
            <p>This Privacy Policy describes how SPORT25 (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, and protects information when you use our website.</p>
            <h2 className="text-title-mobile md:text-title font-bold font-display text-ink pt-2">Information we collect</h2>
            <p>We may collect anonymous usage data (page views, referral sources) via standard analytics tools to improve our news delivery. We do not sell personal data to third parties.</p>
            <h2 className="text-title-mobile md:text-title font-bold font-display text-ink pt-2">Cookies &amp; analytics</h2>
            <p>We use standard performance cookies for web analytics and to improve reader experience.</p>
            <h2 className="text-title-mobile md:text-title font-bold font-display text-ink pt-2">Contact</h2>
            <p>For privacy inquiries, contact <a href="mailto:privacy@sport25.news" className="text-brand hover:underline">privacy@sport25.news</a>.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
