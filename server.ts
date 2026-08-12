import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import Parser from "rss-parser";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import sanitizeHtml from "sanitize-html";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import ws from "ws";

dotenv.config();

// ─── Supabase Client ────────────────────────────────────────────────────────
const supabase =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
        auth: { persistSession: false },
        global: { fetch },
        realtime: { transport: ws as any },
      })
    : null;

if (supabase) {
  console.log("✅ Supabase connected — using database persistence.");
} else {
  console.log("⚠️  Supabase not configured — using local file cache (dev mode).");
}

// ─── Gemini AI Client ────────────────────────────────────────────────────────
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

type AIResult = {
  summary: { label: string; text: string }[] | null;
  rewritten_content: string | null;
  ai_meta_description: string | null;
  classification: string | null;
  quality_score: number | null;
  headline?: string | null;
  seo_title?: string | null;
  research_data?: any;
};

// ─── AI Helpers ──────────────────────────────────────────────────────────────
async function runAIPrompt(prompt: string) {
  if (!genAI) return null;
  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
    let rawText = response.text?.trim() || "{}";
    if (rawText.startsWith("```json"))
      rawText = rawText.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    else if (rawText.startsWith("```"))
      rawText = rawText.replace(/^```\n?/, "").replace(/\n?```$/, "");
    return JSON.parse(rawText);
  } catch (err) {
    console.error(`AI prompt failed: ${(err as Error).message}`);
    return null;
  }
}

