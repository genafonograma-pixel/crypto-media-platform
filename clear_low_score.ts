import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import ws from "ws";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, {
  auth: { persistSession: false },
  realtime: { transport: ws as any },
});

async function run() {
  const { data, error } = await supabase.from("articles").delete().lt("quality_score", 70);
  console.log("Deleted low score articles so they can be re-scraped");
}
run();
