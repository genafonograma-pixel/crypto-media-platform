import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, {
  realtime: { transport: ws as any }
});

async function main() {
  const sourceUrl = "https://ambcrypto.com/bet25-com-launches-zero-margin-sportsbook-to-eliminate-hidden-house-edges/";
  const articleId = Buffer.from(sourceUrl).toString("base64");
  const title = "Bet25.com Launches Zero Margin Sportsbook to Eliminate Hidden House Edges";
  const headline = title;
  const seoTitle = "Bet25.com Launches Zero Margin Sportsbook to Eliminate Hidden House Edges";
  const description = "Bet25.com has officially launched its Zero Margin Sportsbook, eliminating hidden house edges and traditional bookmaker markups with true statistical odds and a single flat 5% stake fee.";
  const metaDescription = "Bet25.com introduces a revolutionary zero margin sportsbook, eliminating hidden bookmaker edges with pure statistical probability odds and a flat 5% stake fee.";

  const contentHtml = `
<p>Every sports bettor deals with the same issue: traditional sportsbooks hide extra profit margins within their odds. Behind flashy ads and complicated bonuses, regular bookmakers quietly lower payouts. When building a parlay or combo bet, these hidden cuts stack up fast.</p>

<p><strong>Bet25</strong> is changing this with the <strong>Zero Margin Sportsbook</strong>, setting the new rules of sports betting. Built on honesty, clear numbers, and fair pricing, Bet25 removes traditional bookmaker tricks, so the real payout is received.</p>

<h2>The Problem: How Hidden Margins Hurt Winnings</h2>

<p>In a standard sportsbook, the odds you see are not the true odds. The bookmaker trims 5% to 10% off the price of each game to guarantee their own cut before you even place a bet.</p>

<p>On a single match, this might look small. But on combo bets, it becomes a serious problem. Because combo odds multiply together, the hidden house cuts multiply too. Every leg you add gives you a payout that is much lower than the actual math says it should be.</p>

<h2>The New Rules: No Hidden House Edge and Naturally Better Odds</h2>

<p>The <a href="https://bet25.com" target="_blank" rel="noopener noreferrer">Bet25 Zero Margin Sportsbook</a> is not a temporary promo or a short-lived boost. It is a completely different way to run a sportsbook:</p>

<ul>
  <li><strong>Removed House Edge:</strong> Odds are calculated using <strong>pure math</strong>. What you see reflects the true statistical probability, with <strong>no hidden house edge</strong>.</li>
  <li><strong>Naturally Better Odds:</strong> Because there are no built-in cuts shaving down the numbers, the odds are simply better from the start.</li>
  <li><strong>One Simple 5% Fee:</strong> Bet25 does not take money out of every single line. Instead, there is a flat 5% service fee charged on the stake &mdash; just once per bet slip, no matter how many picks you include.</li>
</ul>

<p>A normal bookmaker takes a cut on pick 1, pick 2, pick 3, and so on. <strong>Bet25</strong> charges one single 5% fee whether you pick one game or five.</p>

<h2>See the Math: How Combos Pay More</h2>

<p>The difference is easy to see on a multi-leg ticket. Take a simple 5-leg combo where each pick has a true 50/50 probability. A regular bookmaker will usually offer around 1.87 on each outcome to keep their cut, but a zero-margin sportsbook will price it at 2.0, again because of no hidden margin inside.</p>

<figure class="my-6">
  <img src="https://files.catbox.moe/qp2wcw.png" alt="Bet25 Zero Margin Sportsbook Comparison Table" class="w-full rounded-lg border border-line shadow-sm" />
  <figcaption class="text-xs text-subtle text-center mt-2">Comparison: Traditional Bookmaker vs Bet25 Zero Margin on a 5-leg combo ticket.</figcaption>
</figure>

<p>Same five picks. Same $100 bet. Exactly the same risk. But Bet25 pays out <strong>$755 more</strong> because no hidden cuts were multiplied along the way.</p>

<h2>Don&rsquo;t Just Take the Word for It: Just Compare</h2>

<p>Almost every betting site claims to have &ldquo;the best odds.&rdquo; Bet25 doesn&rsquo;t need hype or marketing talk. Instead, the advice is simple: <strong>just compare.</strong></p>

<p>Open a betting site side by side with the Bet25 Zero Margin Sportsbook. Check any match, build a 3-leg or 4-leg combo on both, and look at the final payouts. You will see the difference right away. It is not marketing &mdash; it is pure math.</p>

<h2>Powered by Vegangster</h2>

<p>Turning a concept this disruptive into reality depended on having the right technological backbone. Bet25 teamed up with <strong>Vegangster</strong> as its primary platform partner, working side-by-side from initial ideation straight through to full deployment. Vegangster&rsquo;s flexible, cutting-edge architecture gave the team the technical freedom to execute bold and complex features without friction.</p>

<p>In an industry where legacy tech often limits innovation, having a responsive partner who can translate ambitious mechanics into reality has been essential to Bet25&rsquo;s launch.</p>

<h2>A Fairer Way to Bet on Sports</h2>

<p>Sports betting should be about making smart picks and getting paid fairly when you are right. By creating the <strong>new rules of sports betting</strong>, removing the hidden house edge, and offering <strong>naturally better odds</strong>, Bet25 gives players a clear, honest alternative to old-school sportsbooks.</p>

<h2>About Bet25</h2>

<p>Bet25.com is owned and operated by Horns and Hooves Company S.A., a company registered in Costa Rica under registration number 3-101-922698, with its registered address at Canton 01, San Jose, Cathedral District, Building No. 603, Costa Rica.</p>

<p>Bet25.com operates under a gaming licence issued by the Government of the Autonomous Island of Anjouan, Union of the Comoros, under Licence No. ALSI-202505001-FI1.</p>

<p>The licence authorizes the company to operate online gaming and wagering services in accordance with the applicable licensing requirements and regulations.</p>

<h2>Contact Information</h2>

<p><strong>Kai Armin</strong><br/>
Email: <strong>info@bet25.com</strong><br/>
Website: <strong><a href="https://bet25.com" target="_blank" rel="noopener noreferrer">bet25.com</a></strong></p>

<p class="mt-8 pt-4 border-t border-line text-xs text-subtle"><em>Disclaimer: This article is a sponsored press release and is provided for informational purposes only. It should not be considered investment or financial advice.</em></p>
`.trim();

  const record = {
    id: articleId,
    title: title,
    link: sourceUrl,
    description: description,
    pub_date: new Date().toISOString(),
    image_url: "https://files.catbox.moe/kcl1ve.png",
    source_id: "AMBCrypto",
    category: ["Press Release", "General Sports"],
    headline: headline,
    seo_title: seoTitle,
    ai_meta_description: metaDescription,
    rewritten_content: contentHtml,
    ai_summary: [
      {
        label: "Overview",
        text: "Bet25.com launches an innovative Zero Margin Sportsbook, eliminating hidden house edges and bookmaker margins with fair pricing and a flat 5% stake fee."
      },
      {
        label: "Core Advantage",
        text: "Offers odds calculated on true statistical probability without house margins, preventing compounding payout cuts on multi-leg combo bets."
      },
      {
        label: "Platform Partner",
        text: "Engineered in partnership with Vegangster to deliver a high-performance, flexible betting architecture."
      }
    ],
    classification: "General Sports",
    quality_score: 100,
    related_sources: [
      {
        source_id: "AMBCrypto",
        link: sourceUrl,
        title: title
      }
    ],
    research_data: null,
    created_at: new Date().toISOString()
  };

  console.log(`Publishing press release to Supabase... Article ID: ${articleId}`);
  const { data, error } = await supabase.from("articles").upsert(record);

  if (error) {
    console.error("❌ Supabase insert failed:", error);
    process.exit(1);
  }

  console.log("✅ Successfully saved press release to Supabase!");
  
  // Verify by reading back
  const { data: readBack, error: readError } = await supabase
    .from("articles")
    .select("id, title, headline, quality_score, classification, pub_date")
    .eq("id", articleId)
    .single();

  if (readError) {
    console.error("❌ Read back failed:", readError);
  } else {
    console.log("✅ Read back confirmed:", readBack);
  }
}

main().catch(console.error);
