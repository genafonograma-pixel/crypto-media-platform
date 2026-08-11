import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import ws from "ws";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, {
  auth: { persistSession: false },
  realtime: { transport: ws as any },
});

async function run() {
  const { data } = await supabase.from("articles").select("title, quality_score, classification").order("created_at", { ascending: false }).limit(20);
  console.table(data);
}
run();
