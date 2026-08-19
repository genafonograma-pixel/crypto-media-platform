import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import Parser from "rss-parser";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import sanitizeHtml from "sanitize-html";
import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import ws from "ws";
import sharp from "sharp";

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

// ─── Gemini Key Rotation ─────────────────────────────────────────────────────
// Load all available Gemini keys from env
// Render uses GEMINI_API_KEY, GEMINI_API_KEY_1 ... GEMINI_API_KEY_5 (6 total)
// Local .env uses GEMINI_API_KEY_2 ... GEMINI_API_KEY_6 as extras — both are supported.
const GEMINI_KEYS: string[] = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_1,  // Render's second key
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
  process.env.GEMINI_API_KEY_4,
  process.env.GEMINI_API_KEY_5,
  process.env.GEMINI_API_KEY_6,  // Local .env extra slot
].filter(Boolean) as string[];

const exhaustedKeys = new Set<string>(); // keys that hit 429 today
let geminiKeyIndex = 0;

function getNextGeminiKey(): string | null {
  // Find the next non-exhausted key, cycling through all
  for (let i = 0; i < GEMINI_KEYS.length; i++) {
    const idx = (geminiKeyIndex + i) % GEMINI_KEYS.length;
    if (!exhaustedKeys.has(GEMINI_KEYS[idx])) {
      geminiKeyIndex = (idx + 1) % GEMINI_KEYS.length;
      return GEMINI_KEYS[idx];
    }
  }
  return null; // all keys exhausted
}

// Robust JSON parser — handles markdown fences and articles with unescaped quotes
function safeParseJSON(raw: string): any {
  // Strip markdown code fences
  let text = raw.trim();
  if (text.startsWith("```json")) text = text.replace(/^```json\n?/, "").replace(/\n?```$/, "");
  else if (text.startsWith("```")) text = text.replace(/^```\n?/, "").replace(/\n?```$/, "");
  text = text.trim();

  // First attempt: direct parse
  try { return JSON.parse(text); } catch {}

  // Second attempt: extract outermost JSON object/array
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)); } catch {}
  }

  // Third attempt: use regex to pull top-level string values and sanitize
  // Replace unescaped newlines inside strings
  const sanitized = text
    .replace(/[\u0000-\u001F\u007F]/g, " ") // strip control chars
    .replace(/([^\\])"/g, (m, p) => p + '"');   // passthrough (can't safely fix)
  try { return JSON.parse(sanitized); } catch {}

  console.warn("⚠️ safeParseJSON: all attempts failed, returning null");
  return null;
}

async function runGeminiPrompt(prompt: string, apiKey: string): Promise<any> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });
  const data = await res.json();
  if (data.error) {
    const code = data.error.code;
    if (code === 429) {
      exhaustedKeys.add(apiKey);
      throw new Error(`QUOTA_EXHAUSTED:${apiKey}`);
    }
    throw new Error(`Gemini error ${code}: ${data.error.message}`);
  }
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";
  const parsed = safeParseJSON(text);
  if (!parsed) {
    console.error("Gemini returned unparseable JSON. Raw text:", text);
    throw new Error("Gemini returned unparseable JSON");
  }
  return parsed;
}

async function runOpenRouterPrompt(prompt: string): Promise<any> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://crypto-media-platform.onrender.com",
      "X-Title": "Crypto Media",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openrouter/free",
      messages: [{ role: "user", content: prompt }]
    })
  });
  if (!res.ok) throw new Error(`OpenRouter HTTP ${res.status}: ${res.statusText}`);
  const data = await res.json();
  const rawText = data.choices?.[0]?.message?.content?.trim() || "{}";
  const parsed = safeParseJSON(rawText);
  if (!parsed) {
    console.error("OpenRouter returned unparseable JSON. Raw text:", rawText);
    throw new Error("OpenRouter returned unparseable JSON");
  }
  return parsed;
}

