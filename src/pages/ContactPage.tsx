import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink font-sans">
      <SEO title="Contact Us | SPORT25" description="Contact SPORT25 for editorial inquiries, advertising, or general information." />
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 max-w-[1200px] w-full mx-auto px-4 md:px-6 py-12">
        <nav className="flex items-center gap-2 text-sm text-subtle mb-8">
          <Link to="/" className="text-brand hover:underline">Home</Link>
          <span>/</span>
          <span>Contact</span>
        </nav>
        <div className="max-w-3xl">
          <h1 className="text-hero-mobile md:text-hero font-extrabold font-display text-ink mb-6">Contact us</h1>
          <div className="space-y-6 text-excerpt text-muted leading-relaxed">
            <p>We welcome news tips, editorial feedback, and advertising inquiries.</p>
            <h2 className="text-title-mobile md:text-title font-bold font-display text-ink pt-2">General inquiries</h2>
            <p>Email: <a href="mailto:editor@sport25.news" className="text-brand hover:underline">editor@sport25.news</a></p>
            <h2 className="text-title-mobile md:text-title font-bold font-display text-ink pt-2">Advertising &amp; partnerships</h2>
            <p>Email: <a href="mailto:partners@sport25.news" className="text-brand hover:underline">partners@sport25.news</a></p>
            <h2 className="text-title-mobile md:text-title font-bold font-display text-ink pt-2">Editorial tips &amp; corrections</h2>
            <p>Email: <a href="mailto:newsdesk@sport25.news" className="text-brand hover:underline">newsdesk@sport25.news</a></p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
