/**
 * One-time migration script: imports existing news_cache.json into Supabase.
 * Run ONCE after setting up Supabase, before deploying to Render.
 *
 * Usage:
 *   npx tsx migrate.ts
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import dotenv from "dotenv";
import ws from "ws";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  {
    auth: { persistSession: false },
    realtime: { transport: ws as any },
  }
);

async function migrate() {
  console.log("🔄 Starting migration from news_cache.json → Supabase...");

  let cache: Record<string, any> = {};
  try {
    const raw = await fs.readFile("./news_cache.json", "utf-8");
    cache = JSON.parse(raw);
  } catch {
    console.log("⚠️  No news_cache.json found. Nothing to migrate.");
    return;
  }

  const entries = Object.entries(cache);
  console.log(`📦 Found ${entries.length} cached entries.`);

  let success = 0;
  let skipped = 0;

  for (const [id, data] of entries) {
    // Skip articles that were rejected by AI (no rewritten_content or low quality)
    if (!data.quality_score || data.quality_score < 70 || !data.rewritten_content) {
      skipped++;
      continue;
    }

    const { error } = await supabase.from("articles").upsert({
      id,
      // Note: news_cache.json only stores AI results, not base article fields.
      // These will be null for migrated articles but that's OK — they'll
      // display correctly since they have AI-generated headline/content.
      title: data.headline || data.title || null,
      link: null,
      description: data.ai_meta_description || null,
      pub_date: data.pub_date || new Date().toISOString(),
      image_url: data.image_url || null,
      source_id: data.source_id || null,
      category: data.category || ["News"],
      headline: data.headline || null,
      seo_title: data.seo_title || null,
      ai_meta_description: data.ai_meta_description || null,
      rewritten_content: data.rewritten_content,
      ai_summary: data.ai_summary || null,
      classification: data.classification || null,
      quality_score: data.quality_score,
      related_sources: data.related_sources || null,
      research_data: data.research_data || null,
    });

    if (error) {
      console.error(`❌ Failed to migrate ${id}: ${error.message}`);
    } else {
      success++;
    }
  }

  console.log(`\n✅ Migration complete!`);
  console.log(`   Migrated: ${success} articles`);
  console.log(`   Skipped (rejected/incomplete): ${skipped} articles`);
}

migrate().catch(console.error);
