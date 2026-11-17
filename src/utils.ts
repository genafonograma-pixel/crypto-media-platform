import type { Article } from './types';

export function generateSlug(title: string): string {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Trim hyphens from start and end
}

/**
 * Image sanitization:
 * - NEVER edit Guardian URLs: Fastly CDN uses signed HMAC hashes (&s=...).
 *   Modifying ANY query parameter invalidates the signature and causes 401 Unauthorized!
 * - BBC: replace /ace/branded_sport/ with /ace/standard/ to eliminate the logo banner overlay.
 */
export function cleanImageUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();

  // The Guardian: Do NOT edit URL (signed with s=)
  if (trimmed.includes('guim.co.uk') || trimmed.includes('theguardian.com')) {
    return trimmed;
  }

  // BBC: replace /ace/branded_sport/ with /ace/standard/
  if (trimmed.includes('ichef.bbci.co.uk')) {
    if (trimmed.includes('/ace/branded_sport/')) {
      return trimmed.replace('/ace/branded_sport/', '/ace/standard/');
    }
  }

  return trimmed;
}

/**
 * Excerpt normalization:
 * - Strip HTML, collapse whitespace, insert space where standfirst joins body (e.g. "TeenagerJJ").
 * - Truncate to max ~160 characters at the last sentence end or word boundary, then add "…".
 * - Never cut mid-word.
 */
export function formatExcerpt(rawText?: string | null, maxLength = 160): string {
  if (!rawText) return '';

  // 1. Strip HTML tags, ensuring spacing around removed tags
  let text = rawText.replace(/<\/?[^>]+(>|$)/g, ' ');

  // 2. Insert space between lowercase letter and capital letter where glued (e.g. "TeenagerJJ" -> "Teenager JJ")
  text = text.replace(/([a-z])([A-Z])/g, '$1 $2');

  // 3. Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();

  if (!text) return '';
  if (text.length <= maxLength) return text;

  // 4. Truncate at last sentence end or word boundary (never mid-word)
  const sub = text.slice(0, maxLength);
  const lastSentenceEnd = Math.max(sub.lastIndexOf('. '), sub.lastIndexOf('! '), sub.lastIndexOf('? '));
  if (lastSentenceEnd > 60) {
    return sub.slice(0, lastSentenceEnd + 1).trim();
  }

  const lastSpace = sub.lastIndexOf(' ');
  if (lastSpace > 0) {
    return sub.slice(0, lastSpace).trim() + '…';
  }

  return sub.trim() + '…';
}

export function formatArticleTime(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return '1 min ago';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  // 24h or older: e.g. "17 Nov"
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(date);
}

export function formatSource(sourceId?: string | null): string {
  if (!sourceId) return 'SPORT25';
  const s = sourceId.toLowerCase();
  if (s.includes('bbc')) return 'BBC Sport';
  if (s.includes('guardian')) return 'The Guardian';
  if (s.includes('sky')) return 'Sky Sports';
  if (s.includes('espn')) return 'ESPN';
  if (s.includes('athletic')) return 'The Athletic';
  if (s.includes('cbs')) return 'CBS Sports';
  if (s.includes('marca')) return 'Marca';
  if (s.includes('reuters')) return 'Reuters';
  if (s.includes('ap')) return 'Associated Press';
  return sourceId;
}

/**
 * Category detection with explicit Rugby and Horse racing support.
 * Never mislabel them as General Sports.
 */
export function getArticleClassification(article: Article): string {
  const raw = ((article as any).classification || article.category?.[0] || '').toLowerCase();
  const title = (article.headline || article.title || '').toLowerCase();

  if (raw.includes('rugby') || title.includes('six nations') || title.includes('rugby union') || title.includes('rugby league')) {
    return 'Rugby';
  }
  if (raw.includes('horse') || raw.includes('racing') || title.includes('plumpton') || title.includes('grand national') || title.includes('cheltenham')) {
    return 'Horse racing';
  }
  if (raw.includes('american') || raw.includes('nfl') || title.includes('touchdown') || title.includes('quarterback')) {
    return 'NFL';
  }
  if (raw.includes('foot') || raw.includes('soccer') || title.includes('premier league') || title.includes('champions league') || title.includes('la liga')) {
    return 'Football';
  }
  if (raw.includes('basket') || raw.includes('nba')) {
    return 'Basketball';
  }
  if (raw.includes('tennis') || title.includes('wimbledon') || title.includes('atp') || title.includes('wta')) {
    return 'Tennis';
  }
  if (raw.includes('formula') || raw.includes('f1') || title.includes('grand prix')) {
    return 'Formula 1';
  }

  // Capitalize raw if set, otherwise fallback
  if (raw && !raw.includes('general')) {
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }
  return 'Sport';
}