async function processArticleWithAI(
  title: string,
  content: string,
  sourceName: string,
  category?: string
): Promise<AIResult> {
  if (!genAI)
    return {
      summary: null,
      rewritten_content: null,
      ai_meta_description: null,
      classification: null,
      quality_score: null,
      headline: null,
      seo_title: null,
    };
  const textContent = content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 8000);

  // STEP 1: RESEARCH & FACT EXTRACTION
  const researchPrompt = `You are a senior crypto intelligence researcher. Your task is to analyze the source material and build a strict factual Research Object.
SOURCE OUTLET: ${sourceName}
RAW SOURCE CONTENT:
${textContent}

INSTRUCTIONS:
1. Classify the event into one category (e.g. Breaking News, Regulation, Security/Hack, Company/Earnings, Market Movement).
2. Extract all verifiable facts, numbers, dates, people, and organizations.
3. If you can calculate a useful metric (e.g., percentage change), do so and log it in calculations. Do NOT invent numbers.
4. Return ONLY a JSON object:
{
  "classification": "string",
  "facts": [{"fact": "string", "source_ids": ["${sourceName}"], "confidence": "high|medium|low"}],
  "calculations": [{"type": "string", "formula": "string", "inputs": [1,2], "result": "string", "source_ids": ["${sourceName}"]}]
}`;
  const researchData = await runAIPrompt(researchPrompt);
  if (!researchData)
    return {
      summary: null,
      rewritten_content: null,
      ai_meta_description: null,
      classification: null,
      quality_score: null,
      headline: null,
      seo_title: null,
    };

  let minWords = 600;
  let targetWords = "700-1,200";
  const c = (researchData.classification || "").toLowerCase();
  if (c.includes("breaking") || c.includes("brief")) {
    minWords = 350;
    targetWords = "400-700";
  } else if (
    c.includes("company") ||
    c.includes("earnings") ||
    c.includes("financial") ||
    c.includes("regulation") ||
    c.includes("legal") ||
    c.includes("hack") ||
    c.includes("security")
  ) {
    minWords = 700;
    targetWords = "800-1,500";
  } else if (c.includes("deep") || c.includes("research")) {
    minWords = 1000;
    targetWords = "1,000-2,000+";
  }

  // STEP 1.5: CONTEXT ENRICHMENT
  const enrichmentPrompt = `You are a Crypto Historian/Analyst. Analyze the following Research Object regarding a recent news event.
RESEARCH DATA:
${JSON.stringify(researchData)}

INSTRUCTIONS:
1. Identify the key entities (people, companies, protocols, tokens) and concepts mentioned.
2. Provide dense, accurate historical context, background information, market history, and broader implications of these entities/events using your training data.
3. This information will be used to enrich a short news brief into a comprehensive article. Ensure facts are highly accurate and directly relevant.
4. Return ONLY a JSON object:
{
  "historical_context": "Deep background on the protocols, people, or companies involved.",
  "market_implications": "Broader market context and what this type of event usually means.",
  "technical_details": "Definitions of any complex crypto concepts mentioned."
}`;
  const enrichmentData = await runAIPrompt(enrichmentPrompt);
  const contextBlock = enrichmentData ? `ENRICHED BACKGROUND CONTEXT:\n${JSON.stringify(enrichmentData)}\n` : "";

  // STEP 2: ARTICLE GENERATION
  const generatePrompt = `You are a senior editor at a crypto intelligence platform. Write a news article based STRICTLY on this Research Object and the provided Enriched Background Context.
RESEARCH DATA:
${JSON.stringify(researchData)}

${contextBlock}
ABSOLUTE EDITORIAL RULES:
1. FACT VS ANALYSIS: Distinguish fact from analysis. Do not present subjective editorial judgment as fact. Use precise language (e.g., "suggests" rather than "proves").
2. NO BROAD GENERALIZATIONS: Do not invent industry-wide narratives. Do not claim an event "marks a broader shift" or "changes the industry" without explicit multi-source evidence.
3. NO FORCED SIGNIFICANCE: Do not manufacture significance. Avoid forced "Why it matters". Never claim something "improves financial flexibility" without hard numbers to back it up.
4. NO SEMANTIC REPETITION: Every paragraph and section must add NEW information. Do not repeat the same idea multiple ways. Do not blindly follow the source article's narrative flow; independently structure the facts.
5. NO GENERIC ENDINGS: The final paragraph must state a concrete implication, summarize what changed, identify a next event, or explain an unresolved issue. Never end with "The future remains uncertain" or "Investors will watch closely".
6. BAN LIST (CRITICAL): Never use the following phrases or concepts: "According to our research", "The AI found", "undefined", "[SOURCE]", "Quality score", "Visit the official site for details", "Written by". Do NOT expose any internal template variables, source attribution, or external URLs in the text.
7. LENGTH REQUIREMENT: Target ${targetWords} words. Minimum ${minWords} words. Do NOT pad with generic filler. If you cannot reach the minimum length using ONLY verified facts, write as much verified fact-based content as you can; the validator will downgrade the category if needed.

Return ONLY a JSON object:
{
  "headline": "Strong, accurate headline",
  "seo_title": "SEO optimized title",
  "meta_description": "150-160 char summary",
  "summary": [
    {"label": "What happened", "text": "1-2 sentences."},
    {"label": "Why it matters", "text": "1-2 sentences."},
    {"label": "What to watch", "text": "1 sentence specific event."}
  ],
  "rewritten_content": "<p><strong>[Lead core fact]</strong></p><h2>[Dynamic Heading 1]</h2><p>[Text]</p>"
}`;
  const articleData = await runAIPrompt(generatePrompt);
  if (!articleData)
    return {
      summary: null,
      rewritten_content: null,
      ai_meta_description: null,
      classification: researchData.classification,
      quality_score: null,
      headline: null,
      seo_title: null,
    };

  const wordCount = (articleData.rewritten_content || "")
    .replace(/<[^>]*>?/gm, "")
    .split(/\s+/)
    .filter((w: string) => w.length > 0).length;

  // STEP 3: CLAIM VALIDATION & SCORING
  const validationPrompt = `You are a strict factual and editorial auditor. Compare the generated article against the allowed research data AND the enriched background context.
RESEARCH DATA:
${JSON.stringify(researchData)}
${contextBlock}
GENERATED ARTICLE:
${articleData.rewritten_content}

INSTRUCTIONS:
1. 5-PILLAR VALIDATION. Fail the article (set status to "needs_research" and quality_score below 70) if ANY of the following are violated:
  - FACTUAL: Contains hallucinations, invented numbers, or fake quotes NOT present in the research data or enriched context.
  - RESEARCH: Contains broad industry generalizations without evidence in the research or context data.
  - EDITORIAL: Uses generic filler, forced significance ("marks a turning point"), semantic repetition, or generic conclusions ("Investors will watch closely").
  - TECHNICAL: Contains "undefined", "null", "AI-generated", "According to research", "Visit the official site", or fake author credits.
2. LENGTH CHECK: The generated article body has ${wordCount} words. The required minimum for ${researchData.classification} is ${minWords} words.
  - If it meets the minimum without hallucinated padding, set "status" to "ready" and keep the original classification.
  - If it is under ${minWords} words but contains dense verified facts (no filler) and is at least 350 words, set "status" to "ready", but change "final_classification" to "Breaking News".
  - If it is under 350 words, or if it is heavily padded with generic filler just to hit the word count, set "status" to "needs_research" and quality_score below 70.
3. Score the article (0-100) strictly based on passing these checks.
4. Return ONLY a JSON object:
{
  "unsupported_claims": ["list of hallucinated claims, template leaks, or editorial failures found, or empty array"],
  "final_classification": "string",
  "quality_score": 85,
  "status": "ready" | "needs_research"
}`;
  const validationData = await runAIPrompt(validationPrompt);
  if (!validationData)
    return {
      summary: null,
      rewritten_content: null,
      ai_meta_description: null,
      classification: researchData.classification,
      quality_score: null,
      headline: null,
      seo_title: null,
    };

  const finalScore = validationData.quality_score;
  const finalClassification =
    validationData.final_classification || researchData.classification;

  if (finalScore < 70 || validationData.status === "needs_research") {
    console.log(
      `Article rejected. Score: ${finalScore}. Unsupported: ${JSON.stringify(validationData.unsupported_claims)}`
    );
    return {
      summary: null,
      rewritten_content: null,
      ai_meta_description: null,
      classification: finalClassification,
      quality_score: finalScore,
      headline: null,
      seo_title: null,
    };
  }

  return {
    summary: articleData.summary || null,
    rewritten_content: articleData.rewritten_content || null,
    ai_meta_description: articleData.meta_description || null,
    classification: finalClassification || null,
    quality_score: finalScore,
    headline: articleData.headline || null,
    seo_title: articleData.seo_title || null,
    research_data: researchData,
  };
}