// ─── AI Helpers ──────────────────────────────────────────────────────────────
async function runAIPrompt(prompt: string) {
  const timeoutMs = 120000;
  const withTimeout = (p: Promise<any>) => Promise.race([
    p,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("AI request timed out after 120s")), timeoutMs)
    )
  ]);

  // Try Gemini keys first (rotating through all), with 503 backoff cap
  let consecutive503s = 0;
  while (GEMINI_KEYS.length > 0) {
    const key = getNextGeminiKey();
    if (!key) break; // all Gemini keys exhausted
    try {
      console.log(`🔑 Using Gemini key ...${key.slice(-6)} (${exhaustedKeys.size}/${GEMINI_KEYS.length} exhausted)`);
      const result = await withTimeout(runGeminiPrompt(prompt, key));
      return result;
    } catch (err: any) {
      if (err.message?.startsWith("QUOTA_EXHAUSTED")) {
        console.warn(`⚠️ Gemini key ...${key.slice(-6)} quota exhausted — trying next key`);
        await delay(2000);
        continue;
      }
      if (err.message?.includes("503")) {
        consecutive503s++;
        const backoff = Math.min(5000 * consecutive503s, 20000); // 5s, 10s, 20s cap
        console.warn(`⚠️ Gemini 503 (attempt ${consecutive503s}/3) — backing off ${backoff / 1000}s`);
        if (consecutive503s >= 3) {
          console.warn("⚠️ Gemini 503 limit reached — falling through to fallback.");
          break;
        }
        await delay(backoff);
        continue;
      }
      console.error(`AI prompt failed (Gemini): ${err.message}`);
      break; // non-quota/503 error, fall through
    }
  }

  // Fallback: OpenRouter free tier
  if (process.env.OPENROUTER_API_KEY) {
    try {
      console.log("🔄 Falling back to OpenRouter free tier...");
      return await withTimeout(runOpenRouterPrompt(prompt));
    } catch (err: any) {
      console.error(`AI prompt failed (OpenRouter): ${err.message}`);
    }
  }

  return null;
}

async function processArticleWithAI(
  title: string,
  content: string,
  sourceName: string,
  category?: string
): Promise<AIResult> {
  if (!process.env.OPENROUTER_API_KEY && GEMINI_KEYS.length === 0)
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
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 15000);


  // STEP 1: RESEARCH & FACT EXTRACTION
  const researchPrompt = `You are a senior crypto intelligence researcher. Your task is to analyze the source material and build a strict factual Research Object.
SOURCE OUTLET: ${sourceName}
RAW SOURCE CONTENT:
${textContent}

INSTRUCTIONS:
1. Classify the event into EXACTLY ONE of these categories: "Bitcoin", "Altcoins", "DeFi", "Web3", "Markets", "Tech". Do not use any other category names.
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
  const generatePrompt = `You are a senior editor at a crypto intelligence platform. Write a news article based STRICTLY on this Research Object, the Enriched Background Context, and the RAW SOURCE CONTENT.
SOURCE OUTLET: ${sourceName}
RAW SOURCE CONTENT:
${textContent}

RESEARCH DATA:
${JSON.stringify(researchData)}

