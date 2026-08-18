import dotenv from "dotenv";
dotenv.config();

async function generateThumbnailCloudflare(prompt: string): Promise<Buffer | null> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  
  if (!accountId || !token) {
    console.error("Missing Cloudflare API credentials in environment.");
    return null;
  }

  try {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      console.error(`Cloudflare AI returned ${response.status}: ${await response.text()}`);
      return null;
    }

    const data = await response.json() as any;
    if (data && data.result && data.result.image) {
      return Buffer.from(data.result.image, "base64");
    }
    return null;
  } catch (err) {
    return null;
  }
}

async function uploadThumbnailToCatbox(buffer: Buffer, filename: string): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', new Blob([buffer], { type: 'image/jpeg' }), filename);

    const response = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const url = await response.text();
      return url.trim();
    }
    return null;
  } catch (err) {
    return null;
  }
}

async function main() {
  const prompt = "A highly detailed 16-bit pixel art scene about Bitcoin surging. Vibrant colors, masterpiece, aesthetic, completely text-free, NO words.";
  console.log("Generating with Cloudflare FLUX...");
  const buffer = await generateThumbnailCloudflare(prompt);
  if (buffer) {
    const url = await uploadThumbnailToCatbox(buffer, "PixelArt_Test.jpg");
    console.log(`[Pixel Art] ${url}`);
  } else {
    console.log("Failed to generate with Cloudflare.");
  }
}

main();
