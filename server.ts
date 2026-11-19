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

// ─── IndexNow & SEO Configuration ───────────────────────────────────────────
const INDEXNOW_KEY = (process.env.INDEXNOW_KEY || "c748956be9c240979a7853fd9e472691").trim();
const SITE_URL = (process.env.SITE_URL || "https://sport25.news").trim().replace(/\/+$/, "");

export function generateSlug(title: string): string {
  if (!title) return "";
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function submitToIndexNow(urls: string | string[]): Promise<{ success: boolean; status?: number; message?: string }> {
  try {
    const rawList = Array.isArray(urls) ? urls : [urls];
    const urlList = Array.from(
      new Set(
        rawList
          .map((u) => (u || "").trim())
          .filter((u) => u.length > 0)
          .map((u) => (u.startsWith("http://") || u.startsWith("https://") ? u : `${SITE_URL}${u.startsWith("/") ? "" : "/"}${u}`))
      )
    );

    if (urlList.length === 0) {
      return { success: true, message: "No URLs to submit" };
    }

    let host = "sport25.news";
    try {
      const parsed = new URL(SITE_URL);
      host = parsed.host;
    } catch {
      // fallback
    }

    const payload = {
      host,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList,
    };

    console.log(`📡 [IndexNow] Submitting ${urlList.length} URL(s) to IndexNow for host "${host}"...`);

    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 200 || response.status === 202) {
      console.log(`✅ [IndexNow] Submission accepted (${response.status}): ${urlList.length} URL(s) queued for crawl.`);
      return { success: true, status: response.status };
    } else {
      const errorText = await response.text();
      console.warn(`⚠️ [IndexNow] Response ${response.status}: ${errorText || response.statusText}`);
      return { success: false, status: response.status, message: errorText };
    }
  } catch (error: any) {
    console.error("❌ [IndexNow] Error submitting to IndexNow:", error.message);
    return { success: false, message: error.message };
  }
}

// ─── Auto-Post Articles to X (Twitter) via Buffer ─────────────────────────────
export async function postArticleToX(
  article: {
    headline?: string | null;
    title?: string;
    classification?: string | null;
    image_url?: string | null;
    summary?: { label: string; text: string }[] | null;
  },
  slug: string
): Promise<{ success: boolean; error?: string; postId?: string }> {
  const token = process.env.BUFFER_ACCESS_TOKEN;
  if (!token) {
    console.log("ℹ️ [X / Buffer] Auto-post skipped: BUFFER_ACCESS_TOKEN is not configured.");
    return { success: false, error: "BUFFER_ACCESS_TOKEN not set" };
  }

  const headline = (article.headline || article.title || "").trim();
  if (!headline || !slug) {
    return { success: false, error: "Missing headline or slug" };
  }

  // Never post articles that were classified as irrelevant or have no AI headline
  if (!article.headline || (article.classification || "").toLowerCase() === "irrelevant") {
    console.log(`ℹ️ [X / Buffer] Skipping post — classification is "${article.classification}" or headline missing.`);
    return { success: false, error: "Article is irrelevant or missing headline" };
  }

  const url = `${SITE_URL}/article/${slug}`;

  // Map classification to meaningful sports hashtags
  const classificationHashtagMap: Record<string, string> = {
    football: "#Football #Soccer #PremierLeague",
    basketball: "#Basketball #NBA #Hoops",
    tennis: "#Tennis #ATP #WTA",
    "formula 1": "#F1 #Formula1 #Motorsport",
    "american football": "#NFL #Football #SuperBowl",
    "general sports": "#Sports #BreakingNews #SportsNews",
  };
  const cls = (article.classification || "").toLowerCase();
  const hashtags = classificationHashtagMap[cls] ?? "#Sports #Football #SportsNews";

  // Pull the "What happened" summary sentence for tweet body
  const whatHappened = article.summary?.find((s) => s.label?.toLowerCase().includes("what happened"))?.text?.trim() ?? "";
  const whyMatters = article.summary?.find((s) => s.label?.toLowerCase().includes("why"))?.text?.trim() ?? "";

  // Build tweet: headline + short context + URL + hashtags, strict 280 char limit
  // X counts URLs as 23 chars regardless of actual length
  const TWITTER_URL_LEN = 23;
  const RESERVED = TWITTER_URL_LEN + hashtags.length + 6; // 6 = newlines/spaces
  const MAX_BODY = 280 - RESERVED;

  let body = headline;
  // Try to fit "What happened" sentence after headline
  if (whatHappened && whatHappened !== headline) {
    const candidate = `${headline}\n\n${whatHappened}`;
    if (candidate.length <= MAX_BODY) body = candidate;
    else if (headline.length + 4 <= MAX_BODY && whyMatters) {
      // fallback: try "why it matters" if shorter
      const candidate2 = `${headline}\n\n${whyMatters}`;
      if (candidate2.length <= MAX_BODY) body = candidate2;
    }
  }

  // Safety trim if still over
  if (body.length > MAX_BODY) body = body.slice(0, MAX_BODY - 1).trimEnd() + "…";

  const tweetText = `${body}\n\n${url}\n\n${hashtags}`;

  try {
    let channelId = process.env.BUFFER_CHANNEL_ID;
    if (!channelId) {
      // Auto-detect Twitter channel from Buffer account
      const orgRes = await fetch("https://api.buffer.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ query: `query { account { organizations { id } } }` }),
      });
      const orgJson: any = await orgRes.json();
      const orgId = orgJson?.data?.account?.organizations?.[0]?.id;
      if (orgId) {
        const chanRes = await fetch("https://api.buffer.com", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ query: `query { channels(input: { organizationId: "${orgId}" }) { id service } }` }),
        });
        const chanJson: any = await chanRes.json();
        const twitterChannel = chanJson?.data?.channels?.find((c: any) => c.service === "twitter");
        if (twitterChannel) channelId = twitterChannel.id;
      }
    }

    if (!channelId) {
      console.warn("⚠️ [X / Buffer] No Twitter channel found in Buffer.");
      return { success: false, error: "No Twitter channel found in Buffer" };
    }

    const mutation = `
      mutation CreatePost($input: CreatePostInput!) {
        createPost(input: $input) {
          ... on PostActionSuccess {
            post { id text status }
          }
          ... on InvalidInputError {
            message
          }
          ... on LimitReachedError {
            message
          }
          ... on UnexpectedError {
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        channelId,
        text: tweetText,
        mode: "shareNow",
        schedulingType: "automatic",
        needsApproval: false,
        assets: [],
      },
    };

    const res = await fetch("https://api.buffer.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    const result: any = await res.json();
    const post = result?.data?.createPost?.post;
    if (post) {
      console.log(`🐦 [X / Buffer] Successfully published tweet for: "${headline.slice(0, 50)}..." (Post ID: ${post.id})`);
      return { success: true, postId: post.id };
    } else {
      const errDetail = result?.data?.createPost?.message || result?.errors?.[0]?.message || JSON.stringify(result);
      console.error("❌ [X / Buffer] Failed to create post:", errDetail);
      return { success: false, error: errDetail };
    }
  } catch (err: any) {
    console.error("❌ [X / Buffer] Error posting to X:", err.message);
    return { success: false, error: err.message };
  }
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

const exhaustedKeys = new Map<string, number>(); // `${model}:${key}` or `${key}` -> expiry timestamp
let geminiKeyIndex = 0;

function getNextGeminiKey(model?: string): string | null {
  for (let i = 0; i < GEMINI_KEYS.length; i++) {
    const idx = (geminiKeyIndex + i) % GEMINI_KEYS.length;
    const key = GEMINI_KEYS[idx];
    const keyBlocked = exhaustedKeys.get(key);
    if (keyBlocked && Date.now() < keyBlocked) {
      continue; // Globally invalid or disabled key
    }

    const mapKey = model ? `${model}:${key}` : key;
    const expiry = exhaustedKeys.get(mapKey);
    
    // If key is not exhausted OR the cooldown has passed
    if (!expiry || Date.now() > expiry) {
      if (expiry) exhaustedKeys.delete(mapKey);
      geminiKeyIndex = (idx + 1) % GEMINI_KEYS.length;
      return key;
    }
  }
  return null; 
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

const GEMINI_MODELS: string[] = [
  "gemini-3.6-flash",
  "gemini-flash-latest",
  "gemini-3.8-flash",
  "gemini-flash-lite-latest",
];

async function runGeminiPrompt(prompt: string, apiKey: string, model: string = "gemini-3.6-flash"): Promise<any> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
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
    const msg = data.error.message || "";
    if (msg.includes("invalid authentication credentials") || code === 400 || code === 401) {
      exhaustedKeys.set(apiKey, Date.now() + 86400000); // 24h ignore
      throw new Error(`INVALID_KEY:${apiKey}`);
    }
    if (code === 429) {
      // Cooldown for 1 minute (60,000ms) for this specific model
      exhaustedKeys.set(`${model}:${apiKey}`, Date.now() + 60000);
      throw new Error(`QUOTA_EXHAUSTED:${model}:${apiKey}`);
    }
    if (code === 503 || msg.includes("high demand") || msg.includes("temporarily unavailable")) {
      throw new Error(`MODEL_503:${model}:${msg}`);
    }
    throw new Error(`Gemini error ${code}: ${msg}`);
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
      model: "google/gemma-4-26b-a4b-it:free",
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
  const timeoutMs = 90000;
  const withTimeout = (p: Promise<any>) => Promise.race([
    p,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("AI request timed out after 90s")), timeoutMs)
    )
  ]);

  // Try each Gemini model with rotating keys
  if (GEMINI_KEYS.length > 0) {
    for (const model of GEMINI_MODELS) {
      let keyAttempts = 0;
      while (keyAttempts < GEMINI_KEYS.length) {
        const key = getNextGeminiKey(model);
        if (!key) break;
        keyAttempts++;
        try {
          console.log(`🔑 Using Gemini ${model} with key ...${key.slice(-6)}`);
          const result = await withTimeout(runGeminiPrompt(prompt, key, model));
          return result;
        } catch (err: any) {
          if (err.message?.startsWith("QUOTA_EXHAUSTED")) {
            console.warn(`⚠️ Gemini model ${model} with key ...${key.slice(-6)} quota exhausted — trying next key`);
            await delay(1000);
            continue;
          }
          if (err.message?.startsWith("INVALID_KEY")) {
            console.warn(`⚠️ Gemini key ...${key.slice(-6)} invalid — skipping`);
            continue;
          }
          if (err.message?.includes("MODEL_503") || err.message?.includes("503") || err.message?.includes("high demand")) {
            console.warn(`⚠️ Gemini model ${model} 503 / high demand — trying next model`);
            break; // Switch to next model
          }
          console.error(`AI prompt failed (${model}): ${err.message}`);
          break; // Non-quota/503 error, try next model
        }
      }
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
  const researchPrompt = `You are a senior sports researcher and journalist. Your task is to analyze the source material and build a strict factual Research Object.
SOURCE OUTLET: ${sourceName}
RAW SOURCE CONTENT:
${textContent}

