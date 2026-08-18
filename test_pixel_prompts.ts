import dotenv from "dotenv";
dotenv.config();

async function generateThumbnailCloudflare(prompt: string): Promise<Buffer | null> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  const data = await response.json() as any;
  if (data && data.result && data.result.image) {
    return Buffer.from(data.result.image, "base64");
  }
  return null;
}

async function uploadThumbnailToCatbox(buffer: Buffer, filename: string): Promise<string | null> {
  const formData = new FormData();
  formData.append('reqtype', 'fileupload');
  formData.append('fileToUpload', new Blob([buffer], { type: 'image/jpeg' }), filename);

  const response = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: formData,
  });

  if (response.ok) {
    return (await response.text()).trim();
  }
  return null;
}

async function main() {
  const prompts = [
    "AUTHENTIC 8-BIT PIXEL ART: Flat 2D pixel art of a bank vault with bitcoin, retro SNES style graphics, low resolution, visible square pixels, limited color palette. Masterpiece.",
    "True retro 16-bit pixel art illustration, flat 2D. Bitcoin chart going up. Distinct, chunky pixels. Indie game aesthetic, pixelated.",
    "A crypto bank vault. SNES RPG style pixel art. True 2D pixel-art, flat colors, dithered shading, visible blocky pixels. No 3D effects, no smooth rendering."
  ];

  for (let i = 0; i < prompts.length; i++) {
    console.log(`Testing prompt ${i + 1}...`);
    const buffer = await generateThumbnailCloudflare(prompts[i]);
    if (buffer) {
      const url = await uploadThumbnailToCatbox(buffer, `PixelArt_V${i+1}.jpg`);
      console.log(`Result ${i + 1}: ${url}`);
    } else {
      console.log(`Result ${i + 1}: Failed`);
    }
  }
}

main();
