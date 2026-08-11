import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import ws from "ws";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, {
  auth: { persistSession: false },
  realtime: { transport: ws as any },
});

async function run() {
  const { data: articles } = await supabase.from("articles").select("id, article_id, title").limit(5);
  console.log("Supabase IDs:", articles?.map(a => a.article_id));
}
run();
