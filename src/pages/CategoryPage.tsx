import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import type { Article } from '../types';
import { generateSlug } from '../utils';

interface CategoryPageProps {
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

function getArticleHref(article: Article) {
  const displayTitle = article.headline || article.title;
  return `/article/${generateSlug(displayTitle)}`;
}

function getClassification(article: Article) {
  return (article as any).classification || article.category?.[0] || 'News';
}

export default function CategoryPage({ articles, loading, error }: CategoryPageProps) {
  const { categoryId } = useParams();
  
  const ALLOWED_CATEGORIES = ["Bitcoin", "Altcoins", "DeFi", "Web3", "Markets", "Tech"];
  
  const activeCategory = categoryId
    ? ALLOWED_CATEGORIES.find((c) => c.toLowerCase() === categoryId.toLowerCase()) ?? null
    : null;

  const filteredArticles = categoryId 
    ? (activeCategory ? articles.filter((a) => getClassification(a) === activeCategory) : [])
    : articles;

  const sortedArticles = [...filteredArticles].sort((a, b) =>
    new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  const CATEGORY_DESCRIPTIONS: Record<string, string> = {
    Bitcoin: "The latest Bitcoin news, price analysis, and market updates. Stay informed on BTC developments, mining, ETFs, and institutional adoption.",
    Altcoins: "Latest altcoin news covering Ethereum, Solana, XRP, Dogecoin, and other cryptocurrencies. Discover emerging crypto projects and market moves.",
    DeFi: "Decentralized finance news and analysis. Follow the latest DeFi protocols, yield farming, liquidity mining, and on-chain activity.",
    Web3: "Web3 and NFT news covering blockchain gaming, digital collectibles, metaverse developments, and decentralized applications.",
    Markets: "Crypto market analysis, price movements, trading signals, and macroeconomic factors affecting Bitcoin and altcoin prices.",
    Tech: "Blockchain technology updates including protocol upgrades, security audits, developer tools, and infrastructure innovations.",
  };

  const CATEGORY_SEO_TITLES: Record<string, string> = {
    Bitcoin: "Bitcoin News: BTC Prices & Crypto Market Updates | Crypton",
    Altcoins: "Altcoin News: Crypto Prices & Market Analysis | Crypton",
    DeFi: "DeFi News: Decentralized Finance & Yield Farming | Crypton",
    Web3: "Web3 News: NFTs, Metaverse & Blockchain Gaming | Crypton",
    Markets: "Crypto Market News: Price Analysis & Trading Signals | Crypton",
    Tech: "Blockchain Tech Updates & Crypto Protocol News | Crypton",
  };

  const categoryLabel = activeCategory || 'All Cryptocurrency News';
  const categoryDescription = activeCategory
    ? CATEGORY_DESCRIPTIONS[activeCategory] || `Latest ${activeCategory} cryptocurrency news and market updates on Crypton.`
    : "Browse all the latest cryptocurrency news, bitcoin updates, altcoin analysis, DeFi, Web3 and blockchain market insights on Crypton.";

  const seoTitle = activeCategory
    ? CATEGORY_SEO_TITLES[activeCategory] || `${activeCategory} News & Cryptocurrency Market Updates | Crypton`
    : "Latest Cryptocurrency News & Bitcoin Market Updates | Crypton";

  const categorySchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${categoryLabel} - Crypton`,
    "description": categoryDescription,
    "url": window.location.href,
    "publisher": {
      "@type": "NewsMediaOrganization",
      "name": "Crypton",
      "logo": {
        "@type": "ImageObject",
        "url": `${window.location.origin}/crypton_logo.svg`
      }
    }
  }), [categoryLabel, categoryDescription]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-[#F5F5F5]">
        <div className="w-10 h-10 border-4 border-[#222] border-t-[#3B82F6] rounded-full animate-spin" />
        <p className="mt-4 font-bold uppercase tracking-widest text-[10px] text-[#555]">Loading Category...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-[#F5F5F5] px-4">
        <div className="bg-[#0A0A0A] p-8 border border-[#222] max-w-lg w-full text-center rounded-xl">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Error Loading Category</h2>
          <p className="text-[#888] mb-6 text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="text-[11px] font-bold uppercase tracking-widest bg-[#3B82F6] text-white px-6 py-3 hover:bg-blue-600 rounded transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#F5F5F5] font-sans">
      <SEO 
        title={seoTitle}
        description={categoryDescription}
        schema={categorySchema}
      />
      <Header />
      
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 md:px-6 py-6 md:py-12">
        {/* Category Header */}
        <div className="mb-8 md:mb-12 pb-6 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#666] mb-4">
            <Link to="/" className="hover:text-[#F5F5F5] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#F5F5F5]">News</span>
            {categoryId && (
              <>
                <span>/</span>
                <span className="text-[#3B82F6]">{activeCategory || categoryId}</span>
              </>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-[#F5F5F5]">
            {activeCategory ? `${activeCategory} Cryptocurrency News` : "All Cryptocurrency News"}
          </h1>
        </div>

        {/* Grid Layout */}
        {sortedArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-[#555] text-sm mb-2">No articles available for this category.</p>
            <p className="text-[#333] text-xs">The AI is processing stories. Check back in a few minutes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedArticles.map((article) => {
              const displayTitle = article.headline || article.title;
              return (
                <Link
                  key={article.article_id}
                  to={getArticleHref(article)}
                  state={{ article }}
                  className="group flex flex-col rounded-xl overflow-hidden bg-[#0A0A0A] border border-[#1a1a1a] hover:border-[#333] transition-colors"
                >
                  <div className="w-full aspect-[4/3] bg-[#111] overflow-hidden relative">
                    {article.image_url ? (
                      <img
                        src={article.image_url}
                        alt={displayTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[#222]">
                        <span className="font-black text-2xl tracking-tighter opacity-50">CS</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-[15px] font-bold text-[#E5E5E5] group-hover:text-[#3B82F6] transition-colors line-clamp-3 leading-snug mb-4">
                      {displayTitle}
                    </h3>
                    <div className="mt-auto flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest bg-[#1a1a1a] text-[#888] px-2 py-1 rounded">
                        {formatTimeAgo(article.pubDate)}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 px-2 py-1 rounded">
                        {getClassification(article)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
