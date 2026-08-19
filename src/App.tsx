import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ArticlePage from './pages/ArticlePage';
import AuthorPage from './pages/AuthorPage';
import CategoryPage from './pages/CategoryPage';
import NotFoundPage from './pages/NotFoundPage';
import type { Article, NewsResponse } from './types';

export default function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      try {
        const response = await fetch('/api/news');
        if (!response.ok) {
          throw new Error('Failed to fetch news data');
        }
        const data: NewsResponse = await response.json();
        
        if (data.status === 'success' && data.results) {
          // Filter out articles with duplicate titles or IDs
          const uniqueArticles = Array.from(
            new Map(data.results.map(item => [item.title, item])).values()
          );
          setArticles(uniqueArticles);
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
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home articles={articles} loading={loading} error={error} />} />
      <Route path="/news" element={<CategoryPage articles={articles} loading={loading} error={error} />} />
      <Route path="/news/:categoryId" element={<CategoryPage articles={articles} loading={loading} error={error} />} />
      <Route path="/article/:slug" element={<ArticlePage articles={articles} loading={loading} />} />
      <Route path="/author/jordan-cole" element={<AuthorPage articles={articles} loading={loading} />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
