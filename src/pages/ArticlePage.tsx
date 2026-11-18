import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useLocation, useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AdPlacement from '../components/AdPlacement';
import ArticleCard from '../components/ArticleCard';
import SEO from '../components/SEO';
import BackToTop from '../components/BackToTop';
import type { Article } from '../types';
import { generateSlug, getCategoryFallbackImage } from '../utils';

interface ArticlePageProps {
  articles: Article[];
  loading: boolean;
}

export default function ArticlePage({ articles, loading }: ArticlePageProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [fetchedArticle, setFetchedArticle] = useState<Article | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchAttempted, setFetchAttempted] = useState(false);
  const articleContentRef = useRef<HTMLDivElement | null>(null);

  const cleanSlug = slug ? decodeURIComponent(slug).toLowerCase().trim() : '';

  // Try state first (fast nav), then search in-memory list by slug
  const articleFromList = useMemo(() => {
    if (location.state?.article) return location.state.article as Article;
    if (!cleanSlug) return undefined;
    return articles.find(a => {
      const headlineSlug = generateSlug(a.headline || '');
      const titleSlug = generateSlug(a.title || '');
      return headlineSlug === cleanSlug || titleSlug === cleanSlug;
    });
  }, [location.state, articles, cleanSlug]);

  const article = articleFromList || fetchedArticle;

  // If not found in the in-memory list, fetch from the API by slug
  useEffect(() => {
    if (articleFromList) {
      setFetchAttempted(true);
      return;
    }
    if (!cleanSlug) return;

    let isMounted = true;
    setFetchLoading(true);

    fetch(`/api/article/${encodeURIComponent(cleanSlug)}`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (isMounted && data && !data.error) {
          setFetchedArticle(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) {
          setFetchLoading(false);
          setFetchAttempted(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [articleFromList, cleanSlug]);

  const relatedArticles = useMemo(() => {
    if (!article || !articles.length) return [];
    const otherArticles = articles.filter(a => {
      const headlineSlug = generateSlug(a.headline || '');
      const titleSlug = generateSlug(a.title || '');
      return headlineSlug !== cleanSlug && titleSlug !== cleanSlug;
    });
    const shuffled = [...otherArticles].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [article, articles, cleanSlug]);

  // Build the HTML string of a single related reading card to inject mid-article
  function buildSingleRelatedCard(related: Article): string {
    const title = related.headline || related.title;
    const slug = generateSlug(title);
    const href = `/article/${slug}`;
    const classification = (related as any).classification || related.category?.[0] || 'News';
    const relDate = new Date(related.pubDate);
    const date = !isNaN(relDate.getTime())
      ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(relDate)
      : '';
    const description = related.description ? related.description.replace(/<[^>]*>/g, '').substring(0, 120) + '...' : '';
    return `
<div class="not-prose my-8">
  <a href="${href}" class="group flex flex-col md:flex-row items-stretch rounded-card bg-bg-soft border border-line no-underline transition-colors duration-150 overflow-hidden hover:border-brand">
    ${related.image_url ? `
    <div class="w-full md:w-56 shrink-0 aspect-video md:aspect-auto overflow-hidden bg-bg">
      <img src="${related.image_url}" alt="${title.replace(/"/g, '&quot;')}" class="w-full h-full object-cover block !m-0 !rounded-none" onerror="this.parentElement.style.display='none'" />
    </div>` : ''}
    <div class="flex flex-col justify-center flex-1 min-w-0 p-4 gap-1">
      <div class="flex items-center gap-2 mb-1">
        <span class="inline-block text-xs font-semibold text-brand">${classification}</span>
        <span class="text-xs text-subtle font-medium">Related reading</span>
      </div>
      <span class="block text-base font-bold text-ink leading-snug tracking-tight group-hover:text-brand transition-colors duration-150">${title}</span>
      ${description ? `<span class="block text-xs text-subtle leading-relaxed overflow-hidden line-clamp-2">${description}</span>` : ''}
      <span class="text-xs text-subtle font-medium">${date}</span>
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

      // Remove in-article links that go outside of the website/page.
      // Only keep internal links (e.g., /article/..., internal routes, or anchors).
      const links = doc.querySelectorAll('a');
      const currentHost = typeof window !== 'undefined' ? window.location.host : '';
      links.forEach(link => {
        const href = (link.getAttribute('href') || '').trim();
        let isInternal = false;

        if (!href) {
          isInternal = false;
        } else if (href.startsWith('/') && !href.startsWith('//')) {
          isInternal = true;
        } else if (href.startsWith('#')) {
          isInternal = true;
        } else if (href.startsWith('http://') || href.startsWith('https://')) {
          try {
            const parsedUrl = new URL(href);
            if (
              (currentHost && parsedUrl.host === currentHost) ||
              parsedUrl.hostname === 'sport25.news' ||
              parsedUrl.hostname.endsWith('.sport25.news')
            ) {
              link.setAttribute('href', parsedUrl.pathname + parsedUrl.search + parsedUrl.hash);
              isInternal = true;
            }
          } catch {
            isInternal = false;
          }
        }

        if (!isInternal) {
          // Unwrap the external <a> tag: keep inner text and formatting, remove external link
          const fragment = doc.createDocumentFragment();
          while (link.firstChild) {
            fragment.appendChild(link.firstChild);
          }
          link.parentNode?.replaceChild(fragment, link);
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
        wrapper.className = 'border-l-4 border-brand pl-4 mb-6 mt-12 not-prose';
        const newHeader = doc.createElement('h2');
        newHeader.className = 'text-2xl font-bold tracking-tight text-ink m-0';
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
                details.className = 'group mb-3 border border-line bg-bg-soft rounded-card overflow-hidden transition-colors not-prose';
                
                const summary = doc.createElement('summary');
                summary.className = 'flex items-center justify-between p-4 cursor-pointer list-none font-semibold text-ink text-sm hover:bg-bg transition-colors duration-150 select-none';
                summary.style.listStyle = 'none';
                
                const qSpan = doc.createElement('span');
                qSpan.textContent = questionText;
                qSpan.className = 'pr-6 leading-snug transition-colors duration-150';
                
                const iconWrapper = doc.createElement('div');
                iconWrapper.className = 'relative w-5 h-5 flex items-center justify-center shrink-0';
                
                const iconPlus = doc.createElement('span');
                iconPlus.className = 'text-brand font-bold text-lg transition-all duration-150 leading-none absolute';
                iconPlus.innerHTML = '&#43;'; // +
                
                const iconMinus = doc.createElement('span');
                iconMinus.className = 'text-brand font-bold text-lg transition-all duration-150 leading-none absolute opacity-0';
                iconMinus.innerHTML = '&#8722;'; // −
                
                iconWrapper.appendChild(iconPlus);
                iconWrapper.appendChild(iconMinus);
                
                summary.appendChild(qSpan);
                summary.appendChild(iconWrapper);
                
                const contentDiv = doc.createElement('div');
                contentDiv.className = 'px-4 pb-4 pt-2 text-subtle text-sm leading-relaxed border-t border-line';
                
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
        details[open] { border-color: var(--color-brand) !important; }
        details[open] summary span { color: var(--color-brand) !important; }
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
    const classification = (article as any).classification || article.category?.[0] || 'News';
    const origin = (((import.meta as any).env?.VITE_SITE_URL as string) || 'https://sport25.news').replace(/\/+$/, '');
    const categoryUrl = `${origin}/news/${classification.toLowerCase()}`;
    const articleUrl = `${origin}${location.pathname}`;

    // Extract FAQs from content if present
    const extractedFaqs: { q: string; a: string }[] = [];
    const content = article.rewritten_content || article.content || '';
    if (content && typeof window !== 'undefined') {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const headings = doc.querySelectorAll('h2, h3, h4');
        headings.forEach(h => {
          const text = h.textContent?.trim() || '';
          if (text.includes('?') || /^(what|why|how|who|when|where|are|is|can|will)\b/i.test(text)) {
            let next = h.nextElementSibling;
            const answerParts: string[] = [];
            while (next && !next.tagName.match(/^H[1-6]$/i)) {
              if (next.textContent) answerParts.push(next.textContent.trim());
              next = next.nextElementSibling;
            }
            if (answerParts.length > 0) {
              extractedFaqs.push({ q: text, a: answerParts.join(' ').substring(0, 500) });
            }
          }
        });
      } catch (e) {}
    }

    const graph: any[] = [
      {
        "@type": "NewsArticle",
        "@id": `${articleUrl}#article`,
        "headline": displayTitle,
        "description": seoDescription,
        "image": article.image_url ? [article.image_url] : [],
        "datePublished": article.pubDate,
        "dateModified": article.pubDate,
        "author": {
          "@type": "Organization",
          "name": "SPORT25",
          "url": origin
        },
        "publisher": {
          "@type": "NewsMediaOrganization",
          "name": "SPORT25",
          "url": origin,
          "logo": {
            "@type": "ImageObject",
            "url": `${origin}/sport25_logo.svg`,
            "width": 240,
            "height": 60
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": articleUrl
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${articleUrl}#breadcrumbs`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `${origin}/`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": classification,
            "item": categoryUrl
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": displayTitle,
            "item": articleUrl
          }
        ]
      }
    ];

    if (extractedFaqs.length > 0) {
      graph.push({
        "@type": "FAQPage",
        "@id": `${articleUrl}#faq`,
        "mainEntity": extractedFaqs.map(faq => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.a
          }
        }))
      });
    }

    return {
      "@context": "https://schema.org",
      "@graph": graph
    };
  }, [article, location.pathname]);

  if (!article && (loading || fetchLoading || !fetchAttempted)) {
    return (
      <div className="min-h-screen flex flex-col bg-bg text-ink font-sans" aria-busy="true" aria-label="Loading article">
        {/* Real Header loaded immediately */}
        <Header />

        <main className="max-w-[1200px] w-full mx-auto px-4 md:px-6 py-8 flex-1">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-12 h-3 bg-bg-soft rounded animate-pulse" />
            <span className="text-muted text-xs">/</span>
            <div className="w-16 h-3 bg-bg-soft rounded animate-pulse" />
          </div>

          <article className="max-w-[780px] mx-auto">
            {/* Category badge skeleton */}
            <div className="w-24 h-6 bg-brand/20 rounded-full animate-pulse mb-4" />

            {/* Title skeleton */}
            <div className="h-8 bg-bg-soft rounded animate-pulse w-full mb-3" />
            <div className="h-8 bg-bg-soft rounded animate-pulse w-4/5 mb-6" />

            {/* Author / Date metadata skeleton */}
            <div className="flex items-center gap-3 pb-6 border-b border-line mb-8">
              <div className="w-9 h-9 rounded-full bg-bg-soft animate-pulse shrink-0" />
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="h-3.5 bg-bg-soft rounded animate-pulse w-32" />
                <div className="h-2.5 bg-bg-soft rounded animate-pulse w-24" />
              </div>
            </div>

            {/* Hero image skeleton */}
            <div className="w-full aspect-video bg-bg-soft rounded-card animate-pulse mb-8" />

            {/* Paragraph skeletons */}
            <div className="flex flex-col gap-3 mb-6">
              <div className="h-4 bg-bg-soft rounded animate-pulse w-full" />
              <div className="h-4 bg-bg-soft rounded animate-pulse w-full" />
              <div className="h-4 bg-bg-soft rounded animate-pulse w-11/12" />
              <div className="h-4 bg-bg-soft rounded animate-pulse w-4/5" />
            </div>

            <div className="flex flex-col gap-3">
              <div className="h-4 bg-bg-soft rounded animate-pulse w-full" />
              <div className="h-4 bg-bg-soft rounded animate-pulse w-full" />
              <div className="h-4 bg-bg-soft rounded animate-pulse w-3/4" />
            </div>
          </article>
        </main>

        <Footer />
      </div>
    );
  }

  if (!article && fetchAttempted && !fetchLoading) {
    return <Navigate to="/" replace />;
  }

  if (!article) return null;

  const displayTitle = article.headline || article.title;
  const BRAND = ' | SPORT25';
  const MAX = 60;
  const rawSeoTitle = article.seo_title || `${displayTitle}${BRAND}`;
  // Clamp: if already short enough use it; otherwise truncate displayTitle to leave room for brand
  const displaySeoTitle = rawSeoTitle.length <= MAX
    ? rawSeoTitle
    : (() => {
        const maxSlug = MAX - BRAND.length; // chars left for the article slug
        let slug = displayTitle.slice(0, maxSlug);
        // trim to last full word
        const lastSpace = slug.lastIndexOf(' ');
        if (lastSpace > 0) slug = slug.slice(0, lastSpace);
        return slug + BRAND;
      })();
  const seoDescription = article.ai_meta_description || (Array.isArray(article.ai_summary) ? article.ai_summary.map((s: any) => s.text).join(' ') : article.ai_summary as string) || article.description || `Read about ${displayTitle}`;

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink font-sans">
      <SEO 
        title={displaySeoTitle}
        description={seoDescription}
        image={article.image_url || ''}
        type="article"
        schema={articleSchema}
      />
      <Header />
      
      <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 md:px-6 py-6 flex justify-center gap-6 items-start relative">
        {/* Left Skyscraper Banner (Article Page Gutter) */}
        <aside className="hidden xl:block w-[160px] shrink-0 sticky top-20 self-start" aria-label="Left advertisement">
          <AdPlacement format="skyscraper" />
        </aside>

        {/* Main Article Content */}
        <main id="main" tabIndex={-1} className="max-w-3xl w-full min-w-0">
          {/* Billboard banner OUTSIDE the bordered card so it's never clipped */}
          <div className="mb-4">
            <AdPlacement format="billboard" />
          </div>

        <div className="border border-line bg-bg rounded-card">
          <div className="p-6 md:p-8">
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center flex-wrap gap-2 text-xs font-medium text-subtle">
                <li>
                  <Link to="/" className="hover:text-ink transition-colors duration-150">Home</Link>
                </li>
                <li className="select-none">/</li>
                <li>
                  <Link to={`/news/${((article as any).classification || article.category?.[0] || 'news').toLowerCase()}`} className="hover:text-ink transition-colors duration-150 text-subtle">
                    {(article as any).classification || article.category?.[0] || 'News'}
                  </Link>
                </li>
                <li className="select-none">/</li>
                <li className="text-brand font-semibold truncate max-w-[160px] xs:max-w-[240px] sm:max-w-[400px] lg:max-w-none" aria-current="page">
                  {displayTitle}
                </li>
              </ol>
            </nav>

            <article>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-semibold text-brand">
                  {(article as any).classification || article.category?.[0] || 'News'}
                </span>
                <span className="text-xs text-subtle">
                  {new Date(article.pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <h1 className="text-2xl md:text-4xl font-bold leading-tight mb-6 text-ink">
                {displayTitle}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-8 py-3 border-y border-line text-xs text-subtle">
                {article.source_id && (
                  <span>
                    Source: <span className="font-semibold text-brand">{article.source_id}</span>
                  </span>
                )}
                {article.source_id && article.pubDate && <span aria-hidden="true">·</span>}
                {article.pubDate && (
                  <span>
                    Published: {new Date(article.pubDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                )}
              </div>

                {(() => {
                  const classification = (article as any).classification || article.category?.[0] || 'General Sports';
                  const fallbackImg = getCategoryFallbackImage(classification);
                  return (
                    <div className="w-full relative overflow-hidden aspect-video bg-bg-soft border border-line rounded-card mb-8">
                      <img 
                        src={article.image_url || fallbackImg} 
                        alt={article.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== fallbackImg && !target.src.endsWith(fallbackImg)) {
                            target.src = fallbackImg;
                          }
                        }}
                      />
                    </div>
                  );
                })()}

                {/* Key Takeaways Section */}
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
                    <div className="my-8 bg-bg-soft border border-line border-l-4 border-l-brand rounded-card p-5">
                      <p className="text-xs font-bold text-brand mb-3">
                        Key Takeaways
                      </p>
                      <div className="space-y-3">
                        {items.map((item, i) => (
                          <div key={i} className="flex gap-3 items-start">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand mt-2 shrink-0" />
                            <div className="text-sm text-ink leading-relaxed">
                              {item.label && (
                                <span className="font-semibold text-ink mr-1.5">
                                  {item.label}:
                                </span>
                              )}
                              <span>{item.text}</span>
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
                    const proseClasses = "prose prose-lg max-w-none text-ink prose-p:leading-relaxed prose-p:mb-6 prose-headings:text-ink prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4 prose-a:text-brand prose-a:underline hover:prose-a:opacity-80 prose-img:rounded-card prose-img:my-8 [&_*]:!max-w-full [&_img]:!h-auto [&_img]:object-contain overflow-x-auto";
                    const rawContent = article.rewritten_content || article.content || article.description || null;

                    if (!rawContent) {
                      return <div className="text-base leading-relaxed text-subtle italic">No content available for this article.</div>;
                    }

                    let finalHTML = relatedArticles.length > 0 ? injectRelatedReading(rawContent, relatedArticles) : rawContent;
                    finalHTML = transformArticleContent(finalHTML);

                    return (
                      <div>
                        <div
                          ref={articleContentRef}
                          className={proseClasses}
                          dangerouslySetInnerHTML={{ __html: finalHTML }}
                          onClick={(e) => {
                            const target = (e.target as HTMLElement).closest('a');
                            if (target) {
                              const href = target.getAttribute('href');
                              if (href && href.startsWith('/') && !href.startsWith('//')) {
                                e.preventDefault();
                                navigate(href);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }
                            }
                          }}
                        />
                      </div>
                    );
                  })()}
                </div>

                <AdPlacement format="native" className="mt-10" />
              </article>
              
              {/* Related Articles Section */}
              {relatedArticles.length > 0 && (
                <div className="mt-12 pt-8 border-t border-line">
                  <h3 className="text-xl font-bold tracking-tight text-ink mb-6">Related articles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Right Skyscraper Banner (Article Page Gutter) */}
        <aside className="hidden xl:block w-[160px] shrink-0 sticky top-20 self-start" aria-label="Right advertisement">
          <AdPlacement format="skyscraper" />
        </aside>
      </div>

      <BackToTop />
      <Footer />
      <AdPlacement format="sticky-bottom" />
    </div>
  );
}
