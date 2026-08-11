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

interface NewsCardProps {
  article: Article;
  variant?: 'hero' | 'wide' | 'tall' | 'normal' | 'list';
}

const NewsCard: React.FC<NewsCardProps> = ({ article, variant = 'normal' }) => {
  const displayTitle = article.headline || article.title;
  const slug = generateSlug(displayTitle);
  const classification = (article as any).classification || article.category?.[0] || 'News';

  const baseClasses = "group block relative overflow-hidden rounded-lg bg-[#111] transition-transform duration-300";
  
  if (variant === 'list') {
    return (
      <a href={`/article/${encodeURIComponent(article.article_id)}/${slug}`} className="group flex gap-3 py-3 border-b border-[#1a1a1a] last:border-0 hover:bg-[#111] -mx-2 px-2 rounded transition-colors">
        {article.image_url && (
          <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded bg-[#111]">
            <img
              src={article.image_url}
              alt={displayTitle}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0 py-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#3B82F6] mb-1 block">{classification}</span>
          <h3 className="text-sm font-semibold text-[#E0E0E0] group-hover:text-[#3B82F6] transition-colors line-clamp-2 leading-snug mb-1">
            {displayTitle}
          </h3>
          <span className="text-[10px] text-[#555] flex items-center gap-1"><Clock size={10} />{formatTimeAgo(article.pubDate)}</span>
        </div>
      </a>
    );
  }

  // Layout logic for bento box sizes
  let wrapperClasses = baseClasses;
  let imgWrapperClasses = "relative w-full overflow-hidden";
  let contentClasses = "p-4";
  let titleClasses = "font-bold text-[#F0F0F0] group-hover:text-[#3B82F6] transition-colors leading-snug";
  let showDescription = false;
  let isOverlay = false;

  switch (variant) {
    case 'hero':
      wrapperClasses += " col-span-1 md:col-span-2 lg:col-span-2 row-span-2 h-full min-h-[300px] md:min-h-[400px]";
      imgWrapperClasses = "absolute inset-0 w-full h-full";
      contentClasses = "absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10";
      titleClasses = "text-xl md:text-3xl font-bold text-white group-hover:text-[#93C5FD] transition-colors leading-tight mb-3 line-clamp-3";
      showDescription = true;
      isOverlay = true;
      break;
    case 'wide':
      wrapperClasses += " col-span-1 md:col-span-2 lg:col-span-2 row-span-1 flex flex-col sm:flex-row h-full min-h-[160px]";
      imgWrapperClasses = "relative w-full sm:w-2/5 h-48 sm:h-full flex-shrink-0";
      contentClasses = "p-5 sm:p-6 flex flex-col justify-center flex-1";
      titleClasses = "text-lg md:text-xl font-bold text-[#F0F0F0] group-hover:text-[#3B82F6] transition-colors leading-snug mb-2 line-clamp-2";
      showDescription = true;
      break;
    case 'tall':
      wrapperClasses += " col-span-1 row-span-2 flex flex-col h-full min-h-[300px]";
      imgWrapperClasses = "relative w-full flex-1 min-h-[160px]";
      contentClasses = "p-5 bg-[#0a0a0a]";
      titleClasses = "text-lg font-bold text-[#F0F0F0] group-hover:text-[#3B82F6] transition-colors leading-snug mb-2 line-clamp-3";
      showDescription = true;
      break;
    case 'normal':
    default:
      wrapperClasses += " col-span-1 row-span-1 flex flex-col h-full";
      imgWrapperClasses = "relative w-full aspect-[16/9]";
      contentClasses = "p-4 bg-[#0a0a0a] flex-1 flex flex-col";
      titleClasses = "text-base font-bold text-[#F0F0F0] group-hover:text-[#3B82F6] transition-colors leading-snug mb-2 line-clamp-2";
      break;
  }

  return (
    <a href={`/article/${encodeURIComponent(article.article_id)}/${slug}`} className={wrapperClasses}>
      <div className={imgWrapperClasses}>
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={displayTitle}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#111] to-[#3B82F6]/20" />
        )}
        {isOverlay && <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />}
      </div>
      
      <div className={contentClasses}>
        <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-[#3B82F6] mb-2">
          {classification}
        </span>
        <h2 className={titleClasses}>
          {displayTitle}
        </h2>
        {showDescription && article.description && (
          <p className={`text-sm text-[#999] line-clamp-2 mb-3 ${isOverlay ? 'text-[#ccc]' : ''}`}>{article.description}</p>
        )}
        <div className={`flex items-center gap-2 text-[11px] ${isOverlay ? 'text-[#aaa]' : 'text-[#666]'} mt-auto`}>
          <span className={`font-semibold ${isOverlay ? 'text-[#ddd]' : 'text-[#888]'}`}>Jordan Cole</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Clock size={11} />{formatTimeAgo(article.pubDate)}</span>
        </div>
      </div>
    </a>
  );
}

export default function Home({ articles, loading, error }: HomeProps) {
  // Sort articles by newest first
  const sortedArticles = [...articles].sort((a, b) => {
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
  });

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

  // Bento layout mapping:
  // 0: hero (2x2)
  // 1: tall (1x2)
  // 2: normal (1x1)
  // 3: normal (1x1)
  // 4: wide (2x1)
  // 5: normal (1x1)
  // 6: normal (1x1)
  
  const topArticles = sortedArticles.slice(0, 7);
  const bottomArticles = sortedArticles.slice(7, 20);
  const sidebarArticles = sortedArticles.slice(20, 35);

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#F5F5F5] font-sans">
      <SEO title="CryptoStandard - Latest Cryptocurrency News" />
      <Header />
      <MarketMovers />

      <div className="max-w-[1280px] w-full mx-auto px-4 md:px-6 py-4">
        {sortedArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-[#555] text-sm mb-2">No articles available yet.</p>
            <p className="text-[#333] text-xs">The AI is processing stories. Check back in a few minutes.</p>
          </div>
        ) : (
          <>
            {/* Bento Box Top Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {topArticles[0] && <NewsCard article={topArticles[0]} variant="hero" />}
              {topArticles[1] && <NewsCard article={topArticles[1]} variant="tall" />}
              {topArticles[2] && <NewsCard article={topArticles[2]} variant="normal" />}
              {topArticles[3] && <NewsCard article={topArticles[3]} variant="normal" />}
              {topArticles[4] && <NewsCard article={topArticles[4]} variant="wide" />}
              {topArticles[5] && <NewsCard article={topArticles[5]} variant="normal" />}
              {topArticles[6] && <NewsCard article={topArticles[6]} variant="normal" />}
            </div>

            <div className="w-full h-px bg-[#1a1a1a] mb-6" />

            {/* Bottom Feed & Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main feed (List view) */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-[#888]">More Stories</h2>
                </div>
                <div className="flex flex-col">
                  {bottomArticles.map(a => (
                    <NewsCard key={a.article_id} article={a} variant="list" />
                  ))}
                </div>
              </div>

              {/* Right Sidebar */}
              <aside className="lg:col-span-1">
                <div className="sticky top-4 bg-[#0a0a0a] p-5 rounded-lg border border-[#1a1a1a]">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#222]">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[#888]">Trending</h2>
                  </div>
                  <div className="flex flex-col gap-1">
                    {sidebarArticles.map(a => (
                      <NewsCard key={a.article_id} article={a} variant="list" />
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
