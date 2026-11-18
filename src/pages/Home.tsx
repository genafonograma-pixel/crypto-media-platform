import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import ArticleCard from '../components/ArticleCard';
import NewsImage from '../components/NewsImage';
import AdPlacement from '../components/AdPlacement';
import type { Article } from '../types';
import {
  generateSlug,
  formatArticleTime,
  formatSource,
  getArticleClassification,
  formatExcerpt,
  clusterDuplicateArticles
} from '../utils';

interface HomeProps {
  articles: Article[];
  loading: boolean;
  error: string | null;
}

function getArticleHref(article: Article): string {
  const displayTitle = article.headline || article.title;
  return `/article/${generateSlug(displayTitle)}`;
}

function isBreaking(article: Article): boolean {
  const cat = (article.category || []).join(' ').toLowerCase();
  const kw = (article.keywords || []).join(' ').toLowerCase();
  const title = (article.headline || article.title || '').toLowerCase();
  return cat.includes('breaking') || kw.includes('breaking') || title.startsWith('breaking:');
}

function matchesSport(article: Article, sportKey: string): boolean {
  const c = getArticleClassification(article).toLowerCase();
  const raw = ((article as any).classification || article.category?.[0] || '').toLowerCase();
  const t = (article.headline || article.title || '').toLowerCase();
  const combined = `${c} ${raw} ${t}`;

  if (sportKey === 'football') {
    // Strictly exclude American football / NFL
    if (
      combined.includes('american') ||
      combined.includes('nfl') ||
      combined.includes('quarterback') ||
      combined.includes('touchdown') ||
      combined.includes('super bowl')
    ) {
      return false;
    }
    return (
      combined.includes('foot') ||
      combined.includes('soccer') ||
      combined.includes('premier league') ||
      combined.includes('champions league') ||
      combined.includes('la liga') ||
      combined.includes('serie a') ||
      combined.includes('bundesliga')
    );
  }

  if (sportKey === 'nfl') {
    return (
      combined.includes('american') ||
      combined.includes('nfl') ||
      combined.includes('quarterback') ||
      combined.includes('touchdown') ||
      combined.includes('patriots') ||
      combined.includes('super bowl')
    );
  }

  if (sportKey === 'rugby') {
    return (
      combined.includes('rugby') ||
      combined.includes('six nations') ||
      combined.includes('springboks') ||
      combined.includes('all blacks')
    );
  }

  if (sportKey === 'basketball') {
    return (
      combined.includes('basket') ||
      combined.includes('nba') ||
      combined.includes('lakers') ||
      combined.includes('celtics')
    );
  }

  if (sportKey === 'tennis') {
    return (
      combined.includes('tennis') ||
      combined.includes('wimbledon') ||
      combined.includes('atp') ||
      combined.includes('wta') ||
      combined.includes('slam')
    );
  }

  if (sportKey === 'formula1') {
    return (
      combined.includes('formula') ||
      combined.includes('f1') ||
      combined.includes('grand prix') ||
      combined.includes('verstappen')
    );
  }

  return false;
}

