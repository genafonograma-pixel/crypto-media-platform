import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import ws from "ws";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, {
  auth: { persistSession: false },
  realtime: { transport: ws as any },
});

async function run() {
  const { data, error } = await supabase.from("articles").select("*").gte("quality_score", 70).order("created_at", { ascending: false }).limit(1);
  if (error) console.error(error);
  console.log(JSON.stringify(data?.[0], null, 2));
}
run();
