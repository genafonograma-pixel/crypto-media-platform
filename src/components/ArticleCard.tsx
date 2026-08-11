import React from 'react';
import { Link } from 'react-router-dom';
import type { Article } from '../types';
import { generateSlug } from '../utils';

interface Props {
  article: Article;
  compact?: boolean;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(date);
}

export default function ArticleCard({ article, compact = false }: Props) {
  const displayTitle = article.headline || article.title;
  return (
    <Link to={`/article/${article.article_id}/${generateSlug(displayTitle)}`} state={{ article }} className="block group cursor-pointer flex flex-col h-full">
      {!compact && (
        <div className="relative overflow-hidden aspect-[2/1] bg-[#111] border border-[#222] mb-4">
          {article.image_url ? (
            <img 
              src={article.image_url} 
              alt={displayTitle}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#111] to-[#6366F1]/20"></div>
          )}
        </div>
      )}
      
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold text-[#888] uppercase tracking-widest">
            {(article as any).classification || article.category?.[0] || 'News'}
          </span>
          <span className="w-1 h-1 bg-[#444] rounded-full" />
          <time className="text-[10px] font-mono text-[#555]">
            {formatDate(article.pubDate)}
          </time>
        </div>
        
        <h2 className={`font-bold leading-tight group-hover:text-[#3B82F6] transition-colors text-[#F5F5F5] ${compact ? 'text-sm mb-2' : 'text-xl mb-3 uppercase tracking-tight'} line-clamp-3`}>
          {displayTitle}
        </h2>
        
        {!compact && article.description && (
          <p className="text-sm text-[#888] leading-relaxed mb-4 line-clamp-2 flex-1">
            {article.description}
          </p>
        )}
        
        <div className={`mt-auto text-[10px] font-bold text-[#555] uppercase tracking-widest ${compact ? 'hidden' : 'block'}`}>
          Jordan Cole
        </div>
      </div>
    </Link>
  );
}
