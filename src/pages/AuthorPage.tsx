import React, { useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import ArticleCard from '../components/ArticleCard';
import { AUTHOR } from '../data/author';
import type { Article } from '../types';

interface AuthorPageProps {
  articles: Article[];
  loading: boolean;
}

export default function AuthorPage({ articles, loading }: AuthorPageProps) {
  const recentArticles = articles.slice(0, 8);

  const authorSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: AUTHOR.name,
      jobTitle: AUTHOR.title,
      description: AUTHOR.shortBio,
      url: 'https://sport25.news/author/jordan-cole',
      sameAs: [AUTHOR.twitter],
      worksFor: {
        '@type': 'NewsMediaOrganization',
        name: 'SPORT25',
        url: 'https://sport25.news'
      }
    }
  }), []);

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink font-sans">
      <SEO
        title={`${AUTHOR.name}, ${AUTHOR.title} | SPORT25`}
        description={`${AUTHOR.shortBio} Follow ${AUTHOR.name} for the latest sports analysis.`}
        schema={authorSchema}
      />
      <Header />

      <main id="main" tabIndex={-1} className="flex-1 max-w-[1200px] w-full mx-auto px-4 md:px-6 py-12">
        {/* Author Header */}
        <div className="bg-bg-soft rounded-card p-6 md:p-8 border border-line mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-brand-50 border border-brand text-brand flex items-center justify-center font-display font-extrabold text-2xl shrink-0">
              {AUTHOR.name.split(' ').map(n => n[0]).join('')}
            </div>

            <div className="flex-1">
              <span className="text-label font-bold text-brand">
                {AUTHOR.title}
              </span>
              <h1 className="text-title-mobile md:text-title font-bold font-display text-ink mt-1">
                {AUTHOR.name}
              </h1>
              <p className="text-sm text-subtle mt-1">
                Sports desk · SPORT25
              </p>
              <p className="text-excerpt text-muted mt-3 max-w-2xl leading-relaxed">
                {AUTHOR.bio}
              </p>
            </div>
          </div>
        </div>

        {/* Latest Articles */}
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-line">
            <span className="w-[3px] h-5 bg-brand rounded-full inline-block shrink-0" />
            <h2 className="text-title-mobile md:text-title font-bold font-display text-ink">
              Latest stories from {AUTHOR.name}
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted">
              <div className="w-8 h-8 border-2 border-line border-t-brand rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentArticles.map((article, idx) => (
                <ArticleCard key={article.article_id || idx} article={article} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