// ─── Thumbnail Generation ────────────────────────────────────────────────────

/** Maps article classification to a cinematic visual theme for consistent style. */
function buildThumbnailPrompt(article: { headline?: string | null; title?: string; classification?: string | null }): string {
  const classificationThemes: Record<string, string> = {
    "Breaking News": "urgent breaking news atmosphere, bold dramatic lighting, red and orange energy pulses, dynamic shockwave composition",
    "Regulation": "imposing government building facade, marble columns, legal documents, scales of justice motif, cool authoritative blue tones",
    "Security/Hack": "cyberpunk digital breach visualization, cascading red binary code, cracked shield hologram, electric warning glow",
    "Market Movement": "cinematic financial data visualization, glowing green and red candlestick charts, ascending price graph, Bloomberg terminal aesthetic",
    "Market/Price": "cinematic financial data visualization, glowing candlestick charts, ascending price graph, dynamic trading floor energy",
    "Company/Earnings": "sleek corporate skyscraper glass facade at dusk, boardroom silhouette, financial growth chart overlay, navy and gold palette",
    "DeFi": "decentralized network node web, glowing liquidity pool vortex, interconnected blockchain nodes, electric teal and purple palette",
    "NFT": "vibrant digital art gallery, holographic NFT frames floating in dark space, prismatic light refractions, vivid chromatic colors",
    "Mining": "industrial GPU mining farm, rows of server rigs with cooling fans, blue LED light strips, mechanical precision aesthetic",
    "Blockchain": "interconnected glowing blockchain lattice, crystalline chain links, deep space dark background, electric blue and silver",
  };

  const c = article.classification || "";
  const theme = Object.entries(classificationThemes).find(([key]) =>
    c.toLowerCase().includes(key.toLowerCase())
  )?.[1] ?? "abstract cryptocurrency visualization, glowing blockchain nodes, digital financial network";

  const subject = (article.headline || article.title || "crypto news").slice(0, 120);

  return (
    `Professional crypto news editorial thumbnail. Subject: ${subject}. ` +
    `Visual theme: ${theme}. ` +
    `Style: dark moody background, deep blue-black gradient, gold and electric-cyan accent highlights, ` +
    `cinematic depth of field, 8K hyperrealistic render, dramatic volumetric lighting. ` +
    `No text, no watermarks, no logos, no people's faces.`
  );
}

/** Deterministic numeric hash for a string — used as Pollinations seed. */
function hashStringToInt(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit int
  }
  return Math.abs(hash);
}

/** Fetch a 1200×630 image from Pollinations.ai — free, no API key required. */
async function generateThumbnailPollinations(prompt: string, seed: number): Promise<Buffer | null> {
  try {
    const encodedPrompt = encodeURIComponent(prompt);
    const params = new URLSearchParams({
      width: "1200",
      height: "630",
      nologo: "true",
      seed: String(seed),
      model: "flux"
    });
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?${params}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(45000) });
    if (!response.ok) {
      console.error(`Pollinations returned ${response.status}`);
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    console.error(`Pollinations thumbnail generation failed: ${(err as Error).message}`);
    return null;
  }
}

/** Fetch a 1200×630 image from Gemini image generation — higher quality fallback. */
async function generateThumbnailGemini(prompt: string): Promise<Buffer | null> {
  if (!process.env.GEMINI_API_KEY) return null;
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
      }),
      signal: AbortSignal.timeout(45000),
    });
    if (!response.ok) {
      console.error(`Gemini image API returned ${response.status}: ${await response.text()}`);
      return null;
    }
    const data = await response.json() as any;
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part?.inlineData?.data) {
        return Buffer.from(part.inlineData.data, "base64");
      }
    }
    console.error("Gemini image response had no inlineData.");
    return null;
  } catch (err) {
    console.error(`Gemini thumbnail generation failed: ${(err as Error).message}`);
    return null;
  }
}

