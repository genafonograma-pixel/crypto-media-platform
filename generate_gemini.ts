import dotenv from "dotenv";
dotenv.config();

async function generateThumbnailGemini(prompt: string, model: string): Promise<Buffer | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: 1 }
      }),
    });

    if (!response.ok) {
        // Fallback for non-Imagen models (gemini image)
        const url2 = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
        const response2 = await fetch(url2, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseModalities: ["IMAGE"] }, // remove TEXT as the model might just generate text
          }),
        });
        
        if (!response2.ok) {
            console.log(await response2.text());
            return null;
        }
        const data = await response2.json() as any;
        const parts = data?.candidates?.[0]?.content?.parts ?? [];
        for (const part of parts) {
          if (part?.inlineData?.data) {
            return Buffer.from(part.inlineData.data, "base64");
          }
        }
        return null;
    }
    const data = await response.json() as any;
    if (data && data.predictions && data.predictions[0] && data.predictions[0].bytesBase64Encoded) {
        return Buffer.from(data.predictions[0].bytesBase64Encoded, "base64");
    }
    return null;
  } catch (err) {
    console.error(err);
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
  const prompt = "Professional highly detailed editorial illustration of Bitcoin surging, modern web3 aesthetic, clean minimal composition, vivid colors, no text";
  
  const modelsToTest = ["gemini-3.1-flash-image", "imagen-4.0-generate-001"];
  
  for (const model of modelsToTest) {
      console.log(`Generating with ${model}...`);
      const buffer = await generateThumbnailGemini(prompt, model);
      if (buffer) {
        const url = await uploadThumbnailToImgBB(buffer, `${model}_test.jpg`);
        console.log(`[${model}] ${url}`);
      } else {
        console.log(`Failed to generate with ${model}.`);
      }
  }
}

main();
