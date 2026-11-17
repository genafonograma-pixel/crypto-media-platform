import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function MethodologyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink font-sans">
      <SEO
        title="How We Work | SPORT25"
        description="How our sports news platform ingests, clusters, and synthesizes football, basketball, tennis, and Formula 1 coverage."
      />
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 max-w-[1200px] w-full mx-auto px-4 md:px-6 py-12">
        <nav className="flex items-center gap-2 text-sm text-subtle mb-8">
          <Link to="/" className="text-brand hover:underline">Home</Link>
          <span>/</span>
          <span>How we work</span>
        </nav>

        <div className="max-w-3xl">
          <h1 className="text-hero-mobile md:text-hero font-extrabold font-display text-ink mb-6">
            How we work
          </h1>
          <div className="space-y-6 text-excerpt text-muted leading-relaxed">
            <p>
              Our platform uses a hybrid intelligence system to track, normalize, and analyze sports news in real time. We combine continuous source ingestion with automated verification to synthesize events from leading global sports newsrooms without human editorial bottlenecks.
            </p>

            <h2 className="text-title-mobile md:text-title font-bold font-display text-ink pt-4">
              1. Source ingestion &amp; aggregation
            </h2>
            <p>
              We monitor top sports news outlets — Sky Sports, BBC Sport, The Guardian, CBS Sports, ESPN, and Marca — via verified newsroom feeds. Stories are fetched continuously to ensure up-to-date coverage across Football, Basketball, Tennis, Formula 1, and American Football.
            </p>

            <h2 className="text-title-mobile md:text-title font-bold font-display text-ink pt-4">
              2. Event clustering &amp; duplicate detection
            </h2>
            <p>
              When multiple publications report on the same event (such as a major transfer or match result), our system groups them into a single coherent story and cites all relevant primary sources.
            </p>

            <h2 className="text-title-mobile md:text-title font-bold font-display text-ink pt-4">
              3. Journalistic synthesis
            </h2>
            <p>
              Our editorial pipeline extracts only verified facts from source reporting, maintaining neutrality and clear context while avoiding unverified speculation.
            </p>

            <h2 className="text-title-mobile md:text-title font-bold font-display text-ink pt-4">
              4. Authentic photography
            </h2>
            <p>
              All article photography is sourced directly from original publishers. We do not generate AI images — authentic sports photography is used throughout the platform.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
