import dotenv from "dotenv";
dotenv.config();
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  const content = "FC Porto demands better buy obligation terms for Rodrigo Mora transfer to AS Roma. Porto and Roma Negotiate €50M Transfer for Rodrigo Mora as Fan Tokens Brace for Volatility.";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Summarize this: " + content,
    });
    console.log("Success:", response.text.slice(0, 100));
  } catch (err: any) {
    console.error("AI Error:", err.message);
  }
}
test();
