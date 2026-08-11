import React, { useMemo } from 'react';
import { useLocation, useParams, Link, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AdPlacement from '../components/AdPlacement';
import ArticleCard from '../components/ArticleCard';
import SEO from '../components/SEO';
import { AUTHOR } from '../data/author';
import type { Article } from '../types';

interface ArticlePageProps {
  articles: Article[];
  loading: boolean;
}

export default function ArticlePage({ articles, loading }: ArticlePageProps) {
  const location = useLocation();
  const { id } = useParams<{ id: string; slug: string }>();
  
  // Try to get from state for fast navigation, fallback to searching the articles array
  const article = (location.state?.article as Article | undefined) || articles.find(a => a.article_id === id);

  const relatedArticles = useMemo(() => {
    if (!article || !articles.length) return [];
    // Filter out current article and return 4 articles (prefer same category if possible, fallback to others)
    const sameCategory = articles.filter(a => a.article_id !== article.article_id && a.category?.[0] === article.category?.[0]);
    const others = articles.filter(a => a.article_id !== article.article_id && a.category?.[0] !== article.category?.[0]);
    return [...sameCategory, ...others].slice(0, 4);
  }, [article, articles]);

  if (loading && !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-[#F5F5F5]">
        <div className="w-12 h-12 border-4 border-[#222] border-t-[#3B82F6] rounded-full animate-spin"></div>
        <p className="mt-4 font-bold uppercase tracking-widest text-[10px] text-[#888]">Loading Article...</p>
      </div>
    );
  }

  if (!article) {
    return <Navigate to="/" replace />;
  }

  const displayTitle = article.headline || article.title;
  const displaySeoTitle = article.seo_title || `${displayTitle} - CryptoStandard`;

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#F5F5F5] font-sans pb-[90px]">
      <SEO 
        title={displaySeoTitle}
        description={article.ai_meta_description || (Array.isArray(article.ai_summary) ? article.ai_summary.map((s: any) => s.text).join(' ') : article.ai_summary as string) || article.description || `Read about ${displayTitle}`}
        image={article.image_url || ''}
        type="article"
      />
      <Header />
      
      <div className="flex-1 max-w-7xl w-full mx-auto flex justify-center gap-4 lg:gap-6 px-4 py-4 md:py-6">
        {/* Left Skyscraper Ad */}
        <aside className="hidden lg:block w-[160px] xl:w-[200px] shrink-0">
          <div className="sticky top-4">
            <AdPlacement format="skyscraper" />
          </div>
        </aside>
        
        {/* Main Article Content */}
        <main className="flex-1 max-w-3xl w-full border border-[#222] bg-[#050505] rounded-sm">
          <AdPlacement format="billboard" className="border-x-0 border-t-0" />
          
          <div className="p-6 md:p-10">
            <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-bold text-[#888] uppercase tracking-widest hover:text-white transition-colors mb-10">
              <span className="text-[#3B82F6]">←</span> Back to Feed
            </Link>

            <article>
              <div className="flex items-center gap-2 mb-6">
                <span className="bg-[#3B82F6] text-white text-[10px] font-black px-2 py-0.5 uppercase">
                  {(article as any).classification || article.category?.[0] || 'News'}
                </span>
                <span className="text-[10px] text-[#666] font-mono uppercase">
                  {new Date(article.pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold leading-[1.1] tracking-tighter mb-8 uppercase text-[#F5F5F5]">
                {displayTitle}
              </h1>

              <div className="flex items-center gap-6 mb-10 py-4 border-y border-[#222]">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-[#555] uppercase tracking-widest mb-1">Author</span>
                  <Link
                    to="/author/jordan-cole"
                    className="text-sm font-semibold text-[#F5F5F5] hover:text-[#3B82F6] transition-colors"
                  >
                    {AUTHOR.name}
                  </Link>
                </div>
              </div>

              {article.image_url && (
                <div className="w-full relative overflow-hidden aspect-video bg-[#111] border border-[#222] mb-12">
                  <img 
                    src={article.image_url} 
                    alt={article.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Market Brief Section */}
              {article.ai_summary && (() => {
                // Handle JSON array format: [{label, text}, ...]
                let items: { label: string; text: string }[] = [];
                try {
                  const parsed = typeof article.ai_summary === 'string'
                    ? JSON.parse(article.ai_summary)
                    : article.ai_summary;
                  if (Array.isArray(parsed)) {
                    items = parsed;
                  }
                } catch {
                  // Legacy fallback
                  const lines = (article.ai_summary as string)
                    .split(/\\n|\n/)
                    .map((l: string) => l.trim())
                    .filter(Boolean);
                  items = lines.map((line: string) => {
                    const match = line.match(/^\*\*([^*]+)\*\*[:\s]*(.*)/);
                    return match
                      ? { label: match[1].trim(), text: match[2].trim() }
                      : { label: '', text: line };
                  });
                }

                return (
                  <div className="my-8 bg-gradient-to-br from-[#0d1b2e] to-[#0a0a0a] border border-[#1d3a5c] rounded-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#3B82F6] to-[#1d4ed8]"></div>
                    <div className="pl-5 pr-5 pt-4 pb-1">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#3B82F6] mb-3">
                        Market Brief
                      </p>
                    </div>
                    <div className="divide-y divide-[#1d3a5c]/50">
                      {items.map((item, i) => (
                        <div key={i} className="flex gap-3 px-5 py-4">
                          <div className="w-1 shrink-0 mt-1.5 h-1 rounded-full bg-[#3B82F6]" />
                          <div>
                            {item.label && (
                              <span className="text-[10px] font-black uppercase tracking-wider text-[#3B82F6] block mb-1">
                                {item.label}
                              </span>
                            )}
                            <span className="text-sm text-[#C9D8E8] leading-relaxed font-light">{item.text}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <AdPlacement format="in-article" />

              <div className="w-full overflow-hidden break-words">
                {article.rewritten_content ? (
                  <div className="font-light">
                    <div 
                      className="prose prose-invert prose-lg md:prose-xl max-w-none text-[#E5E5E5] prose-p:leading-relaxed prose-p:mb-8 prose-headings:text-white prose-headings:font-bold prose-headings:mt-12 prose-headings:mb-6 prose-a:text-[#3B82F6] prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:my-10 [&_*]:!max-w-full [&_img]:!h-auto [&_img]:object-contain overflow-x-auto"
                      dangerouslySetInnerHTML={{ __html: article.rewritten_content }}
                    />
                    <div className="flex items-center justify-between mt-12 pt-8 border-t border-[#222]">
                      <div>
                        <p className="text-xs text-[#555] uppercase tracking-widest font-bold mb-1">Written by</p>
                        <Link to="/author/jordan-cole" className="text-sm font-semibold text-[#F5F5F5] hover:text-[#3B82F6] transition-colors">
                          {AUTHOR.name}
                        </Link>
                        <span className="text-[#555] text-sm"> · {AUTHOR.title}</span>
                      </div>
                    </div>
                  </div>
                ) : article.content ? (
                  <div 
                    className="prose prose-invert prose-lg md:prose-xl max-w-none font-light text-[#E5E5E5] prose-p:leading-relaxed prose-p:mb-8 prose-headings:text-white prose-headings:font-bold prose-headings:mt-12 prose-headings:mb-6 prose-a:text-[#3B82F6] prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:my-10 [&_*]:!max-w-full [&_img]:!h-auto [&_img]:object-contain overflow-x-auto"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                ) : article.description ? (
                  <div className="font-light">
                    <div 
                      className="prose prose-invert prose-lg md:prose-xl max-w-none text-[#E5E5E5] prose-p:leading-relaxed prose-p:mb-8 prose-headings:text-white prose-headings:font-bold prose-headings:mt-12 prose-headings:mb-6 prose-a:text-[#3B82F6] prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:my-10 [&_*]:!max-w-full [&_img]:!h-auto [&_img]:object-contain overflow-x-auto"
                      dangerouslySetInnerHTML={{ __html: article.description }} 
                    />
                  </div>
                ) : (
                  <div className="text-lg leading-relaxed text-[#CCC] italic">
                    No content available for this article.
                  </div>
                )}
              </div>

              <AdPlacement format="native" className="mt-12" />
            </article>
            
            {/* Related Articles Section */}
            {relatedArticles.length > 0 && (
              <div className="mt-16 pt-10 border-t border-[#222]">
                <h3 className="text-xl font-bold tracking-tight mb-8">Related Articles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {relatedArticles.map((relArticle, idx) => (
                    <div key={relArticle.article_id || idx}>
                      <ArticleCard article={relArticle} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
        
        {/* Right Skyscraper Ad */}
        <aside className="hidden xl:block w-[160px] xl:w-[200px] shrink-0">
          <div className="sticky top-4">
            <AdPlacement format="skyscraper" />
          </div>
        </aside>
      </div>

      <Footer />
      <AdPlacement format="sticky-bottom" />
    </div>
  );
}
