import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import ArticlePage from './pages/ArticlePage';
import AuthorPage from './pages/AuthorPage';
import CategoryPage from './pages/CategoryPage';
import NotFoundPage from './pages/NotFoundPage';
import MethodologyPage from './pages/MethodologyPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import PopupAd from './components/PopupAd';
import AdminAds from './pages/AdminAds';
import AdminGuard from './components/AdminGuard';

import type { Article, NewsResponse } from './types';

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timer: any;
    let retries = 0;
    const maxRetries = 10;

    async function fetchNews() {
      try {
        const response = await fetch('/api/news');
        if (!response.ok) {
          throw new Error('Failed to fetch news data');
        }
        const data: NewsResponse = await response.json();
        
        if (data.status === 'success' && Array.isArray(data.results)) {
          // Filter out articles with duplicate IDs or titles
          const uniqueArticles = Array.from(
            new Map(data.results.map(item => [item.article_id || item.title, item])).values()
          );
          setArticles(uniqueArticles);
          setError(null);

          // If pipeline is still processing initial articles, poll again until articles arrive
          if (uniqueArticles.length === 0 && retries < maxRetries) {
            retries++;
            timer = setTimeout(fetchNews, 4000);
          }
        } else {
          throw new Error('Invalid data format received');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchNews();

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <PopupAd />
      <Routes>
        <Route path="/" element={<Home articles={articles} loading={loading} error={error} />} />
        <Route path="/methodology" element={<MethodologyPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/news" element={<CategoryPage articles={articles} loading={loading} error={error} />} />
        <Route path="/news/:categoryId" element={<CategoryPage articles={articles} loading={loading} error={error} />} />
        <Route path="/bitcoin-news" element={<CategoryPage articles={articles} loading={loading} error={error} defaultCategory="Bitcoin" />} />
        <Route path="/article/:slug" element={<ArticlePage articles={articles} loading={loading} />} />
        <Route path="/author/jordan-cole" element={<AuthorPage articles={articles} loading={loading} />} />
        <Route path="/admin" element={<AdminGuard><AdminAds /></AdminGuard>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
