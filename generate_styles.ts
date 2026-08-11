import dotenv from "dotenv";
dotenv.config();

const styles = [
  {
    name: "Minimalist Vector",
    prompt: "Minimalist flat vector illustration, clean modern corporate tech style, geometric shapes, solid background, elegant composition, UI/UX aesthetic, dribbble style, no text"
  },
  {
    name: "3D Isometric",
    prompt: "3D isometric illustration of a cryptocurrency concept, claymorphism, soft studio lighting, pastel colors, clean white background, high quality blender render, modern web3 aesthetic, no text"
  },
  {
    name: "Cyberpunk Neon",
    prompt: "Cyberpunk digital art, neon glowing crypto symbols, dark futuristic city background, highly detailed, synthwave color palette, vibrant pink and cyan, no text"
  },
  {
    name: "Abstract Editorial",
    prompt: "Abstract editorial collage, modern financial times style, crypto market concept, sophisticated textures, double exposure, high contrast, artistic, no text"
  }
];

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
    const encodedPrompt = encodeURIComponent("Crypto news thumbnail. Subject: Bitcoin surging. " + prompt);
    const params = new URLSearchParams({ width: "1200", height: "630", nologo: "true", seed: String(seed) });
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?${params}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    return Buffer.from(await response.arrayBuffer());
  } catch (err) {
    return null;
  }
}

async function uploadThumbnailToImgBB(buffer: Buffer, filename: string): Promise<string | null> {
  const apiKey = process.env.IMGBB_API_KEY;
  const formData = new FormData();
  formData.append("key", apiKey!);
  formData.append("image", buffer.toString("base64"));
  formData.append("name", filename);
  const response = await fetch("https://api.imgbb.com/1/upload", { method: "POST", body: formData });
  const data = await response.json() as any;
  if (data && data.data && data.data.url) return data.data.url;
  return null;
}

async function main() {
  for (const style of styles) {
    const seed = hashStringToInt(style.name + Date.now());
    const buffer = await generateThumbnailPollinations(style.prompt, seed);
    if (buffer) {
      const url = await uploadThumbnailToImgBB(buffer, style.name.replace(/\s/g, "_"));
      console.log(`[${style.name}] ${url}`);
    } else {
      console.log(`[${style.name}] Failed`);
    }
  }
}

main();
