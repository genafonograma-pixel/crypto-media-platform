export interface AISummaryItem {
  label: string;
  text: string;
}

export interface Calculation {
  type: string;
  formula: string;
  inputs: number[];
  result: string | number;
  source_ids: string[];
}

export interface Claim {
  fact: string;
  source_ids: string[];
  confidence: 'high' | 'medium' | 'low';
}

export interface ResearchObject {
  classification: string;
  primary_sources: string[];
  secondary_sources: string[];
  facts: Claim[];
  conflicting_claims: string[];
  historical_context: string[];
  calculations: Calculation[];
  entities: string[];
}

export interface Article {
  article_id: string;      // Will now represent an event ID
  title: string;           // Original headline or AI generated headline
  headline?: string;       // AI generated headline
  seo_title?: string;
  slug?: string;
  link: string;            // Primary source link
  keywords: string[] | null;
  creator: string[] | null;
  video_url: string | null;
  description: string | null;
  content: string | null;
  ai_summary?: AISummaryItem[] | string | null;
  rewritten_content?: string | null;
  ai_meta_description?: string | null;
  classification?: string | null;
  quality_score?: number | null;
  research_data?: ResearchObject | null;
  pubDate: string;
  image_url: string | null;
  source_id: string;       // Primary source
  source_priority: number;
  country: string[];
  category: string[];
  language: string;
  related_sources?: { source_id: string; link: string; title: string }[];
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  results: Article[];
}
