import { createClient } from "@supabase/supabase-js";
import Parser from "rss-parser";
import fs from "fs/promises";
import dotenv from "dotenv";
import ws from "ws";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, {
  auth: { persistSession: false },
  realtime: { transport: ws as any },
});

const parser = new Parser({
  customFields: { item: ["media:content", "enclosure", "image"] },
});

const RSS_FEEDS = [
  "https://cointelegraph.com/rss",
  "https://www.coindesk.com/arc/outboundfeeds/rss/",
  "https://cryptoslate.com/feed/",
  "https://bitcoinmagazine.com/.rss/full/",
  "https://news.bitcoin.com/feed/",
  "https://decrypt.co/feed",
  "https://thedefiant.io/api/feed",
  "https://blockworks.co/feed",
  "https://cryptonews.com/news/feed/",
  "https://u.today/rss",
  "https://zycrypto.com/feed/",
  "https://www.cryptoglobe.com/latest/feed/",
  "https://ambcrypto.com/feed/",
  "https://beincrypto.com/feed/",
];

function extractImage(item: any): string | null {
  if (item["media:content"]?.["$"]?.["url"]) return item["media:content"]["$"]["url"];
  if (item.enclosure?.url) return item.enclosure.url;
  if (item.image?.url) return item.image.url;
  const imgMatch = item.content?.match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch) return imgMatch[1];
  return null;
}

async function run() {
  console.log("Fetching RSS feeds to find original images...");
  const imageMap = new Map<string, string>();

  // 1. Load from RSS
  for (const feedUrl of RSS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      for (const item of feed.items) {
        const id = item.guid || item.link;
        if (!id) continue;
        const b64Id = Buffer.from(id).toString("base64");
        const img = extractImage(item);
        if (img) imageMap.set(b64Id, img);
      }
    } catch (e) {
      console.log(`Failed to fetch ${feedUrl}`);
    }
  }

  // 2. Load from old cache
  try {
    const cacheData = JSON.parse(await fs.readFile("news_cache.json", "utf-8"));
    for (const [id, article] of Object.entries<any>(cacheData)) {
      if (article.image_url && !article.image_url.includes("pollinations") && !article.image_url.includes("imgbb")) {
        imageMap.set(id, article.image_url);
      }
    }
  } catch (e) {}

  console.log(`Found ${imageMap.size} original images. Updating database...`);

  // 3. Update Supabase
  const { data: articles } = await supabase.from("articles").select("id, article_id, image_url");
  let updated = 0;

  for (const article of articles || []) {
    const originalImage = imageMap.get(article.article_id);
    if (originalImage && article.image_url !== originalImage) {
      await supabase.from("articles").update({ image_url: originalImage }).eq("id", article.id);
      updated++;
    }
  }

  console.log(`✅ Restored original images for ${updated} articles!`);
}

run();
