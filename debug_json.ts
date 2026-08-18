import dotenv from "dotenv";
dotenv.config();
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function runAIPrompt(prompt: string) {
  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
    let rawText = response.text?.trim() || "{}";
    console.log("Raw Response:\n", rawText);
    
    if (rawText.startsWith("```json"))
      rawText = rawText.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    else if (rawText.startsWith("```"))
      rawText = rawText.replace(/^```\n?/, "").replace(/\n?```$/, "");
      
    return JSON.parse(rawText);
  } catch (err: any) {
    console.error(`AI prompt failed: ${err.message}`);
    return null;
  }
}

async function test() {
  const p = `You are a senior crypto intelligence researcher. Your task is to analyze the source material and build a strict factual Research Object.
SOURCE OUTLET: Test Source
RAW SOURCE CONTENT:
Bitcoin price drops below 60k as miners sell off. The overall market is down 5% today.

INSTRUCTIONS:
1. Classify the event into one category (e.g. Breaking News, Regulation, Security/Hack, Company/Earnings, Market Movement).
2. Extract all verifiable facts, numbers, dates, people, and organizations.
3. If you can calculate a useful metric (e.g., percentage change), do so and log it in calculations. Do NOT invent numbers.
4. Return ONLY a JSON object:
{
  "classification": "string",
  "facts": [{"fact": "string", "source_ids": ["Test Source"], "confidence": "high|medium|low"}],
  "calculations": [{"type": "string", "formula": "string", "inputs": [1,2], "result": "string", "source_ids": ["Test Source"]}]
}`;

  console.log("Testing...");
  const res = await runAIPrompt(p);
  console.log("Parsed JSON:", res);
}
test();
