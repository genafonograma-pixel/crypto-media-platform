import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink font-sans">
      <SEO
        title="About Us | SPORT25"
        description="About SPORT25 sports news platform delivering 24/7 football, basketball, tennis, Formula 1, and global sports coverage."
      />
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 max-w-[1200px] w-full mx-auto px-4 md:px-6 py-12">
        <nav className="flex items-center gap-2 text-sm text-subtle mb-8">
          <Link to="/" className="text-brand hover:underline">Home</Link>
          <span>/</span>
          <span>About</span>
        </nav>

        <div className="max-w-3xl">
          <h1 className="text-hero-mobile md:text-hero font-extrabold font-display text-ink mb-6">
            About SPORT25
          </h1>
          <div className="space-y-6 text-excerpt text-muted leading-relaxed">
            <p>
              SPORT25 is a sports news platform delivering 24/7 coverage of football (soccer), basketball, tennis, Formula 1, and global sports. We aggregate, analyze, and synthesize reporting from the world&apos;s leading sports newsrooms to give readers a clear, unbiased view of what is happening in sport.
            </p>
            <p>
              Our platform monitors major sports publications including Sky Sports, BBC Sport, The Guardian, CBS Sports, ESPN, and Marca — clustering related stories to eliminate duplication and providing clean editorial summaries of major developments.
            </p>

            <h2 className="text-title-mobile md:text-title font-bold font-display text-ink pt-4">
              Our mission
            </h2>
            <p>
              To be the most reliable and readable sports news hub on the internet. Not an overwhelming feed of clutter — but a clear, continuous editorial service that helps fans understand what is happening and why it matters.
            </p>

            <h2 className="text-title-mobile md:text-title font-bold font-display text-ink pt-4">
              How we work
            </h2>
            <p>
              See our{' '}
              <Link to="/methodology" className="text-brand hover:underline">
                How we work page
              </Link>{' '}
              for a detailed explanation of how our editorial pipeline ingests, processes, and presents verified sports reporting.
            </p>

            <hr className="my-8 border-line" />

            <div className="bg-bg-soft rounded-card p-6 md:p-8 border border-line">
              <h2 className="text-card-lg font-bold font-display text-ink mb-3">
                Sports coverage guide
              </h2>
              <p className="text-sm text-muted mb-4">
                A reference guide to following live sports news, tracking league standings, and staying ahead of breaking stories across European and American competitions.
              </p>
              <ul className="space-y-2 text-sm text-ink font-medium">
                <li>• <strong>Football:</strong> Premier League, UEFA Champions League, La Liga, Serie A, Bundesliga, and transfer updates.</li>
                <li>• <strong>Basketball:</strong> NBA regular season, Emirates NBA Cup, Playoffs, and Finals.</li>
                <li>• <strong>Tennis:</strong> Grand Slams (Australian Open, Roland Garros, Wimbledon, US Open) and ATP/WTA 1000 events.</li>
                <li>• <strong>Formula 1:</strong> Grand Prix race weekends, qualifying sessions, and driver/constructor standings.</li>
                <li>• <strong>NFL:</strong> Regular season game recaps, division standings, playoffs, and Super Bowl coverage.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
