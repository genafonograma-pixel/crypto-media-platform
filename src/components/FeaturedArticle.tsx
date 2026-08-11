import React from 'react';
import { Link } from 'react-router-dom';
import type { Article } from '../types';

interface Props {
  article: Article;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

export default function FeaturedArticle({ article }: Props) {
  return (
    <Link to={`/article/${article.article_id}`} state={{ article }} className="block group cursor-pointer flex flex-col justify-between border-b border-[#222] pb-12 mb-12">
        <div className="flex flex-col md:flex-row gap-10">
          <div className="flex-1 order-2 md:order-1 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-[#3B82F6] text-white text-[10px] font-black px-2 py-0.5 uppercase">
                {article.category?.[0] || 'Breaking'}
              </span>
              <span className="text-[10px] text-[#666] font-mono uppercase">
                {formatDate(article.pubDate)}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[0.95] tracking-tighter mb-8 uppercase group-hover:text-[#3B82F6] transition-colors line-clamp-4 text-[#F5F5F5]">
              {article.title}
            </h1>
            
            {article.description && (
              <p className="text-xl text-[#AAA] leading-relaxed max-w-xl font-light mb-10 line-clamp-3">
                {article.description}
              </p>
            )}
            
            <div className="flex gap-12">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#555] uppercase tracking-widest mb-1">Source</span>
                <span className="text-sm font-medium text-[#F5F5F5]">{article.source_id}</span>
              </div>
              <div className="flex flex-col hidden sm:flex">
                <span className="text-[10px] font-bold text-[#555] uppercase tracking-widest mb-1">Author</span>
                <span className="text-sm font-medium text-[#F5F5F5]">{article.creator?.[0] || 'News Desk'}</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-[40%] lg:w-[45%] order-1 md:order-2 relative overflow-hidden aspect-video bg-[#111] border border-[#222]">
            {article.image_url ? (
              <img 
                src={article.image_url} 
                alt={article.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#111] to-[#3B82F6]/20"></div>
            )}
          </div>
        </div>
    </Link>
  );
}
