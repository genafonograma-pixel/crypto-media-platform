import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChevronRight, Flame, TrendingUp, HelpCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MarketMovers from '../components/MarketMovers';
import MarketWatch from '../components/MarketWatch';
import SEO from '../components/SEO';
import AdPlacement from '../components/AdPlacement';
import SeoEditorialBlog from '../components/SeoEditorialBlog';
import type { Article } from '../types';
import { generateSlug } from '../utils';

interface HomeProps {
  articles: Article[];
  loading: boolean;
  error: string | null;
}

function formatTimeAgo(dateStr?: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${Math.max(1, diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function getArticleHref(article: Article) {
  const displayTitle = article.headline || article.title;
  return `/article/${generateSlug(displayTitle)}`;
}

function getClassification(article: Article) {
  return (article as any).classification || article.category?.[0] || 'News';
}

// ─── Hero (Breaking Story) ────────────────────────────────────────────────────
function HeroCard({ article }: { article: Article }) {
  const displayTitle = article.headline || article.title;
  const classification = getClassification(article);
  return (
    <Link
      to={getArticleHref(article)}
      state={{ article }}
      className="group relative flex flex-col justify-end overflow-hidden rounded-xl min-h-[280px] md:min-h-[420px] bg-[#0a0a0a] border border-[#1a1a1a]"
    >
      {article.image_url && (
        <img
          src={article.image_url}
          alt={displayTitle}
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-700"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

      <div className="relative z-10 p-4 md:p-8">
        <div className="flex items-center gap-2 mb-2 md:mb-3">
          <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amber-400">
            <Flame size={10} /> Top Breaking Story
          </span>
        </div>
        <h2 className="text-xl md:text-3xl lg:text-4xl font-black leading-tight text-white group-hover:text-[#FBBF5A] transition-colors mb-3 md:mb-4 line-clamp-3">
          {displayTitle}
        </h2>
        {article.description && (
          <p className="hidden sm:block text-sm text-[#aaa] line-clamp-2 mb-4 max-w-xl">{article.description}</p>
        )}
        <div className="flex items-center gap-3 text-[11px] text-[#777]">
          <span className="bg-[#F4A917] text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">{classification}</span>
          <span className="flex items-center gap-1"><Clock size={10} />{formatTimeAgo(article.pubDate)}</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Secondary Story ──────────────────────────────────────────────────────────
function SecondaryCard({ article }: { article: Article }) {
  const displayTitle = article.headline || article.title;
  const classification = getClassification(article);
  return (
    <Link
      to={getArticleHref(article)}
      state={{ article }}
      className="group flex gap-4 p-4 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#2a2a2a] hover:bg-[#111] transition-all"
    >
      {article.image_url && (
        <div className="w-24 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-[#111]">
          <img
            src={article.image_url}
            alt={displayTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <span className="text-[9px] font-black uppercase tracking-widest text-[#F4A917] block mb-1">{classification}</span>
        <h3 className="text-sm font-bold text-[#E5E5E5] group-hover:text-[#F4A917] transition-colors line-clamp-3 leading-snug mb-2">
          {displayTitle}
        </h3>
        <span className="text-[10px] text-[#555] flex items-center gap-1"><Clock size={9} />{formatTimeAgo(article.pubDate)}</span>
      </div>
    </Link>
  );
}

// ─── Trending Card ────────────────────────────────────────────────────────────
function TrendingCard({ article, index }: { article: Article; index: number }) {
  const displayTitle = article.headline || article.title;
  const classification = getClassification(article);
  return (
    <Link
      to={getArticleHref(article)}
      state={{ article }}
      className="group flex gap-3 p-4 rounded-xl bg-[#0a0a0a] border border-[#1a1a1a] hover:border-[#2a2a2a] hover:bg-[#0f0f0f] transition-all h-full"
    >
      {article.image_url ? (
        <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg bg-[#111]">
          <img
            src={article.image_url}
            alt={displayTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      ) : (
        <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-[#111] flex items-center justify-center text-[#222]">
           <span className="font-black text-xl tracking-tighter opacity-50">WWCS</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <span className="text-[9px] font-black uppercase tracking-widest text-[#F4A917] block mb-1.5">{classification}</span>
        <h3 className="text-sm font-bold text-[#E0E0E0] group-hover:text-[#F4A917] transition-colors line-clamp-2 leading-snug mb-2">
          {displayTitle}
        </h3>
        <span className="text-[10px] text-[#555] flex items-center gap-1"><Clock size={9} />{formatTimeAgo(article.pubDate)}</span>
      </div>
    </Link>
  );
}

// ─── Main Feed Card ───────────────────────────────────────────────────────────
function FeedCard({ article }: { article: Article }) {
  const displayTitle = article.headline || article.title;
  const classification = getClassification(article);
  return (
    <Link
      to={getArticleHref(article)}
      state={{ article }}
      className="group flex gap-4 sm:gap-5 py-4 sm:py-5 border-b border-[#131313] last:border-0 hover:bg-[#0a0a0a] -mx-4 px-4 rounded-lg transition-colors"
    >
      {article.image_url && (
        <div className="w-20 h-16 sm:w-28 sm:h-24 flex-shrink-0 overflow-hidden rounded-lg bg-[#111]">
          <img
            src={article.image_url}
            alt={displayTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <span className="text-[9px] font-black uppercase tracking-widest text-[#F4A917] block mb-1.5">{classification}</span>
        <h3 className="text-sm sm:text-base font-bold text-[#E5E5E5] group-hover:text-[#F4A917] transition-colors line-clamp-2 leading-snug mb-2">
          {displayTitle}
        </h3>
        {article.description && (
          <p className="hidden sm:block text-[13px] text-[#666] line-clamp-1 mb-2">{article.description}</p>
        )}
        <span className="text-[10px] text-[#555] flex items-center gap-1 mt-auto"><Clock size={9} />{formatDate(article.pubDate)}</span>
      </div>
    </Link>
  );
}

// ─── Sidebar Mini Card ────────────────────────────────────────────────────────
function SidebarCard({ article, index }: { article: Article; index: number }) {
  const displayTitle = article.headline || article.title;
  const classification = getClassification(article);
  return (
    <Link
      to={getArticleHref(article)}
      state={{ article }}
      className="group flex gap-3 py-3.5 border-b border-[#131313] last:border-0 hover:bg-[#0a0a0a] -mx-4 px-4 rounded-lg transition-colors"
    >
      <span className="text-base font-black text-[#1e1e1e] group-hover:text-[#252525] transition-colors select-none shrink-0 w-5 text-center mt-0.5">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <span className="text-[9px] font-black uppercase tracking-widest text-[#F4A917] block mb-1">{classification}</span>
        <h3 className="text-[13px] font-semibold text-[#D5D5D5] group-hover:text-[#F4A917] transition-colors line-clamp-2 leading-snug">
          {displayTitle}
        </h3>
        <span className="text-[9px] text-[#555] flex items-center gap-1 mt-1"><Clock size={8} />{formatTimeAgo(article.pubDate)}</span>
      </div>
    </Link>
  );
}

// ─── FAQ Section ─────────────────────────────────────────────────────────────
const HOME_FAQS = [
  {
    q: "What is Wild West Crypto Show?",
    a: "Wild West Crypto Show is a premier digital asset intelligence and cryptocurrency news platform delivering 24/7 real-time Bitcoin, altcoin, DeFi, and blockchain coverage. Our editorial team curates, verifies, and analyzes market movements from primary sources globally."
  },
  {
    q: "How often is the cryptocurrency news updated?",
    a: "Our editorial pipeline refreshes every 15 minutes around the clock, delivering the latest Bitcoin spot ETF flows, breaking crypto protocol news, market volatility alerts, and macroeconomic trends."
  },
  {
    q: "Where can I check live Bitcoin and cryptocurrency prices?",
    a: "Live Bitcoin and altcoin prices are displayed on our Bitcoin page, in the interactive Market Movers ticker across the top of every page, and in the Market Watch sidebar."
  },
  {
    q: "What cryptocurrency categories are covered?",
    a: "We provide dedicated coverage for Bitcoin (BTC), Altcoins (Ethereum, Solana, XRP and more), Decentralized Finance (DeFi), Web3 & NFTs, Crypto Markets, and Blockchain Technology."
  },
  {
    q: "How does Wild West Crypto Show ensure news accuracy?",
    a: "Every story is cross-referenced with on-chain data, exchange liquidity metrics, official protocol announcements, and verified press releases before publishing."
  },
  {
    q: "Is all market analysis and cryptocurrency news free to read?",
    a: "Yes, all articles, live market data feeds, charts, and technical summaries on Wild West Crypto Show are 100% free and open to everyone."
  }
];

function FAQSection() {
  return (
    <section aria-label="Frequently Asked Questions about cryptocurrency news" className="mt-14 mb-8 pt-10 border-t border-zinc-800/80">
      <div className="flex items-center gap-2 mb-2 text-zinc-400">
        <HelpCircle size={15} />
        <span className="text-[11px] font-semibold uppercase tracking-wider">Frequently Asked Questions</span>
      </div>
      <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mb-6">
        Crypto News &amp; Markets FAQ
      </h2>
      <div className="space-y-3">
        {HOME_FAQS.map((faq, i) => (
          <details
            key={i}
            className="group border border-zinc-800/80 bg-[#0B0B0C] rounded-xl overflow-hidden transition-all duration-300"
          >
            <summary className="flex items-center justify-between p-5 cursor-pointer list-none hover:bg-zinc-900/60 transition-colors duration-200 select-none">
              <h3 className="pr-6 leading-snug font-semibold text-zinc-200 text-sm uppercase tracking-wide">
                {faq.q}
              </h3>
              <div className="relative w-5 h-5 flex items-center justify-center shrink-0 text-zinc-400 group-hover:text-zinc-200">
                <span className="font-bold text-xl leading-none absolute group-open:opacity-0 transition-opacity">+</span>
                <span className="font-bold text-xl leading-none absolute opacity-0 group-open:opacity-100 transition-opacity">−</span>
              </div>
            </summary>
            <div className="px-5 pb-5 pt-2 text-zinc-400 text-sm leading-relaxed border-t border-zinc-800/60">
              <p>{faq.a}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

export default function Home({ articles, loading, error }: HomeProps) {
  const [visibleFeedCount, setVisibleFeedCount] = useState(8);

  const sortedArticles = [...articles].sort((a, b) =>
    (new Date(b.pubDate || 0).getTime() || 0) - (new Date(a.pubDate || 0).getTime() || 0)
  );

  const homeSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://wildwestcryptoshow.com/#website",
        "url": "https://wildwestcryptoshow.com",
        "name": "Wild West Crypto Show",
        "description": "Stay updated with the latest cryptocurrency news, bitcoin updates, altcoin markets, blockchain technology, and DeFi insights.",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://wildwestcryptoshow.com/news?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "NewsMediaOrganization",
        "@id": "https://wildwestcryptoshow.com/#organization",
        "name": "Wild West Crypto Show",
        "alternateName": ["WWCS", "Wild West Crypto"],
        "url": "https://wildwestcryptoshow.com",
        "logo": {
          "@type": "ImageObject",
          "url": "https://wildwestcryptoshow.com/wildwest_logo.svg",
          "width": 240,
          "height": 60
        },
        "description": "Wild West Crypto Show is an AI-powered cryptocurrency news and market intelligence platform delivering real-time Bitcoin updates, altcoin analysis, DeFi reporting, and blockchain insights.",
        "foundingDate": "2024",
        "publishingPrinciples": "https://wildwestcryptoshow.com/methodology",
        "knowsAbout": [
          "Bitcoin",
          "Cryptocurrency",
          "Ethereum",
          "Altcoins",
          "Decentralized Finance (DeFi)",
          "Blockchain Technology",
          "Web3",
          "Crypto Trading and Market Analysis"
        ],
        "sameAs": [
          "https://x.com/wildwestcrypto",
          "https://t.me/wildwestcrypto"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "editorial",
          "url": "https://wildwestcryptoshow.com/contact"
        }
      },
      {
        "@type": "FAQPage",
        "@id": "https://wildwestcryptoshow.com/#faq",
        "mainEntity": HOME_FAQS.map(faq => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.a
          }
        }))
      }
    ]
  }), []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-[#F5F5F5]">
        <div className="w-10 h-10 border-4 border-[#222] border-t-[#F4A917] rounded-full animate-spin" />
        <p className="mt-4 font-bold uppercase tracking-widest text-[10px] text-[#555]">Loading Live Feed...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-[#F5F5F5] px-4">
        <div className="bg-[#0A0A0A] p-8 border border-[#222] max-w-lg w-full text-center rounded-xl">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Error Loading Feed</h2>
          <p className="text-[#888] mb-6 text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="text-[11px] font-bold uppercase tracking-widest bg-[#F4A917] text-white px-6 py-3 hover:bg-[#C4830B] rounded transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const hero = sortedArticles[0];
  const secondaryArticles = sortedArticles.slice(1, 4);
  const trendingArticles = sortedArticles.length > 4 ? sortedArticles.slice(4, 8) : [];
  const feedArticles = sortedArticles.length > 8 
    ? sortedArticles.slice(8) 
    : (sortedArticles.length > 1 ? sortedArticles.slice(1) : sortedArticles);
  const sidebarArticles = sortedArticles.length > 1 ? sortedArticles.slice(1, 10) : sortedArticles;

  const displayedFeedArticles = feedArticles.slice(0, visibleFeedCount);

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#F5F5F5] font-sans">
      <SEO 
        title="Crypto News & Bitcoin Markets | Wild West Crypto Show" 
        description="Stay updated with the latest cryptocurrency news, bitcoin updates, altcoin markets, blockchain technology, and DeFi insights on Wild West Crypto Show."
        schema={homeSchema}
      />
      <Header />
      <MarketMovers />
      <div className="max-w-[1280px] w-full mx-auto px-4 md:px-6 py-4">
        <AdPlacement format="billboard" className="mx-auto" />
      </div>

      <div className="max-w-[1280px] w-full mx-auto px-4 md:px-6 py-6">

        {/* ── Page H1 Header ── */}
        <header className="mb-8 pb-5 border-b border-zinc-800/80">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Live 24/7 Digital Asset Intelligence
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white">
                Cryptocurrency News &amp; Bitcoin Markets
              </h1>
            </div>
            <p className="text-xs sm:text-[13px] text-zinc-400 max-w-md md:text-right leading-relaxed font-normal">
              Real-time breaking crypto headlines, on-chain market analytics, Bitcoin ETF flows, and decentralized finance updates.
            </p>
          </div>
        </header>

        {sortedArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-[#555] text-sm mb-2">No articles available yet.</p>
            <p className="text-[#333] text-xs">The AI is processing stories. Check back in a few minutes.</p>
          </div>
        ) : (
          <>
            {/* ── Section 1: Hero + Right Column ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              {/* Hero */}
              <div className="lg:col-span-2">
                {hero && <HeroCard article={hero} />}
              </div>
              {/* Right secondary cards */}
              <div className="flex flex-col gap-3">
                {secondaryArticles.map(a => (
                  <React.Fragment key={a.article_id}>
                    <SecondaryCard article={a} />
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* ── Section 2: Trending Now ── */}
            {trendingArticles.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={14} className="text-[#F4A917]" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-[#E0E0E0]">Trending Cryptocurrency News &amp; Market Stories</h2>
                  <div className="flex-1 h-px bg-[#1a1a1a]" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {trendingArticles.map((a, i) => (
                    <React.Fragment key={a.article_id}>
                      <TrendingCard article={a} index={i} />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* ── Section 3: Main Feed + Sidebar ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">

              {/* Main Feed */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-sm font-black uppercase tracking-widest text-[#E0E0E0]">Latest Cryptocurrency &amp; Bitcoin News</h2>
                  <div className="flex-1 h-px bg-[#1a1a1a]" />
                  <Link to="/news" className="text-[10px] font-bold uppercase tracking-widest text-[#F4A917] hover:text-[#FBBF5A] transition-colors">
                    View All →
                  </Link>
                </div>
                <div>
                  {displayedFeedArticles.map((a, i) => (
                    <React.Fragment key={a.article_id}>
                      <FeedCard article={a} />
                      {i > 0 && i % 3 === 0 && (
                        <div className="py-4 border-b border-[#131313]">
                          <AdPlacement format="in-article" className="mx-auto" />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                {feedArticles.length === 0 && (
                  <p className="text-[#555] text-sm py-8 text-center">No more articles available.</p>
                )}

                {/* Load More News Button */}
                {feedArticles.length > visibleFeedCount && (
                  <button
                    onClick={() => setVisibleFeedCount(prev => prev + 8)}
                    className="w-full mt-5 py-3.5 px-4 rounded-xl bg-[#0f0f0f] hover:bg-[#161616] border border-[#222] text-[#CCC] hover:text-[#F4A917] font-bold text-xs uppercase tracking-widest transition-all shadow-md active:translate-y-0.5"
                  >
                    Load More Stories ({feedArticles.length - visibleFeedCount} remaining)
                  </button>
                )}
              </div>

              {/* Sidebar */}
              <aside className="lg:col-span-1 space-y-4">
                {/* Market Watch Widget */}
                <MarketWatch />

                {/* Most Read */}
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a1a1a]">
                    <h2 className="text-xs font-black uppercase tracking-widest text-[#DDD]">Most Read Cryptocurrency Articles</h2>
                  </div>
                  <div className="px-4 py-2">
                    {sidebarArticles.map((a, i) => (
                      <React.Fragment key={a.article_id}>
                        <SidebarCard article={a} index={i} />
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                <div className="hidden lg:block mt-6">
                  <AdPlacement format="skyscraper" className="mx-auto" />
                </div>
              </aside>
            </div>

            {/* ── Section 4: Comprehensive In-Depth SEO Blog Article ── */}
            <SeoEditorialBlog category="home" />

            {/* ── Section 5: Frequently Asked Questions ── */}
            <FAQSection />
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