/**
 * Upload a thumbnail Buffer to ImgBB.
 * Returns the public CDN URL, or null on failure.
 * Requires IMGBB_API_KEY in .env.
 */
async function uploadThumbnailToImgBB(buffer: Buffer, articleId: string): Promise<string | null> {
  const apiKey = process.env.IMGBB_API_KEY;
  if (!apiKey) {
    console.error("Missing IMGBB_API_KEY in environment variables. Cannot upload thumbnail.");
    return null;
  }

  const safeId = articleId.replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `${safeId}.jpg`;

  try {
    const formData = new FormData();
    formData.append("key", apiKey);
    formData.append("image", buffer.toString("base64"));
    formData.append("name", filename);

    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      console.error(`ImgBB upload failed: ${response.status} ${await response.text()}`);
      return null;
    }

    const data = await response.json() as any;
    if (data && data.data && data.data.url) {
      return data.data.url;
    }
    
    console.error("ImgBB upload failed: Missing URL in response", data);
    return null;
  } catch (err) {
    console.error(`Failed to upload thumbnail to ImgBB: ${(err as Error).message}`);
    return null;
  }
}

/**
 * Full thumbnail generation orchestrator.
 * Tries Pollinations first (free), falls back to Gemini, uploads to ImgBB.
 * Skips entirely if GENERATE_THUMBNAILS env var is not "true".
 */
async function generateAndStoreThumbnail(
  article: { article_id: string; headline?: string | null; title?: string; classification?: string | null }
): Promise<string | null> {
  if (process.env.GENERATE_THUMBNAILS !== "true") return null;

  const prompt = buildThumbnailPrompt(article);
  const seed = hashStringToInt(article.article_id);

  console.log(`🎨 Generating thumbnail for: "${(article.headline || article.title || "").slice(0, 50)}..."`);

  // Primary: Pollinations (free, no key required)
  let imageBuffer = await generateThumbnailPollinations(prompt, seed);

  // Fallback: Gemini image generation
  if (!imageBuffer) {
    console.log("Pollinations failed — falling back to Gemini image generation.");
    imageBuffer = await generateThumbnailGemini(prompt);
  }

  if (!imageBuffer) {
    console.error("All thumbnail generation methods failed.");
    return null;
  }

  const publicUrl = await uploadThumbnailToImgBB(imageBuffer, article.article_id);
  if (publicUrl) {
    console.log(`✅ Thumbnail uploaded to ImgBB: ${publicUrl}`);
  }
  return publicUrl;
}

// ─── Database Helpers (Supabase) ─────────────────────────────────────────────
async function getProcessedIds(): Promise<Set<string>> {
  if (!supabase) {
    // Fall back to local file cache
    try {
      const data = await fs.readFile(
        path.join(process.cwd(), "news_cache.json"),
        "utf-8"
      );
      return new Set(Object.keys(JSON.parse(data)));
    } catch {
      return new Set();
    }
  }
  const { data, error } = await supabase.from("articles").select("id");
  if (error) {
    console.error("Supabase getProcessedIds error:", error.message);
    return new Set();
  }
  return new Set((data || []).map((r: any) => r.id));
}

async function getPublishedArticles(): Promise<any[]> {
  if (!supabase) {
    // Fall back to local file cache
    try {
      const raw = await fs.readFile(
        path.join(process.cwd(), "news_cache.json"),
        "utf-8"
      );
      const cache = JSON.parse(raw);
      return Object.values(cache).filter(
        (a: any) => a.quality_score && a.quality_score >= 70
      );
    } catch {
      return [];
    }
  }
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .gte("quality_score", 70)
    .order("pub_date", { ascending: false })
    .limit(100);
  if (error) {
    console.error("Supabase getPublishedArticles error:", error.message);
    return [];
  }
  // Normalize field names to match what the frontend expects
  return (data || []).map((row: any) => ({
    article_id: row.id,
    title: row.title,
    link: row.link,
    description: row.description,
    pubDate: row.pub_date,
    image_url: row.image_url,
    source_id: row.source_id,
    headline: row.headline,
    seo_title: row.seo_title,
    ai_meta_description: row.ai_meta_description,
    rewritten_content: row.rewritten_content,
    ai_summary: row.ai_summary,
    classification: row.classification,
    quality_score: row.quality_score,
    related_sources: row.related_sources,
    research_data: row.research_data,
    category: row.category || ["News"],
  }));
}

