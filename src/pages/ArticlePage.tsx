import React, { useMemo, useState, useEffect } from 'react';
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
  const { slug } = useParams<{ slug: string }>();
  const [fetchedArticle, setFetchedArticle] = useState<Article | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);

  // Try state first (fast nav), then search in-memory list by slug, then fetch from API
  const articleFromList = (location.state?.article as Article | undefined) 
    || articles.find(a => generateSlug(a.headline || a.title) === slug);

  const article = articleFromList || fetchedArticle;

  // If not found in the in-memory list, fetch from the API by slug
  useEffect(() => {
    if (!articleFromList && !loading && slug && !fetchedArticle) {
      setFetchLoading(true);
      fetch(`/api/article/${slug}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setFetchedArticle(data); })
        .catch(() => {})
        .finally(() => setFetchLoading(false));
    }
  }, [articleFromList, loading, slug, fetchedArticle]);

  const relatedArticles = useMemo(() => {
    if (!article || !articles.length) return [];
    const otherArticles = articles.filter(a => generateSlug(a.headline || a.title) !== slug);
    const shuffled = [...otherArticles].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [article, articles, slug]);

  // Build the HTML string of a single related reading card to inject mid-article
  function buildSingleRelatedCard(related: Article): string {
    const title = related.headline || related.title;
    const slug = generateSlug(title);
    const href = `/article/${slug}`;
    const classification = (related as any).classification || related.category?.[0] || 'News';
    const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(related.pubDate));
    const description = related.description ? related.description.replace(/<[^>]*>/g, '').substring(0, 120) + '...' : '';
    return `
<div class="not-prose my-10">
  <a href="${href}" class="group flex flex-col md:flex-row items-stretch rounded-2xl bg-[#0c0c0c] border border-[#1f1f1f] no-underline transition-all duration-300 ease-out overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:border-[#2a2a2a] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
    ${related.image_url ? `
    <div class="w-full md:w-[260px] md:min-w-[260px] h-[180px] md:h-auto shrink-0 flex relative">
      <img src="${related.image_url}" alt="${title.replace(/"/g, '&quot;')}" class="w-full h-full object-cover block !m-0 !rounded-none" onerror="this.parentElement.style.display='none'" />
    </div>` : ''}
    <div class="flex flex-col justify-center flex-1 min-w-0 p-4 md:p-6 gap-0">
      <div class="flex items-center gap-2 mb-2.5">
        <span class="inline-block text-[9px] font-black tracking-[0.18em] uppercase text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">${classification}</span>
        <span class="text-[9px] font-bold tracking-[0.12em] uppercase text-[#444]">Related Reading</span>
      </div>
      <span class="block text-[15px] md:text-base font-extrabold text-[#F0F0F0] leading-snug mb-2.5 tracking-tight group-hover:text-[#3B82F6] transition-colors">${title}</span>
      ${description ? `<span class="block text-xs text-[#666] leading-relaxed mb-3.5 overflow-hidden line-clamp-2">${description}</span>` : ''}
      <span class="text-[10px] text-[#444] tracking-wider uppercase font-semibold">${date}</span>
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

  // Transform FAQ sections into interactive accordions and make external links open in a new tab
  function transformArticleContent(html: string): string {
    if (typeof window === 'undefined') return html;
    
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Make all external links open in a new tab
      const links = doc.querySelectorAll('a');
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        }
      });
      
      const headers = Array.from(doc.querySelectorAll('h2, h3, h4')).filter(h => 
        h.textContent && (
          h.textContent.toLowerCase().includes('faq') || 
          h.textContent.toLowerCase().includes('frequently asked')
        )
      );
      
      headers.forEach(faqHeader => {
        // Style the FAQ header
        const wrapper = doc.createElement('div');
        wrapper.className = 'border-l-4 border-[#3B82F6] pl-4 mb-8 mt-16 not-prose';
        const newHeader = doc.createElement('h2');
        newHeader.className = 'text-2xl font-black uppercase tracking-tight text-[#F5F5F5] m-0';
        newHeader.textContent = 'Frequently Asked Questions';
        wrapper.appendChild(newHeader);
        
        faqHeader.parentNode?.insertBefore(wrapper, faqHeader);
        faqHeader.parentNode?.removeChild(faqHeader);
        
        let currentNode = wrapper.nextElementSibling;
        
        while (currentNode) {
          // Stop if we hit a heading that does NOT look like a question (no question indicator)
          if (currentNode.tagName.match(/^H[1-6]$/)) {
            const text = currentNode.textContent?.trim().toLowerCase() || '';
            const hasQuestionIndicator = text.includes('?') || 
                                         /^(what|why|how|who|when|where|are|is|can|will|do|does|should|could|would)\b/.test(text);
            if (!hasQuestionIndicator) break;
          }
          
          let isQuestion = false;
          let questionText = '';
          
          if (currentNode.tagName.match(/^H[1-6]$/)) {
            isQuestion = true;
            questionText = currentNode.textContent || '';
          } else if (currentNode.tagName === 'P') {
            const strong = currentNode.querySelector('strong');
            const text = currentNode.textContent?.trim().toLowerCase() || '';
            const hasQuestionIndicator = text.includes('?') || 
                                         /^(what|why|how|who|when|where|are|is|can|will|do|does|should|could|would)\b/.test(text);
            if ((strong && strong.textContent && strong.textContent.length > (currentNode.textContent?.length || 0) * 0.5) || hasQuestionIndicator) {
               isQuestion = true;
               questionText = currentNode.textContent || '';
            }
          }
          
          if (isQuestion && questionText.trim().length > 0) {
             let answerNodes: Element[] = [];
             let nextNode = currentNode.nextElementSibling;
             
             while (nextNode) {
               let isNextQuestion = false;
               if (nextNode.tagName.match(/^H[1-6]$/)) {
                  const text = nextNode.textContent?.trim().toLowerCase() || '';
                  const hasQuestionIndicator = text.includes('?') || 
                                               /^(what|why|how|who|when|where|are|is|can|will|do|does|should|could|would)\b/.test(text);
                  isNextQuestion = hasQuestionIndicator;
                  if (!hasQuestionIndicator) break;
               } else if (nextNode.tagName === 'P') {
                  const s = nextNode.querySelector('strong');
                  const text = nextNode.textContent?.trim().toLowerCase() || '';
                  const hasQuestionIndicator = text.includes('?') || 
                                               /^(what|why|how|who|when|where|are|is|can|will|do|does|should|could|would)\b/.test(text);
                  if ((s && s.textContent && s.textContent.length > (nextNode.textContent?.length || 0) * 0.5) || hasQuestionIndicator) {
                     isNextQuestion = true;
                  }
               }
               
               if (isNextQuestion) break;
               
               answerNodes.push(nextNode);
               nextNode = nextNode.nextElementSibling;
             }
             
             if (answerNodes.length > 0) {
                const details = doc.createElement('details');
                details.className = 'group mb-4 border border-[#1a1a1a] bg-[#080808] rounded-xl overflow-hidden transition-all duration-300 not-prose';
                
                const summary = doc.createElement('summary');
                summary.className = 'flex items-center justify-between p-5 cursor-pointer list-none font-bold text-[#E5E5E5] text-[13px] uppercase tracking-wider hover:bg-[#111] transition-colors duration-200 select-none';
                summary.style.listStyle = 'none';
                
                const qSpan = doc.createElement('span');
                qSpan.textContent = questionText;
                qSpan.className = 'pr-6 leading-snug transition-colors duration-200';
                
                const iconWrapper = doc.createElement('div');
                iconWrapper.className = 'relative w-5 h-5 flex items-center justify-center shrink-0';
                
                const iconPlus = doc.createElement('span');
                iconPlus.className = 'text-[#3B82F6] font-bold text-xl transition-all duration-200 leading-none absolute';
                iconPlus.innerHTML = '&#43;'; // +
                
                const iconMinus = doc.createElement('span');
                iconMinus.className = 'text-[#3B82F6] font-bold text-xl transition-all duration-200 leading-none absolute opacity-0';
                iconMinus.innerHTML = '&#8722;'; // −
                
                iconWrapper.appendChild(iconPlus);
                iconWrapper.appendChild(iconMinus);
                
                summary.appendChild(qSpan);
                summary.appendChild(iconWrapper);
                
                const contentDiv = doc.createElement('div');
                contentDiv.className = 'px-5 pb-5 pt-2 text-[#aaa] text-sm leading-relaxed border-t border-[#1a1a1a]';
                
                answerNodes.forEach(node => {
                  contentDiv.appendChild(node.cloneNode(true));
                  node.parentNode?.removeChild(node);
                });
                
                details.appendChild(summary);
                details.appendChild(contentDiv);
                
                currentNode.parentNode?.insertBefore(details, currentNode);
                const oldCurrent = currentNode;
                currentNode = details;
                oldCurrent.parentNode?.removeChild(oldCurrent);
             }
          }
          
          currentNode = currentNode.nextElementSibling;
        }
      });
      
      const style = doc.createElement('style');
      style.innerHTML = `
        details > summary::-webkit-details-marker { display: none; }
        details[open] { border-color: rgba(59, 130, 246, 0.4) !important; background-color: #0b0e14 !important; }
        details[open] summary span { color: #3B82F6 !important; }
        details[open] summary div span:first-child { opacity: 0 !important; }
        details[open] summary div span:last-child { opacity: 1 !important; }
      `;
      doc.body.appendChild(style);
      
      return doc.body.innerHTML;
    } catch (e) {
      console.error("Error transforming HTML content", e);
      return html;
    }
  }

  const articleSchema = useMemo(() => {
    if (!article) return null;
    const displayTitle = article.headline || article.title;
    const seoDescription = article.ai_meta_description || (Array.isArray(article.ai_summary) ? article.ai_summary.map((s: any) => s.text).join(' ') : article.ai_summary as string) || article.description || `Read about ${displayTitle}`;
    
    return {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": displayTitle,
      "description": seoDescription,
      "image": article.image_url ? [article.image_url] : [],
      "datePublished": article.pubDate,
      "dateModified": article.pubDate,
      "author": {
        "@type": "Person",
        "name": AUTHOR.name,
        "url": `${window.location.origin}/author/jordan-cole`
      },
      "publisher": {
        "@type": "NewsMediaOrganization",
        "name": "Crypton",
        "logo": {
          "@type": "ImageObject",
          "url": `${window.location.origin}/crypton_logo.svg`
        }
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": window.location.href
      }
    };
  }, [article]);

  if ((loading || fetchLoading) && !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-[#F5F5F5]">
        <div className="w-12 h-12 border-4 border-[#222] border-t-[#3B82F6] rounded-full animate-spin"></div>
        <p className="mt-4 font-bold uppercase tracking-widest text-[10px] text-[#888]">Loading Article...</p>
      </div>
    );
  }

  if (!article && !loading && !fetchLoading) {
    return <Navigate to="/" replace />;
  }

  if (!article) return null;

  const displayTitle = article.headline || article.title;
  const displaySeoTitle = article.seo_title || `${displayTitle} - Crypton`;
  const seoDescription = article.ai_meta_description || (Array.isArray(article.ai_summary) ? article.ai_summary.map((s: any) => s.text).join(' ') : article.ai_summary as string) || article.description || `Read about ${displayTitle}`;


  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#F5F5F5] font-sans pb-[70px] md:pb-[90px]">
      <SEO 
        title={displaySeoTitle}
        description={seoDescription}
        image={article.image_url || ''}
        type="article"
        schema={articleSchema}
      />
      <Header />
      
      <div className="flex-1 max-w-7xl w-full mx-auto flex justify-center gap-4 lg:gap-6 px-2 sm:px-4 py-4 md:py-6 min-w-0">
        {/* Left Skyscraper Ad */}
        <aside className="hidden lg:block w-[160px] xl:w-[200px] shrink-0">
          <div className="sticky top-[72px]">
            <AdPlacement format="skyscraper" />
          </div>
        </aside>
        
        {/* Main Article Content */}
        <main className="flex-1 min-w-0 max-w-3xl w-full">
          {/* Billboard banner OUTSIDE the bordered card so it's never clipped */}
          <div className="mb-3">
            <AdPlacement format="billboard" />
          </div>

          <div className="border border-[#222] bg-[#050505] rounded-sm">
          <div className="p-6 md:p-10">
            <Link to="/news" className="inline-flex items-center gap-2 text-[10px] font-bold text-[#888] uppercase tracking-widest hover:text-white transition-colors mb-6 md:mb-10">
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

              <h1 className="text-2xl md:text-5xl font-extrabold leading-[1.1] tracking-tighter mb-6 md:mb-8 uppercase text-[#F5F5F5]">
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

                  let finalHTML = relatedArticles.length > 0 ? injectRelatedReading(rawContent, relatedArticles) : rawContent;
                  finalHTML = transformArticleContent(finalHTML);

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
          </div>{/* end border wrapper */}
        </main>
        
        {/* Right Skyscraper Ad */}
        <aside className="hidden xl:block w-[160px] xl:w-[200px] shrink-0">
          <div className="sticky top-[72px]">
            <AdPlacement format="skyscraper" />
          </div>
        </aside>
      </div>

      <Footer />
      <AdPlacement format="sticky-bottom" />
    </div>
  );
}