INSTRUCTIONS:
1. Classify the event into EXACTLY ONE of these categories: "Football", "Basketball", "Tennis", "Formula 1", "American Football", "General Sports", "Irrelevant". If the article is not about sports, classify it as "Irrelevant". Do not use any other category names.
2. Extract all verifiable facts, numbers, dates, people, teams, scores, and organizations.
3. If you can calculate a useful metric (e.g., points difference, win percentage), do so and log it in calculations. Do NOT invent numbers.
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

  let minWords = 500;
  let targetWords = "600-1,000";
  const c = (researchData.classification || "").toLowerCase();
  if (c.includes("breaking") || c.includes("brief")) {
    minWords = 300;
    targetWords = "350-600";
  } else if (
    c.includes("transfer") ||
    c.includes("match") ||
    c.includes("derby") ||
    c.includes("final") ||
    c.includes("championship")
  ) {
    minWords = 600;
    targetWords = "700-1,200";
  }

  // STEP 1.5: CONTEXT ENRICHMENT
  const enrichmentPrompt = `You are a Sports Analyst and Historian. Analyze the following Research Object regarding a recent sports news event.
RESEARCH DATA:
${JSON.stringify(researchData)}

INSTRUCTIONS:
1. Identify the key entities (teams, players, managers, tournaments, leagues) and concepts mentioned.
2. Provide dense, accurate historical context, head-to-head records, season background, and broader tournament/league implications of these entities/events using your knowledge.
3. This information will be used to enrich a short news brief into a comprehensive article. Ensure facts are highly accurate and directly relevant.
4. Return ONLY a JSON object:
{
  "historical_context": "Deep background on the teams, players, or managers involved.",
  "market_implications": "Broader championship/league implications and what this result or news means.",
  "technical_details": "Tactical or rules context regarding the sport."
}`;
  const enrichmentData = await runAIPrompt(enrichmentPrompt);
  const contextBlock = enrichmentData ? `ENRICHED BACKGROUND CONTEXT:\n${JSON.stringify(enrichmentData)}\n` : "";

  // STEP 2: ARTICLE GENERATION
  const generatePrompt = `You are a senior sports editor at a sports news platform. Write a sports news article based STRICTLY on this Research Object, the Enriched Background Context, and the RAW SOURCE CONTENT.
SOURCE OUTLET: ${sourceName}
RAW SOURCE CONTENT:
${textContent}

RESEARCH DATA:
${JSON.stringify(researchData)}

${contextBlock}
ABSOLUTE EDITORIAL RULES:
1. FACT VS ANALYSIS: Distinguish fact from analysis. Do not present subjective editorial judgment as fact. Use precise language.
2. IMAGES & MEDIA: If the RAW SOURCE CONTENT contains <img> tags, naturally embed those exact <img> tags (with their original src) into the rewritten_content where contextually relevant.
3. SOURCE LINKING: If the content references external sources like official team announcements or athlete statements, embed those links natively using <a href="..."> tags. However, NEVER link to the domain where the content was scraped from (${sourceName}).
4. SEO & STRUCTURE: Optimize the article for SEO. Use semantic heading structures (<h2>, <h3>), naturally incorporate relevant sports keywords, and bold key terms or player/team names to improve readability.
5. FAQ SECTION: At the bottom of the article, append a "Frequently Asked Questions" section. Use an <h2> tag for the section title, followed by <h3> tags for each question (always ending with a question mark), and <p> tags for the answers. Do not wrap them in custom divs, just output semantic tags.
6. NO SEMANTIC REPETITION: Every paragraph and section must add NEW information. Do not repeat the same idea multiple ways. Do not blindly follow the source article's narrative flow; independently structure the facts.
7. BAN LIST (CRITICAL): Never use the following phrases or concepts: "According to our research", "The AI found", "undefined", "[SOURCE]", "Quality score", "Visit the official site for details", "Written by". Do NOT expose any internal template variables in the text.
8. LENGTH REQUIREMENT: Target ${targetWords} words. Minimum ${minWords} words. Do NOT pad with generic filler. If you cannot reach the minimum length using ONLY verified facts, write as much verified fact-based content as you can; the validator will downgrade the category if needed.


Return ONLY a JSON object:
{
  "headline": "Strong, accurate sports headline",
  "seo_title": "SEO optimized sports title",
  "meta_description": "150-160 char summary",
  "summary": [
    {"label": "What happened", "text": "1-2 sentences."},
    {"label": "Why it matters", "text": "1-2 sentences."},
    {"label": "What to watch", "text": "1 sentence specific upcoming event/match."}
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
  let rawClassification = researchData.classification || category || "Football";
  
  if (rawClassification.toLowerCase().includes("irrelevant")) {
    console.log(`Article classified as irrelevant (${rawClassification}). Skipping.`);
    return {
      summary: null,
      rewritten_content: null,
      ai_meta_description: null,
      classification: "Irrelevant",
      quality_score: 0,
      headline: null,
      seo_title: null,
    };
  }

  const allowedCategories = ["Football", "Basketball", "Tennis", "Formula 1", "American Football", "General Sports"];
  let finalClassification = "Football"; // Fallback
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

  const aiPrompt = `You are an expert art director for a sports news site. 
Write a creative image generation prompt for the following sports headline: "${title}"
Classification: "${article.classification || 'Sports'}"

INSTRUCTIONS:
1. Describe a dynamic sports scene that matches the news. You MUST describe it as authentic, flat 2D retro pixel art.
2. DO NOT include any text, words, or typography in the image. The image must be completely text-free.
3. Use keywords like: AUTHENTIC 8-BIT PIXEL ART, flat 2D pixel art, retro SNES style graphics, low resolution, visible square pixels, limited color palette, sports arena aesthetic.
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
  const c = article.classification || "Sports";
  const topic = (title || c).slice(0, 80);
  return `AUTHENTIC 8-BIT PIXEL ART sports scene representing ${topic}. Flat 2D pixel art, retro SNES style graphics, low resolution, visible square pixels, limited color palette. Completely text-free, NO words, NO typography.`;
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
  { accountId: process.env.CLOUDFLARE_ACCOUNT_ID_4, token: process.env.CLOUDFLARE_API_TOKEN_4 },
  { accountId: process.env.CLOUDFLARE_ACCOUNT_ID_5, token: process.env.CLOUDFLARE_API_TOKEN_5 },
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
        const neuronsUsed = data.result?.usage?.neurons ?? "172.8";
        console.log(`🎨 Cloudflare AI (${label}) generated pixel art image (${neuronsUsed} neurons used).`);
        const rawBuffer = Buffer.from(data.result.image, "base64");
        // Convert to WebP for massive file size reduction (~500kb -> ~80kb)
        // keeping the native 1024x1024 dimensions so the pixel art stays perfectly crisp!
        return await sharp(rawBuffer)
          .webp({ quality: 80 })
          .toBuffer();
      }

      console.error(`Cloudflare AI (${label}) response had no image data.`);
    } catch (err) {
      console.error(`Cloudflare AI (${label}) failed: ${(err as Error).message}`);
    }
  }

  return null; // all accounts exhausted
}


/** Fetch an image from Gemini image generation — higher quality fallback.
 *  Rotates across all available GEMINI_KEYS to avoid per-key quota limits. */
async function generateThumbnailGemini(prompt: string): Promise<Buffer | null> {
  if (GEMINI_KEYS.length === 0) return null;

  const MODEL = "gemini-3.1-flash-image";

  for (const key of GEMINI_KEYS) {
    try {
      console.log(`🖼  Trying Gemini image gen with key ...${key.slice(-6)}`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
        }),
        signal: AbortSignal.timeout(45000),
      });

      if (response.status === 429) {
        console.warn(`⚠️ Gemini image key ...${key.slice(-6)} quota exhausted — trying next key`);
        continue;
      }

      if (!response.ok) {
        console.error(`Gemini image API (key ...${key.slice(-6)}) returned ${response.status}: ${await response.text()}`);
        continue;
      }

      const data = await response.json() as any;
      const parts = data?.candidates?.[0]?.content?.parts ?? [];
      for (const part of parts) {
        if (part?.inlineData?.data) {
          const rawBuffer = Buffer.from(part.inlineData.data, "base64");
          const webpBuffer = await sharp(rawBuffer)
            .webp({ quality: 80 })
            .toBuffer();
          console.log(`✅ Gemini image gen succeeded with key ...${key.slice(-6)}`);
          return webpBuffer;
        }
      }
      console.error(`Gemini image key ...${key.slice(-6)} response had no inlineData.`);
    } catch (err) {
      console.error(`Gemini thumbnail (key ...${key.slice(-6)}) failed: ${(err as Error).message}`);
    }
  }

  console.error("❌ All Gemini image keys exhausted.");
  return null;
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
 * Returns a categorized fallback thumbnail when live generation fails.
 * Searches tags in backup_thumbnails.json, and if no tag matches,
 * hashes the title to select among 30+ diverse categories so different articles never get the same image.
 */
// Pixel art .webp category files served statically from /public/backup_thumbnails/
const PIXEL_ART_CATEGORIES: Record<string, string[]> = {
  football:          ["football", "soccer", "premier league", "champions league", "la liga", "serie a", "bundesliga", "goal", "striker", "fifa", "uefa"],
  basketball:        ["basketball", "nba", "hoops", "lakers", "celtics", "warriors", "lebron", "curry"],
  tennis:            ["tennis", "wimbledon", "atp", "wta", "djokovic", "alcaraz", "sinner", "grand slam"],
  formula1:          ["formula 1", "f1", "grand prix", "verstappen", "hamilton", "racing", "ferrari", "mercedes", "red bull"],
  american_football: ["nfl", "touchdown", "quarterback", "super bowl", "chiefs", "eagles", "mahomes"],
  general_sports:    ["sport", "athlete", "championship", "tournament", "olympics", "coach", "manager"],
};

// Map sports categories to available backup static .webp files
const SPORTS_FILE_MAP: Record<string, string> = {
  football: "altcoins",
  basketball: "ethereum",
  tennis: "bitcoin",
  formula1: "layer2",
  american_football: "market_bull",
  general_sports: "adoption",
};

export function getCategoryFallbackImage(category?: string | null): string {
  const cat = (category || "").toLowerCase();
  if (cat.includes("foot") || cat.includes("soccer")) return "/images/sports/football.svg";
  if (cat.includes("basket") || cat.includes("nba")) return "/images/sports/basketball.svg";
  if (cat.includes("tennis")) return "/images/sports/tennis.svg";
  if (cat.includes("formula") || cat.includes("f1")) return "/images/sports/formula1.svg";
  if (cat.includes("american") || cat.includes("nfl")) return "/images/sports/american_football.svg";
  return "/images/sports/general_sports.svg";
}

async function getFallbackThumbnail(
  title?: string | null,
  headline?: string | null,
  classification?: string | null
): Promise<string> {
  const fallback = getCategoryFallbackImage(classification || title);
  console.log(`ℹ️ Selected sports fallback: "${classification}" → ${fallback}`);
  return fallback;
}

