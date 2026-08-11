import dotenv from "dotenv";
dotenv.config();

async function generateThumbnailFlux(prompt: string): Promise<Buffer | null> {
  try {
    const encodedPrompt = encodeURIComponent(prompt);
    // Added model=flux to the parameters
    const params = new URLSearchParams({ width: "1200", height: "630", nologo: "true", seed: "12345", model: "flux" });
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?${params}`;
    console.log("Fetching from: " + url);
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
  const prompt = "Crypto news thumbnail. Subject: Bitcoin surging. Professional high quality editorial illustration, modern web3 aesthetic, solid background, clean composition, no text";
  console.log("Generating with Flux (Pollinations)...");
  const buffer = await generateThumbnailFlux(prompt);
  if (buffer) {
    const url = await uploadThumbnailToImgBB(buffer, "Flux_Test.jpg");
    console.log(`[Flux] ${url}`);
  } else {
    console.log("Failed to generate with Flux.");
  }
}

main();