async function saveArticleToDB(article: any): Promise<void> {
  const record = {
    id: article.article_id,
    title: article.title,
    link: article.link,
    description: article.description,
    pub_date: article.pubDate,
    image_url: article.image_url,
    source_id: article.source_id,
    category: article.category,
    headline: article.headline,
    seo_title: article.seo_title,
    ai_meta_description: article.ai_meta_description,
    rewritten_content: article.rewritten_content,
    ai_summary: article.ai_summary,
    classification: article.classification,
    quality_score: article.quality_score,
    related_sources: article.related_sources || null,
    research_data: article.research_data || null,
  };

  if (!supabase) {
    // Fall back to local file cache
    const cacheFile = path.join(process.cwd(), "news_cache.json");
    try {
      let cache: any = {};
      try {
        const data = await fs.readFile(cacheFile, "utf-8");
        cache = JSON.parse(data);
      } catch {}
      cache[article.article_id] = record;
      await fs.writeFile(cacheFile, JSON.stringify(cache, null, 2), "utf-8");
    } catch (err) {
      console.error("Failed to save to local cache:", err);
    }
    return;
  }

  const { error } = await supabase.from("articles").upsert(record);
  if (error) {
    console.error("Supabase saveArticleToDB error:", error.message);
  }
}

async function getQuotaInfo(): Promise<{ date: string; count: number }> {
  const today = new Date().toISOString().split("T")[0];
  if (!supabase) {
    const quotaFile = path.join(process.cwd(), "ai_quota.json");
    try {
      const data = await fs.readFile(quotaFile, "utf-8");
      const parsed = JSON.parse(data);
      if (parsed.date !== today) return { date: today, count: 0 };
      return parsed;
    } catch {
      return { date: today, count: 0 };
    }
  }
  const { data, error } = await supabase
    .from("quota")
    .select("*")
    .eq("date", today)
    .single();
  if (error || !data) return { date: today, count: 0 };
  return { date: data.date, count: data.count };
}

async function saveQuotaInfo(date: string, count: number): Promise<void> {
  if (!supabase) {
    const quotaFile = path.join(process.cwd(), "ai_quota.json");
    try {
      await fs.writeFile(
        quotaFile,
        JSON.stringify({ date, count }),
        "utf-8"
      );
    } catch (err) {
      console.error("Failed to save quota:", err);
    }
    return;
  }
  const { error } = await supabase.from("quota").upsert({ date, count });
  if (error) console.error("Supabase saveQuotaInfo error:", error.message);
}

// ─── Constants ───────────────────────────────────────────────────────────────
const DAILY_LIMIT = 200;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["content:encoded", "contentEncoded"],
    ],
  },
});

const RSS_SOURCES = [
  { id: "cryptopotato", name: "CryptoPotato", url: "https://cryptopotato.com/feed/" },
  { id: "decrypt", name: "Decrypt", url: "https://decrypt.co/feed" },
  { id: "cointelegraph", name: "CoinTelegraph", url: "https://cointelegraph.com/rss" },
  { id: "coindesk", name: "CoinDesk", url: "https://www.coindesk.com/arc/outboundfeeds/rss?outputType=xml" },
  { id: "bitcoinist", name: "Bitcoinist", url: "https://bitcoinist.com/feed/" },
  { id: "beincrypto", name: "BeInCrypto", url: "https://beincrypto.com/feed/" },
  { id: "cryptoslate", name: "CryptoSlate", url: "https://cryptoslate.com/feed/" },
  { id: "newsbtc", name: "NewsBTC", url: "https://www.newsbtc.com/feed/" },
  { id: "ambcrypto", name: "AMBCrypto", url: "https://ambcrypto.com/feed/" },
  { id: "utoday", name: "U.Today", url: "https://u.today/rss.php" },
  { id: "dailyhodl", name: "The Daily Hodl", url: "https://dailyhodl.com/feed/" },
  { id: "thedefiant", name: "The Defiant", url: "https://thedefiant.io/api/feed" },
  { id: "blockworks", name: "Blockworks", url: "https://blockworks.com/feed" },
  { id: "cryptonews", name: "CryptoNews", url: "https://cryptonews.com/feed/" },
  { id: "theblock", name: "The Block", url: "https://www.theblock.co/rss.xml" },
  { id: "cryptobriefing", name: "CryptoBriefing", url: "https://cryptobriefing.com/feed/" },
  { id: "cryptoglobe", name: "CryptoGlobe", url: "https://www.cryptoglobe.com/latest/feed/" },
  { id: "bitcoinmagazine", name: "Bitcoin Magazine", url: "https://bitcoinmagazine.com/.rss/full/" },
];