/**
 * Full thumbnail generation orchestrator.
 * Tries Cloudflare first, falls back to Pollinations / Gemini, uploads to ImgBB / Catbox.
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
  
  console.log("🎨 Generating thumbnail via Cloudflare Workers AI (FLUX-1-Schnell)...");
  imageBuffer = await generateThumbnailCloudflare(prompt);

  if (!imageBuffer) {
    console.error("❌ Cloudflare thumbnail generation failed (accounts exhausted or rate-limited).");
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
  const { data, error } = await supabase.from("articles").select("id, title");
  if (error) {
    console.error("Supabase getProcessedIds error:", error.message);
    return new Set();
  }
  // Include both article IDs and normalized titles so near-duplicate titles are caught
  const ids = new Set<string>();
  for (const r of data || []) {
    ids.add(r.id);
    // Add normalized title as a dedupe key (lowercase, stripped punctuation)
    if (r.title) {
      const normalizedTitle = r.title.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
      ids.add(`title::${normalizedTitle}`);
    }
  }
  return ids;
}

const SPORTS_CLASSIFICATIONS = [
  "Football",
  "Basketball",
  "Tennis",
  "Formula 1",
  "American Football",
  "General Sports"
];

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
        (a: any) => a.quality_score && a.quality_score >= 70 && SPORTS_CLASSIFICATIONS.includes(a.classification)
      );
    } catch {
      return [];
    }
  }
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .in("classification", SPORTS_CLASSIFICATIONS)
    .gte("quality_score", 70)
    .order("pub_date", { ascending: false })
    .limit(500);
  if (error) {
    console.error("Supabase getPublishedArticles error:", error.message);
    return [];
  }
  // Filter for substantive full articles only and upgrade image resolution
  return (data || [])
    .filter((row: any) => {
      // Must have substantive full article text
      const text = (row.rewritten_content || "").replace(/<[^>]*>?/gm, " ").trim();
      if (text.length < 400) return false;
      // Must have a real image (not null, empty, or SVG fallback)
      const img = (row.image_url || "").trim();
      if (!img || img.startsWith("/images/sports/")) return false;
      return true;
    })
    .map((row: any) => ({
      article_id: row.id,
      title: row.title,
      link: row.link,
      description: row.description,
      pubDate: row.pub_date,
      image_url: upgradeImageUrl(row.image_url, row.classification) || getCategoryFallbackImage(row.classification),
      source_id: row.source_id,
      headline: row.headline,
      seo_title: row.seo_title,
      ai_meta_description: row.ai_meta_description,
      rewritten_content: row.rewritten_content,
      ai_summary: row.ai_summary,
      classification: row.classification,
      quality_score: row.quality_score,
      related_sources: row.related_sources,
      category: row.category || ["News"],
    }));
}

async function saveArticleToDB(article: any): Promise<void> {
  const record = {
    id: article.article_id,
    title: article.title,
    link: article.link,
    description: article.description,
    pub_date: article.pubDate ? new Date(article.pubDate).toISOString() : new Date().toISOString(),
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

// 1 CF account = 10,000 neurons / 172.8 neurons/image ≈ 57 pixel art images/day.
// With 4 active accounts (~228 images/day capacity), 50 articles/day comfortably covers all breaking news.
const DAILY_LIMIT = parseInt(process.env.DAILY_LIMIT || "50", 10);
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  },
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
      ["content:encoded", "contentEncoded"],
    ],
  },
});

const RSS_SOURCES = [
  // ── Football / Soccer ──
  { id: "bbc_football", name: "BBC Football", url: "https://feeds.bbci.co.uk/sport/football/rss.xml" },
  { id: "guardian_football", name: "The Guardian Football", url: "https://www.theguardian.com/football/rss" },
  { id: "skysports_football", name: "Sky Sports Football", url: "https://www.skysports.com/rss/11095" },
  { id: "skysports_pl", name: "Sky Sports Premier League", url: "https://www.skysports.com/rss/11661" },
  { id: "skysports_transfer", name: "Sky Sports Transfer News", url: "https://www.skysports.com/rss/12010" },
  { id: "marca_en", name: "Marca Football", url: "https://e00-marca.uecdn.es/rss/en/football.xml" },
  { id: "cbs_soccer", name: "CBS Sports Soccer", url: "https://www.cbssports.com/rss/headlines/soccer/" },
  { id: "espn_soccer", name: "ESPN Soccer", url: "https://www.espn.com/espn/rss/soccer/news" },

  // ── Basketball / NBA ──
  { id: "espn_nba", name: "ESPN NBA", url: "https://www.espn.com/espn/rss/nba/news" },
  { id: "cbs_nba", name: "CBS Sports NBA", url: "https://www.cbssports.com/rss/headlines/nba/" },

  // ── Formula 1 ──
  { id: "skysports_f1", name: "Sky Sports F1", url: "https://www.skysports.com/rss/12433" },
  { id: "espn_f1", name: "ESPN F1", url: "https://www.espn.com/espn/rss/f1/news" },
  { id: "bbc_formula1", name: "BBC Formula 1", url: "https://feeds.bbci.co.uk/sport/formula1/rss.xml" },
  { id: "guardian_f1", name: "The Guardian F1", url: "https://www.theguardian.com/sport/formulaone/rss" },

  // ── Tennis ──
  { id: "skysports_tennis", name: "Sky Sports Tennis", url: "https://www.skysports.com/rss/12110" },
  { id: "espn_tennis", name: "ESPN Tennis", url: "https://www.espn.com/espn/rss/tennis/news" },
  { id: "bbc_tennis", name: "BBC Tennis", url: "https://feeds.bbci.co.uk/sport/tennis/rss.xml" },
  { id: "guardian_tennis", name: "The Guardian Tennis", url: "https://www.theguardian.com/sport/tennis/rss" },

  // ── American Football (NFL) ──
  { id: "cbs_nfl", name: "CBS Sports NFL", url: "https://www.cbssports.com/rss/headlines/nfl/" },

  // ── General Sports ──
  { id: "bbc_sport", name: "BBC Sport", url: "https://feeds.bbci.co.uk/sport/rss.xml" },
  { id: "guardian_sport", name: "The Guardian Sport", url: "https://www.theguardian.com/sport/rss" },
];

// ─── RSS Fetching (no AI — pure data collection) ─────────────────────────────
export async function fetchRSSArticles(): Promise<any[]> {
  const allArticles: any[] = [];

  for (const source of RSS_SOURCES) {
    try {
      let feed: any;
      try {
        const resp = await fetch(source.url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          }
        });
        if (!resp.ok) continue;
        const xml = await resp.text();
        feed = await parser.parseString(xml);
      } catch {
        feed = await parser.parseURL(source.url);
      }
      if (!feed || !feed.items) continue;
      
      for (const item of feed.items) {
        // Yield to the event loop between articles so Express can handle requests
        await new Promise(r => setImmediate(r));

        const cleanTitle = (item.title || "").replace(/\s+/g, " ").trim();
        if (!cleanTitle || cleanTitle.length < 5) continue;

        const itemLink = String(item.link || "").trim();
        const lowerLink = itemLink.toLowerCase();
        const lowerTitle = cleanTitle.toLowerCase();

        // 1. Skip Live Blogs (they are fragmented timestamp updates, not standard articles)
        const isLiveBlog = 
          lowerTitle.endsWith(" live!") ||
          lowerTitle.endsWith(" live") ||
          lowerTitle.includes("– live") ||
          lowerTitle.includes("- live") ||
          lowerTitle.includes("live updates") ||
          lowerTitle.includes("live score") ||
          lowerLink.includes("/live/") ||
          lowerLink.includes("/live-blog/") ||
          lowerLink.includes("/live-updates/");
        if (isLiveBlog) continue;

        let imageUrl: string | null = null;
        const mediaList: any[] = [];
        if (Array.isArray(item.mediaContent)) mediaList.push(...item.mediaContent);
        else if (item.mediaContent) mediaList.push(item.mediaContent);

        if (Array.isArray((item as any).mediaThumbnail)) mediaList.push(...(item as any).mediaThumbnail);
        else if ((item as any).mediaThumbnail) mediaList.push((item as any).mediaThumbnail);

        if (mediaList.length > 0) {
          // Guardian: choose media:content with width ~460-1000 without logo overlay
          if (source.id.includes("guardian") || itemLink.includes("theguardian.com")) {
            const gMatch = mediaList.find((m) => {
              const w = parseInt(m?.$?.width || "0", 10);
              return w >= 460 && w <= 1000;
            });
            if (gMatch?.$?.url) imageUrl = gMatch.$.url;
          }

          // Pick largest width available
          if (!imageUrl) {
            let maxWidth = -1;
            for (const m of mediaList) {
              const url = m?.$?.url;
              const w = parseInt(m?.$?.width || "0", 10);
              if (url && w > maxWidth) {
                maxWidth = w;
                imageUrl = url;
              }
            }
            if (!imageUrl && mediaList[0]?.$?.url) {
              imageUrl = mediaList[0].$.url;
            }
          }
        }

        if (!imageUrl) {
          if (item.enclosure && item.enclosure.url) {
            imageUrl = item.enclosure.url;
          } else if ((item as any).image && (item as any).image.url) {
            imageUrl = (item as any).image.url;
          } else if ((item as any).contentEncoded) {
            const imgMatch = (item as any).contentEncoded.match(/<img[^>]+src=["']([^"']+)["']/i);
            if (imgMatch) imageUrl = imgMatch[1];
          } else if (item.content) {
            const imgMatch = item.content.match(/<img[^>]+src=["']([^"']+)["']/i);
            if (imgMatch) imageUrl = imgMatch[1];
          } else if ((item as any).description) {
            const imgMatch = String((item as any).description).match(/<img[^>]+src=["']([^"']+)["']/i);
            if (imgMatch) imageUrl = imgMatch[1];
          }
        }

        let rawDescription = String(
          item.contentSnippet ||
            (item as any).snippet ||
            (item as any).description ||
            ""
        );
        let cleanDescription = rawDescription.replace(/<\/?[^>]+(>|$)/g, " ");
        cleanDescription = cleanDescription
          .replace(/The post.*?appeared first on.*?\.?/gi, "")
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .replace(/\s+/g, " ")
          .trim();

        let rawContent = String((item as any).contentEncoded || item.content || "");
        rawContent = rawContent
          .replace(/<p>The post[\s\S]*?appeared first on[\s\S]*?<\/p>/gi, "")
          .trim();

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

        // 2. Strict Exclusion Filter: Crypto & Betting/Gambling content
        const excludeKeywords = [
          // Crypto / blockchain
          "cryptocurrency", "bitcoin", "ethereum", "defi", "altcoin", "nft", "blockchain",
          "tokenomics", "binance", "coinbase", "satoshi",
          // Betting / gambling / picks / promos
          "fanduel", "draftkings", "betmgm", "kalshi", "caesars", "pointsbet", "betrivers",
          "promo code", "bonus bets", "free bets", "deposit bonus", "sportsbook",
          "sports betting", "betting odds", "moneyline", "point spread", "over/under",
          "parlay", "teaser bet", "prop bet", "best bets", "picks and predictions",
          "picks:", "odds, picks", "betting preview", "gambling", "online casino",
          "legal betting", "betting promos", "banned for betting", "betting on"
        ];
        const textToCheck = (lowerTitle + " " + cleanDescription.toLowerCase() + " " + lowerLink);
        const isExcluded = excludeKeywords.some((kw) => textToCheck.includes(kw));
        if (isExcluded) continue;

        // 72-hour cutoff so fresh sports stories are fetched immediately
        const rawPubDate = item.isoDate || item.pubDate;
        const pubDateMs = new Date(rawPubDate).getTime();
        const cutoffTime = Date.now() - 72 * 60 * 60 * 1000;
        if (!pubDateMs || isNaN(pubDateMs) || pubDateMs < cutoffTime) {
          continue;
        }
        if (pubDateMs > Date.now() + 10 * 60 * 1000) {
          continue; // Discard invalid future timestamps
        }

        allArticles.push({
          article_id: Buffer.from(
            String(itemLink || item.guid || `${source.id}-${cleanTitle}`)
          ).toString("base64"),
          title: cleanTitle,
          link: itemLink,
          description: cleanDescription,
          content: rawContent,
          pubDate: rawPubDate,
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
      if (timeDiff > 12 * 60 * 60 * 1000) continue;
      if (calculateSimilarity(article.title, group.primary.title) > 0.3) {
        group.related.push(article);
        // If this article is newer than the current primary, promote it so newest headline & pubDate lead
        if (new Date(article.pubDate).getTime() > new Date(group.primary.pubDate).getTime()) {
          group.primary = article;
        }
        foundGroup = true;
        break;
      }
    }
    if (!foundGroup) groupedEvents.push({ primary: article, related: [] });
  }

  // Sort groupedEvents strictly by freshness (newest pubDate descending): breaking news is always processed first!
  groupedEvents.sort((a, b) => {
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

function upgradeImageUrl(url: string | null | undefined, classification?: string): string | null {
  if (!url) return null;
  let upgraded = url.trim();

  // If already a local SVG fallback, return as is
  if (upgraded.startsWith("/images/sports/")) return upgraded;

  // The Guardian: Fastly CDN uses signed HMAC hashes (&s=...).
  // NEVER modify ANY query parameter on i.guim.co.uk URLs — doing so invalidates the signature and causes 401 Unauthorized!
  if (upgraded.includes("i.guim.co.uk")) {
    if (upgraded.includes("height=630") && upgraded.includes("width=140")) {
      upgraded = upgraded.replace("width=140", "width=1200");
    }
    return upgraded;
  }

  // BBC Sport: replace /standard/240/ with /standard/976/ (supported high-res resolution)
  if (upgraded.includes("ichef.bbci.co.uk")) {
    // If it was previously corrupted with branded_sport/1200/cpsprodpb/1200, fix it
    if (upgraded.includes("/branded_sport/1200/cpsprodpb/1200/")) {
      upgraded = upgraded.replace("/branded_sport/1200/cpsprodpb/1200/", "/standard/976/cpsprodpb/");
    }
    upgraded = upgraded.replace(/\/standard\/\d+\//, "/standard/976/");
    return upgraded;
  }

  // Sky Sports: upgrade resolution to 1920x1080
  if (upgraded.includes("365dm.com")) {
    upgraded = upgraded.replace(/\/\d+x\d+\//, "/1920x1080/");
  }

  // ESPN: upgrade width & height
  if (upgraded.includes("espncdn.com") || upgraded.includes("espn.com")) {
    upgraded = upgraded.replace(/w=\d+/, "w=1200").replace(/h=\d+/, "h=675");
  }

  // CBS Sports: upgrade thumbnail resolution to 1200x675
  if (upgraded.includes("cbsistatic.com")) {
    upgraded = upgraded.replace(/thumbnail\/\d+x\d+\//, "thumbnail/1200x675/");
  }

  return upgraded;
}

async function scrapeFullArticle(url: string): Promise<{ contentHtml: string; words: number; highResImage: string | null } | null> {
  try {
    const cleanUrl = url.trim();
    if (!cleanUrl.startsWith("http")) return null;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const resp = await fetch(cleanUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    });
    clearTimeout(timeout);
    if (!resp.ok) return null;
    const html = await resp.text();
    const dom = new JSDOM(html, { url: cleanUrl });
    const doc = dom.window.document;

    // High-resolution image extraction from OpenGraph / Twitter meta tags
    const ogImg = doc.querySelector("meta[property=\"og:image\"]")?.getAttribute("content")
      || doc.querySelector("meta[name=\"twitter:image\"]")?.getAttribute("content")
      || doc.querySelector("meta[property=\"twitter:image\"]")?.getAttribute("content");

    // Remove video players, interactive widgets, social buttons, ad containers before Readability
    const selectorsToRemove = [
      "script", "style", "noscript", "iframe", "svg",
      ".ad", ".ads", ".advertisement", ".sponsored",
      ".social-share", ".share-bar", ".newsletter-signup",
      ".video-player", ".video-container", ".embedded-video",
      ".related-links", ".more-on-this-story", ".inline-ad",
      "[id*='EmailSignup']", "[href*='EmailSignup']", "[href*='privacy-options']",
      "aside", "header", "footer", "nav"
    ];
    selectorsToRemove.forEach((sel) => {
      doc.querySelectorAll(sel).forEach((el) => el.remove());
    });

    const reader = new Readability(doc);
    const parsed = reader.parse();
    if (!parsed || !parsed.content) return null;

    const words = parsed.textContent ? parsed.textContent.split(/\s+/).filter(Boolean).length : 0;
    if (words < 70) return null;

    let cleanHtml = sanitizeHtml(parsed.content, {
      allowedTags: ["p", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "strong", "b", "em", "i", "blockquote", "br", "img", "figure", "figcaption", "table", "thead", "tbody", "tr", "th", "td"],
      allowedAttributes: {
        img: ["src", "alt", "width", "height", "loading"]
      },
      exclusiveFilter: (frame) => frame.tag === "p" && !frame.text.trim()
    });

    // ── Normalization: Standardize headings across sources ──
    // Replace <h1> with <h2> so there is only one H1 on the page (the article headline)
    cleanHtml = cleanHtml.replace(/<h1\b[^>]*>/gi, "<h2>").replace(/<\/h1>/gi, "</h2>");
    cleanHtml = cleanHtml.replace(/<h[456]\b[^>]*>/gi, "<h3>").replace(/<\/h[456]>/gi, "</h3>");

    // Remove source-specific promo lines & boilerplate
    const promoPhrases = [
      /Follow live text commentary.*?(?:<\/p>|$)/gi,
      /Download the (?:BBC Sport|Sky Sports|CBS Sports) app.*?(?:<\/p>|$)/gi,
      /Listen (?:to the latest|on BBC Sounds).*?(?:<\/p>|$)/gi,
      /Sign up to (?:our|the) (?:daily |weekly )?sports? newsletter.*?(?:<\/p>|$)/gi,
      /Watch live on (?:Sky Sports|TNT Sports).*?(?:<\/p>|$)/gi,
      /Stream on Paramount\+.*?(?:<\/p>|$)/gi,
      /Get Sky Sports or stream with NOW.*?(?:<\/p>|$)/gi,
      /Join our (?:WhatsApp|Telegram) channel.*?(?:<\/p>|$)/gi
    ];
    for (const phrase of promoPhrases) {
      cleanHtml = cleanHtml.replace(phrase, "");
    }

    // Upgrade inline image resolution
    cleanHtml = cleanHtml.replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, (match, src) => {
      const upgraded = upgradeImageUrl(src);
      return upgraded ? match.replace(src, upgraded) : match;
    });

    // Remove empty paragraphs & collapse excessive whitespace
    cleanHtml = cleanHtml.replace(/<p>\s*(&nbsp;|<br\s*\/?>)*\s*<\/p>/gi, "");
    cleanHtml = cleanHtml.replace(/\n\s*\n/g, "\n");
    cleanHtml = cleanHtml.trim();

    return {
      contentHtml: cleanHtml,
      words,
      highResImage: upgradeImageUrl(ogImg)
    };
  } catch {
    return null;
  }
}

function inferSportsCategory(
  sourceId: string,
  title: string,
  description: string,
  categories: string[] = []
): string {
  const src = sourceId.toLowerCase();
  const combined = `${title} ${description} ${categories.join(" ")}`.toLowerCase();

  // ── STEP 1: Rugby (union and league) ──
  const isRugby =
    combined.includes("rugby union") || combined.includes("rugby league") || combined.includes("six nations") ||
    combined.includes("springboks") || combined.includes("all blacks") || combined.includes("lions tour") ||
    combined.includes("nations championship") || combined.includes("rugby world cup") ||
    (combined.includes("rugby") && !combined.includes("rugby player arrested"));
  if (isRugby) return "Rugby";

  // ── STEP 1b: Horse Racing ──
  const isHorseRacing =
    combined.includes("jockey") || combined.includes("horse racing") || combined.includes("plumpton") ||
    combined.includes("cheltenham") || combined.includes("grand national") || combined.includes("ascot") ||
    combined.includes("de boinville");
  if (isHorseRacing) return "Horse Racing";

  // ── STEP 1c: Other General Sports ──
  const isOtherSport =
    combined.includes("cricket") || combined.includes(" ipl ") || combined.includes("test match") ||
    combined.includes("ashes ") || combined.includes("county cricket") ||
    combined.includes("pga tour") || combined.includes(" golf ") || combined.includes("tiger woods") ||
    combined.includes("the masters") || combined.includes("open championship") || combined.includes("ryder cup") ||
    combined.includes("boxing") || combined.includes(" ufc ") || combined.includes(" mma ") ||
    combined.includes("vitality roses") || combined.includes("netball") || combined.includes("darts") ||
    combined.includes("snooker") || combined.includes("olympic") || combined.includes("triathlon");
  if (isOtherSport) return "General Sports";

  // ── STEP 2: American Football — keyword match BEFORE source-pin to prevent NFL in NBA feed ──
  const isNFL =
    combined.includes(" nfl ") || combined.includes("nfl draft") || combined.includes("nfl week") ||
    combined.includes("nfl playoff") || combined.includes("nfl season") || combined.includes("nfl mock") ||
    combined.includes("nfl schedule") || combined.includes("nfl trade") || combined.includes("nfl power ranking") ||
    combined.includes("nfl coaching") || combined.includes("nfl pick") || combined.includes("nfl grade") ||
    combined.includes("super bowl") || combined.includes("monday night football") || combined.includes("sunday night football") ||
    combined.includes("college football") || combined.includes("quarterback") ||
    combined.includes("wide receiver") || combined.includes("tight end") ||
    combined.includes("running back") || combined.includes("linebacker") || combined.includes("cornerback") ||
    (combined.includes("touchdown") && !combined.includes("premier league") && !combined.includes("soccer")) ||
    // NFL-specific player names
    combined.includes("patrick mahomes") || combined.includes("lamar jackson") ||
    combined.includes("joe burrow") || combined.includes("josh allen") || combined.includes("travis kelce") ||
    combined.includes("justin jefferson") || combined.includes("brock purdy") ||
    combined.includes("dak prescott") || combined.includes("jalen hurts") || combined.includes("tua tagovailoa") ||
    combined.includes("derrick henry") || combined.includes("aidan hutchinson") || combined.includes("sam darnold") ||
    combined.includes("drew lock") || combined.includes("ben earl") ||
    // NFL-specific team references (avoid ambiguous words like "chiefs" alone)
    combined.includes("49ers") || combined.includes("seahawks") || combined.includes("bengals") ||
    combined.includes("steelers") || combined.includes("packers") || combined.includes("buccaneers") ||
    combined.includes("chargers ") || combined.includes("ravens ") || combined.includes("bills ") ||
    combined.includes("cowboys ") || combined.includes("colts ") || combined.includes("texans ") ||
    combined.includes("jaguars") || combined.includes("titans ") || combined.includes("raiders ") ||
    combined.includes("eagles ") || combined.includes("giants ") || combined.includes("jets ") ||
    combined.includes("lions ") || combined.includes("bears ") || combined.includes("vikings ") ||
    combined.includes("rams ") || combined.includes("cardinals ") || combined.includes("falcons ") ||
    combined.includes("panthers ") || combined.includes("saints ") || combined.includes("broncos ");
  if (isNFL) return "American Football";

  // ── STEP 3: Formula 1 — BEFORE generic source-pin; "hamilton" alone is NOT safe (Lamar Jackson) ──
  const isF1 =
    combined.includes("formula 1") || combined.includes("formula1") ||
    (combined.includes(" f1 ") && !combined.includes("nfl")) ||
    combined.includes("grand prix") || combined.includes("las vegas gp") || combined.includes("monaco gp") ||
    combined.includes("verstappen") || combined.includes("max verstappen") ||
    combined.includes("lewis hamilton") || combined.includes("george russell") ||
    combined.includes("lando norris") || combined.includes("charles leclerc") ||
    combined.includes("carlos sainz") || combined.includes("sergio perez") ||
    combined.includes("mclaren f1") || combined.includes("red bull racing") ||
    combined.includes("mercedes amg") || combined.includes("haas f1") || combined.includes("alpine f1") ||
    combined.includes("aston martin f1") || combined.includes("williams f1") ||
    combined.includes("pit stop") || combined.includes("pole position") || combined.includes("fastest lap") ||
    combined.includes("safety car") || combined.includes("power unit") ||
    combined.includes("fia ") || combined.includes("race steward") || combined.includes("race director");
  if (isF1) return "Formula 1";

  // Source-pin for dedicated F1 feeds (only reached if no other sport detected)
  if (src.includes("sky sports f1") || src.includes("espn f1") || src.includes("bbc formula") ||
      src.includes("guardian f1") || src.includes("espn_f1") || src.includes("bbc_formula1") ||
      src.includes("skysports_f1") || src.includes("guardian_f1")) return "Formula 1";

  // ── STEP 4: Tennis ──
  const isTennis =
    combined.includes("tennis") || combined.includes("wimbledon") ||
    combined.includes(" atp ") || combined.includes(" wta ") ||
    combined.includes("roland garros") || combined.includes("us open tennis") ||
    combined.includes("australian open") || combined.includes("grand slam") ||
    combined.includes("alcaraz") || combined.includes("jannik sinner") ||
    combined.includes("djokovic") || combined.includes("novak djokovic") ||
    combined.includes("serena williams") || combined.includes("rafael nadal") ||
    combined.includes("roger federer") || combined.includes("andy murray") ||
    combined.includes("emma raducanu") || combined.includes("iga swiatek") ||
    combined.includes("aryna sabalenka") || combined.includes("coco gauff") ||
    combined.includes("atp finals") || combined.includes("wta finals") || combined.includes("davis cup");
  if (isTennis) return "Tennis";

  // Source-pin for dedicated Tennis feeds
  if (src.includes("espn tennis") || src.includes("bbc tennis") || src.includes("sky sports tennis") ||
      src.includes("guardian tennis") || src.includes("espn_tennis") || src.includes("bbc_tennis") ||
      src.includes("skysports_tennis") || src.includes("guardian_tennis")) return "Tennis";

  // ── STEP 5: Basketball — keyword match BEFORE source-pin to prevent NFL in NBA source ──
  const isBasketball =
    combined.includes(" nba ") || combined.includes("basketball") ||
    combined.includes("nba draft") || combined.includes("nba finals") ||
    combined.includes("nba playoff") || combined.includes("nba season") ||
    combined.includes("nba trade") || combined.includes("nba rookie") || combined.includes("nba rankings") ||
    combined.includes("lakers") || combined.includes("celtics ") ||
    combined.includes("golden state warriors") || combined.includes("miami heat nba") ||
    combined.includes("new york knicks") || combined.includes("chicago bulls") ||
    combined.includes("lebron james") || combined.includes("stephen curry") ||
    combined.includes("kevin durant") || combined.includes("giannis") ||
    combined.includes("jayson tatum") || combined.includes("luka doncic") ||
    combined.includes("nikola jokic") || combined.includes("trae young") ||
    combined.includes("jaylen brown") || combined.includes("bam adebayo") ||
    combined.includes("three-pointer") || combined.includes("free throw") ||
    combined.includes("point guard") || combined.includes("power forward");
  if (isBasketball) return "Basketball";

  // Source-pin for dedicated NBA feeds (only after keyword checks)
  if (src.includes("espn nba") || src.includes("cbs sports nba") || src.includes("cbs_nba") ||
      src.includes("espn_nba")) return "Basketball";

  // ── STEP 6: American Football — source-pin fallback ──
  if (src.includes("cbs sports nfl") || src.includes("cbs_nfl")) return "American Football";

  // ── STEP 7: Football (Soccer) ──
  const isFootball =
    combined.includes("premier league") || combined.includes("champions league") ||
    combined.includes("la liga") || combined.includes("serie a") ||
    combined.includes("bundesliga") || combined.includes("ligue 1") ||
    combined.includes("uefa ") || combined.includes(" fifa ") ||
    combined.includes("soccer") || combined.includes("nwsl") ||
    combined.includes("usmnt") || combined.includes("uswnt") ||
    combined.includes("transfer window") || combined.includes("transfer fee") ||
    combined.includes("world cup qualifier") || combined.includes("afcon") ||
    combined.includes("arsenal") || combined.includes("liverpool") ||
    combined.includes("manchester united") || combined.includes("man utd") ||
    combined.includes("manchester city") || combined.includes("man city") ||
    combined.includes("chelsea fc") || combined.includes("tottenham") ||
    combined.includes("real madrid") || combined.includes("barcelona") ||
    combined.includes("atletico madrid") || combined.includes("juventus") ||
    combined.includes("inter milan") || combined.includes("ac milan") ||
    combined.includes("borussia dortmund") || combined.includes("bayern munich") ||
    combined.includes("psg ") || combined.includes("paris saint-germain");

  const isFootballSource =
    src.includes("bbc football") || src.includes("guardian football") ||
    src.includes("sky sports football") || src.includes("sky sports premier league") ||
    src.includes("sky sports transfer") || src.includes("marca") ||
    src.includes("cbs sports soccer") || src.includes("espn soccer") ||
    src.includes("bbc_football") || src.includes("guardian_football") ||
    src.includes("skysports_football") || src.includes("skysports_pl") ||
    src.includes("skysports_transfer") || src.includes("cbs_soccer") ||
    src.includes("espn_soccer") || src.includes("marca_en");

  if (isFootball || isFootballSource) return "Football";

  return "General Sports";
}

// ─── Direct Ingestion Pipeline (called by POST /api/process and startup) ────
let processingInProgress = false;

export async function runAIPipeline(): Promise<{
  processed: number;
  skipped: number;
  quota: number;
}> {
  if (processingInProgress) {
    console.log("Pipeline already running, skipping.");
    return { processed: 0, skipped: 0, quota: 0 };
  }

  processingInProgress = true;
  let processed = 0;
  let skipped = 0;
  const MAX_ARTICLES_PER_RUN = 100;

  try {
    console.log("🔄 Starting sports news pipeline (direct ingestion from source)...");
    const articles = await fetchRSSArticles();
    const processedIds = await getProcessedIds();

    console.log(`📰 ${articles.length} sports articles fetched. ${processedIds.size} already in DB.`);

    const unreadArticles = articles.filter((a) => {
      if (processedIds.has(a.article_id)) return false;
      // Also check by normalized title to catch cross-feed duplicates
      const normalizedTitle = (a.title || "").toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
      if (normalizedTitle && processedIds.has(`title::${normalizedTitle}`)) return false;
      return true;
    });
    console.log(`✨ ${unreadArticles.length} candidate new articles to process.`);


    // Process candidate articles in concurrent batches of 4 for 4x faster ingestion speed
    const CONCURRENCY = 4;
    for (let i = 0; i < unreadArticles.length && processed < MAX_ARTICLES_PER_RUN; i += CONCURRENCY) {
      const batch = unreadArticles.slice(i, i + CONCURRENCY);
      
      await Promise.all(
        batch.map(async (article) => {
          if (processed >= MAX_ARTICLES_PER_RUN) return;

          try {
            const sportsCategory = inferSportsCategory(
              article.source_id || "",
              article.title || "",
              article.description || "",
              article.category || []
            );

            const headline = (article.title || "Sports News Update").trim();
            const seoTitle = `${headline} | Live Sports News`;
            const metaDesc = (article.description || article.title || "").slice(0, 160);

            // Fetch complete full-text article directly from source link
            let contentHtml = "";
            let highResImage: string | null = null;
            if (article.link) {
              const scraped = await scrapeFullArticle(article.link);
              if (scraped) {
                contentHtml = scraped.contentHtml;
                highResImage = scraped.highResImage;
              }
            }

            // STRICT REQUIREMENT: Article MUST have full content inside!
            const plainTextLen = contentHtml.replace(/<[^>]*>?/gm, "").trim().length;
            if (plainTextLen < 400) {
              console.log(`⏩ Dropped article without full text: "${headline.slice(0, 50)}" (${plainTextLen} chars)`);
              processedIds.add(article.article_id);
              skipped++;
              return;
            }

            if (article.source_id) {
              contentHtml += `<p class="mt-8 pt-4 border-t border-zinc-800 text-xs text-zinc-400">Originally reported by <span class="text-amber-400 font-medium">${article.source_id}</span>.</p>`;
            }

            // Key takeaways summary (instant, directly from description and source)
            const summary = [
              { label: "Overview", text: article.description || headline },
              { label: "Source", text: `Reported by ${article.source_id || "Sports News Desk"}` },
              { label: "Category", text: sportsCategory }
            ];

            // Feed image (media:content / media:thumbnail without burned-in overlays) preferred over scraped og:image
            let finalImageUrl = upgradeImageUrl(article.image_url) || highResImage;

            // STRICT REQUIREMENT: Article MUST have a real image (not an SVG placeholder)
            // SVG fallbacks are only used by the UI renderer — never stored in the DB
            if (!finalImageUrl || finalImageUrl.startsWith("/images/sports/")) {
              console.log(`⏩ Dropped article without real image: "${headline.slice(0, 50)}"`);
              processedIds.add(article.article_id);
              const normTitleDrop = headline.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
              if (normTitleDrop) processedIds.add(`title::${normTitleDrop}`);
              skipped++;
              return;
            }

            // Save directly to DB
            await saveArticleToDB({
              ...article,
              image_url: finalImageUrl,
              headline: headline,
              seo_title: seoTitle,
              ai_meta_description: metaDesc,
              rewritten_content: contentHtml,
              ai_summary: summary,
              classification: sportsCategory,
              quality_score: 95,
              research_data: null,
            });

            processedIds.add(article.article_id);
            // Also track normalized title to prevent within-run cross-feed duplicates
            const normalizedTitle = headline.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
            if (normalizedTitle) processedIds.add(`title::${normalizedTitle}`);
            processed++;
            lastFetchTime = 0; // invalidate cache so visitors see new articles immediately
            console.log(`✅ Saved sports article: "${headline.slice(0, 50)}" [${sportsCategory}]`);


            // Trigger IndexNow ping for Bing/Yandex (non-blocking)
            const articleSlug = generateSlug(headline);
            if (articleSlug) {
              const articleUrl = `${SITE_URL}/article/${articleSlug}`;
              submitToIndexNow([articleUrl, `${SITE_URL}/`, `${SITE_URL}/football-news`]).catch(() => {});

              // Auto-post to X (Twitter) via Buffer (non-blocking)
              postArticleToX(
                {
                  headline: headline,
                  title: article.title,
                  classification: sportsCategory,
                  image_url: finalImageUrl,
                  summary: summary,
                },
                articleSlug
              ).catch(() => {});
            }
          } catch (err: any) {
            console.error(`Error saving article "${article.title?.slice(0, 40)}":`, err.message);
          }
        })
      );
    }

    // Invalidate in-memory cache so next /api/news request re-reads from DB
    lastFetchTime = 0;

    console.log(`✅ Pipeline complete. Processed: ${processed}, Skipped: ${skipped}`);
    return { processed, skipped, quota: processed };
  } finally {
    processingInProgress = false;
  }
}

// ─── In-Memory Cache (short-term, for /api/news performance) ────────────────
let cachedNews: any[] = [];
let lastFetchTime = 0;
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes for rapid news freshness

// ─── Price & Fear/Greed Cache ────────────────────────────────────────────────
let cachedPrices: any = null;
let lastPriceFetchTime = 0;
const PRICE_CACHE_TTL = 2 * 60 * 1000;

let cachedFearGreed: any = null;
let lastFearGreedFetchTime = 0;
const FEAR_GREED_CACHE_TTL = 60 * 60 * 1000;

// ─── Express Server ──────────────────────────────────────────────────────────

// ─── Football & Sports Pipeline ─────────────────────────────────────────────
let footballIntelligenceInProgress = false;

async function getFootballArticles() {
  if (!supabase) return [];
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("classification", "Football")
    .gte("pub_date", twoDaysAgo)
    .order("pub_date", { ascending: false });
    
  if (error) {
    console.error("Error fetching football articles:", error.message);
    return [];
  }
  
  const rawArticles = (data || [])
    .filter((row: any) => {
      const text = (row.rewritten_content || "").replace(/<[^>]*>?/gm, " ").trim();
      return text.length >= 400;
    })
    .map((row: any) => ({
      article_id: row.id,
      title: row.title,
      headline: row.headline,
      link: row.link,
      source_id: row.source_id,
      pubDate: row.pub_date,
      image_url: upgradeImageUrl(row.image_url, row.classification) || getCategoryFallbackImage(row.classification),
      description: row.description,
      rewritten_content: row.rewritten_content,
      ai_summary: row.ai_summary,
      classification: row.classification,
      related_sources: row.related_sources || [],
      category: row.category || ["News"]
    }));

  // Deduplication / Event clustering
  const getWords = (text: string) => new Set(text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((w) => w.length > 3));
  const calculateSimilarity = (t1: string, t2: string) => {
    const w1 = getWords(t1);
    const w2 = getWords(t2);
    const intersection = new Set([...w1].filter((x) => w2.has(x)));
    const union = new Set([...w1, ...w2]);
    return union.size === 0 ? 0 : intersection.size / union.size;
  };

  const clustered: any[] = [];
  for (const article of rawArticles) {
    let foundGroup = false;
    for (const group of clustered) {
      if (calculateSimilarity(article.headline || article.title, group.headline || group.title) > 0.35) {
        const sourceExists = group.related_sources?.some((rs: any) => rs.source_id === article.source_id);
        if (!sourceExists && group.source_id !== article.source_id) {
          if (!group.related_sources) group.related_sources = [];
          group.related_sources.push({
            source_id: article.source_id,
            link: article.link,
            title: article.title
          });
        }
        foundGroup = true;
        break;
      }
    }
    if (!foundGroup) clustered.push(article);
  }

  return clustered;
}

const getBitcoinArticles = getFootballArticles;

function rankFootballArticleImportance(article: any) {
  let score = 0;
  
  // Recency
  const hoursOld = (Date.now() - new Date(article.pubDate).getTime()) / (1000 * 60 * 60);
  if (hoursOld < 4) score += 3;
  else if (hoursOld < 12) score += 2;
  else score += 1;
  
  // Coverage
  const sourceCount = (article.related_sources?.length || 0) + 1;
  score += Math.min(sourceCount * 2, 6);
  
  // Keyword signals
  const text = ((article.headline || article.title) + " " + (article.description || "")).toLowerCase();
  if (text.includes("final") || text.includes("champions league") || text.includes("transfer") || text.includes("derby")) score += 4;
  if (text.includes("goal") || text.includes("striker") || text.includes("injury")) score += 3;
  if (text.includes("manager") || text.includes("trophy") || text.includes("title")) score += 2;
  
  if (score >= 10) return "High";
  if (score >= 6) return "Medium";
  return "Low";
}

const rankBitcoinArticleImportance = rankFootballArticleImportance;

async function refreshBitcoinIntelligence() {
  cachedBtcNews = [];
  cachedBtcIntelligence = {
    quiet_market: true,
    situation_text: "Sports media coverage is live.",
    last_updated: new Date().toISOString()
  };
}

// ─── Bitcoin API Caches ──────────────────────────────────────────────────────
let cachedBtcNews: any[] = [];
let cachedBtcNewsTime = 0;
let cachedBtcIntelligence: any = null;
let cachedBtcIntelligenceTime = 0;
let cachedBtcExtended: any = null;
let cachedBtcExtendedTime = 0;


async function startServer() {
  const app = express();

// --- IN-MEMORY LOGGER ---
const _logs: string[] = [];
const origLog = console.log;
const origError = console.error;
const origWarn = console.warn;
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
console.warn = (...args) => {
  _logs.push("[WARN] " + args.join(" "));
  if (_logs.length > 200) _logs.shift();
  origWarn.apply(console, args);
};

app.get("/api/logs", (req, res) => {
  res.send(_logs.join("\n"));
});
// -------------------------

  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: '50mb' }));

  // ── GET /api/news — Read published articles from DB ──────────────────────
  
  // ── GET /api/football-news ────────────────────────────────────────────────
  app.get("/api/football-news", async (req, res) => {
    try {
      const now = Date.now();
      if (now - cachedBtcNewsTime > CACHE_TTL || cachedBtcNews.length === 0) {
        const articles = await getFootballArticles();
        cachedBtcNews = articles.map((a: any) => ({
          ...a,
          importance: rankFootballArticleImportance(a)
        })).sort((a: any, b: any) => {
          return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
        });
        cachedBtcNewsTime = now;
      }
      res.json({ status: "success", results: cachedBtcNews });
    } catch (error) {
      console.error("Error fetching football news:", error);
      res.status(500).json({ error: "Failed to fetch football news" });
    }
  });

  // ── GET /api/bitcoin-news (Redirect/alias to football-news) ─────────────────
  app.get("/api/bitcoin-news", async (req, res) => {
    try {
      const now = Date.now();
      if (now - cachedBtcNewsTime > CACHE_TTL || cachedBtcNews.length === 0) {
        const articles = await getFootballArticles();
        cachedBtcNews = articles.map((a: any) => ({
          ...a,
          importance: rankFootballArticleImportance(a)
        })).sort((a: any, b: any) => {
          return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
        });
        cachedBtcNewsTime = now;
      }
      res.json({ status: "success", results: cachedBtcNews });
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  // ── GET /api/bitcoin-intelligence ─────────────────────────────────────────
  app.get("/api/bitcoin-intelligence", async (req, res) => {
    res.json(cachedBtcIntelligence || { quiet_market: true, situation_text: "Sports media coverage is live." });
  });

  // ── POST /api/bitcoin-intelligence/refresh ────────────────────────────────
  app.post("/api/bitcoin-intelligence/refresh", async (req, res) => {
    const secret = process.env.PROCESS_SECRET;
    const authHeader = req.headers["authorization"];
    if (secret && authHeader !== `Bearer ${secret}`) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    res.json({ status: "success", message: "Refreshed." });
  });

  // ── GET /api/btc-extended ──────────────────────────────────────────────────
  app.get("/api/btc-extended", async (req, res) => {
    res.json({});
  });

  app.get("/api/news", async (req, res) => {
    try {
      const now = Date.now();
      if (now - lastFetchTime > CACHE_TTL || cachedNews.length === 0) {
        cachedNews = await getPublishedArticles();
        lastFetchTime = now;
      }

      // If no published articles yet, automatically trigger pipeline in the background
      if (cachedNews.length === 0 && !processingInProgress) {
        console.log("ℹ️ No published articles in cache. Triggering AI pipeline in background...");
        runAIPipeline().catch((err) => console.error("Auto AI pipeline error:", err));
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
    const cleanSlug = decodeURIComponent(slug || "").toLowerCase().trim();

    // Search in-memory cache first
    const fromCache = cachedNews.find(a => {
      const headlineSlug = generateSlug(a.headline || "");
      const titleSlug = generateSlug(a.title || "");
      return headlineSlug === cleanSlug || titleSlug === cleanSlug;
    });
    if (fromCache) return res.json(fromCache);

    // Fallback: query Supabase directly
    if (supabase) {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("pub_date", { ascending: false })
        .limit(500);
      if (!error && data) {
        const match = data.find((row: any) => {
          const headlineSlug = generateSlug(row.headline || "");
          const titleSlug = generateSlug(row.title || "");
          return headlineSlug === cleanSlug || titleSlug === cleanSlug;
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
  
  // Helper to upload base64 to Catbox
  async function uploadBase64Image(base64Image: string): Promise<string> {
    const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 format');
    }
    const mimeType = matches[1];
    const imageBuffer = Buffer.from(matches[2], 'base64');
    const blob = new Blob([imageBuffer], { type: mimeType });

    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', blob, 'upload.png');

    const response = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData
    });
    const text = await response.text();
    if (text.startsWith('https://')) {
      return text.trim();
    }
    throw new Error('Upload provider error: ' + text);
  }

  // Fallback in-memory ads store if DB is disconnected
  let localAdsStore: any[] = [];

  // --- AD MANAGEMENT API ---
  app.get('/api/ads', async (req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      if (supabase) {
        const { data, error } = await supabase.from('ads').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return res.json({ status: 'success', ads: data || [] });
      }
      return res.json({ status: 'success', ads: localAdsStore });
    } catch (err: any) {
      console.error('Error fetching ads:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  });

  app.post('/api/ads', async (req, res) => {
    try {
      let { format, image_url, target_url, cta_text, active, button_color, image_base64 } = req.body;
      if (active === undefined) active = true;

      if (!image_url && image_base64) {
        try {
          image_url = await uploadBase64Image(image_base64);
        } catch (uploadErr) {
          console.warn('Failed to upload image to Catbox, falling back to base64 data URI:', uploadErr);
          image_url = image_base64;
        }
      }

      const newAd = {
        format: format || 'billboard',
        image_url: image_url || null,
        target_url: target_url || '',
        cta_text: cta_text || null,
        active: active !== false,
        button_color: button_color || 'brand'
      };

      if (supabase) {
        const { data, error } = await supabase.from('ads').insert([newAd]).select().single();
        if (error) throw error;
        return res.json({ status: 'success', ad: data });
      }

      const memoryAd = { id: 'mem_' + Date.now(), created_at: new Date().toISOString(), ...newAd };
      localAdsStore.unshift(memoryAd);
      res.json({ status: 'success', ad: memoryAd });
    } catch (err: any) {
      console.error('Error creating ad:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  });

  const handleUpdateAd = async (req: any, res: any) => {
    try {
      const { id } = req.params;
      let { format, image_url, target_url, cta_text, active, button_color, image_base64 } = req.body;

      if (!image_url && image_base64) {
        try {
          image_url = await uploadBase64Image(image_base64);
        } catch (uploadErr) {
          image_url = image_base64;
        }
      }

      const updateData: Record<string, any> = {};
      if (format !== undefined) updateData.format = format;
      if (image_url !== undefined) updateData.image_url = image_url;
      if (target_url !== undefined) updateData.target_url = target_url;
      if (cta_text !== undefined) updateData.cta_text = cta_text;
      if (active !== undefined) updateData.active = active;
      if (button_color !== undefined) updateData.button_color = button_color;

      if (supabase) {
        const { data, error } = await supabase.from('ads').update(updateData).eq('id', id).select().single();
        if (error) throw error;
        // Keep in-memory store in sync
        const idx = localAdsStore.findIndex(a => a.id === id);
        if (idx !== -1) localAdsStore[idx] = { ...localAdsStore[idx], ...updateData };
        return res.json({ status: 'success', ad: data });
      }

      const index = localAdsStore.findIndex(a => a.id === id);
      if (index !== -1) {
        localAdsStore[index] = { ...localAdsStore[index], ...updateData };
        return res.json({ status: 'success', ad: localAdsStore[index] });
      }
      res.status(404).json({ status: 'error', message: 'Ad not found' });
    } catch (err: any) {
      console.error('Error updating ad:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  };

  app.put('/api/ads/:id', handleUpdateAd);
  app.patch('/api/ads/:id', handleUpdateAd);
  app.post('/api/ads/:id', handleUpdateAd);

  app.delete('/api/ads/:id', async (req, res) => {
    try {
      const { id } = req.params;
      if (supabase) {
        const { error } = await supabase.from('ads').delete().eq('id', id);
        if (error) throw error;
        return res.json({ status: 'success', message: 'Ad deleted' });
      }
      localAdsStore = localAdsStore.filter(a => a.id !== id);
      res.json({ status: 'success', message: 'Ad deleted' });
    } catch (err: any) {
      console.error('Error deleting ad:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  });

  // Simple file upload endpoint using Catbox.moe
  app.post('/api/upload', async (req, res) => {
    try {
      const { base64Image } = req.body;
      if (!base64Image) {
        return res.status(400).json({ status: 'error', message: 'No image provided' });
      }

      const url = await uploadBase64Image(base64Image);
      res.json({ status: 'success', url });
    } catch (err: any) {
      console.error('Error uploading image:', err);
      res.status(500).json({ status: 'error', message: err.message });
    }
  });
  // --- END AD MANAGEMENT API ---

  app.get("/api/prices", async (req, res) => {
    res.json({});
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
      let finalImageUrl = thumbnailUrl;
      if (!finalImageUrl) {
        finalImageUrl = await getFallbackThumbnail(
          mockArticle.title,
          aiResult.headline,
          aiResult.classification
        );
      }
      res.json({
        success: true,
        headline: aiResult.headline,
        classification: aiResult.classification,
        quality_score: aiResult.quality_score,
        image_url: finalImageUrl,
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

  // ── GET /api/test-x — Test posting latest article to X via Buffer ───────────
  app.get("/api/test-x", async (req, res) => {
    try {
      if (!cachedNews || cachedNews.length === 0) {
        cachedNews = await getPublishedArticles();
      }
      const latestArticle = cachedNews?.[0];
      if (!latestArticle) {
        return res.status(404).json({ success: false, error: "No articles found in database" });
      }
      const slug = generateSlug(latestArticle.headline || latestArticle.title);
      const result = await postArticleToX(latestArticle, slug);
      res.json({
        success: result.success,
        article: {
          title: latestArticle.headline || latestArticle.title,
          slug,
        },
        result,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // ── GET /api/fear-greed ───────────────────────────────────────────────────
  app.get("/api/fear-greed", async (req, res) => {
    res.json({ value: null, value_classification: "Unknown" });
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

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      xml += `  <url>\n    <loc>${baseUrl}/</loc>\n    <changefreq>hourly</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

      // Add sports categories to sitemap
      xml += `  <url>\n    <loc>${baseUrl}/football-news</loc>\n    <changefreq>hourly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
      xml += `  <url>\n    <loc>${baseUrl}/news/football</loc>\n    <changefreq>hourly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
      xml += `  <url>\n    <loc>${baseUrl}/news/basketball</loc>\n    <changefreq>hourly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      xml += `  <url>\n    <loc>${baseUrl}/news/tennis</loc>\n    <changefreq>hourly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      xml += `  <url>\n    <loc>${baseUrl}/news/formula1</loc>\n    <changefreq>hourly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;

      for (const article of cachedNews) {
        const slug = generateSlug(article.headline || article.title);
        if (!slug) continue;
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

  // ── GET /rss.xml & /feed.xml ────────────────────────────────────────────────
  const escapeXml = (str: string): string => {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  app.get(["/rss.xml", "/feed.xml", "/rss", "/feed"], async (req, res) => {
    try {
      const protocol = req.headers["x-forwarded-proto"] || req.protocol;
      const host = req.headers.host;
      const baseUrl = `${protocol}://${host}`;

      const now = Date.now();
      if (now - lastFetchTime > CACHE_TTL || cachedNews.length === 0) {
        cachedNews = await getPublishedArticles();
        lastFetchTime = now;
      }

      const buildDate = new Date().toUTCString();

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">\n`;
      xml += `  <channel>\n`;
      xml += `    <title>Sports News | Football, Basketball, F1 &amp; Live Sports Coverage</title>\n`;
      xml += `    <link>${baseUrl}</link>\n`;
      xml += `    <description>Latest breaking sports news, football headlines, match updates, transfers, and in-depth analysis.</description>\n`;
      xml += `    <language>en-us</language>\n`;
      xml += `    <lastBuildDate>${buildDate}</lastBuildDate>\n`;
      xml += `    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>\n`;

      for (const article of cachedNews) {
        const slug = generateSlug(article.headline || article.title);
        if (!slug) continue;
        const articleUrl = `${baseUrl}/article/${slug}`;
        const title = escapeXml(article.headline || article.title || "");
        const pubDate = new Date(article.pubDate || Date.now()).toUTCString();
        const description = escapeXml(
          article.ai_meta_description ||
          (Array.isArray(article.ai_summary) ? article.ai_summary.map((s: any) => s.text).join(" ") : article.ai_summary) ||
          article.description ||
          ""
        );
        const category = escapeXml(
          article.classification ||
          (Array.isArray(article.category) ? article.category[0] : article.category) ||
          "Crypto"
        );
        const imageUrl = article.image_url ? escapeXml(article.image_url) : "";

        xml += `    <item>\n`;
        xml += `      <title>${title}</title>\n`;
        xml += `      <link>${articleUrl}</link>\n`;
        xml += `      <guid isPermaLink="true">${articleUrl}</guid>\n`;
        xml += `      <pubDate>${pubDate}</pubDate>\n`;
        xml += `      <description>${description}</description>\n`;
        xml += `      <category>${category}</category>\n`;
        if (imageUrl) {
          xml += `      <enclosure url="${imageUrl}" type="image/jpeg" length="0"/>\n`;
          xml += `      <media:content url="${imageUrl}" medium="image"/>\n`;
        }
        xml += `    </item>\n`;
      }

      xml += `  </channel>\n`;
      xml += `</rss>`;

      res.header("Content-Type", "application/xml; charset=utf-8");
      res.send(xml);
    } catch (error) {
      console.error("Error generating RSS feed:", error);
      res.status(500).send("Error generating RSS feed");
    }
  });

  // ── GET /robots.txt ───────────────────────────────────────────────────────
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  });

  // ── IndexNow Key Verification Route ────────────────────────────────────────
  // Bing / IndexNow crawlers check https://<host>/<key>.txt to verify domain ownership
  app.get(`/${INDEXNOW_KEY}.txt`, (req, res) => {
    res.type("text/plain");
    res.send(INDEXNOW_KEY);
  });
  app.get("/:key([a-f0-9]{32}).txt", (req, res, next) => {
    if (req.params.key === INDEXNOW_KEY) {
      res.type("text/plain");
      return res.send(INDEXNOW_KEY);
    }
    next();
  });

  // ── POST /api/seo/indexnow ─────────────────────────────────────────────────
  // Allows manual or bulk submission of URLs to IndexNow
  app.post("/api/seo/indexnow", async (req, res) => {
    try {
      const secret = req.headers["x-process-secret"] || req.query.secret;
      const configuredSecret = process.env.PROCESS_SECRET;
      if (configuredSecret && secret !== configuredSecret) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { urls, bulkAll } = req.body || {};
      let targetUrls: string[] = [];

      if (bulkAll) {
        const articles = await getPublishedArticles();
        targetUrls = [
          `${SITE_URL}/`,
          `${SITE_URL}/football-news`,
          `${SITE_URL}/news/football`,
          `${SITE_URL}/news/basketball`,
          `${SITE_URL}/news/tennis`,
          `${SITE_URL}/news/formula1`,
          ...articles.slice(0, 100).map((a) => `${SITE_URL}/article/${generateSlug(a.headline || a.title || "")}`)
        ];
      } else if (Array.isArray(urls) && urls.length > 0) {
        targetUrls = urls;
      } else {
        targetUrls = [`${SITE_URL}/`, `${SITE_URL}/football-news`];
      }

      const result = await submitToIndexNow(targetUrls);
      return res.json({
        ...result,
        submittedCount: targetUrls.length,
        urls: targetUrls.slice(0, 10),
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // ── Quiz Logo Proxy ───────────────────────────────────────────────────────
  // Fetches club badges server-side (bypasses CORS/hotlink blocks), converts
  // SVG → PNG via sharp, and caches in memory for 24 h.
  const LOGO_CACHE = new Map<string, { buf: Buffer; ct: string; ts: number }>();
  const LOGO_TTL = 24 * 60 * 60 * 1000; // 24 h

  // Wikimedia Commons direct-download URLs for each club slug
  const LOGO_URLS: Record<string, string> = {
    // ── Easy ──────────────────────────────────────────────────────────────
    'barcelona':          'https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg',
    'real-madrid':        'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
    'man-united':         'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg',
    'liverpool':          'https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg',
    'chelsea':            'https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg',
    'arsenal':            'https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg',
    'juventus':           'https://upload.wikimedia.org/wikipedia/commons/1/15/Juventus_FC_2017_logo.svg',
    'bayern':             'https://upload.wikimedia.org/wikipedia/commons/1/1f/FC_Bayern_M%C3%BCnchen_logo_%282002%E2%80%932017%29.svg',
    'psg':                'https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg',
    'ac-milan':           'https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg',
    'inter-milan':        'https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg',
    'man-city':           'https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg',
    'tottenham':          'https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg',
    'dortmund':           'https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg',
    'atletico':           'https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_de_Madrid_2017_logo.svg',
    'ajax':               'https://upload.wikimedia.org/wikipedia/en/7/79/Ajax_Amsterdam.svg',
    'porto':              'https://upload.wikimedia.org/wikipedia/en/f/f1/FC_Porto.svg',
    'benfica':            'https://upload.wikimedia.org/wikipedia/en/a/a2/SL_Benfica_logo.svg',
    'roma':               'https://upload.wikimedia.org/wikipedia/en/f/f7/AS_Roma_logo_%282013%29.svg',
    'napoli':             'https://upload.wikimedia.org/wikipedia/commons/2/21/SSC_Napoli_logo_2010.svg',
    // ── Hard ──────────────────────────────────────────────────────────────
    'rb-leipzig':         'https://upload.wikimedia.org/wikipedia/en/0/04/RB_Leipzig_2014_logo.svg',
    'leverkusen':         'https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg',
    'feyenoord':          'https://upload.wikimedia.org/wikipedia/en/6/6c/Feyenoord_Rotterdam.svg',
    'galatasaray':        'https://upload.wikimedia.org/wikipedia/en/5/51/Galatasaray.svg',
    'fenerbahce':         'https://upload.wikimedia.org/wikipedia/en/7/73/Fenerbah%C3%A7e_SK.svg',
    'sporting-cp':        'https://upload.wikimedia.org/wikipedia/en/6/6a/Sporting_CP_%28Portugal%29.svg',
    'lazio':              'https://upload.wikimedia.org/wikipedia/en/f/f1/Logo_S.S._Lazio.svg',
    'marseille':          'https://upload.wikimedia.org/wikipedia/en/d/d8/Olympique_Marseille_logo.svg',
    'lyon':               'https://upload.wikimedia.org/wikipedia/en/b/b7/Olympique_Lyonnais_logo.svg',
    'sevilla':            'https://upload.wikimedia.org/wikipedia/en/3/3b/Sevilla_FC_logo.svg',
    'valencia':           'https://upload.wikimedia.org/wikipedia/en/c/ce/Valenciacf.svg',
    'villarreal':         'https://upload.wikimedia.org/wikipedia/en/b/b9/Villarreal_CF_logo-en.svg',
    'wolves':             'https://upload.wikimedia.org/wikipedia/en/f/fc/Wolverhampton_Wanderers.svg',
    'west-ham':           'https://upload.wikimedia.org/wikipedia/en/c/c2/West_Ham_United_FC_logo.svg',
    'aston-villa':        'https://upload.wikimedia.org/wikipedia/en/9/9f/Aston_Villa_FC_crest_%282016%29.svg',
    'frankfurt':          'https://upload.wikimedia.org/wikipedia/commons/0/04/Eintracht_Frankfurt_Logo.svg',
    'shakhtar':           'https://upload.wikimedia.org/wikipedia/en/a/a2/FC_Shakhtar_Donetsk.svg',
    'red-star':           'https://upload.wikimedia.org/wikipedia/en/8/8f/Crvena_zvezda.svg',
    'club-brugge':        'https://upload.wikimedia.org/wikipedia/en/b/b7/Club_Brugge_logo.svg',
    'psv':                'https://upload.wikimedia.org/wikipedia/en/0/05/PSV_Eindhoven.svg',
    'flamengo':           'https://upload.wikimedia.org/wikipedia/commons/2/2e/Flamengo_braz_logo.svg',
    'boca-juniors':       'https://upload.wikimedia.org/wikipedia/commons/7/70/Boca_Juniors_crest.svg',
    'celtic':             'https://upload.wikimedia.org/wikipedia/en/3/35/Celtic_FC_crest.svg',
    'rangers':            'https://upload.wikimedia.org/wikipedia/en/a/a9/Rangers_FC_crest.svg',
    'anderlecht':         'https://upload.wikimedia.org/wikipedia/commons/9/90/RSC_Anderlecht_logo.svg',
  };

  app.get('/api/quiz-logo/:id', async (req, res) => {
    const id = (req.params.id || '').toLowerCase().trim();
    const src = LOGO_URLS[id];
    if (!src) return res.status(404).json({ error: 'Unknown club id' });

    // Serve from cache if fresh
    const cached = LOGO_CACHE.get(id);
    if (cached && Date.now() - cached.ts < LOGO_TTL) {
      res.setHeader('Content-Type', cached.ct);
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
      return res.send(cached.buf);
    }

    try {
      const r = await fetch(src, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Sport25Bot/1.0; +https://sport25.news)',
          'Accept': 'image/svg+xml,image/*,*/*',
          'Referer': 'https://sport25.news/',
        },
        signal: AbortSignal.timeout(8000),
      });
      if (!r.ok) throw new Error(`upstream ${r.status}`);

      const rawBuf = Buffer.from(await r.arrayBuffer());
      const isSvg = (r.headers.get('content-type') || '').includes('svg') || src.endsWith('.svg');

      let finalBuf: Buffer;
      let ct: string;

      if (isSvg) {
        // Convert SVG → PNG via sharp for fast, consistent browser rendering
        finalBuf = await sharp(rawBuf, { density: 144 })
          .resize(240, 240, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png({ compressionLevel: 8 })
          .toBuffer();
        ct = 'image/png';
      } else {
        finalBuf = await sharp(rawBuf)
          .resize(240, 240, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png({ compressionLevel: 8 })
          .toBuffer();
        ct = 'image/png';
      }

      LOGO_CACHE.set(id, { buf: finalBuf, ct, ts: Date.now() });
      res.setHeader('Content-Type', ct);
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
      return res.send(finalBuf);
    } catch (err: any) {
      console.error(`[quiz-logo] Failed to fetch "${id}":`, err.message);
      return res.status(502).json({ error: 'Failed to fetch logo', detail: err.message });
    }
  });

  // ── Known Valid Frontend Routes ──────────────────────────────────────────
  const VALID_STATIC_PATHS = new Set([
    "",
    "/",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/methodology",
    "/news",
    "/football-news",
    "/bitcoin-news",
    "/author/jordan-cole",
    "/admin",
    "/quiz",
  ]);

  const VALID_CATEGORIES = new Set([
    "football",
    "basketball",
    "tennis",
    "formula1",
    "american-football",
    "general-sports",
    "bitcoin",
    "altcoins",
    "defi",
    "web3",
    "markets",
    "tech",
  ]);

  const generateSlugForRedirect = (title: string) =>
    (title || "")
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  async function isValidArticleSlug(slug: string): Promise<boolean> {
    const cleanSlug = decodeURIComponent(slug || "").toLowerCase().trim();
    if (!cleanSlug) return false;

    // 1. Check in-memory cache
    if (cachedNews && cachedNews.length > 0) {
      const match = cachedNews.some((a) => {
        const headlineSlug = generateSlugForRedirect(a.headline || "");
        const titleSlug = generateSlugForRedirect(a.title || "");
        return headlineSlug === cleanSlug || titleSlug === cleanSlug;
      });
      if (match) return true;
    } else {
      try {
        cachedNews = await getPublishedArticles();
        const match = cachedNews.some((a) => {
          const headlineSlug = generateSlugForRedirect(a.headline || "");
          const titleSlug = generateSlugForRedirect(a.title || "");
          return headlineSlug === cleanSlug || titleSlug === cleanSlug;
        });
        if (match) return true;
      } catch (err) {
        console.error("Error populating cached news for slug validation:", err);
      }
    }

    // 2. Check Supabase directly
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("articles")
          .select("title, headline")
          .order("pub_date", { ascending: false })
          .limit(500);

        if (!error && Array.isArray(data)) {
          const match = data.some((row: any) => {
            const headlineSlug = generateSlugForRedirect(row.headline || "");
            const titleSlug = generateSlugForRedirect(row.title || "");
            return headlineSlug === cleanSlug || titleSlug === cleanSlug;
          });
          if (match) return true;
        }
      } catch (err) {
        console.error("Error querying Supabase for article validation:", err);
      }
    }

    return false;
  }

  // ── OG tag injection helpers ──────────────────────────────────────────────
  // Cache the built index.html in memory so we only read it once from disk.
  let indexHtmlCache: string | null = null;
  async function getIndexHtml(distPath: string): Promise<string> {
    if (!indexHtmlCache) {
      indexHtmlCache = await fs.readFile(path.join(distPath, "index.html"), "utf-8");
    }
    return indexHtmlCache;
  }

  /** Look up a full article row by URL slug. Returns null if not found. */
  async function fetchArticleBySlug(slug: string): Promise<any | null> {
    const cleanSlug = decodeURIComponent(slug || "").toLowerCase().trim();
    if (!cleanSlug) return null;

    // 1. Check in-memory cache first
    if (cachedNews && cachedNews.length > 0) {
      const match = cachedNews.find((a) => {
        const hs = generateSlugForRedirect(a.headline || "");
        const ts = generateSlugForRedirect(a.title || "");
        return hs === cleanSlug || ts === cleanSlug;
      });
      if (match) return match;
    }

    // 2. Fallback to Supabase
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("articles")
          .select("id,title,headline,seo_title,ai_meta_description,description,image_url")
          .order("pub_date", { ascending: false })
          .limit(500);
        if (!error && Array.isArray(data)) {
          const match = data.find((row: any) => {
            const hs = generateSlugForRedirect(row.headline || "");
            const ts = generateSlugForRedirect(row.title || "");
            return hs === cleanSlug || ts === cleanSlug;
          });
          if (match) return match;
        }
      } catch (err) {
        console.error("fetchArticleBySlug error:", err);
      }
    }

    return null;
  }

  const SITE_URL_BASE = (process.env.SITE_URL || "https://sport25.news").trim().replace(/\/+$/, "");
  const DEFAULT_OG_IMAGE = `${SITE_URL_BASE}/sport25_logo.svg`;

  /** Replace static OG/Twitter meta tags in index.html with article-specific values. */
  function injectArticleOG(html: string, article: any, slug: string): string {
    const title = (article.seo_title || article.headline || article.title || "").trim();
    const description = (article.ai_meta_description || article.description || "").trim();
    const image = (article.image_url || DEFAULT_OG_IMAGE).trim();
    const url = `${SITE_URL_BASE}/article/${slug}`;

    const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

    const t = escape(title);
    const d = escape(description);
    const img = escape(image);
    const u = escape(url);

    return html
      // <title>
      .replace(/<title>[^<]*<\/title>/, `<title>${t}</title>`)
      // og:title
      .replace(
        /(<meta\s+property="og:title"\s+content=")[^"]*(")/,
        `$1${t}$2`
      )
      // og:description
      .replace(
        /(<meta\s+property="og:description"\s+content=")[^"]*(")/,
        `$1${d}$2`
      )
      // og:image
      .replace(
        /(<meta\s+property="og:image"\s+content=")[^"]*(")/,
        `$1${img}$2`
      )
      // og:url
      .replace(
        /(<meta\s+property="og:url"\s+content=")[^"]*(")/,
        `$1${u}$2`
      )
      // og:type
      .replace(
        /(<meta\s+property="og:type"\s+content=")[^"]*(")/,
        `$1article$2`
      )
      // twitter:title
      .replace(
        /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,
        `$1${t}$2`
      )
      // twitter:description
      .replace(
        /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,
        `$1${d}$2`
      )
      // twitter:image
      .replace(
        /(<meta\s+name="twitter:image"\s+content=")[^"]*(")/,
        `$1${img}$2`
      )
      // canonical link
      .replace(
        /(<link\s+rel="canonical"\s+href=")[^"]*(")/,
        `$1${u}$2`
      );
  }

  // ── Vite middleware (dev) / Static files (prod) ───────────────────────────
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    // Dev redirect middleware for unmatched paths
    app.use(async (req, res, next) => {
      if (
        req.path.startsWith("/api/") ||
        req.path.startsWith("/@") ||
        req.path.startsWith("/src/") ||
        req.path.startsWith("/node_modules/") ||
        req.path.includes(".")
      ) {
        return next();
      }

      const normalizedPath = req.path.replace(/\/+$/, "") || "/";
      const lowerPath = normalizedPath.toLowerCase();

      if (VALID_STATIC_PATHS.has(lowerPath)) {
        return next();
      }

      const categoryMatch = lowerPath.match(/^\/news\/([a-z0-9_-]+)$/);
      if (categoryMatch && VALID_CATEGORIES.has(categoryMatch[1])) {
        return next();
      }

      const articleMatch = req.path.match(/^\/article\/([^/?#]+)$/i);
      if (articleMatch) {
        const slug = articleMatch[1];
        const exists = await isValidArticleSlug(slug);
        if (exists) {
          return next();
        }
      }

      // Non-existent page -> 301 Redirect to homepage to transfer backlink authority
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.redirect(301, "/");
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));

    app.get("*", async (req, res) => {
      // 1. API routes should return 404 JSON if not matched
      if (req.path.startsWith("/api/")) {
        return res.status(404).json({ error: "API endpoint not found" });
      }

      const normalizedPath = req.path.replace(/\/+$/, "") || "/";
      const lowerPath = normalizedPath.toLowerCase();

      // 2. Valid static pages
      if (VALID_STATIC_PATHS.has(lowerPath)) {
        return res.sendFile(path.join(distPath, "index.html"));
      }

      // 3. Valid category routes
      const categoryMatch = lowerPath.match(/^\/news\/([a-z0-9_-]+)$/);
      if (categoryMatch && VALID_CATEGORIES.has(categoryMatch[1])) {
        return res.sendFile(path.join(distPath, "index.html"));
      }

      // 4. Valid article routes — serve with article-specific OG tags injected
      const articleMatch = req.path.match(/^\/article\/([^/?#]+)$/i);
      if (articleMatch) {
        const slug = articleMatch[1];
        const article = await fetchArticleBySlug(slug);
        if (article) {
          try {
            const html = await getIndexHtml(distPath);
            const injected = injectArticleOG(html, article, slug);
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            return res.send(injected);
          } catch (err) {
            console.error("OG injection error, falling back to sendFile:", err);
            return res.sendFile(path.join(distPath, "index.html"));
          }
        }
      }

      // 5. Non-existent page / old backlink URL -> 301 Permanent Redirect to homepage
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.redirect(301, "/");
    });
  }



  // ── Pre-warm article cache on server boot for instant first page loads ────
  console.log("⚡ Pre-warming article cache from database...");
  try {
    cachedNews = await getPublishedArticles();
    const football = await getFootballArticles();
    cachedBtcNews = football.map((a: any) => ({
      ...a,
      importance: rankFootballArticleImportance(a)
    })).sort((a: any, b: any) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    lastFetchTime = Date.now();
    cachedBtcNewsTime = Date.now();
    console.log(`⚡ Cache pre-warmed: ${cachedNews.length} published articles, ${cachedBtcNews.length} football articles ready.`);
  } catch (err: any) {
    console.error("Cache pre-warm error:", err.message);
  }

  // Start sports pipeline cron (on startup after 5s, and every 8 mins)
  setTimeout(() => {
    runAIPipeline().catch(console.error);
    setInterval(() => runAIPipeline().catch(console.error), 8 * 60 * 1000);
  }, 5000); // 5s delay on startup

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