export default function Home({ articles, loading, error }: HomeProps) {
  const sortedArticles = useMemo(() => {
    return [...articles].sort(
      (a, b) => (new Date(b.pubDate || 0).getTime() || 0) - (new Date(a.pubDate || 0).getTime() || 0)
    );
  }, [articles]);

  // Duplicate-event clustering
  const clusteredArticles = useMemo(() => {
    return clusterDuplicateArticles(sortedArticles);
  }, [sortedArticles]);

  // Story selection in one single pass with a shared shownIds Set
  const {
    heroArticle,
    heroSideArticles,
    latestNewsArticles,
    mostReadArticles,
    footballArticles,
    nflArticles,
    pairedSportRows
  } = useMemo(() => {
    const shownIds = new Set<string>();

    // 1. Hero: 1 story (featured, highest quality score with image, or newest with image)
    let hero = clusteredArticles.find(a => (a as any).featured && a.image_url);
    if (!hero) {
      hero = clusteredArticles.find(a => ((a as any).quality_score || 0) >= 90 && a.image_url);
    }
    if (!hero) {
      hero = clusteredArticles.find(a => Boolean(a.image_url)) || clusteredArticles[0];
    }
    if (hero) shownIds.add(hero.article_id);

    // 2. Hero side: next 4 stories not in shownIds
    const heroSide: typeof clusteredArticles = [];
    for (const a of clusteredArticles) {
      if (heroSide.length >= 4) break;
      if (!shownIds.has(a.article_id)) {
        heroSide.push(a);
        shownIds.add(a.article_id);
      }
    }

    // 3. Latest news: next 8 stories not in shownIds
    const latestNews: typeof clusteredArticles = [];
    for (const a of clusteredArticles) {
      if (latestNews.length >= 8) break;
      if (!shownIds.has(a.article_id)) {
        latestNews.push(a);
        shownIds.add(a.article_id);
      }
    }

    // 4. Most read: top 5 by views/clicks, or top 5 from last 24h NOT in hero zone.
    // Guaranteed not identical to hero side list.
    const heroZoneIds = new Set([hero?.article_id, ...heroSide.map(s => s.article_id)].filter(Boolean));
    const now = Date.now();
    const last24h = clusteredArticles.filter(a => {
      if (heroZoneIds.has(a.article_id)) return false;
      const pub = new Date(a.pubDate || 0).getTime();
      return now - pub <= 24 * 60 * 60 * 1000;
    });

    const mostReadCandidates =
      last24h.length >= 5
        ? last24h
        : clusteredArticles.filter(a => !heroZoneIds.has(a.article_id));

    const mostRead = [...mostReadCandidates]
      .sort((a, b) => ((b as any).views || (b as any).clicks || b.quality_score || 0) - ((a as any).views || (a as any).clicks || a.quality_score || 0))
      .slice(0, 5);

    // 5. Sport sections: ONLY stories matching that category and not in shownIds.
    // NEVER pad from another category. If < 3 stories, hide the section entirely.

    // Football (Layout A: feature + list, up to 4 stories)
    const fbCandidates = clusteredArticles.filter(a => !shownIds.has(a.article_id) && matchesSport(a, 'football'));
    let football: typeof clusteredArticles = [];
    if (fbCandidates.length >= 3) {
      football = fbCandidates.slice(0, 4);
      football.forEach(a => shownIds.add(a.article_id));
    }

    // NFL (Layout A: feature + list, up to 4 stories)
    const nflCandidates = clusteredArticles.filter(a => !shownIds.has(a.article_id) && matchesSport(a, 'nfl'));
    let nfl: typeof clusteredArticles = [];
    if (nflCandidates.length >= 3) {
      nfl = nflCandidates.slice(0, 4);
      nfl.forEach(a => shownIds.add(a.article_id));
    }

    // Paired sports: Rugby, Basketball, Tennis, Formula 1 (Layout B: 3 stories each)
    const pairedConfig = [
      { key: 'rugby', label: 'Rugby', href: '/news/rugby' },
      { key: 'basketball', label: 'Basketball', href: '/news/basketball' },
      { key: 'tennis', label: 'Tennis', href: '/news/tennis' },
      { key: 'formula1', label: 'Formula 1', href: '/news/formula1' }
    ];

    const validPairedSections: {
      key: string;
      label: string;
      href: string;
      stories: typeof clusteredArticles;
    }[] = [];

    for (const conf of pairedConfig) {
      const candidates = clusteredArticles.filter(
        a => !shownIds.has(a.article_id) && matchesSport(a, conf.key)
      );
      if (candidates.length >= 3) {
        const stories = candidates.slice(0, 3);
        stories.forEach(a => shownIds.add(a.article_id));
        validPairedSections.push({ ...conf, stories });
      }
    }

    // Pair into rows of 2
    const pairedRows: (typeof validPairedSections)[] = [];
    for (let i = 0; i < validPairedSections.length; i += 2) {
      pairedRows.push(validPairedSections.slice(i, i + 2));
    }

    return {
      heroArticle: hero,
      heroSideArticles: heroSide,
      latestNewsArticles: latestNews,
      mostReadArticles: mostRead,
      footballArticles: football,
      nflArticles: nfl,
      pairedSportRows: pairedRows
    };
  }, [clusteredArticles]);

  const homeSchema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': 'https://sport25.news/#website',
          url: 'https://sport25.news',
          name: 'SPORT25 - Live Sports News & Scores',
          description:
            'Breaking sports news, football transfers, Champions League, Premier League, NBA, Tennis Grand Slams, Formula 1, and NFL updates.'
        },
        {
          '@type': 'NewsMediaOrganization',
          '@id': 'https://sport25.news/#organization',
          name: 'SPORT25',
          url: 'https://sport25.news',
          logo: {
            '@type': 'ImageObject',
            url: 'https://sport25.news/sport25_logo.svg',
            width: 240,
            height: 60
          }
        }
      ]
    }),
    []
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-bg text-ink font-sans" aria-busy="true" aria-label="Loading sports news">
        <SEO
          title="SPORT25 - Live Sports News, Scores & Breaking Headlines"
          description="Breaking sports news, football transfers, Champions League, Premier League, NBA, Tennis Grand Slams, Formula 1, and NFL updates."
          canonical="https://sport25.news/"
          schema={homeSchema}
        />

        {/* Real Header loaded instantly with full navigation & logo */}
        <Header />

        {/* Live status ticker */}
        <div className="bg-bg-soft/70 border-b border-line/40 py-2">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted font-medium">
              <span className="w-2 h-2 rounded-full bg-brand animate-ping" />
              <span className="text-ink font-semibold">SPORT25 Wire</span>
              <span className="text-muted">&bull; Updating latest sports coverage...</span>
            </div>
            <span className="text-[11px] text-muted hidden sm:inline font-mono">Live Sync</span>
          </div>
        </div>

        {/* Skeleton content area matching actual home layout */}
        <main className="max-w-[1200px] w-full mx-auto px-4 md:px-6 py-6 flex-1">
          {/* Top billboard placeholder */}
          <div className="w-full h-24 bg-bg-soft/40 border border-line/30 rounded-card mb-8 animate-pulse hidden md:block" />

          {/* Hero section skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
            {/* Main Hero Story */}
            <div className="lg:col-span-8 flex flex-col gap-3">
              <div className="aspect-video bg-bg-soft rounded-card animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 w-20 h-5 bg-brand/30 rounded-full animate-pulse" />
              </div>
              <div className="h-6 bg-bg-soft rounded animate-pulse w-4/5" />
              <div className="h-4 bg-bg-soft rounded animate-pulse w-3/5" />
            </div>

            {/* Side List Stories */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="text-xs font-bold uppercase tracking-wider text-muted pb-2 border-b border-line">
                Top Stories
              </div>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex gap-3 pb-3 border-b border-line/40">
                  <span className="text-sm font-bold text-muted/50 font-display">0{i}</span>
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="h-4 bg-bg-soft rounded animate-pulse w-full" />
                    <div className="h-3 bg-bg-soft rounded animate-pulse w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Secondary grid skeleton */}
          <div className="mb-8">
            <div className="text-xs font-bold uppercase tracking-wider text-muted pb-2 border-b border-line mb-4">
              Trending Across Sports
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="aspect-video bg-bg-soft rounded-card animate-pulse" />
                  <div className="h-4 bg-bg-soft rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-bg-soft rounded animate-pulse w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }


  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-ink px-4">
        <div className="bg-bg-soft p-8 border border-line max-w-lg w-full text-center rounded-card">
          <h2 className="text-card-lg font-bold font-display text-ink mb-3">Unable to load feed</h2>
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

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink font-sans selection:bg-brand selection:text-white">
      <SEO
        title="SPORT25 | Live Sports News & Scores"
        description="Breaking sports news, live football transfers, Champions League, Premier League, NBA, Tennis Grand Slams, Formula 1, and NFL updates."
        schema={homeSchema}
      />

      <h1 className="sr-only">SPORT25 - Live Sports News &amp; Scores</h1>

      <Header />

      <main id="main" tabIndex={-1} className="flex-1 w-full">
        {clusteredArticles.length === 0 ? (
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-24 text-center">
            <p className="text-muted text-sm">No articles available yet. Check back shortly.</p>
          </div>
        ) : (
          <div>
            {/* Top Billboard Banner Placement */}
            <div className="max-w-[1200px] mx-auto px-4 md:px-6 pt-6">
              <AdPlacement format="billboard" />
            </div>

            {/* ── 1. HERO ZONE: 1 Big Story (8 cols) + 4 Compact Stories (4 cols) ── */}
            <section aria-label="Top stories" className="max-w-[1200px] mx-auto px-4 md:px-6 pt-4 pb-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Big Story (8 cols) */}
                <div className="lg:col-span-8 flex flex-col justify-between">
                  {heroArticle && (
                    <Link
                      to={getArticleHref(heroArticle)}
                      state={{ article: heroArticle }}
                      className="group block focus-visible:outline-brand focus-visible:outline-offset-2"
                    >
                      <NewsImage
                        src={heroArticle.image_url}
                        alt={heroArticle.headline || heroArticle.title}
                        isHero={true}
                        className="w-full aspect-video"
                      />
                      <div className="mt-4">
                        <div className="flex items-center gap-2 mb-2">
                          {isBreaking(heroArticle) && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-alert text-white text-label font-bold">
                              Breaking
                            </span>
                          )}
                          <span className="text-label font-bold text-ink">
                            {getArticleClassification(heroArticle)}
                          </span>
                        </div>
                        <h2 className="text-hero-mobile md:text-hero font-extrabold font-display leading-[1.1] text-ink group-hover:text-brand transition-colors duration-150 text-balance line-clamp-3">
                          {heroArticle.headline || heroArticle.title}
                        </h2>
                        {(() => {
                          const excerpt = formatExcerpt(heroArticle.ai_meta_description || heroArticle.description);
                          return excerpt ? (
                            <p className="text-excerpt text-muted font-normal leading-relaxed line-clamp-2 mt-2">
                              {excerpt}
                            </p>
                          ) : null;
                        })()}
                        <p className="text-meta font-medium text-subtle mt-2">
                          {formatSource(heroArticle.source_id)} · {formatArticleTime(heroArticle.pubDate)}
                          {heroArticle.extraSourceCount && ` · +${heroArticle.extraSourceCount} source${heroArticle.extraSourceCount > 1 ? 's' : ''}`}
                        </p>
                      </div>
                    </Link>
                  )}
                </div>

                {/* Side Column: 4 compact rows — image hidden on mobile, shown on sm+ */}
                <div className="lg:col-span-4 flex flex-col divide-y divide-line h-full">
                  {heroSideArticles.map(article => (
                    <Link
                      key={article.article_id}
                      to={getArticleHref(article)}
                      state={{ article }}
                      className="flex-1 flex items-center gap-3 py-3 group focus-visible:outline-brand focus-visible:outline-offset-2"
                    >
                      {/* Thumbnail: hidden on mobile, visible sm+ */}
                      <div className="hidden sm:block w-[100px] shrink-0 aspect-video rounded-card overflow-hidden">
                        <NewsImage src={article.image_url} alt="" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-label font-bold text-ink block">
                          {getArticleClassification(article)}
                        </span>
                        <h3 className="text-list font-semibold font-sans text-ink group-hover:text-brand transition-colors duration-150 text-balance line-clamp-3 mt-1 leading-snug">
                          {article.headline || article.title}
                        </h3>
                        <p className="text-meta font-medium text-subtle mt-1">
                          {formatSource(article.source_id)} · {formatArticleTime(article.pubDate)}
                          {article.extraSourceCount && ` · +${article.extraSourceCount} source${article.extraSourceCount > 1 ? 's' : ''}`}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            {/* ── 2. LATEST NEWS (8 cols) + STICKY SIDEBAR (4 cols) ── */}
            <section aria-label="Latest news" className="max-w-[1200px] mx-auto px-4 md:px-6 pb-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Sidebar: Most read — order-first on mobile, right column on desktop */}
                <aside className="lg:col-span-4 lg:sticky lg:top-20 self-start order-first lg:order-last">
                  <div className="bg-bg-soft rounded-card p-5 border border-line">
                    <h3 className="text-card font-bold font-display text-ink mb-4">
                      Most read
                    </h3>
                    <div className="divide-y divide-line">
                      {mostReadArticles.map((article, idx) => (
                        <Link
                          key={article.article_id}
                          to={getArticleHref(article)}
                          state={{ article }}
                          className="group flex gap-4 py-3 first:pt-0 last:pb-0 focus-visible:outline-brand focus-visible:outline-offset-2"
                        >
                          <span className="text-2xl font-extrabold text-brand leading-none shrink-0 w-6">
                            {idx + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-list font-semibold font-sans text-ink group-hover:text-brand transition-colors duration-150 line-clamp-2 leading-snug">
                              {article.headline || article.title}
                            </h4>
                            <p className="text-meta font-medium text-subtle mt-1">
                              {formatSource(article.source_id)} · {formatArticleTime(article.pubDate)}
                              {article.extraSourceCount && ` · +${article.extraSourceCount} source${article.extraSourceCount > 1 ? 's' : ''}`}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Sidebar Ad Placement */}
                  <div className="mt-6">
                    <AdPlacement format="in-article" />
                  </div>
                </aside>

                {/* Main Column: Latest news (8 cols) */}
                <div className="lg:col-span-8 order-last lg:order-first">
                  <div className="flex items-center justify-between pb-4 border-b border-line">
                    <div className="flex items-center gap-2.5">
                      <span className="w-[3px] h-5 bg-brand rounded-full inline-block shrink-0" />
                      <h2 className="text-title-mobile md:text-title font-bold font-display text-ink">
                        Latest news
                      </h2>
                    </div>
                    <Link
                      to="/news"
                      className="text-sm font-semibold text-brand hover:underline transition-colors duration-150"
                    >
                      View all
                    </Link>
                  </div>

                  <div className="divide-y divide-line">
                    {latestNewsArticles.map(article => {
                      const excerpt = formatExcerpt(article.ai_meta_description || article.description);
                      return (
                        <Link
                          key={article.article_id}
                          to={getArticleHref(article)}
                          state={{ article }}
                          className="group flex gap-3 sm:gap-5 py-4 items-start focus-visible:outline-brand focus-visible:outline-offset-2"
                        >
                          {/* Compact thumbnail on mobile, wider on sm+ */}
                          <div className="w-24 h-16 sm:w-[200px] sm:h-auto sm:aspect-video shrink-0 rounded-card overflow-hidden">
                            <NewsImage src={article.image_url} alt="" />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <span className="text-label font-bold text-ink">
                              {getArticleClassification(article)}
                            </span>
                            <h3 className="text-list sm:text-title-mobile font-bold font-display text-ink group-hover:text-brand transition-colors duration-150 text-balance line-clamp-3 mt-1 leading-snug">
                              {article.headline || article.title}
                            </h3>
                            {excerpt && (
                              <p className="hidden sm:block text-excerpt text-muted font-normal leading-relaxed line-clamp-2 mt-2">
                                {excerpt}
                              </p>
                            )}
                            <p className="text-meta font-medium text-subtle mt-1.5">
                              {formatSource(article.source_id)} · {formatArticleTime(article.pubDate)}
                              {article.extraSourceCount && ` · +${article.extraSourceCount} source${article.extraSourceCount > 1 ? 's' : ''}`}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* Mid-Feed Native Leaderboard Banner */}
            <div className="max-w-[1200px] mx-auto px-4 md:px-6 pb-8">
              <AdPlacement format="native" />
            </div>

            {/* ── 3. FOOTBALL: Layout A (Feature + List) with alternating bg-bg-soft band ── */}
            {footballArticles.length >= 3 && (
              <section aria-label="Football" className="w-full bg-bg-soft py-12">
                <div className="max-w-[1200px] mx-auto px-4 md:px-6">
                  <div className="flex items-center justify-between pb-4 border-b border-line mb-6">
                    <div className="flex items-center gap-2.5">
                      <span className="w-[3px] h-5 bg-brand rounded-full inline-block shrink-0" />
                      <h2 className="text-title-mobile md:text-title font-bold font-display text-ink">
                        Football
                      </h2>
                    </div>
                    <Link
                      to="/football-news"
                      className="text-sm font-semibold text-brand hover:underline transition-colors duration-150"
                    >
                      View all
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* Left: 1 large feature card (7 cols) */}
                    <div className="lg:col-span-7">
                      <Link
                        to={getArticleHref(footballArticles[0])}
                        state={{ article: footballArticles[0] }}
                        className="group block focus-visible:outline-brand focus-visible:outline-offset-2"
                      >
                        <NewsImage
                          src={footballArticles[0].image_url}
                          alt=""
                          className="w-full aspect-video"
                        />
                        <div className="mt-3">
                          <span className="text-label font-bold text-ink">
                            {getArticleClassification(footballArticles[0])}
                          </span>
                          <h3 className="text-card-lg font-bold font-display text-ink group-hover:text-brand transition-colors duration-150 text-balance line-clamp-3 mt-1 leading-snug">
                            {footballArticles[0].headline || footballArticles[0].title}
                          </h3>
                          {(() => {
                            const excerpt = formatExcerpt(
                              footballArticles[0].ai_meta_description || footballArticles[0].description
                            );
                            return excerpt ? (
                              <p className="text-excerpt text-muted font-normal leading-relaxed line-clamp-2 mt-2">
                                {excerpt}
                              </p>
                            ) : null;
                          })()}
                          <p className="text-meta font-medium text-subtle mt-2">
                            {formatSource(footballArticles[0].source_id)} · {formatArticleTime(footballArticles[0].pubDate)}
                            {footballArticles[0].extraSourceCount && ` · +${footballArticles[0].extraSourceCount} source${footballArticles[0].extraSourceCount > 1 ? 's' : ''}`}
                          </p>
                        </div>
                      </Link>
                    </div>

                    {/* Right: 3 list rows (5 cols) */}
                    <div className="lg:col-span-5 flex flex-col justify-between divide-y divide-line h-full">
                      {footballArticles.slice(1, 4).map(article => (
                        <Link
                          key={article.article_id}
                          to={getArticleHref(article)}
                          state={{ article }}
                          className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 group focus-visible:outline-brand focus-visible:outline-offset-2"
                        >
                          <div className="hidden sm:block w-[120px] shrink-0 aspect-video rounded-card overflow-hidden">
                            <NewsImage src={article.image_url} alt="" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-label font-bold text-ink block">
                              {getArticleClassification(article)}
                            </span>
                            <h4 className="text-list font-semibold font-sans text-ink group-hover:text-brand transition-colors duration-150 text-balance line-clamp-2 mt-1 leading-snug">
                              {article.headline || article.title}
                            </h4>
                            <p className="text-meta font-medium text-subtle mt-1">
                              {formatSource(article.source_id)} · {formatArticleTime(article.pubDate)}
                              {article.extraSourceCount && ` · +${article.extraSourceCount} source${article.extraSourceCount > 1 ? 's' : ''}`}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ── 4. NFL: Layout A (Feature + List) on white bg ── */}
            {nflArticles.length >= 3 && (
              <section aria-label="NFL" className="max-w-[1200px] mx-auto px-4 md:px-6 py-12">
                <div className="flex items-center justify-between pb-4 border-b border-line mb-6">
                  <div className="flex items-center gap-2.5">
                    <span className="w-[3px] h-5 bg-brand rounded-full inline-block shrink-0" />
                    <h2 className="text-title-mobile md:text-title font-bold font-display text-ink">
                      NFL
                    </h2>
                  </div>
                  <Link
                    to="/news/american-football"
                    className="text-sm font-semibold text-brand hover:underline transition-colors duration-150"
                  >
                    View all
                  </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  {/* Left: 1 feature card (7 cols) */}
                  <div className="lg:col-span-7">
                    <Link
                      to={getArticleHref(nflArticles[0])}
                      state={{ article: nflArticles[0] }}
                      className="group block focus-visible:outline-brand focus-visible:outline-offset-2"
                    >
                      <NewsImage
                        src={nflArticles[0].image_url}
                        alt=""
                        className="w-full aspect-video"
                      />
                      <div className="mt-3">
                        <span className="text-label font-bold text-ink">
                          {getArticleClassification(nflArticles[0])}
                        </span>
                        <h3 className="text-card-lg font-bold font-display text-ink group-hover:text-brand transition-colors duration-150 text-balance line-clamp-3 mt-1 leading-snug">
                          {nflArticles[0].headline || nflArticles[0].title}
                        </h3>
                        {(() => {
                          const excerpt = formatExcerpt(
                            nflArticles[0].ai_meta_description || nflArticles[0].description
                          );
                          return excerpt ? (
                            <p className="text-excerpt text-muted font-normal leading-relaxed line-clamp-2 mt-2">
                              {excerpt}
                            </p>
                          ) : null;
                        })()}
                        <p className="text-meta font-medium text-subtle mt-2">
                          {formatSource(nflArticles[0].source_id)} · {formatArticleTime(nflArticles[0].pubDate)}
                          {nflArticles[0].extraSourceCount && ` · +${nflArticles[0].extraSourceCount} source${nflArticles[0].extraSourceCount > 1 ? 's' : ''}`}
                        </p>
                      </div>
                    </Link>
                  </div>

                  {/* Right: 3 list rows (5 cols) */}
                  <div className="lg:col-span-5 flex flex-col justify-between divide-y divide-line h-full">
                    {nflArticles.slice(1, 4).map(article => (
                      <Link
                        key={article.article_id}
                        to={getArticleHref(article)}
                        state={{ article }}
                        className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 group focus-visible:outline-brand focus-visible:outline-offset-2"
                      >
                        <div className="hidden sm:block w-[120px] shrink-0 aspect-video rounded-card overflow-hidden">
                          <NewsImage src={article.image_url} alt="" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-label font-bold text-ink block">
                            {getArticleClassification(article)}
                          </span>
                          <h4 className="text-list font-semibold font-sans text-ink group-hover:text-brand transition-colors duration-150 text-balance line-clamp-2 mt-1 leading-snug">
                            {article.headline || article.title}
                          </h4>
                          <p className="text-meta font-medium text-subtle mt-1">
                            {formatSource(article.source_id)} · {formatArticleTime(article.pubDate)}
                            {article.extraSourceCount && ` · +${article.extraSourceCount} source${article.extraSourceCount > 1 ? 's' : ''}`}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* ── 5. PAIRED COLUMNS: Rugby, Basketball, Tennis, F1 (Layout B) ── */}
            {pairedSportRows.map((pair, rowIdx) => {
              const isBand = rowIdx % 2 === 0;
              return (
                <section
                  key={rowIdx}
                  aria-label="Sports coverage"
                  className={`w-full py-12 ${isBand ? 'bg-bg-soft' : ''}`}
                >
                  <div className="max-w-[1200px] mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {pair.map(section => (
                        <div key={section.key} className="flex flex-col">
                          {/* Section Header */}
                          <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
                            <div className="flex items-center gap-2.5">
                              <span className="w-[3px] h-5 bg-brand rounded-full inline-block shrink-0" />
                              <h3 className="text-title-mobile md:text-title font-bold font-display text-ink">
                                {section.label}
                              </h3>
                            </div>
                            <Link
                              to={section.href}
                              className="text-sm font-semibold text-brand hover:underline transition-colors duration-150"
                            >
                              View all
                            </Link>
                          </div>

                          {/* 1 Standard Card (16:9 image, 18px headline) */}
                          {section.stories[0] && (
                            <ArticleCard article={section.stories[0]} />
                          )}

                          {/* 2 Text-only rows (headline + meta, hairline separated) */}
                          {section.stories.length > 1 && (
                            <div className="mt-4 pt-3 border-t border-line divide-y divide-line">
                              {section.stories.slice(1, 3).map(article => (
                                <Link
                                  key={article.article_id}
                                  to={getArticleHref(article)}
                                  state={{ article }}
                                  className="block py-3 first:pt-0 last:pb-0 group focus-visible:outline-brand focus-visible:outline-offset-2"
                                >
                                  <h4 className="text-list font-semibold font-sans text-ink group-hover:text-brand transition-colors duration-150 text-balance line-clamp-2 leading-snug">
                                    {article.headline || article.title}
                                  </h4>
                                  <p className="text-meta font-medium text-subtle mt-1">
                                    {formatSource(article.source_id)} · {formatArticleTime(article.pubDate)}
                                    {article.extraSourceCount && ` · +${article.extraSourceCount} source${article.extraSourceCount > 1 ? 's' : ''}`}
                                  </p>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );
            })}

            {/* ── 6. REWRITTEN ABOUT SPORT25 STRIP (Plain words) ── */}
            <section aria-label="About SPORT25" className="max-w-[1200px] mx-auto px-4 md:px-6 py-12">
              <div className="bg-bg-soft rounded-card p-6 md:p-8 border border-line">
                <div className="max-w-2xl">
                  <h2 className="text-card font-bold font-display text-ink mb-2">
                    About SPORT25
                  </h2>
                  <p className="text-excerpt text-muted leading-relaxed font-normal">
                    SPORT25 brings together the day&apos;s sports news from BBC Sport, The Guardian, Sky Sports and CBS Sports, with a link to the original report on every story. How we select and summarise stories is explained on our{' '}
                    <Link to="/methodology" className="text-brand hover:underline font-semibold">
                      How we work page
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
