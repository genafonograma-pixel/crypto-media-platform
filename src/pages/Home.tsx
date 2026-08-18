import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChevronRight, Flame, TrendingUp } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MarketMovers from '../components/MarketMovers';
import MarketWatch from '../components/MarketWatch';
import SEO from '../components/SEO';
import type { Article } from '../types';
import { generateSlug } from '../utils';

interface HomeProps {
  articles: Article[];
  loading: boolean;
  error: string | null;
}

function formatTimeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateStr));
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
      className="group relative flex flex-col justify-end overflow-hidden rounded-xl min-h-[420px] bg-[#0a0a0a] border border-[#1a1a1a]"
    >
      {article.image_url && (
        <img
          src={article.image_url}
          alt={displayTitle}
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-75 group-hover:scale-105 transition-all duration-700"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      )}
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

      <div className="relative z-10 p-6 md:p-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amber-400">
            <Flame size={10} /> Top Breaking Story
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight text-white group-hover:text-[#93C5FD] transition-colors mb-4 line-clamp-3">
          {displayTitle}
        </h2>
        {article.description && (
          <p className="text-sm text-[#aaa] line-clamp-2 mb-4 max-w-xl">{article.description}</p>
        )}
        <div className="flex items-center gap-3 text-[11px] text-[#777]">
          <span className="bg-[#3B82F6] text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">{classification}</span>
          <span className="flex items-center gap-1"><Clock size={10} />{formatTimeAgo(article.pubDate)}</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Secondary Story (right column of hero section) ──────────────────────────
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
        <span className="text-[9px] font-black uppercase tracking-widest text-[#3B82F6] block mb-1">{classification}</span>
        <h3 className="text-sm font-bold text-[#E5E5E5] group-hover:text-[#3B82F6] transition-colors line-clamp-3 leading-snug mb-2">
          {displayTitle}
        </h3>
        <span className="text-[10px] text-[#555] flex items-center gap-1"><Clock size={9} />{formatTimeAgo(article.pubDate)}</span>
      </div>
    </Link>
  );
}

// ─── Trending Card (horizontal strip) ────────────────────────────────────────
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
           <span className="font-black text-xl tracking-tighter opacity-50">CS</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <span className="text-[9px] font-black uppercase tracking-widest text-[#3B82F6] block mb-1.5">{classification}</span>
        <h3 className="text-sm font-bold text-[#E0E0E0] group-hover:text-[#3B82F6] transition-colors line-clamp-2 leading-snug mb-2">
          {displayTitle}
        </h3>
        <span className="text-[10px] text-[#555] flex items-center gap-1"><Clock size={9} />{formatTimeAgo(article.pubDate)}</span>
      </div>
    </Link>
  );
}

// ─── Main Feed Card (left column) ────────────────────────────────────────────
function FeedCard({ article }: { article: Article }) {
  const displayTitle = article.headline || article.title;
  const classification = getClassification(article);
  return (
    <Link
      to={getArticleHref(article)}
      state={{ article }}
      className="group flex gap-5 py-5 border-b border-[#131313] last:border-0 hover:bg-[#0a0a0a] -mx-4 px-4 rounded-lg transition-colors"
    >
      {article.image_url && (
        <div className="w-28 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-[#111]">
          <img
            src={article.image_url}
            alt={displayTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <span className="text-[9px] font-black uppercase tracking-widest text-[#3B82F6] block mb-1.5">{classification}</span>
        <h3 className="text-base font-bold text-[#E5E5E5] group-hover:text-[#3B82F6] transition-colors line-clamp-2 leading-snug mb-2">
          {displayTitle}
        </h3>
        {article.description && (
          <p className="text-[13px] text-[#666] line-clamp-1 mb-2">{article.description}</p>
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
      <span className="text-xl font-black text-[#1e1e1e] group-hover:text-[#252525] transition-colors select-none shrink-0 w-6 text-center mt-0.5">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <span className="text-[9px] font-black uppercase tracking-widest text-[#3B82F6] block mb-1">{classification}</span>
        <h3 className="text-[13px] font-semibold text-[#D5D5D5] group-hover:text-[#3B82F6] transition-colors line-clamp-2 leading-snug">
          {displayTitle}
        </h3>
        <span className="text-[9px] text-[#555] flex items-center gap-1 mt-1"><Clock size={8} />{formatTimeAgo(article.pubDate)}</span>
      </div>
    </Link>
  );
}

export default function Home({ articles, loading, error }: HomeProps) {
  const sortedArticles = [...articles].sort((a, b) =>
    new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-[#F5F5F5]">
        <div className="w-10 h-10 border-4 border-[#222] border-t-[#3B82F6] rounded-full animate-spin" />
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
          <button onClick={() => window.location.reload()} className="text-[11px] font-bold uppercase tracking-widest bg-[#3B82F6] text-white px-6 py-3 hover:bg-blue-600 rounded transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const hero = sortedArticles[0];
  const secondaryArticles = sortedArticles.slice(1, 4);
  const trendingArticles = sortedArticles.slice(4, 8);
  const feedArticles = sortedArticles.slice(8, 20);
  const sidebarArticles = sortedArticles.slice(1, 10);

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#F5F5F5] font-sans">
      <SEO title="Crypton - Latest Cryptocurrency News" />
      <Header />
      <MarketMovers />

      <div className="max-w-[1280px] w-full mx-auto px-4 md:px-6 py-6">

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
                  <TrendingUp size={14} className="text-[#3B82F6]" />
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-[#888]">Trending Now</h2>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Main Feed */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-[10px] font-black uppercase tracking-widest text-[#888]">Latest News</h2>
                  <div className="flex-1 h-px bg-[#1a1a1a]" />
                  <Link to="/news" className="text-[10px] font-bold uppercase tracking-widest text-[#3B82F6] hover:text-[#93C5FD] transition-colors">
                    View All →
                  </Link>
                </div>
                <div>
                  {feedArticles.map(a => (
                    <React.Fragment key={a.article_id}>
                      <FeedCard article={a} />
                    </React.Fragment>
                  ))}
                </div>
                {feedArticles.length === 0 && (
                  <p className="text-[#555] text-sm py-8 text-center">No more articles available.</p>
                )}
              </div>

              {/* Sidebar */}
              <aside className="lg:col-span-1 space-y-4">
                {/* Market Watch Widget */}
                <MarketWatch />

                {/* Most Read */}
                <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a1a1a]">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#888]">Most Read</span>
                  </div>
                  <div className="px-4 py-2">
                    {sidebarArticles.map((a, i) => (
                      <React.Fragment key={a.article_id}>
                        <SidebarCard article={a} index={i} />
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
