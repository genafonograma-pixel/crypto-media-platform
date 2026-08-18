import React, { useMemo } from 'react';
import { useLocation, useParams, Link, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AdPlacement from '../components/AdPlacement';
import ArticleCard from '../components/ArticleCard';
import SEO from '../components/SEO';
import { AUTHOR } from '../data/author';
import type { Article } from '../types';
import { generateSlug } from '../utils';

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
    // Filter out current article
    const otherArticles = articles.filter(a => a.article_id !== article.article_id);
    
    // Shuffle to get random articles
    const shuffled = [...otherArticles].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [article, articles]);

  // Build the HTML string of a single related reading card to inject mid-article
  function buildSingleRelatedCard(related: Article): string {
    const title = related.headline || related.title;
    const slug = generateSlug(title);
    const href = `/article/${encodeURIComponent(related.article_id)}/${slug}`;
    const classification = (related as any).classification || related.category?.[0] || 'News';
    const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(related.pubDate));
    const description = related.description ? related.description.replace(/<[^>]*>/g, '').substring(0, 120) + '...' : '';
    
    return `
<div class="not-prose" style="margin:2.5rem 0;">
  <a href="${href}" style="display:flex;gap:0;border-radius:16px;background:#0c0c0c;border:1px solid #1f1f1f;text-decoration:none;transition:all 0.25s ease;box-shadow:0 4px 24px rgba(0,0,0,0.4);overflow:hidden;" onmouseover="this.style.borderColor='#2a2a2a';this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 32px rgba(0,0,0,0.5)'" onmouseout="this.style.borderColor='#1f1f1f';this.style.transform='translateY(0)';this.style.boxShadow='0 4px 24px rgba(0,0,0,0.4)'">
    ${related.image_url ? `
    <div style="width:260px;min-width:260px;height:160px;flex-shrink:0;position:relative;">
      <img src="${related.image_url}" alt="${title.replace(/"/g, '&quot;')}" style="width:100%;height:100%;object-fit:cover;transition:transform 0.6s ease;display:block;" onerror="this.parentElement.style.display='none'" />
    </div>` : ''}
    <div style="padding:20px 24px;display:flex;flex-direction:column;justify-content:center;flex:1;gap:0;min-width:0;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
        <span style="display:inline-block;font-size:9px;font-weight:900;letter-spacing:0.18em;text-transform:uppercase;color:#3B82F6;background:rgba(59,130,246,0.12);padding:3px 8px;border-radius:4px;">${classification}</span>
        <span style="font-size:9px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#444;">Related Reading</span>
      </div>
      <span style="display:block;font-size:16px;font-weight:800;color:#F0F0F0;line-height:1.35;margin-bottom:10px;letter-spacing:-0.01em;">${title}</span>
      ${description ? `<span style="display:block;font-size:12px;color:#666;line-height:1.6;margin-bottom:14px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${description}</span>` : ''}
      <span style="font-size:10px;color:#444;letter-spacing:0.05em;text-transform:uppercase;font-weight:600;">${date}</span>
    </div>
  </a>
</div>
`;
  }

  // Inject related reading widgets spaced out in the content
  function injectRelatedReading(html: string, relatedList: Article[]): string {
    if (!relatedList || relatedList.length === 0) return html;
    
    let count = 0;
    return html.replace(/<\/p>/gi, (match) => {
      count++;
      if (count === 2 && relatedList.length > 0) return `${match}${buildSingleRelatedCard(relatedList[0])}`;
      if (count === 5 && relatedList.length > 1) return `${match}${buildSingleRelatedCard(relatedList[1])}`;
      if (count === 8 && relatedList.length > 2) return `${match}${buildSingleRelatedCard(relatedList[2])}`;
      return match;
    });
  }

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
            <Link to="/news" className="inline-flex items-center gap-2 text-[10px] font-bold text-[#888] uppercase tracking-widest hover:text-white transition-colors mb-10">
              <span className="text-[#3B82F6]">←</span> All News
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
                {(() => {
                  const proseClasses = "prose prose-invert prose-lg md:prose-xl max-w-none text-[#E5E5E5] prose-p:leading-relaxed prose-p:mb-8 prose-headings:text-white prose-headings:font-bold prose-headings:mt-12 prose-headings:mb-6 prose-a:text-[#3B82F6] prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:my-10 [&_*]:!max-w-full [&_img]:!h-auto [&_img]:object-contain overflow-x-auto";
                  const rawContent = article.rewritten_content || article.content || article.description || null;

                  if (!rawContent) {
                    return <div className="text-lg leading-relaxed text-[#CCC] italic">No content available for this article.</div>;
                  }

                  const finalHTML = relatedArticles.length > 0 ? injectRelatedReading(rawContent, relatedArticles) : rawContent;

                  return (
                    <div className={article.rewritten_content ? 'font-light' : ''}>
                      <div
                        className={proseClasses}
                        dangerouslySetInnerHTML={{ __html: finalHTML }}
                      />
                      {article.rewritten_content && (
                        <div className="flex items-center justify-between mt-12 pt-8 border-t border-[#222]">
                          <div>
                            <p className="text-xs text-[#555] uppercase tracking-widest font-bold mb-1">Written by</p>
                            <Link to="/author/jordan-cole" className="text-sm font-semibold text-[#F5F5F5] hover:text-[#3B82F6] transition-colors">
                              {AUTHOR.name}
                            </Link>
                            <span className="text-[#555] text-sm"> · {AUTHOR.title}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
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