// ─── RSS Fetching (no AI — pure data collection) ─────────────────────────────
async function fetchRSSArticles(): Promise<any[]> {
  const allArticles: any[] = [];

  for (const source of RSS_SOURCES) {
    try {
      const feed = await parser.parseURL(source.url);
      
      for (const item of feed.items) {
        // Yield to the event loop between articles so Express can handle requests
        await new Promise(r => setImmediate(r));

        let imageUrl: string | null = null;
        if (item.mediaContent && (item.mediaContent as any)["$"] && (item.mediaContent as any)["$"].url) {
          imageUrl = (item.mediaContent as any)["$"].url;
        } else if (item.enclosure && item.enclosure.url) {
          imageUrl = item.enclosure.url;
        } else if ((item as any).contentEncoded) {
          const imgMatch = (item as any).contentEncoded.match(/<img[^>]+src="([^">]+)"/);
          if (imgMatch) imageUrl = imgMatch[1];
        } else if (item.content) {
          const imgMatch = item.content.match(/<img[^>]+src="([^">]+)"/);
          if (imgMatch) imageUrl = imgMatch[1];
        }

        let rawDescription = String(
          item.contentSnippet ||
            (item as any).snippet ||
            (item as any).description ||
            ""
        );
        let cleanDescription = rawDescription.replace(/<[^>]*>?/gm, "");
        cleanDescription = cleanDescription
          .replace(/The post.*?appeared first on.*?CryptoPotato\.?/gi, "")
          .trim();

        let rawContent = String((item as any).contentEncoded || item.content || "");
        rawContent = rawContent
          .replace(/<p>The post[\s\S]*?appeared first on[\s\S]*?<\/p>/gi, "")
          .trim();

        if (rawContent.length < 1500 && item.link) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000);
            const response = await fetch(item.link, {
              signal: controller.signal,
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
                Accept:
                  "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Cache-Control": "no-cache",
              },
            });
            clearTimeout(timeoutId);
            if (response.ok) {
              const html = await response.text();
              
              // Yield before heavy HTML parsing
              await new Promise(r => setTimeout(r, 10));
              
              const doc = new JSDOM(html, { url: item.link });
              const reader = new Readability(doc.window.document);
              const parsed = reader.parse();
              if (parsed && parsed.content && parsed.content.length > rawContent.length + 200) {
                rawContent = parsed.content;
              }
            }
          } catch (err) {
            console.error(`Failed to fetch full article for ${item.link}: ${(err as Error).message}`);
          }
        }

        if (rawContent) {
          rawContent = rawContent.replace(/<p><i>Morning Minute is a daily newsletter.*?<\/i><\/p>/gi, "");
          rawContent = rawContent.replace(/<h2>.*?AI Summary.*?<\/h2>[\s\S]*?(?=<h2>)/gi, "");
          rawContent = rawContent.replace(/<div[^>]*>.*?AI Summary.*?<\/div>/gi, "");
          rawContent = rawContent.replace(/You Might Also Like/gi, "");
          rawContent = rawContent.replace(/HOT Stories/gi, "");

          rawContent = sanitizeHtml(rawContent, {
            allowedTags: ["p", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "strong", "b", "em", "i", "blockquote", "br", "img", "figure", "figcaption", "table", "thead", "tbody", "tr", "th", "td"],
            allowedAttributes: { img: ["src", "alt", "width", "height", "loading"] },
            exclusiveFilter: (frame) => frame.tag === "p" && !frame.text.trim(),
          });
        }

        const cryptoKeywords = ["crypto", "cryptocurrency", "bitcoin", "btc", "ethereum", "eth", "blockchain", "web3", "nft", "defi", "altcoin", "binance", "coinbase", "solana", "xrp", "ripple", "cardano", "dogecoin", "doge", "satoshi", "tether", "usdt", "usdc", "polkadot", "avalanche", "avax", "chainlink", "polygon", "matic", "shiba", "shib", "litecoin", "ltc", "uniswap", "aave"];
        const excludeKeywords = ["federal reserve", "interest rates", "nasdaq", "s&p 500", "inflation", "cpi data"];
        const textToCheck = (item.title + " " + cleanDescription).toLowerCase();
        const isExcluded = excludeKeywords.some((kw) => textToCheck.includes(kw));
        const isCryptoRelated = cryptoKeywords.some((kw) =>
          new RegExp(`\\b${kw}\\b`, "i").test(textToCheck)
        );

        if (!isCryptoRelated || isExcluded) continue;

        allArticles.push({
          article_id: Buffer.from(
            String(item.guid || item.link || `${source.id}-${item.title || ""}`)
          ).toString("base64"),
          title: item.title,
          link: item.link,
          description: cleanDescription,
          content: rawContent,
          pubDate: item.isoDate || item.pubDate,
          image_url: imageUrl,
          source_id: source.name,
          creator: item.creator ? [item.creator] : [],
          category:
            item.categories && item.categories.length > 0
              ? item.categories.map((c: any) =>
                  typeof c === "string" ? c : c._ || c.name || "News"
                )
              : ["News"],
        });
      }
    } catch (e) {
      console.error(`Failed to fetch from ${source.name}: ${(e as Error).message}`);
    }
  }

  allArticles.sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  // Event clustering
  const getWords = (text: string) =>
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter((w) => w.length > 3)
    );
  const calculateSimilarity = (t1: string, t2: string) => {
    const w1 = getWords(t1);
    const w2 = getWords(t2);
    const intersection = new Set([...w1].filter((x) => w2.has(x)));
    const union = new Set([...w1, ...w2]);
    return union.size === 0 ? 0 : intersection.size / union.size;
  };

  const groupedEvents: any[] = [];
  for (const article of allArticles) {
    let foundGroup = false;
    for (const group of groupedEvents) {
      const timeDiff = Math.abs(
        new Date(article.pubDate).getTime() - new Date(group.primary.pubDate).getTime()
      );
      if (timeDiff > 48 * 60 * 60 * 1000) continue;
      if (calculateSimilarity(article.title, group.primary.title) > 0.3) {
        group.related.push(article);
        foundGroup = true;
        break;
      }
    }
    if (!foundGroup) groupedEvents.push({ primary: article, related: [] });
  }

  return groupedEvents.map((group) => {
    const primary = group.primary;
    primary.related_sources = group.related.map((r: any) => ({
      source_id: r.source_id,
      link: r.link,
      title: r.title,
    }));
    primary._combined_content = [
      `SOURCE: ${primary.source_id} | TITLE: ${primary.title}\n${primary.content || primary.description}`,
      ...group.related.map(
        (r: any) =>
          `SOURCE: ${r.source_id} | TITLE: ${r.title}\n${r.content || r.description}`
      ),
    ].join("\n\n---\n\n");
    return primary;
  });
}

