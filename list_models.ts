import dotenv from "dotenv";
dotenv.config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const response = await fetch(url);
  const data = await response.json() as any;
  if (data.models) {
    const imageModels = data.models.filter((m: any) => m.name.includes("image") || m.name.includes("vision"));
    console.log(imageModels.map((m: any) => m.name));
  } else {
    console.log(data);
  }
}
listModels();
