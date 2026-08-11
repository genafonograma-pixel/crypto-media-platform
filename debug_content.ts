import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import ws from "ws";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, {
  auth: { persistSession: false },
  realtime: { transport: ws as any },
});

async function run() {
  const { data } = await supabase.from("articles").select("title, quality_score, rewritten_content").gte("quality_score", 70).order("created_at", { ascending: false }).limit(5);
  for (const article of data || []) {
    console.log(`\n--- ${article.title} (Score: ${article.quality_score}) ---`);
    console.log("Content preview:", article.rewritten_content?.substring(0, 150));
    console.log("Length:", article.rewritten_content?.length);
  }
}
run();
