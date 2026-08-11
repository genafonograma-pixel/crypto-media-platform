import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import ws from "ws";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, {
  auth: { persistSession: false },
  realtime: { transport: ws as any },
});

async function run() {
  const { count } = await supabase.from("articles").select("*", { count: "exact", head: true });
  console.log(`Total articles in DB: ${count}`);

  const { count: qualityCount } = await supabase.from("articles").select("*", { count: "exact", head: true }).gte("quality_score", 70).neq("rewritten_content", null);
  console.log(`Quality articles (shown on site): ${qualityCount}`);
}
run();
