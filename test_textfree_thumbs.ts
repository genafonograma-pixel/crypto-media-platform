async function test() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;

  const prompts = [
    "A stunning 3D conceptual illustration of a glowing Bitcoin logo shattering into digital shards. Sleek futuristic dark background, cyberpunk lighting, ultra-high quality, completely text-free, NO words.",
    "A photorealistic 3D render of abstract blockchain nodes glowing in a vibrant neon cyan and purple grid, representing DeFi ecosystem growth. Cinematic lighting, editorial style, completely text-free, NO words.",
    "A cinematic and moody conceptual illustration of a digital courtroom representing crypto regulation. Glowing smart contract papers floating in the air. Professional news aesthetic, 8k resolution, completely text-free, NO words."
  ];

  for (let i = 0; i < prompts.length; i++) {
    const p = prompts[i];
    console.log(`Generating image ${i+1}...`);
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: p }),
    });
    
    const data = await response.json() as any;
    const b64 = data.result.image;
    const buffer = Buffer.from(b64, "base64");
    
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', new Blob([buffer], { type: 'image/jpeg' }), `thumb${i}.jpg`);
    
    const catboxRes = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: formData,
    });
    const url = await catboxRes.text();
    console.log(`Result ${i+1}: ${url}`);
  }
}

test().catch(console.error);
