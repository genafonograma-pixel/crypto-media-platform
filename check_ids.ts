import dotenv from "dotenv"; dotenv.config();
import { createClient } from "@supabase/supabase-js";
import Parser from "rss-parser";
import ws from "ws";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, { realtime: { transport: ws as any } });
const parser = new Parser({ timeout: 15000, customFields: { item: [["media:content","mediaContent"],["content:encoded","contentEncoded"]] } });

// Get ALL IDs from DB
const { data: existing } = await supabase.from("articles").select("id");
const processedIds = new Set((existing ?? []).map((r: any) => r.id));
console.log("DB IDs:", [...processedIds].map(id => { try { return Buffer.from(id, "base64").toString(); } catch { return id; } }));

// Simulate what fetchRSSArticles produces for CryptoSlate
const feed = await parser.parseURL("https://cryptoslate.com/feed/");
let newCount = 0, skipCount = 0;
for (const item of feed.items) {
  // NEW logic: item.link || item.guid
  const newId = Buffer.from(String(item.link || item.guid || "")).toString("base64");
  const inDB = processedIds.has(newId);
  if (inDB) { skipCount++; console.log(`[SKIP] ${item.title?.slice(0,50)} → link: ${item.link?.slice(0,50)}`); }
  else { newCount++; console.log(`[NEW ] ${item.title?.slice(0,50)} → link: ${item.link?.slice(0,50)}`); }
}
console.log(`\nResult: ${newCount} new, ${skipCount} skipped`);
process.exit(0);
