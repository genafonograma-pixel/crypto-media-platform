import React from 'react';
import { Link } from 'react-router-dom';
import type { Article } from '../types';
import { generateSlug, formatArticleTime, formatSource, getArticleClassification, formatExcerpt } from '../utils';
import NewsImage from './NewsImage';

export interface ArticleCardProps {
  article: Article;
  key?: React.Key;
  compact?: boolean;
  showExcerpt?: boolean;
}

export default function ArticleCard({ article, showExcerpt = false }: ArticleCardProps) {
  const displayTitle = article.headline || article.title;
  const classification = getArticleClassification(article);
  const extraSources = (article as any).extraSourceCount || (article.related_sources?.length || 0);
  const excerpt = formatExcerpt(article.ai_meta_description || article.description || '');

  return (
    <Link
      to={`/article/${generateSlug(displayTitle)}`}
      state={{ article }}
      className="group flex flex-col h-full focus-visible:outline-brand focus-visible:outline-offset-2"
    >
      <NewsImage
        src={article.image_url}
        alt=""
      />
      <div className="flex flex-col flex-1 pt-3">
        <span className="text-label font-bold text-ink">
          {classification}
        </span>
        <h3 className="text-card font-bold font-display text-ink group-hover:text-brand transition-colors duration-150 text-balance line-clamp-3 mt-1.5 leading-snug">
          {displayTitle}
        </h3>
        {showExcerpt && excerpt && (
          <p className="text-excerpt text-muted font-normal leading-relaxed line-clamp-2 mt-2">
            {excerpt}
          </p>
        )}
        <p className="text-meta font-medium text-subtle mt-2">
          {formatSource(article.source_id)} · {formatArticleTime(article.pubDate)}
          {extraSources > 0 && ` · +${extraSources} source${extraSources > 1 ? 's' : ''}`}
        </p>
      </div>
    </Link>
  );
}
