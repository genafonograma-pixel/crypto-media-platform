import React from 'react';
import { Link } from 'react-router-dom';
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

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#F5F5F5] font-sans">
      <SEO
        title={`${AUTHOR.name} - Senior Markets Reporter | Crypton`}
        description={AUTHOR.shortBio}
        image=""
        type="website"
      />
      <Header />

      {/* Hero */}
      <div className="border-b border-[#1a1a1a] bg-gradient-to-b from-[#080c14] to-[#050505]">
        <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Avatar placeholder */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#1d3a5c] to-[#0d1b2e] border-2 border-[#3B82F6]/40 flex items-center justify-center shrink-0">
              <span className="text-4xl md:text-5xl font-black text-[#3B82F6]">
                {AUTHOR.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#3B82F6]">
                  {AUTHOR.title}
                </p>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-3">
                {AUTHOR.name}
              </h1>
              <p className="text-sm text-[#888] mb-5">
                Member since {AUTHOR.joined} &nbsp;&middot;&nbsp; Crypton
              </p>
              <div className="flex items-center gap-4">
                <a
                  href={AUTHOR.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#111] hover:bg-[#1a1a1a] border border-[#222] hover:border-[#333] text-[#F5F5F5] text-xs font-bold px-4 py-2.5 rounded-sm transition-all"
                >
                  {/* X logo */}
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.258 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/>
                  </svg>
                  {AUTHOR.twitterHandle}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="border-b border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#555] mb-4">About</p>
          <p className="text-[#AAAAAA] leading-[1.9] text-base max-w-2xl">
            {AUTHOR.bio}
          </p>
        </div>
      </div>

      {/* Recent Articles */}
      <div className="max-w-4xl mx-auto w-full px-6 py-12">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#555] mb-8">
          Latest from {AUTHOR.name}
        </p>
        {loading ? (
          <div className="flex items-center gap-3 text-[#555]">
            <div className="w-5 h-5 border-2 border-[#222] border-t-[#3B82F6] rounded-full animate-spin" />
            <span className="text-xs uppercase tracking-widest font-bold">Loading...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentArticles.map((article, idx) => (
              <ArticleCard key={article.article_id || idx} article={article} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