// ─── AI Processing Pipeline (called by POST /api/process) ────────────────────
let processingInProgress = false;

async function runAIPipeline(): Promise<{ processed: number; skipped: number; quota: number }> {
  if (processingInProgress) {
    console.log("AI pipeline already running, skipping.");
    return { processed: 0, skipped: 0, quota: 0 };
  }

  processingInProgress = true;
  let processed = 0;
  let skipped = 0;

  try {
    console.log("🔄 Starting AI pipeline...");
    const articles = await fetchRSSArticles();
    const processedIds = await getProcessedIds();
    let quotaInfo = await getQuotaInfo();

    console.log(`📰 ${articles.length} events fetched. ${processedIds.size} already in DB. Quota: ${quotaInfo.count}/${DAILY_LIMIT}`);

    for (const article of articles) {
      if (processedIds.has(article.article_id)) {
        skipped++;
        continue;
      }
      if (quotaInfo.count >= DAILY_LIMIT) {
        console.log("Daily AI quota reached. Stopping.");
        break;
      }
      if (!genAI) break;

      console.log(`🤖 AI processing: "${article.title?.slice(0, 50)}..." (Quota: ${quotaInfo.count + 1}/${DAILY_LIMIT})`);

      const aiResult = await processArticleWithAI(
        article.title || "",
        article._combined_content,
        article.source_id || "multiple sources",
        article.category?.[0]
      );

      // Use original image from RSS source — keep real editorial photos from publishers
      const finalImageUrl = article.image_url;

      // Save to DB regardless of quality (so we don't re-process rejected articles)
      await saveArticleToDB({
        ...article,
        image_url: finalImageUrl,
        headline: aiResult.headline,
        seo_title: aiResult.seo_title,
        ai_meta_description: aiResult.ai_meta_description,
        rewritten_content: aiResult.rewritten_content,
        ai_summary: aiResult.summary,
        classification: aiResult.classification,
        quality_score: aiResult.quality_score,
        research_data: aiResult.research_data,
      });

      quotaInfo.count++;
      await saveQuotaInfo(quotaInfo.date, quotaInfo.count);
      processed++;

      // gemini-2.5-flash free tier: ~15 RPM, 4s between articles is safe
      await delay(4000);
    }

    // Invalidate in-memory cache so next /api/news request re-reads from DB
    lastFetchTime = 0;

    console.log(`✅ Pipeline complete. Processed: ${processed}, Skipped: ${skipped}, Quota used: ${quotaInfo.count}/${DAILY_LIMIT}`);
    return { processed, skipped, quota: quotaInfo.count };
  } finally {
    processingInProgress = false;
  }
}

// ─── In-Memory Cache (short-term, for /api/news performance) ────────────────
let cachedNews: any[] = [];
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ─── Price & Fear/Greed Cache ────────────────────────────────────────────────
let cachedPrices: any = null;
let lastPriceFetchTime = 0;
const PRICE_CACHE_TTL = 2 * 60 * 1000;

let cachedFearGreed: any = null;
let lastFearGreedFetchTime = 0;
const FEAR_GREED_CACHE_TTL = 60 * 60 * 1000;

