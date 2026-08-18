import dotenv from "dotenv";
dotenv.config();
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";
import Parser from "rss-parser";
import ws from "ws";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, {
  realtime: { transport: ws as any }
});
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;
const parser = new Parser({ timeout: 15000 });

console.log("genAI available:", !!genAI);

// 1. Check DB IDs
const { data: existing } = await supabase.from("articles").select("id");
const processedIds = new Set((existing ?? []).map((r: any) => r.id));
console.log("\nDB IDs count:", processedIds.size);
for (const id of processedIds) {
  try { console.log(" -", Buffer.from(id, "base64").toString()); } catch { console.log(" -", id); }
}

// 2. Fetch RSS and check which articles are new
const feed = await parser.parseURL("https://cryptoslate.com/feed/");
console.log("\nCryptoSlate RSS items:", feed.items.length);
let newCount = 0;
for (const item of feed.items) {
  const id = Buffer.from(item.link || item.guid || "").toString("base64");
  const isNew = !processedIds.has(id);
  if (isNew) newCount++;
  console.log(`[${isNew ? "NEW " : "SKIP"}] ${item.title?.slice(0, 55)}`);
}
console.log("New articles:", newCount);

// 3. If there are new articles, test the AI
if (newCount > 0 && genAI) {
  const newItem = feed.items.find(item => !processedIds.has(Buffer.from(item.link || "").toString("base64")));
  if (newItem) {
    console.log("\nTesting AI on:", newItem.title?.slice(0, 50));
    const content = (newItem.contentSnippet || "").slice(0, 2000);
    console.log("Content length:", content.length);
    try {
      const r = await Promise.race([
        genAI.models.generateContent({
          model: "gemini-flash-latest",
          contents: `Return ONLY JSON: {"ok": true, "title": "${newItem.title?.slice(0, 30)}"}`,
        }),
        new Promise<never>((_, rej) => setTimeout(() => rej(new Error("Timeout")), 30000))
      ]) as any;
      console.log("AI response:", r.text?.slice(0, 100));
    } catch(e: any) {
      console.error("AI ERROR:", e.message);
    }
  }
}

process.exit(0);
