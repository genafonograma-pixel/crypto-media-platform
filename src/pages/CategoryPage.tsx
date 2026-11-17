import React, { useMemo, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import ArticleCard from '../components/ArticleCard';
import AdPlacement from '../components/AdPlacement';
import type { Article } from '../types';
import { getArticleClassification } from '../utils';

interface CategoryPageProps {
  articles: Article[];
  loading: boolean;
  error: string | null;
  defaultCategory?: string;
}

const CATEGORY_TABS = [
  { id: 'all', label: 'All sports', path: '/news' },
  { id: 'football', label: 'Football', path: '/football-news' },
  { id: 'nfl', label: 'NFL', path: '/news/american-football' },
  { id: 'rugby', label: 'Rugby', path: '/news/rugby' },
  { id: 'basketball', label: 'Basketball', path: '/news/basketball' },
  { id: 'tennis', label: 'Tennis', path: '/news/tennis' },
  { id: 'formula1', label: 'Formula 1', path: '/news/formula1' },
  { id: 'horse-racing', label: 'Horse racing', path: '/news/horse-racing' },
];

const CATEGORY_CONFIGS: Record<string, {
  h1: string;
  subtitle: string;
  seoTitle: string;
  seoDescription: string;
}> = {
  Football: {
    h1: "Football news: Premier League, Champions League & transfers",
    subtitle: "Breaking football headlines, live match reports, transfer market exclusives, and tactical analysis from Europe's top leagues.",
    seoTitle: "Football News & Transfer Updates | SPORT25",
    seoDescription: "Stay ahead with breaking football news, Champions League coverage, Premier League transfer rumors, match highlights, and tactical breakdowns."
  },
  Basketball: {
    h1: "Basketball news: NBA scores, highlights & trade rumors",
    subtitle: "Comprehensive NBA reporting, game highlights, player performance metrics, playoff standings, and front-office trade rumors.",
    seoTitle: "Basketball News & NBA Coverage | SPORT25",
    seoDescription: "Follow latest NBA news, game recaps, trade deadlines, player updates, and postseason basketball tournament coverage."
  },
  Tennis: {
    h1: "Tennis news: Grand Slam coverage, ATP & WTA tours",
    subtitle: "Live tournament updates, Grand Slam match reports, ATP and WTA rankings, injury updates, and player interviews.",
    seoTitle: "Tennis News: Grand Slams & ATP/WTA Tours | SPORT25",
    seoDescription: "Comprehensive coverage of Grand Slam tournaments (Wimbledon, US Open, Roland Garros, Australian Open) and ATP/WTA tour results."
  },
  "Formula 1": {
    h1: "Formula 1 news: Grand Prix results, driver standings & race reports",
    subtitle: "Breaking F1 updates, Grand Prix weekend recaps, qualifying results, constructor championship battles, and driver market news.",
    seoTitle: "Formula 1 News & Grand Prix Coverage | SPORT25",
    seoDescription: "Track the latest F1 news, race results, lap times, technical regulations, and driver championship standings."
  },
  "NFL": {
    h1: "NFL & American football news: scores, rosters & playoff race",
    subtitle: "Comprehensive NFL reporting, game day recaps, quarterback performances, injury updates, and Super Bowl contention.",
    seoTitle: "NFL News & American Football Coverage | SPORT25",
    seoDescription: "Follow breaking NFL headlines, Super Bowl news, game highlights, draft prospect analysis, and team injury reports."
  },
  "Rugby": {
    h1: "Rugby news: Six Nations, Rugby Championship & international tests",
    subtitle: "Comprehensive coverage of Rugby Union and Rugby League, tournament standings, team selections, and match analysis.",
    seoTitle: "Rugby News & Six Nations Coverage | SPORT25",
    seoDescription: "Follow breaking Rugby union and league news, Six Nations match reports, international fixtures, and tournament updates."
  },
  "Horse racing": {
    h1: "Horse racing news: fixtures, festival updates & racecards",
    subtitle: "Coverage of major race meets, festival contenders, jockey updates, and daily racing headlines.",
    seoTitle: "Horse Racing News & Festival Updates | SPORT25",
    seoDescription: "Stay informed with breaking horse racing news, major festival coverage, and race analysis."
  }
};

const DEFAULT_CONFIG = {
  h1: "All sports news & live match coverage",
  subtitle: "Real-time 24/7 sports reporting, breaking football updates, NBA highlights, tennis results, and global sports news.",
  seoTitle: "All Sports News & Live Headlines | SPORT25",
  seoDescription: "Browse all sports news, breaking football reports, basketball updates, tennis Grand Slams, and F1 results updated 24/7."
};

export default function CategoryPage({ articles, loading, error, defaultCategory }: CategoryPageProps) {
  const { categoryId } = useParams();
  const location = useLocation();
  const [visibleCount, setVisibleCount] = useState(12);

  const isExplicitFootballRoute = location.pathname === '/football-news' || defaultCategory === 'Football';

  const ALLOWED_CATEGORIES = [
    "Football",
    "Basketball",
    "Tennis",
    "Formula 1",
    "NFL",
    "Rugby",
    "Horse racing"
  ];

  const activeCategory = isExplicitFootballRoute
    ? 'Football'
    : (categoryId
        ? ALLOWED_CATEGORIES.find((c) => {
            const normalized = c.toLowerCase().replace(/\s+/g, '-');
            const param = categoryId.toLowerCase();
            if (param === 'american-football' && c === 'NFL') return true;
            if (param === 'formula1' && c === 'Formula 1') return true;
            return c.toLowerCase() === param || normalized === param;
          }) ?? null
        : null);

  const filteredArticles = activeCategory
    ? articles.filter((a) => {
        const cls = getArticleClassification(a).toLowerCase();
        const act = activeCategory.toLowerCase();
        if (act === 'football') {
          return cls === 'football' && !cls.includes('american') && !cls.includes('nfl');
        }
        if (act === 'nfl') {
          return cls === 'nfl' || cls.includes('american');
        }
        return cls === act || cls.includes(act);
      })
    : articles;

  const sortedArticles = useMemo(() => {
    return [...filteredArticles].sort((a, b) =>
      (new Date(b.pubDate || 0).getTime() || 0) - (new Date(a.pubDate || 0).getTime() || 0)
    );
  }, [filteredArticles]);

  const config = activeCategory ? (CATEGORY_CONFIGS[activeCategory] || DEFAULT_CONFIG) : DEFAULT_CONFIG;
  const canonicalUrl = `https://sport25.news${activeCategory === 'Football' ? '/football-news' : (activeCategory ? `/news/${activeCategory.toLowerCase().replace(/\s+/g, '-')}` : '/news')}`;

  const categorySchema = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "url": canonicalUrl,
      "name": config.seoTitle,
      "description": config.seoDescription,
      "publisher": {
        "@type": "NewsMediaOrganization",
        "name": "SPORT25",
        "url": "https://sport25.news"
      }
    };
  }, [config, canonicalUrl]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-ink">
        <div className="w-8 h-8 border-2 border-line border-t-brand rounded-full animate-spin" />
        <p className="mt-4 text-sm text-muted font-medium">Loading sports news...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-ink px-4">
        <div className="bg-bg-soft p-8 border border-line max-w-lg w-full text-center rounded-card">
          <h2 className="text-card-lg font-bold font-display text-ink mb-3">Unable to load category</h2>
          <p className="text-muted text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="h-10 px-6 rounded-card bg-brand text-white font-semibold text-sm hover:bg-brand-600 transition-colors duration-150"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const displayedArticles = sortedArticles.slice(0, visibleCount);

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink font-sans">
      <SEO
        title={config.seoTitle}
        description={config.seoDescription}
        schema={categorySchema}
        canonical={canonicalUrl}
      />
      <Header />

      <main id="main" tabIndex={-1} className="flex-1 max-w-[1200px] w-full mx-auto px-4 md:px-6 py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-subtle">
            <li>
              <Link to="/" className="text-brand hover:underline">Home</Link>
            </li>
            <li>/</li>
            <li>
              <Link to="/news" className={activeCategory ? "text-brand hover:underline" : "text-ink font-semibold"}>
                News
              </Link>
            </li>
            {activeCategory && (
              <>
                <li>/</li>
                <li className="text-ink font-semibold" aria-current="page">{activeCategory}</li>
              </>
            )}
          </ol>
        </nav>

        {/* Category Header */}
        <header className="mb-8 pb-6 border-b border-line">
          <h1 className="text-hero-mobile md:text-hero font-extrabold font-display text-ink mb-3 leading-tight">
            {config.h1}
          </h1>
          <p className="text-excerpt text-muted max-w-3xl leading-relaxed">
            {config.subtitle}
          </p>

          {/* Category Tabs — horizontal scroll with fade-right hint */}
          <div className="relative mt-6">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {CATEGORY_TABS.map((tab) => {
                const isActive = (tab.id === 'all' && !activeCategory) ||
                  (tab.label.toLowerCase() === activeCategory?.toLowerCase());

                return (
                  <Link
                    key={tab.id}
                    to={tab.path}
                    className={`px-4 py-2 rounded-card text-sm font-semibold whitespace-nowrap transition-colors duration-150 ${
                      isActive
                        ? 'bg-brand text-white'
                        : 'bg-bg-soft text-ink hover:bg-line border border-line'
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>
            {/* Right fade hint — signals more content off-screen */}
            <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-bg to-transparent" />
          </div>
        </header>

        {/* Category Top Billboard Ad Placement */}
        <div className="mb-6">
          <AdPlacement format="billboard" />
        </div>

        {/* Articles Count */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-line">
          <h2 className="text-card font-bold font-display text-ink">
            {activeCategory ? `${activeCategory} stories` : "All sports stories"}
          </h2>
          <span className="text-meta text-subtle font-medium">
            {sortedArticles.length} articles
          </span>
        </div>

        {/* Articles Grid */}
        {sortedArticles.length === 0 ? (
          <div className="py-20 text-center bg-bg-soft border border-line rounded-card mb-12">
            <p className="text-ink text-sm font-semibold mb-1">No articles in this category yet.</p>
            <p className="text-muted text-xs">Stories update continuously throughout the day.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayedArticles.slice(0, 4).map((article) => (
              <ArticleCard key={article.article_id} article={article} />
            ))}
            {displayedArticles.length > 4 && (
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 my-2">
                <AdPlacement format="native" />
              </div>
            )}
            {displayedArticles.slice(4).map((article) => (
              <ArticleCard key={article.article_id} article={article} />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {sortedArticles.length > visibleCount && (
          <div className="mt-12 text-center">
            <button
              onClick={() => setVisibleCount((prev) => prev + 12)}
              className="h-10 px-8 rounded-card bg-white border border-line text-ink hover:border-ink transition-colors duration-150 text-sm font-semibold"
            >
              Load more
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
