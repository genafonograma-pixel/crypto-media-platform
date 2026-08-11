import React from 'react';
import { Clock } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MarketMovers from '../components/MarketMovers';
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

function HeroCard({ article }: { article: Article }) {
  const displayTitle = article.headline || article.title;
  const slug = generateSlug(displayTitle);
  const classification = (article as any).classification || article.category?.[0] || 'News';

  return (
    <a href={`/article/${encodeURIComponent(article.article_id)}/${slug}`} className="group block relative overflow-hidden rounded-lg bg-[#111] aspect-[16/9] md:aspect-[21/9]">
      {article.image_url ? (
        <img
          src={article.image_url}
          alt={displayTitle}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-70"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1b2e] to-[#1a0533]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-[#3B82F6] bg-[#3B82F6]/10 border border-[#3B82F6]/20 px-2 py-1 rounded mb-3">
          {classification}
        </span>
        <h1 className="text-xl md:text-3xl font-bold text-white leading-tight mb-3 group-hover:text-[#93C5FD] transition-colors line-clamp-3">
          {displayTitle}
        </h1>
        {article.description && (
          <p className="text-sm text-[#aaa] line-clamp-2 mb-3 max-w-2xl hidden md:block">{article.description}</p>
        )}
        <div className="flex items-center gap-3 text-[11px] text-[#666]">
          <span className="font-semibold text-[#888]">Jordan Cole</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Clock size={10} />{formatTimeAgo(article.pubDate)}</span>
        </div>
      </div>
    </a>
  );
}

function NewsCard({ article, size = 'normal' }: { article: Article; size?: 'normal' | 'small' }) {
  const displayTitle = article.headline || article.title;
  const slug = generateSlug(displayTitle);
  const classification = (article as any).classification || article.category?.[0] || 'News';

  if (size === 'small') {
    return (
      <a href={`/article/${encodeURIComponent(article.article_id)}/${slug}`} className="group flex gap-3 py-3 border-b border-[#1a1a1a] last:border-0">
        {article.image_url && (
          <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded bg-[#111]">
            <img
              src={article.image_url}
              alt={displayTitle}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-[#E0E0E0] group-hover:text-[#3B82F6] transition-colors line-clamp-2 leading-snug mb-1">
            {displayTitle}
          </h3>
          <span className="text-[10px] text-[#555]">{formatTimeAgo(article.pubDate)}</span>
        </div>
      </a>
    );
  }

  return (
    <a href={`/article/${encodeURIComponent(article.article_id)}/${slug}`} className="group block">
      <div className="relative overflow-hidden rounded-md bg-[#111] aspect-[16/9] mb-3">
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={displayTitle}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#111] to-[#3B82F6]/10" />
        )}
      </div>
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#3B82F6] mb-2 block">{classification}</span>
        <h2 className="text-base font-bold text-[#F0F0F0] group-hover:text-[#3B82F6] transition-colors line-clamp-2 leading-snug mb-2">
          {displayTitle}
        </h2>
        {article.description && (
          <p className="text-xs text-[#666] line-clamp-2 mb-3">{article.description}</p>
        )}
        <div className="flex items-center gap-2 text-[10px] text-[#555]">
          <span className="font-semibold text-[#666]">Jordan Cole</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Clock size={9} />{formatTimeAgo(article.pubDate)}</span>
        </div>
      </div>
    </a>
  );
}

export default function Home({ articles, loading, error }: HomeProps) {
  const filteredArticles = articles;

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
        <div className="bg-[#0A0A0A] p-8 border border-[#222] max-w-lg w-full text-center">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Error Loading Feed</h2>
          <p className="text-[#888] mb-6 text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="text-[11px] font-bold uppercase tracking-widest bg-[#3B82F6] text-white px-6 py-3 hover:bg-blue-600 rounded transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const heroArticle = filteredArticles[0];
  const secondaryArticles = filteredArticles.slice(1, 3);
  const gridArticles = filteredArticles.slice(3, 9);
  const sidebarArticles = filteredArticles.slice(9, 17);
  const bottomArticles = filteredArticles.slice(17, 50);

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#F5F5F5] font-sans">
      <SEO title="CryptoStandard - Latest Cryptocurrency News" />
      <Header />
      <MarketMovers />

      <div className="max-w-[1280px] w-full mx-auto px-4 md:px-6 py-6">

        {filteredArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-[#555] text-sm mb-2">No articles available yet.</p>
            <p className="text-[#333] text-xs">The AI is processing stories. Check back in a few minutes.</p>
          </div>
        ) : (
          <>
            {/* Top Section: Hero + 2 secondary cards */}
            {heroArticle && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="md:col-span-2">
                  <HeroCard article={heroArticle} />
                </div>
                <div className="flex flex-col gap-4">
                  {secondaryArticles.map(a => (
                    <NewsCard key={a.article_id} article={a} />
                  ))}
                </div>
              </div>
            )}

            <div className="w-full h-px bg-[#1a1a1a] mb-8" />

            {/* Main content + Right sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Main news grid */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-[#888]">Latest News</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  {gridArticles.map(a => (
                    <NewsCard key={a.article_id} article={a} />
                  ))}
                </div>

                {/* Bottom list */}
                {bottomArticles.length > 0 && (
                  <>
                    <div className="w-full h-px bg-[#1a1a1a] mb-6" />
                    <div className="flex flex-col divide-y divide-[#1a1a1a]">
                      {bottomArticles.map(a => (
                        <NewsCard key={a.article_id} article={a} size="small" />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Right Sidebar */}
              <aside className="lg:col-span-1">
                <div className="sticky top-4">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1a1a1a]">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[#888]">More Stories</h2>
                  </div>
                  <div className="flex flex-col">
                    {sidebarArticles.map(a => (
                      <NewsCard key={a.article_id} article={a} size="small" />
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