export function getCategoryFallbackImage(category?: string | null): string {
  const cat = (category || "").toLowerCase();
  if (cat.includes("foot") || cat.includes("soccer")) return "/images/sports/football.svg";
  if (cat.includes("basket") || cat.includes("nba")) return "/images/sports/basketball.svg";
  if (cat.includes("tennis")) return "/images/sports/tennis.svg";
  if (cat.includes("formula") || cat.includes("f1")) return "/images/sports/formula1.svg";
  if (cat.includes("american") || cat.includes("nfl")) return "/images/sports/american_football.svg";
  return "/images/sports/general_sports.svg";
}

/**
 * Duplicate-event clustering:
 * If 2+ articles have near-identical titles or the same main entity within 6 hours,
 * pick the best one (good image, preferred source BBC > Guardian > Sky > CBS)
 * and attach extraSourceCount for the meta line "+2 sources".
 */
export function clusterDuplicateArticles(articles: Article[]): (Article & { extraSourceCount?: number })[] {
  const getKeywords = (text: string) => {
    return new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3 && !['with', 'from', 'this', 'that', 'after', 'will', 'have', 'been', 'says'].includes(w))
    );
  };

  const calculateSimilarity = (t1: string, t2: string) => {
    const w1 = getKeywords(t1);
    const w2 = getKeywords(t2);
    if (w1.size === 0 || w2.size === 0) return 0;
    const intersection = new Set([...w1].filter(x => w2.has(x)));
    const union = new Set([...w1, ...w2]);
    return union.size === 0 ? 0 : intersection.size / union.size;
  };

  const sourceRank = (sourceId?: string) => {
    const s = (sourceId || '').toLowerCase();
    if (s.includes('bbc')) return 1;
    if (s.includes('guardian')) return 2;
    if (s.includes('sky')) return 3;
    if (s.includes('cbs')) return 4;
    return 5;
  };

  const clusters: { primary: Article; others: Article[] }[] = [];

  for (const article of articles) {
    const artTitle = article.headline || article.title;
    const artDate = new Date(article.pubDate || 0).getTime();

    let matched = false;
    for (const cluster of clusters) {
      const clusterTitle = cluster.primary.headline || cluster.primary.title;
      const clusterDate = new Date(cluster.primary.pubDate || 0).getTime();

      // Within 6 hours
      const diffHours = Math.abs(artDate - clusterDate) / (1000 * 60 * 60);
      if (diffHours <= 6 && calculateSimilarity(artTitle, clusterTitle) >= 0.35) {
        // Evaluate if this article should replace primary
        const primaryRank = sourceRank(cluster.primary.source_id);
        const currentRank = sourceRank(article.source_id);
        const primaryHasImg = Boolean(cluster.primary.image_url);
        const currentHasImg = Boolean(article.image_url);

        if ((!primaryHasImg && currentHasImg) || (currentHasImg && currentRank < primaryRank)) {
          cluster.others.push(cluster.primary);
          cluster.primary = article;
        } else {
          cluster.others.push(article);
        }
        matched = true;
        break;
      }
    }

    if (!matched) {
      clusters.push({ primary: article, others: [] });
    }
  }

  return clusters.map(c => {
    const uniqueSources = new Set<string>();
    c.others.forEach(o => {
      const s = formatSource(o.source_id);
      if (s !== formatSource(c.primary.source_id)) {
        uniqueSources.add(s);
      }
    });

    const extraSources = uniqueSources.size > 0 ? uniqueSources.size : (c.others.length > 0 ? c.others.length : (c.primary.related_sources?.length || 0));

    return {
      ...c.primary,
      extraSourceCount: extraSources > 0 ? extraSources : undefined
    };
  });
}

let cachedPrices: Record<string, any> | null = null;
let pricesInFlight: Promise<Record<string, any>> | null = null;
let lastPricesTime = 0;

export async function fetchSharedPrices(): Promise<Record<string, any>> {
  const now = Date.now();
  if (cachedPrices && now - lastPricesTime < 15000) {
    return cachedPrices;
  }
  if (!pricesInFlight) {
    pricesInFlight = fetch('/api/prices')
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => {
        cachedPrices = data;
        lastPricesTime = Date.now();
        pricesInFlight = null;
        return data;
      })
      .catch(() => {
        pricesInFlight = null;
        return cachedPrices || {};
      });
  }
  return pricesInFlight;
}
