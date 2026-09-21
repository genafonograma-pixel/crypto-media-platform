import React, { useMemo, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Clock, TrendingUp, Sparkles, ChevronRight, HelpCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import AdPlacement from '../components/AdPlacement';
import BitcoinMarketSnapshot from '../components/BitcoinMarketSnapshot';
import BitcoinPriceChart from '../components/BitcoinPriceChart';
import SeoEditorialBlog from '../components/SeoEditorialBlog';
import type { Article } from '../types';
import { generateSlug } from '../utils';

interface CategoryPageProps {
  articles: Article[];
  loading: boolean;
  error: string | null;
  defaultCategory?: string;
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

function getArticleHref(article: Article) {
  const displayTitle = article.headline || article.title;
  return `/article/${generateSlug(displayTitle)}`;
}

function getClassification(article: Article) {
  return (article as any).classification || article.category?.[0] || 'News';
}

const CATEGORY_TABS = [
  { id: 'all', label: 'All News', path: '/news' },
  { id: 'bitcoin', label: 'Bitcoin', path: '/news/bitcoin' },
  { id: 'altcoins', label: 'Altcoins', path: '/news/altcoins' },
  { id: 'defi', label: 'DeFi', path: '/news/defi' },
  { id: 'web3', label: 'Web3 & NFT', path: '/news/web3' },
  { id: 'markets', label: 'Markets', path: '/news/markets' },
  { id: 'tech', label: 'Tech', path: '/news/tech' },
];

const CATEGORY_CONFIGS: Record<string, {
  h1: string;
  subtitle: string;
  seoTitle: string;
  seoDescription: string;
  faqs: { q: string; a: string }[];
}> = {
  Bitcoin: {
    h1: "Bitcoin News: Live BTC Price, ETF Updates & Market Analysis",
    subtitle: "Real-time Bitcoin reporting, institutional ETF inflows, on-chain network metrics, mining hashrate analysis, and macroeconomic digital gold intelligence.",
    seoTitle: "Bitcoin News & Live BTC Price | Wild West Crypto Show",
    seoDescription: "Stay ahead with real-time Bitcoin news, live BTC price charts, 24h market analysis, ETF flows, halving cycles, and expert cryptocurrency commentary on Wild West Crypto Show.",
    faqs: [
      {
        q: "What is Bitcoin (BTC) and why is it important?",
        a: "Bitcoin is the world's first decentralized digital currency, created in 2009 by the pseudonymous Satoshi Nakamoto. It operates on a proof-of-work blockchain without central bank intermediaries, featuring a capped supply of 21 million coins, making it a premier digital store of value."
      },
      {
        q: "What factors affect Bitcoin's price?",
        a: "Bitcoin price movements are driven by spot ETF inflows, institutional adoption, macroeconomic interest rates, global liquidity conditions, mining difficulty adjustments, halving supply shocks, and regulatory developments."
      },
      {
        q: "What is the Bitcoin Halving cycle?",
        a: "The Bitcoin Halving occurs approximately every 210,000 blocks (roughly every 4 years) and cuts the mining block reward by 50%. This programmatic reduction in new coin issuance has historically preceded major multi-year market expansions."
      },
      {
        q: "How do spot Bitcoin ETFs impact the cryptocurrency market?",
        a: "Spot Bitcoin ETFs allow institutional and retail investors to gain direct exposure to physical Bitcoin through traditional brokerage accounts, driving billions in regulated liquidity and institutional custody demand."
      },
      {
        q: "How often is Bitcoin news updated on Wild West Crypto Show?",
        a: "Our AI-driven news pipeline updates around the clock every 15 minutes, tracking breaking announcements, price swings, network developments, and macro market reports."
      }
    ]
  },
  Altcoins: {
    h1: "Altcoin News: Ethereum, Solana, XRP & Layer 1 Ecosystems",
    subtitle: "Comprehensive reporting on alternative cryptocurrencies, smart contract platforms, layer-2 rollups, and emerging digital asset ecosystems.",
    seoTitle: "Altcoin News: ETH, SOL & Markets | Wild West Crypto Show",
    seoDescription: "Get the latest altcoin news covering Ethereum (ETH), Solana (SOL), XRP, emerging layer 1 & 2 networks, tokenomics, and market trends on Wild West Crypto Show.",
    faqs: [
      {
        q: "What are altcoins in cryptocurrency?",
        a: "Altcoins refers to any cryptocurrency alternative to Bitcoin, including major utility assets like Ethereum (ETH), Solana (SOL), and XRP, as well as layer-2 tokens and specialized protocol assets."
      },
      {
        q: "What is 'Altcoin Season' and when does it happen?",
        a: "Altcoin Season is a market phase when the majority of top alternative cryptocurrencies outperform Bitcoin over a sustained period, typically triggered when Bitcoin dominance declines after a major market rally."
      },
      {
        q: "Which altcoins does Wild West Crypto Show cover?",
        a: "We cover all major layer-1 networks (Ethereum, Solana, BNB, Avalanche, Cardano), layer-2 rollups (Arbitrum, Optimism, Base), decentralized storage, privacy coins, and high-volume utility tokens."
      }
    ]
  },
  DeFi: {
    h1: "Decentralized Finance (DeFi) News & Yield Protocols",
    subtitle: "Tracking decentralized exchanges (DEXs), liquidity mining, on-chain lending protocols, real-world assets (RWAs), and automated market makers.",
    seoTitle: "DeFi News: Protocols & Yields | Wild West Crypto Show",
    seoDescription: "Follow breaking DeFi news, decentralized exchange volumes, yield protocols, smart contract innovations, and on-chain liquidity shifts on Wild West Crypto Show.",
    faqs: [
      {
        q: "What is Decentralized Finance (DeFi)?",
        a: "Decentralized Finance (DeFi) is an umbrella term for financial applications and protocols built on public smart-contract blockchains that enable trading, lending, borrowing, and yield generation without traditional banking intermediaries."
      },
      {
        q: "What are the major components of DeFi?",
        a: "Core DeFi components include decentralized exchanges (like Uniswap), lending protocols (such as Aave), algorithmic stablecoins, liquid staking derivatives, and tokenized real-world assets (RWAs)."
      },
      {
        q: "How does Wild West Crypto Show track DeFi protocol health?",
        a: "We monitor Total Value Locked (TVL), decentralized exchange trading volumes, smart contract protocol upgrades, exploit alerts, and regulatory policies affecting liquidity."
      }
    ]
  },
  Web3: {
    h1: "Web3 & NFT News: Metaverse, Gaming & Digital Ownership",
    subtitle: "Latest intelligence on blockchain gaming, decentralized social networks, digital collectibles, metaverse platforms, and sovereign identity.",
    seoTitle: "Web3 News: NFTs & Gaming | Wild West Crypto Show",
    seoDescription: "Explore Web3 news, digital collectibles, metaverse platforms, blockchain gaming, and decentralized identity developments on Wild West Crypto Show.",
    faqs: [
      {
        q: "What is Web3?",
        a: "Web3 represents the next generation of the internet built on decentralized blockchains, enabling user ownership of data, identity, digital assets, and sovereign computation."
      },
      {
        q: "How are NFTs utilized in the Web3 ecosystem?",
        a: "Non-fungible tokens (NFTs) verify unique digital ownership for art, in-game assets, token-gated community access, intellectual property, and real-world asset tokenization."
      }
    ]
  },
  Markets: {
    h1: "Crypto Market Intelligence: Technical Analysis & Liquidity Signals",
    subtitle: "Macroeconomic indicators, crypto derivatives, liquidation heatmaps, funding rates, and institutional market structure analysis.",
    seoTitle: "Crypto Market Analysis & Signals | Wild West Crypto Show",
    seoDescription: "In-depth crypto market analysis, Bitcoin liquidity signals, derivatives data, macroeconomic influences, and trader insights on Wild West Crypto Show.",
    faqs: [
      {
        q: "What indicators are tracked in crypto market analysis?",
        a: "Key indicators include perpetual futures funding rates, open interest, liquidation cascades, exchange reserve balances, stablecoin inflows, and the Fear & Greed Index."
      },
      {
        q: "How does macro policy impact digital assets?",
        a: "Federal Reserve interest rate decisions, global M2 money supply growth, inflation metrics (CPI), and regulatory policies directly influence crypto asset risk appetites."
      }
    ]
  },
  Tech: {
    h1: "Blockchain Technology: Protocol Upgrades & Scalability",
    subtitle: "Deep-dive technical reporting on zero-knowledge cryptography, modular blockchain architecture, consensus mechanisms, and developer tooling.",
    seoTitle: "Blockchain Tech & Protocol News | Wild West Crypto Show",
    seoDescription: "Explore cutting-edge blockchain technology updates, zero-knowledge proofs, layer-2 rollup advancements, and decentralized infrastructure on Wild West Crypto Show.",
    faqs: [
      {
        q: "What is modular blockchain architecture?",
        a: "Modular blockchains decouple execution, settlement, consensus, and data availability into specialized layers, offering superior throughput and reduced transaction fees compared to monolithic networks."
      },
      {
        q: "Why are Zero-Knowledge (ZK) proofs important?",
        a: "Zero-Knowledge proofs enable cryptographic transaction verification without revealing underlying sensitive data, providing breakthrough privacy and massive layer-2 computational scaling."
      }
    ]
  }
};

const DEFAULT_CONFIG = {
  h1: "All Cryptocurrency News & Market Intelligence",
  subtitle: "Real-time 24/7 digital asset reporting, breaking Bitcoin updates, altcoin analysis, DeFi protocols, and Web3 market intelligence.",
  seoTitle: "All Crypto News & Live Headlines | Wild West Crypto Show",
  seoDescription: "Browse all cryptocurrency news, breaking digital asset reports, Bitcoin updates, altcoin analysis, DeFi protocols, and Web3 trends updated 24/7 on Wild West Crypto Show.",
  faqs: [
    {
      q: "What cryptocurrency news does Wild West Crypto Show cover?",
      a: "We provide comprehensive 24/7 coverage of Bitcoin, major altcoins (Ethereum, Solana, XRP), DeFi liquidity, Web3 developments, market trading signals, and blockchain technology innovations."
    },
    {
      q: "How frequently are crypto stories published?",
      a: "Our AI editorial pipeline continuously ingests, filters, and analyzes stories from global market sources, publishing new verified reports every 15 minutes."
    },
    {
      q: "How can I filter news by specific cryptocurrency topics?",
      a: "You can use the category tabs above to filter news directly by Bitcoin, Altcoins, DeFi, Web3, Markets, or Tech."
    },
    {
      q: "Is all crypto news free to access on Wild West Crypto Show?",
      a: "Yes, all real-time news articles, technical charts, market briefs, and FAQs are 100% free and open to everyone."
    }
  ]
};

export default function CategoryPage({ articles, loading, error, defaultCategory }: CategoryPageProps) {
  const { categoryId } = useParams();
  const location = useLocation();
  const [visibleCount, setVisibleCount] = useState(12);

  const isExplicitBitcoinRoute = location.pathname === '/bitcoin-news' || defaultCategory === 'Bitcoin';

  const ALLOWED_CATEGORIES = ["Bitcoin", "Altcoins", "DeFi", "Web3", "Markets", "Tech"];
  
  const activeCategory = isExplicitBitcoinRoute
    ? 'Bitcoin'
    : (categoryId
        ? ALLOWED_CATEGORIES.find((c) => c.toLowerCase() === categoryId.toLowerCase()) ?? null
        : null);

  const filteredArticles = activeCategory
    ? articles.filter((a) => getClassification(a).toLowerCase() === activeCategory.toLowerCase())
    : articles;

  const sortedArticles = useMemo(() => {
    return [...filteredArticles].sort((a, b) =>
      (new Date(b.pubDate || 0).getTime() || 0) - (new Date(a.pubDate || 0).getTime() || 0)
    );
  }, [filteredArticles]);

  const config = activeCategory ? (CATEGORY_CONFIGS[activeCategory] || DEFAULT_CONFIG) : DEFAULT_CONFIG;
  const canonicalUrl = `${window.location.origin}${activeCategory === 'Bitcoin' ? '/news/bitcoin' : (activeCategory ? `/news/${activeCategory.toLowerCase()}` : '/news')}`;

  const categorySchema = useMemo(() => {
    const pageUrl = typeof window !== 'undefined' ? (window.location.origin + window.location.pathname) : canonicalUrl;
    
    const graph: any[] = [
      {
        "@type": "CollectionPage",
        "@id": `${pageUrl}#webpage`,
        "url": pageUrl,
        "name": config.seoTitle,
        "description": config.seoDescription,
        "isPartOf": {
          "@type": "WebSite",
          "@id": "https://wildwestcryptoshow.com/#website",
          "name": "Wild West Crypto Show",
          "url": "https://wildwestcryptoshow.com"
        },
        "publisher": {
          "@type": "NewsMediaOrganization",
          "name": "Wild West Crypto Show",
          "url": "https://wildwestcryptoshow.com",
          "logo": {
            "@type": "ImageObject",
            "url": "https://wildwestcryptoshow.com/wildwest_logo.svg",
            "width": 240,
            "height": 60
          }
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumbs`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://wildwestcryptoshow.com/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "News",
            "item": "https://wildwestcryptoshow.com/news"
          },
          ...(activeCategory ? [{
            "@type": "ListItem",
            "position": 3,
            "name": activeCategory,
            "item": canonicalUrl
          }] : [])
        ]
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#articlelist`,
        "name": `${config.h1} Articles`,
        "itemListElement": sortedArticles.slice(0, 10).map((article, idx) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "name": article.headline || article.title,
          "url": `https://wildwestcryptoshow.com${getArticleHref(article)}`
        }))
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        "mainEntity": config.faqs.map(faq => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.a
          }
        }))
      }
    ];

    if (activeCategory === 'Bitcoin') {
      graph.push({
        "@type": "FinancialProduct",
        "@id": "https://wildwestcryptoshow.com/news/bitcoin#asset",
        "name": "Bitcoin",
        "alternateName": "BTC",
        "category": "Cryptocurrency",
        "description": "Bitcoin (BTC) is a decentralized digital currency and the world's leading cryptographic asset by market capitalization."
      });
    }

    return {
      "@context": "https://schema.org",
      "@graph": graph
    };
  }, [activeCategory, config, sortedArticles, canonicalUrl]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505] text-[#F5F5F5]">
        <div className="w-10 h-10 border-4 border-[#222] border-t-[#F4A917] rounded-full animate-spin" />
        <p className="mt-4 font-bold uppercase tracking-widest text-[10px] text-[#555]">
          Loading {activeCategory || 'Cryptocurrency'} News...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] text-[#F5F5F5] px-4">
        <div className="bg-[#0A0A0A] p-8 border border-[#222] max-w-lg w-full text-center rounded-xl">
          <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Error Loading Category</h2>
          <p className="text-[#888] mb-6 text-sm">{error}</p>
          <button onClick={() => window.location.reload()} className="text-[11px] font-bold uppercase tracking-widest bg-[#F4A917] text-white px-6 py-3 hover:bg-[#C4830B] rounded transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#F5F5F5] font-sans">
      <SEO 
        title={config.seoTitle}
        description={config.seoDescription}
        canonical={canonicalUrl}
        schema={categorySchema}
      />
      <Header />
      <div className="max-w-[1280px] w-full mx-auto px-4 md:px-6 py-4">
        <AdPlacement format="billboard" />
      </div>
      
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Semantic Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#666]">
            <li>
              <Link to="/" className="hover:text-[#F5F5F5] transition-colors">Home</Link>
            </li>
            <li className="select-none">/</li>
            <li>
              <Link to="/news" className={activeCategory ? "hover:text-[#F5F5F5] transition-colors text-[#888]" : "text-[#F4A917]"}>
                All News
              </Link>
            </li>
            {activeCategory && (
              <>
                <li className="select-none">/</li>
                <li className="text-[#F4A917]" aria-current="page">{activeCategory}</li>
              </>
            )}
          </ol>
        </nav>

        {/* Category Header with Primary H1 */}
        <header className="mb-8 pb-6 border-b border-zinc-800/80">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            <Sparkles size={13} className="text-amber-500/80" />
            <span>Digital Asset Coverage</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white leading-tight mb-3">
            {config.h1}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-zinc-400 max-w-3xl leading-relaxed font-normal">
            {config.subtitle}
          </p>

          {/* Internal Navigation Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-5 scrollbar-none no-scrollbar">
            {CATEGORY_TABS.map((tab) => {
              const isActive = (!activeCategory && tab.id === 'all') || 
                (activeCategory && activeCategory.toLowerCase() === tab.id);
              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-zinc-100 text-zinc-950 font-bold shadow-md'
                      : 'bg-zinc-900/70 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </header>

        {/* Specialized Live Bitcoin Snapshot & Chart for Bitcoin Page */}
        {activeCategory === 'Bitcoin' && (
          <section aria-label="Bitcoin Live Market Intelligence" className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-zinc-400" />
              <h2 className="text-sm md:text-base font-bold uppercase tracking-wider text-zinc-200">
                Live Bitcoin Market Intelligence &amp; Technical Chart
              </h2>
            </div>
            <BitcoinMarketSnapshot />
            <div className="mt-4">
              <BitcoinPriceChart />
            </div>
          </section>
        )}

        {/* Main Articles Section Heading (H2) */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#888]">
              {activeCategory ? `Latest ${activeCategory} Reports & Analysis` : "All Breaking Cryptocurrency Reports"}
            </h2>
            <div className="hidden sm:block w-12 h-px bg-[#222]" />
          </div>
          <span className="text-[11px] font-mono text-[#555]">
            {sortedArticles.length} {sortedArticles.length === 1 ? 'Article' : 'Articles'}
          </span>
        </div>

        {/* Grid Layout of Articles (H3 titles) */}
        {sortedArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl mb-12">
            <p className="text-[#888] text-sm mb-2 font-semibold">No articles currently published in this category.</p>
            <p className="text-[#555] text-xs">Our AI news crawler is processing new stories. Please check back shortly.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {sortedArticles.slice(0, visibleCount).map((article, i) => {
                const displayTitle = article.headline || article.title;
                return (
                  <React.Fragment key={article.article_id || i}>
                    {i > 0 && i % 8 === 0 && (
                      <div className="md:col-span-2 lg:col-span-4 py-4 flex justify-center w-full">
                        <AdPlacement format="billboard" />
                      </div>
                    )}
                    <article className="h-full">
                      <Link
                        to={getArticleHref(article)}
                        state={{ article }}
                        className="group flex flex-col h-full rounded-xl overflow-hidden bg-[#0A0A0A] border border-[#1a1a1a] hover:border-[#333] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60"
                      >
                        <div className="w-full aspect-[16/10] bg-[#111] overflow-hidden relative">
                          {article.image_url ? (
                            <img
                              src={article.image_url}
                              alt={displayTitle}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-[#222]">
                              <span className="font-black text-2xl tracking-tighter opacity-50">WWCS</span>
                            </div>
                          )}
                          <span className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-sm text-[#F4A917] text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-white/10">
                            {getClassification(article)}
                          </span>
                        </div>
                        
                        <div className="p-5 flex flex-col flex-1">
                          <h3 className="text-[15px] font-bold text-[#E5E5E5] group-hover:text-[#F4A917] transition-colors line-clamp-3 leading-snug mb-4">
                            {displayTitle}
                          </h3>
                          {article.description && (
                            <p className="text-xs text-[#777] line-clamp-2 leading-relaxed mb-4">
                              {article.description}
                            </p>
                          )}
                          <div className="mt-auto pt-3 border-t border-[#161616] flex items-center justify-between text-[10px] text-[#555]">
                            <span className="flex items-center gap-1 font-medium">
                              <Clock size={10} />
                              {formatTimeAgo(article.pubDate)}
                            </span>
                            <span className="text-[#F4A917] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                              Read More →
                            </span>
                          </div>
                        </div>
                      </Link>
                    </article>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Load More Stories Button */}
            {sortedArticles.length > visibleCount && (
              <div className="flex justify-center mb-12">
                <button
                  onClick={() => setVisibleCount(prev => prev + 12)}
                  className="px-8 py-3.5 rounded-xl bg-[#0F0F0F] hover:bg-[#161616] border border-[#222] text-[#CCC] hover:text-[#F4A917] font-bold text-xs uppercase tracking-widest transition-all shadow-lg active:translate-y-0.5"
                >
                  Load More Stories ({sortedArticles.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Comprehensive In-Depth SEO Blog Article ── */}
        <SeoEditorialBlog category={activeCategory || 'all'} />

        {/* Dedicated Category FAQ Section (H2 & H3) */}
        <section aria-label="Category Frequently Asked Questions" className="mt-14 mb-12 border-t border-zinc-800/80 pt-10">
          <div className="flex items-center gap-2 mb-2 text-zinc-400">
            <HelpCircle size={15} />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Frequently Asked Questions</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mb-6">
            Frequently Asked Questions: {activeCategory || "Cryptocurrency News"}
          </h2>
          <div className="space-y-3">
            {config.faqs.map((faq, idx) => (
              <details
                key={idx}
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
      </main>
      
      <Footer />
    </div>
  );
}
