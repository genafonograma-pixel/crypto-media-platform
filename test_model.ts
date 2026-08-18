import dotenv from "dotenv";
dotenv.config();
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function testModel(modelName: string) {
  try {
    const res = await genAI.models.generateContent({
      model: modelName,
      contents: "hello",
    });
    console.log(modelName, "SUCCESS:", res.text?.slice(0, 20));
  } catch (e: any) {
    console.error(modelName, "FAILED:", e.message);
  }
}

await testModel("gemini-3.5-flash");