// ─── Express Server ──────────────────────────────────────────────────────────
async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // ── GET /api/news — Read published articles from DB ──────────────────────
  app.get("/api/news", async (req, res) => {
    try {
      const now = Date.now();
      if (now - lastFetchTime > CACHE_TTL || cachedNews.length === 0) {
        cachedNews = await getPublishedArticles();
        lastFetchTime = now;
      }
      res.json({
        status: "success",
        totalResults: cachedNews.length,
        results: cachedNews,
      });
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  // ── POST /api/process — Trigger AI pipeline (for GitHub Actions cron) ────
  app.post("/api/process", async (req, res) => {
    const secret = process.env.PROCESS_SECRET;
    const authHeader = req.headers["authorization"];

    if (secret && authHeader !== `Bearer ${secret}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Run in background, respond immediately so GitHub Actions doesn't timeout
    res.json({ status: "processing_started", message: "AI pipeline triggered." });

    runAIPipeline().catch((err) =>
      console.error("Pipeline error:", err)
    );
  });

  // ── GET /api/process/status — Check if pipeline is running ───────────────
  app.get("/api/process/status", async (req, res) => {
    const quotaInfo = await getQuotaInfo();
    res.json({
      processing: processingInProgress,
      quota: quotaInfo,
      daily_limit: DAILY_LIMIT,
      cached_articles: cachedNews.length,
    });
  });

  // ── GET /api/prices ───────────────────────────────────────────────────────
  app.get("/api/prices", async (req, res) => {
    try {
      const now = Date.now();
      if (now - lastPriceFetchTime > PRICE_CACHE_TTL || !cachedPrices) {
        // Use KuCoin API which works reliably on Render
        const response = await fetch(
          'https://api.kucoin.com/api/v1/market/allTickers'
        );
        if (!response.ok) throw new Error(`KuCoin API: ${response.status}`);
        
        const json = await response.json();
        const data = json.data?.ticker || [];
        
        const symbolMap: Record<string, string> = {
          'BTC-USDT': 'bitcoin',
          'ETH-USDT': 'ethereum',
          'SOL-USDT': 'solana',
          'BNB-USDT': 'binancecoin',
          'XRP-USDT': 'ripple',
          'DOGE-USDT': 'dogecoin'
        };
        
        const formatted: Record<string, any> = {};
        for (const item of data) {
          const id = symbolMap[item.symbol];
          if (id) {
            formatted[id] = {
              usd: parseFloat(item.last),
              usd_24h_change: parseFloat(item.changeRate || '0') * 100 // KuCoin gives decimal e.g. 0.05 for 5%
            };
          }
        }
        
        cachedPrices = formatted;
        lastPriceFetchTime = now;
      }
      res.json(cachedPrices);
    } catch (error) {
      console.error("Error fetching prices:", error);
      if (cachedPrices) return res.json(cachedPrices);
      res.status(500).json({ error: "Failed to fetch prices" });
    }
  });

  // ── GET /api/fear-greed ───────────────────────────────────────────────────
  app.get("/api/fear-greed", async (req, res) => {
    try {
      const now = Date.now();
      if (now - lastFearGreedFetchTime > FEAR_GREED_CACHE_TTL || !cachedFearGreed) {
        const response = await fetch("https://api.alternative.me/fng/?limit=1");
        if (!response.ok) throw new Error(`Fear & Greed API: ${response.status}`);
        const json = await response.json();
        cachedFearGreed = json.data?.[0] || null;
        lastFearGreedFetchTime = now;
      }
      res.json(cachedFearGreed || { value: null, value_classification: "Unknown" });
    } catch (error) {
      console.error("Error fetching Fear & Greed index:", error);
      if (cachedFearGreed) return res.json(cachedFearGreed);
      res.status(500).json({ error: "Failed to fetch Fear & Greed index" });
    }
  });

  // ── GET /sitemap.xml ──────────────────────────────────────────────────────
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const protocol = req.headers["x-forwarded-proto"] || req.protocol;
      const host = req.headers.host;
      const baseUrl = `${protocol}://${host}`;

      const now = Date.now();
      if (now - lastFetchTime > CACHE_TTL || cachedNews.length === 0) {
        cachedNews = await getPublishedArticles();
        lastFetchTime = now;
      }

      const generateSlug = (title: string) => {
        if (!title) return "";
        return title
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "");
      };

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>hourly</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

      for (const article of cachedNews) {
        const slug = generateSlug(article.title);
        const articleUrl = `${baseUrl}/article/${article.article_id}/${slug}`;
        const date = new Date(article.pubDate || Date.now()).toISOString();
        xml += `  <url>\n    <loc>${articleUrl}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      }

      xml += `</urlset>`;
      res.header("Content-Type", "application/xml");
      res.send(xml);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  // ── Vite middleware (dev) / Static files (prod) ───────────────────────────
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
