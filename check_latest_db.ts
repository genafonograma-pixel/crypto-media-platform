import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, {
  realtime: { transport: ws as any }
});

async function main() {
  console.log("Querying latest 10 articles from Supabase...");
  const { data, error } = await supabase
    .from("articles")
    .select("created_at, title, headline, image_url, classification, quality_score")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("\n====================================");
  data.forEach((art, idx) => {
    console.log(`\n#${idx + 1} - Created: ${art.created_at}`);
    console.log(`Headline: ${art.headline}`);
    console.log(`Original: ${art.title}`);
    console.log(`Quality Score: ${art.quality_score}`);
    console.log(`Classification: ${art.classification}`);
    console.log(`Image URL: ${art.image_url}`);
  });
  console.log("====================================\n");
}

main().catch(console.error);