${contextBlock}
ABSOLUTE EDITORIAL RULES:
1. FACT VS ANALYSIS: Distinguish fact from analysis. Do not present subjective editorial judgment as fact. Use precise language (e.g., "suggests" rather than "proves").
2. IMAGES & MEDIA: If the RAW SOURCE CONTENT contains <img> tags, naturally embed those exact <img> tags (with their original src) into the rewritten_content where contextually relevant.
3. SOURCE LINKING: If the content references external sources like X posts or official announcements, embed those links natively using <a href="..."> tags. However, NEVER link to the domain where the content was scraped from (${sourceName}).
4. SEO & STRUCTURE: Optimize the article for SEO. Use semantic heading structures (<h2>, <h3>), naturally incorporate relevant LSI keywords, and bold key terms or phrases to improve readability.
5. FAQ SECTION: At the bottom of the article, append a "Frequently Asked Questions" section. Use an <h2> tag for the section title, followed by <h3> tags for each question (always ending with a question mark), and <p> tags for the answers. Do not wrap them in custom divs, just output semantic tags.
6. NO SEMANTIC REPETITION: Every paragraph and section must add NEW information. Do not repeat the same idea multiple ways. Do not blindly follow the source article's narrative flow; independently structure the facts.
7. BAN LIST (CRITICAL): Never use the following phrases or concepts: "According to our research", "The AI found", "undefined", "[SOURCE]", "Quality score", "Visit the official site for details", "Written by". Do NOT expose any internal template variables in the text.
8. LENGTH REQUIREMENT: Target ${targetWords} words. Minimum ${minWords} words. Do NOT pad with generic filler. If you cannot reach the minimum length using ONLY verified facts, write as much verified fact-based content as you can; the validator will downgrade the category if needed.


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
  // STEP 3: SIMPLE WORD-COUNT QUALITY GATE
  // Replaces AI validation which was over-rejecting good articles.
  // The research + generation steps already enforce factual accuracy.
  let rawClassification = researchData.classification || category || "Crypto News";
  const allowedCategories = ["Bitcoin", "Altcoins", "DeFi", "Web3", "Markets", "Tech"];
  let finalClassification = "Markets"; // Fallback
  for (const allowed of allowedCategories) {
    if (rawClassification.toLowerCase().includes(allowed.toLowerCase())) {
      finalClassification = allowed;
      break;
    }
  }
  const finalScore = wordCount >= 400 ? 85 : wordCount >= 200 ? 75 : 65;

  if (wordCount < 200) {
    console.log(`Article too short (${wordCount} words). Skipping.`);
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

/** Uses Gemini to generate a custom, highly specific text-free conceptual image prompt */
async function buildDynamicThumbnailPrompt(article: { headline?: string | null; title?: string; classification?: string | null }): Promise<string> {
  const title = article.headline || article.title || "";

  const aiPrompt = `You are an expert art director for a crypto news site. 
Write a creative image generation prompt for the following headline: "${title}"
Classification: "${article.classification || 'News'}"

INSTRUCTIONS:
1. Describe a scene that matches the news. You MUST describe it as authentic, flat 2D retro pixel art.
2. DO NOT include any text, words, or typography in the image. The image must be completely text-free.
3. Use keywords like: AUTHENTIC 8-BIT PIXEL ART, flat 2D pixel art, retro SNES style graphics, low resolution, visible square pixels, limited color palette, indie game aesthetic.
4. Return ONLY a JSON object:
{
  "image_prompt": "string"
}`;

  try {
    const res = await runAIPrompt(aiPrompt);
    if (res && res.image_prompt) {
      return res.image_prompt + ". AUTHENTIC 8-BIT PIXEL ART, flat 2D, visible square pixels. The image MUST be completely text-free. NO words, NO letters, NO typography.";
    }
  } catch (e) {
    console.error("Failed to generate dynamic thumbnail prompt:", e);
  }

  // Fallback
  const c = article.classification || "Crypto News";
  return `AUTHENTIC 8-BIT PIXEL ART of ${c}. Flat 2D pixel art, retro SNES style graphics, low resolution, visible square pixels, limited color palette. Completely text-free, NO words.`;
}



/** Generate a 1200x630 (16:9) image from Cloudflare Workers AI FLUX-1-Schnell */
// ─── Cloudflare Account Rotation ─────────────────────────────────────────────
// Supports multiple Cloudflare accounts. When one hits the daily quota (429),
// it automatically falls through to the next account.
// Add to .env: CLOUDFLARE_ACCOUNT_ID_2 + CLOUDFLARE_API_TOKEN_2 (and _3, _4, etc.)
const CLOUDFLARE_ACCOUNTS = [
  { accountId: process.env.CLOUDFLARE_ACCOUNT_ID,   token: process.env.CLOUDFLARE_API_TOKEN   },
  { accountId: process.env.CLOUDFLARE_ACCOUNT_ID_2, token: process.env.CLOUDFLARE_API_TOKEN_2 },
  { accountId: process.env.CLOUDFLARE_ACCOUNT_ID_3, token: process.env.CLOUDFLARE_API_TOKEN_3 },
].filter((a) => a.accountId && a.token) as { accountId: string; token: string }[];

async function generateThumbnailCloudflare(prompt: string): Promise<Buffer | null> {
  if (CLOUDFLARE_ACCOUNTS.length === 0) {
    console.error("Missing Cloudflare API credentials in environment.");
    return null;
  }

  for (let i = 0; i < CLOUDFLARE_ACCOUNTS.length; i++) {
    const { accountId, token } = CLOUDFLARE_ACCOUNTS[i];
    const label = i === 0 ? "primary" : `account #${i + 1}`;
    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
        signal: AbortSignal.timeout(45000),
      });

      if (response.status === 429) {
        const body = await response.text();
        console.error(`Cloudflare AI (${label}) returned 429: ${body}`);
        if (i + 1 < CLOUDFLARE_ACCOUNTS.length) {
          console.log(`Switching to Cloudflare account #${i + 2}...`);
        }
        continue; // try next account
      }

      if (!response.ok) {
        console.error(`Cloudflare AI (${label}) returned ${response.status}: ${await response.text()}`);
        continue;
      }

      const data = await response.json() as any;
      if (data && data.result && data.result.image) {
        if (i > 0) console.log(`✅ Cloudflare AI (${label}) succeeded.`);
        // Cloudflare natively returns 1024x1024. Do NOT resize/crop it,
        // which caused the "trashy blurry" look the user hated.
        return Buffer.from(data.result.image, "base64");
      }

      console.error(`Cloudflare AI (${label}) response had no image data.`);
    } catch (err) {
      console.error(`Cloudflare AI (${label}) failed: ${(err as Error).message}`);
    }
  }

  return null; // all accounts exhausted
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
        const rawBuffer = Buffer.from(part.inlineData.data, "base64");
        // Resize and convert to WebP for consistency and next-gen format support
        const webpBuffer = await sharp(rawBuffer)
          .resize(1200, 630, { fit: "cover", position: "centre" })
          .webp({ quality: 85 })
          .toBuffer();
        return webpBuffer;
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
  const safeId = articleId.replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `${safeId}.webp`;

  // Try ImgBB if key is present
  const apiKey = process.env.IMGBB_API_KEY;
  if (apiKey) {
    try {
      const formData = new FormData();
      formData.append("key", apiKey);
      formData.append("image", buffer.toString("base64"));
      formData.append("name", filename);

      const response = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json() as any;
        if (data && data.data && data.data.url) {
          return data.data.url;
        }
      } else {
        console.warn(`ImgBB upload failed (${response.status}) — falling back to Catbox.moe`);
      }
    } catch (err) {
      console.warn(`ImgBB upload error — falling back to Catbox.moe: ${(err as Error).message}`);
    }
  }

  // Fallback: Catbox.moe (Free, no API key required, datacenter friendly)
  try {
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', new Blob([buffer], { type: 'image/webp' }), filename);

    const response = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const url = await response.text();
      return url.trim();
    } else {
      console.error(`Catbox upload failed: ${response.status} ${await response.text()}`);
      return null;
    }
  } catch (err) {
    console.error(`Catbox upload failed: ${(err as Error).message}`);
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

  const prompt = await buildDynamicThumbnailPrompt(article);

  console.log(`🎨 Generating thumbnail for: "${(article.headline || article.title || "").slice(0, 50)}..."`);
  console.log(`📝 Prompt: "${prompt.slice(0, 120)}..."`);

  let imageBuffer: Buffer | null = null;
  
  console.log("Using Cloudflare AI as primary provider...");
  imageBuffer = await generateThumbnailCloudflare(prompt);

  // Last resort: Gemini image generation
  if (!imageBuffer) {
    console.log("All main providers failed — falling back to Gemini image generation.");
    imageBuffer = await generateThumbnailGemini(prompt);
  }

  if (!imageBuffer) {
    console.error("❌ All thumbnail generation methods failed.");
    return null;
  }

  const publicUrl = await uploadThumbnailToImgBB(imageBuffer, article.article_id);
  if (publicUrl) {
    console.log(`✅ Thumbnail uploaded: ${publicUrl}`);
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

const parser = new Parser({ timeout: 15000,
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
export async function fetchRSSArticles(): Promise<any[]> {
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

        // Use RSS content directly — full-page scraping was too slow (up to 180 sequential fetches).
        // The AI generates well from RSS content alone.

        if (rawContent) {
          rawContent = rawContent.replace(/<p><i>Morning Minute is a daily newsletter.*?<\/i><\/p>/gi, "");
          rawContent = rawContent.replace(/<h2>.*?AI Summary.*?<\/h2>[\s\S]*?(?=<h2>)/gi, "");
          rawContent = rawContent.replace(/<div[^>]*>.*?AI Summary.*?<\/div>/gi, "");
          rawContent = rawContent.replace(/You Might Also Like/gi, "");
          rawContent = rawContent.replace(/HOT Stories/gi, "");

          rawContent = sanitizeHtml(rawContent, {
            allowedTags: ["p", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "strong", "b", "em", "i", "blockquote", "br", "img", "figure", "figcaption", "table", "thead", "tbody", "tr", "th", "td", "a"],
            allowedAttributes: { 
              img: ["src", "alt", "width", "height", "loading"],
              a: ["href", "title", "target"]
            },
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
            // Always prefer the full article URL as the unique ID - it is guaranteed unique.
            // item.guid is often a short, truncated query string that collides across articles.
            String(item.link || item.guid || `${source.id}-${item.title || ""}`)
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

  // Sort groupedEvents by number of related sources descending (popularity), then by pubDate descending (freshness)
  groupedEvents.sort((a, b) => {
    const coverageDiff = b.related.length - a.related.length;
    if (coverageDiff !== 0) return coverageDiff;
    return new Date(b.primary.pubDate).getTime() - new Date(a.primary.pubDate).getTime();
  });

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

export async function runAIPipeline(): Promise<{
  processed: number;
  skipped: number;
  quota: number;
}> {
  if (processingInProgress) {
    console.log("AI pipeline already running, skipping.");
    return { processed: 0, skipped: 0, quota: 0 };
  }

  processingInProgress = true;
  let processed = 0;
  let skipped = 0;
  const MAX_ARTICLES_PER_RUN = 5;

  try {
    console.log("🔄 Starting AI pipeline...");
    // Clear dynamic rate limit block at the beginning of each run so keys get a fresh retry
    exhaustedKeys.clear();

    const articles = await fetchRSSArticles();
    const processedIds = await getProcessedIds();
    let quotaInfo = await getQuotaInfo();

    // Sync quota with actual DB count for today to prevent stale quota drift
    const today = new Date().toISOString().split("T")[0];
    if (supabase) {
      const { count } = await supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .gte("pub_date", today);
      const realCount = count ?? 0;
      if (realCount < quotaInfo.count) {
        console.log(`🔄 Syncing quota: DB has ${realCount} articles today, quota said ${quotaInfo.count}. Resetting to ${realCount}.`);
        quotaInfo.count = realCount;
        await saveQuotaInfo(today, realCount);
      }
    }

    console.log(`📰 ${articles.length} events fetched. ${processedIds.size} already in DB. Quota: ${quotaInfo.count}/${DAILY_LIMIT}`);

    for (const article of articles) {
      if (processed >= MAX_ARTICLES_PER_RUN) {
        console.log(`🛑 Reached limit of ${MAX_ARTICLES_PER_RUN} article per pipeline run. Stopping.`);
        break;
      }
      if (processedIds.has(article.article_id)) {
        skipped++;
        continue;
      }
      if (quotaInfo.count >= DAILY_LIMIT) {
        console.log("Daily AI quota reached. Stopping.");
        break;
      }
      if (!process.env.OPENROUTER_API_KEY && GEMINI_KEYS.length === 0) {
        console.error("❌ FATAL: No AI keys configured (OPENROUTER_API_KEY and all GEMINI_API_KEY_* are missing). Pipeline cannot continue.");
        break;
      }

      console.log(`🤖 AI processing: "${article.title?.slice(0, 50)}..." (Quota: ${quotaInfo.count + 1}/${DAILY_LIMIT})`);

      try {
        const aiResult = await processArticleWithAI(
          article.title || "",
          article._combined_content,
          article.source_id || "multiple sources",
          article.category?.[0]
        );

        // Only save if AI actually ran. If quality_score is null it means
        // the AI failed completely (rate limit, timeout, etc.) — skip saving so
        // the article can be retried on the next pipeline run.
        if (aiResult.quality_score === null && aiResult.rewritten_content === null) {
          console.error(`⚠️ AI returned null for "${article.title?.slice(0, 50)}" — skipping, will retry next run.`);
          continue;
        }

        // Generate thumbnail via Cloudflare AI
        const thumbnailUrl = await generateAndStoreThumbnail({
          article_id: article.article_id,
          headline: aiResult.headline,
          title: article.title,
          classification: aiResult.classification,
        });

        // NEVER use scraped original images. If AI generation completely fails (due to quota/timeout), use a generic pixel art fallback.
        let finalImageUrl = thumbnailUrl;
        if (!finalImageUrl) {
          try {
            const mappingData = await fs.readFile(path.join(process.cwd(), "backup_thumbnails.json"), "utf-8");
            const backupMap = JSON.parse(mappingData);
            
            const matchText = `${article.title || ""} ${aiResult.headline || ""} ${aiResult.classification || ""}`.toLowerCase();
            let matchedKey = "altcoins"; // default fallback key
            
            for (const [key, details] of Object.entries(backupMap)) {
              const tags = (details as any).tags || [];
              if (tags.some((tag: string) => matchText.includes(tag.toLowerCase()))) {
                matchedKey = key;
                break;
              }
            }
            
            if (backupMap[matchedKey]) {
              finalImageUrl = backupMap[matchedKey].url;
              console.log(`ℹ️ AI thumbnail generation failed. Selected categorized fallback: "${matchedKey}" (${finalImageUrl})`);
            } else {
              finalImageUrl = "https://files.catbox.moe/2k119g.jpg";
            }
          } catch (e) {
            console.warn("Failed to load backup thumbnails mapping, using global fallback:", e);
            finalImageUrl = "https://files.catbox.moe/2k119g.jpg";
          }
        }

        // Save to DB
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
        // Invalidate the in-memory news cache so /api/news immediately reflects the new article
        lastFetchTime = 0;
        console.log(`✅ Saved: "${article.title?.slice(0, 50)}" (score: ${aiResult.quality_score})`);
      } catch (articleErr: any) {
        console.error(`❌ Unexpected error processing "${article.title?.slice(0, 50)}": ${articleErr.message}`);
        // Continue to next article — don't let one bad article kill the pipeline
      }

      // gemini-flash-latest: 2 calls per article (research + generate).
      // 8 second delay keeps us well under the per-minute rate limit.
      await delay(8000);
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

// --- IN-MEMORY LOGGER ---
const _logs: string[] = [];
const origLog = console.log;
const origError = console.error;
console.log = (...args) => {
  _logs.push("[LOG] " + args.join(" "));
  if (_logs.length > 200) _logs.shift();
  origLog.apply(console, args);
};
console.error = (...args) => {
  _logs.push("[ERR] " + args.join(" "));
  if (_logs.length > 200) _logs.shift();
  origError.apply(console, args);
};

app.get("/api/logs", (req, res) => {
  res.send(_logs.join("\n"));
});
// -------------------------

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

  // ── GET /api/article/:slug — Fetch a single article by its slug ──────────
  app.get("/api/article/:slug", async (req, res) => {
    const { slug } = req.params;
    const generateSlug = (title: string) => title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Search in-memory cache first
    const fromCache = cachedNews.find(a => {
      const articleSlug = generateSlug(a.headline || a.title || "");
      return articleSlug === slug;
    });
    if (fromCache) return res.json(fromCache);

    // Fallback: query Supabase directly
    if (supabase) {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("pub_date", { ascending: false })
        .limit(200);
      if (!error && data) {
        const match = data.find((row: any) => {
          const articleSlug = generateSlug(row.headline || row.title || "");
          return articleSlug === slug;
        });
        if (match) {
          return res.json({
            article_id: match.id,
            title: match.title,
            link: match.link,
            description: match.description,
            pubDate: match.pub_date,
            image_url: match.image_url,
            source_id: match.source_id,
            headline: match.headline,
            seo_title: match.seo_title,
            ai_meta_description: match.ai_meta_description,
            rewritten_content: match.rewritten_content,
            ai_summary: match.ai_summary,
            classification: match.classification,
            quality_score: match.quality_score,
            related_sources: match.related_sources,
            research_data: match.research_data,
            category: match.category || ["News"],
          });
        }
      }
    }

    return res.status(404).json({ error: "Article not found" });
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

  // ── GET /api/debug — diagnose environment variable state ─────────────────
  app.get("/api/debug", (req, res) => {
    res.json({
      has_gemini_key: !!process.env.GEMINI_API_KEY,
      gemini_key_count: [
        process.env.GEMINI_API_KEY,
        process.env.GEMINI_API_KEY_1,
        process.env.GEMINI_API_KEY_2,
        process.env.GEMINI_API_KEY_3,
        process.env.GEMINI_API_KEY_4,
        process.env.GEMINI_API_KEY_5,
      ].filter(Boolean).length,
      has_supabase_url: !!process.env.SUPABASE_URL,
      has_supabase_key: !!process.env.SUPABASE_SERVICE_KEY,
      cloudflare_accounts: CLOUDFLARE_ACCOUNTS.length,
      has_cloudflare_account: !!process.env.CLOUDFLARE_ACCOUNT_ID,
      has_cloudflare_token: !!process.env.CLOUDFLARE_API_TOKEN,
      has_cloudflare_account_2: !!process.env.CLOUDFLARE_ACCOUNT_ID_2,
      has_cloudflare_token_2: !!process.env.CLOUDFLARE_API_TOKEN_2,
      thumbnail_provider: process.env.THUMBNAIL_PROVIDER || "pollinations",
      has_imgbb_key: !!process.env.IMGBB_API_KEY,
      generate_thumbnails: process.env.GENERATE_THUMBNAILS,
      process_secret_set: !!process.env.PROCESS_SECRET,
      node_env: process.env.NODE_ENV,
      genai_initialized: GEMINI_KEYS.length > 0,
    });
  });

  // ── GET /api/test-cloudflare — Live ping both Cloudflare accounts ─────────
  app.get("/api/test-cloudflare", async (req, res) => {
    const results: any[] = [];
    for (let i = 0; i < CLOUDFLARE_ACCOUNTS.length; i++) {
      const { accountId, token } = CLOUDFLARE_ACCOUNTS[i];
      const label = i === 0 ? "primary" : `account #${i + 1}`;
      try {
        const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: "a single glowing bitcoin coin" }),
          signal: AbortSignal.timeout(30000),
        });
        const status = response.status;
        let detail = "";
        if (!response.ok) {
          detail = await response.text();
        } else {
          const data = await response.json() as any;
          detail = data?.result?.image ? `OK - image ${data.result.image.length} chars` : "OK but no image";
        }
        results.push({ account: label, status, detail: detail.slice(0, 200) });
      } catch (err) {
        results.push({ account: label, status: "error", detail: (err as Error).message });
      }
    }
    res.json({ cloudflare_accounts: CLOUDFLARE_ACCOUNTS.length, results });
  });

  // ── GET /api/test-generate — Force generate a mock article and thumbnail ────
  app.get("/api/test-generate", async (req, res) => {
    try {
      const mockArticle = {
        title: "Ethereum Whales Accumulate $500M in ETH as Layer 2 Gas Fees Hit All-Time Lows",
        description: "Large holders are taking advantage of low transaction costs to stack Ethereum.",
        article_id: "mock_eth_accumulate_" + Date.now(),
        source_id: "Crypto News",
      };
      const aiResult = await processArticleWithAI(
        mockArticle.title,
        mockArticle.description,
        mockArticle.source_id,
        "Ethereum"
      );
      const thumbnailUrl = await generateAndStoreThumbnail({
        article_id: mockArticle.article_id,
        headline: aiResult.headline,
        title: mockArticle.title,
        classification: aiResult.classification,
      });
      res.json({
        success: true,
        headline: aiResult.headline,
        classification: aiResult.classification,
        quality_score: aiResult.quality_score,
        image_url: thumbnailUrl,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ── GET /api/test-rss — Check if Render IP is blocked ────────────────────
  app.get("/api/test-rss", async (req, res) => {
    try {
      const start = Date.now();
      const articles = await fetchRSSArticles();
      const duration = Date.now() - start;
      res.json({
        success: true,
        count: articles.length,
        duration_ms: duration,
        sources: articles.reduce((acc: any, a: any) => {
          acc[a.source_id] = (acc[a.source_id] || 0) + 1;
          return acc;
        }, {}),
        first_few: articles.slice(0, 3).map((a: any) => ({ title: a.title, source: a.source_id }))
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message, stack: err.stack });
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
        const articleUrl = `${baseUrl}/article/${slug}`;
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
