/**
 * reclassify_articles.ts
 * One-shot migration: fetches all articles from Supabase and re-classifies
 * them into one of the 6 standard categories using keyword matching.
 * Run with: npx tsx reclassify_articles.ts
 */

import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";
import ws from "ws";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  { auth: { persistSession: false }, realtime: { transport: ws as any } }
);

// ─── Category Classifier ────────────────────────────────────────────────────
// Ordered by priority — first match wins.
const CATEGORY_RULES: { category: string; keywords: string[] }[] = [
  {
    category: "Bitcoin",
    keywords: [
      "bitcoin", "btc", "satoshi", "lightning network", "segwit",
      "ordinals", "inscription", "bip", "bitcoin improvement",
      "mining pool", "hashrate", "proof of work",
    ],
  },
  {
    category: "DeFi",
    keywords: [
      "defi", "decentralized finance", "uniswap", "aave", "compound",
      "liquidity pool", "yield farming", "amm", "dex", "protocol",
      "staking", "lending", "borrowing", "tvl", "total value locked",
      "curve finance", "sushiswap", "balancer", "maker dao", "makerdao",
    ],
  },
  {
    category: "Web3",
    keywords: [
      "web3", "nft", "non-fungible", "metaverse", "dao", "smart contract",
      "opensea", "blur", "pudgy", "bored ape", "mint", "collection",
      "robinhood chain", "gaming", "play-to-earn", "p2e",
    ],
  },
  {
    category: "Altcoins",
    keywords: [
      "ethereum", "eth", "solana", "sol", "xrp", "ripple", "cardano", "ada",
      "dogecoin", "doge", "shiba", "shib", "litecoin", "ltc", "polkadot",
      "dot", "avalanche", "avax", "chainlink", "link", "polygon", "matic",
      "tron", "trx", "cronos", "cro", "near", "cosmos", "atom",
      "altcoin", "token", "altcoins",
    ],
  },
  {
    category: "Markets",
    keywords: [
      "price", "market cap", "rally", "crash", "surge", "dump", "bull",
      "bear", "trading", "volume", "open interest", "futures", "options",
      "long", "short", "liquidation", "etf", "spot", "exchange",
      "binance", "coinbase", "bybit", "okx", "kraken", "earnings",
      "revenue", "quarterly", "q2", "q1", "q3", "q4", "loss", "profit",
      "net income", "sec filing", "warrant", "ipo",
    ],
  },
  {
    category: "Tech",
    keywords: [
      "regulation", "regulatory", "law", "legislation", "compliance",
      "license", "sec", "cftc", "fca", "bank", "central bank",
      "government", "congress", "senate", "kyc", "aml", "clarity act",
      "hack", "exploit", "vulnerability", "security breach", "scam",
      "fraud", "phishing", "wallet", "custody", "infrastructure",
      "blockchain", "layer 2", "rollup", "zk", "zero knowledge",
    ],
  },
];

function classify(headline: string, title: string): string {
  const text = `${headline} ${title}`.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    for (const kw of rule.keywords) {
      if (text.includes(kw)) {
        return rule.category;
      }
    }
  }
  return "Markets"; // default fallback
}

async function main() {
  console.log("🔄 Fetching all articles from Supabase...");
  const { data, error } = await supabase
    .from("articles")
    .select("id, headline, title, classification");

  if (error) {
    console.error("❌ Failed to fetch articles:", error.message);
    process.exit(1);
  }

  console.log(`📰 Found ${data.length} articles. Re-classifying...`);

  const allowedCategories = ["Bitcoin", "Altcoins", "DeFi", "Web3", "Markets", "Tech"];
  let updated = 0;
  let skipped = 0;

  for (const article of data) {
    const newCategory = classify(article.headline || "", article.title || "");

    // Skip if already correctly classified
    if (allowedCategories.includes(article.classification) && article.classification === newCategory) {
      skipped++;
      continue;
    }

    const { error: updateError } = await supabase
      .from("articles")
      .update({ classification: newCategory })
      .eq("id", article.id);

    if (updateError) {
      console.error(`  ❌ Failed to update ${article.id}: ${updateError.message}`);
    } else {
      console.log(`  ✅ [${newCategory}] "${(article.headline || article.title || "").slice(0, 60)}..."`);
      updated++;
    }
  }

  console.log(`\n🎉 Done! Updated: ${updated}, Already correct: ${skipped}`);
}

main();
