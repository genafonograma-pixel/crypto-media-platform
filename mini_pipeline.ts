import dotenv from "dotenv";
dotenv.config();
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import Parser from "rss-parser";
import ws from "ws";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, {
  realtime: { transport: ws as any }
});
const parser = new Parser({ timeout: 15000 });

async function runAIPrompt(prompt: string) {
  try {
    const res = await Promise.race([
      genAI.models.generateContent({ model: "gemini-flash-latest", contents: prompt }),
      new Promise<never>((_, r) => setTimeout(() => r(new Error("Timeout")), 45000)),
    ]) as any;
    let raw = (res.text ?? "{}").trim();
    raw = raw.replace(/^```json\n?/, "").replace(/^```\n?/, "").replace(/\n?```$/, "");
    return JSON.parse(raw);
  } catch(e: any) { console.error("AI failed:", e.message.slice(0, 80)); return null; }
}

// Step 1: get processed IDs
const { data: existing } = await supabase.from("articles").select("id");
const processedIds = new Set((existing ?? []).map((r: any) => r.id));
console.log("Existing articles in DB:", processedIds.size);

// Step 2: fetch 1 RSS feed
const feed = await parser.parseURL("https://cryptoslate.com/feed/");
const newArticle = feed.items.find(item => {
  const id = Buffer.from(item.link || item.guid || "").toString("base64");
  return !processedIds.has(id);
});
if (!newArticle) { console.log("No new articles found!"); process.exit(0); }

const article_id = Buffer.from(newArticle.link || "").toString("base64");
console.log("\nProcessing:", newArticle.title?.slice(0, 60));
console.log("Article ID:", article_id.slice(0, 40));

// Step 3: run research AI
const content = (newArticle.contentSnippet || newArticle.content || "").slice(0, 5000);
const researchResult = await runAIPrompt(`You are a crypto news researcher. Article: "${newArticle.title}". Content: "${content}". Return ONLY JSON: {"classification":"string","facts":["string"]}`);
console.log("Research:", researchResult ? "OK → " + researchResult.classification : "FAILED");

// Step 4: generate article
if (!researchResult) { console.log("Pipeline would skip article (research failed)"); process.exit(0); }
const genResult = await runAIPrompt(`Write a crypto news article. Headline: "${newArticle.title}". Facts: ${JSON.stringify(researchResult.facts?.slice(0,3))}. Return ONLY JSON: {"headline":"string","rewritten_content":"<p>content here</p>","summary":[],"seo_title":"string","meta_description":"string"}`);
console.log("Generate:", genResult ? "OK → " + genResult.headline : "FAILED");

// Step 5: validate
if (!genResult) { console.log("Pipeline would skip (generate failed)"); process.exit(0); }
const validResult = await runAIPrompt(`Score this crypto article 0-100 for quality. Article: "${genResult.rewritten_content?.slice(0,300)}". Return ONLY JSON: {"quality_score":85,"status":"ready","final_classification":"${researchResult.classification}","unsupported_claims":[]}`);
console.log("Validate:", validResult ? "OK → score:" + validResult.quality_score : "FAILED");

// Step 6: save to DB
if (validResult && validResult.quality_score >= 70) {
  const { error } = await supabase.from("articles").upsert({
    id: article_id,
    title: newArticle.title,
    link: newArticle.link,
    description: content.slice(0, 500),
    pub_date: newArticle.isoDate,
    source_id: "CryptoSlate",
    headline: genResult.headline,
    seo_title: genResult.seo_title,
    ai_meta_description: genResult.meta_description,
    rewritten_content: genResult.rewritten_content,
    ai_summary: genResult.summary,
    classification: validResult.final_classification,
    quality_score: validResult.quality_score,
    category: ["Crypto"],
  });
  if (error) console.error("DB save error:", error.message);
  else console.log("✅ ARTICLE SAVED TO DB SUCCESSFULLY!");
}

process.exit(0);
