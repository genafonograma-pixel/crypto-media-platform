import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const FAQS = [
  {
    q: "What sports are covered on this platform?",
    a: "We provide comprehensive, 24/7 coverage of Football (Soccer), Basketball (NBA), Tennis (Grand Slams & ATP/WTA), Formula 1, American Football (NFL), and general global sports news."
  },
  {
    q: "How often is the sports news updated?",
    a: "Our sports news feed updates continuously around the clock with breaking transfer stories, live match updates, post-match analysis, injury reports, and tournament standings."
  },
  {
    q: "Where does the sports news content come from?",
    a: "Our editorial intelligence pipeline ingests and synthesizes reporting from leading global sports newsrooms including Sky Sports, BBC Sport, The Guardian, CBS Sports, ESPN, and Marca."
  },
  {
    q: "How can I follow specific sports like Football or Formula 1?",
    a: "You can navigate using the category tabs at the top of the page to filter specifically for Football, Basketball, Tennis, Formula 1, American Football, or General Sports."
  },
  {
    q: "Is all sports news and analysis free to access?",
    a: "Yes, all sports news coverage, match briefs, transfer roundups, and tournament articles are 100% free and open to everyone."
  }
];

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink font-sans">
      <SEO
        title="Help & FAQ | SPORT25"
        description="Frequently asked questions about SPORT25 news coverage, sources, and sports reporting."
      />
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 max-w-[1200px] w-full mx-auto px-4 md:px-6 py-12">
        <nav className="flex items-center gap-2 text-sm text-subtle mb-8">
          <Link to="/" className="text-brand hover:underline">Home</Link>
          <span>/</span>
          <span>Help &amp; FAQ</span>
        </nav>

        <div className="max-w-3xl">
          <h1 className="text-title-mobile md:text-title font-bold font-display text-ink mb-3">
            Frequently asked questions
          </h1>
          <p className="text-excerpt text-muted mb-8">
            Find answers to common questions about our sports reporting, newsroom sources, and coverage schedule.
          </p>

          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <details
                key={i}
                className="group border border-line bg-bg-soft rounded-card overflow-hidden"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none select-none font-display font-bold text-card text-ink">
                  <span>{faq.q}</span>
                  <span className="text-xl text-subtle group-open:rotate-45 transition-transform duration-150 inline-block shrink-0 ml-4">
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 pt-2 text-sm text-muted leading-relaxed border-t border-line">
                  <p>{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
