import dotenv from "dotenv";
dotenv.config();

function buildThumbnailPrompt(article: { headline?: string | null; title?: string; classification?: string | null }): string {
  const classificationThemes: Record<string, string> = {
    "Breaking News": "urgent breaking news atmosphere, bold dramatic lighting, red and orange energy pulses, dynamic shockwave composition",
    "Regulation": "imposing government building facade, marble columns, legal documents, scales of justice motif, cool authoritative blue tones",
    "Security/Hack": "cyberpunk digital breach visualization, cascading red binary code, cracked shield hologram, electric warning glow",
    "Market Movement": "cinematic financial data visualization, glowing green and red candlestick charts, ascending price graph, Bloomberg terminal aesthetic",
    "Market/Price": "cinematic financial data visualization, glowing candlestick charts, ascending price graph, dynamic trading floor energy",
    "Company/Earnings": "sleek corporate skyscraper glass facade at dusk, boardroom silhouette, financial growth chart overlay, navy and gold palette",
    "DeFi": "decentralized network node web, glowing liquidity pool vortex, interconnected blockchain nodes, electric teal and purple palette",
    "NFT": "vibrant digital art gallery, holographic NFT frames floating in dark space, prismatic light refractions, vivid chromatic colors",
    "Mining": "industrial GPU mining farm, rows of server rigs with cooling fans, blue LED light strips, mechanical precision aesthetic",
    "Blockchain": "interconnected glowing blockchain lattice, crystalline chain links, deep space dark background, electric blue and silver",
  };

  const c = article.classification || "";
  const theme = Object.entries(classificationThemes).find(([key]) =>
    c.toLowerCase().includes(key.toLowerCase())
  )?.[1] ?? "abstract cryptocurrency visualization, glowing blockchain nodes, digital financial network";

  const subject = (article.headline || article.title || "crypto news").slice(0, 120);

  return (
    `Professional crypto news editorial thumbnail. Subject: ${subject}. ` +
    `Visual theme: ${theme}. ` +
    `Style: dark moody background, deep blue-black gradient, gold and electric-cyan accent highlights, ` +
    `cinematic depth of field, 8K hyperrealistic render, dramatic volumetric lighting. ` +
    `No text, no watermarks, no logos, no people's faces.`
  );
}

function hashStringToInt(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

async function generateThumbnailPollinations(prompt: string, seed: number): Promise<Buffer | null> {
  try {
    const encodedPrompt = encodeURIComponent(prompt);
    const params = new URLSearchParams({ width: "1200", height: "630", nologo: "true", seed: String(seed) });
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?${params}`;
    console.log("Generating with Pollinations...");
    const response = await fetch(url);
    if (!response.ok) return null;
    return Buffer.from(await response.arrayBuffer());
  } catch (err) {
    return null;
  }
}

async function uploadThumbnailToImgBB(buffer: Buffer, articleId: string): Promise<string | null> {
  const apiKey = process.env.IMGBB_API_KEY;
  const formData = new FormData();
  formData.append("key", apiKey!);
  formData.append("image", buffer.toString("base64"));
  formData.append("name", articleId + ".jpg");

  console.log("Uploading to ImgBB...");
  const response = await fetch("https://api.imgbb.com/1/upload", { method: "POST", body: formData });
  const data = await response.json() as any;
  if (data && data.data && data.data.url) return data.data.url;
  return null;
}

async function main() {
  const article = {
    article_id: "test_" + Date.now(),
    headline: "Bitcoin Surges Past Key Resistance Amid New ETF Approvals",
    classification: "Market Movement"
  };
  
  const prompt = buildThumbnailPrompt(article);
  const seed = hashStringToInt(article.article_id);
  
  let imageBuffer = await generateThumbnailPollinations(prompt, seed);
  if (imageBuffer) {
    const url = await uploadThumbnailToImgBB(imageBuffer, article.article_id);
    console.log("\n✅ Generated URL:", url);
  }
}

main();
