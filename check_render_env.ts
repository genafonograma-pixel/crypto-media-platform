// This hits an endpoint that only works if GEMINI_API_KEY is set on Render
// We add a diagnostic endpoint temporarily to check
import dotenv from "dotenv";
dotenv.config();

const resp = await fetch("https://crypto-media-platform.onrender.com/api/fear-greed");
console.log("Fear/greed works:", resp.ok, resp.status);

// Try triggering a minimal AI test via the process endpoint
const SECRET = process.env.PROCESS_SECRET;
const trigger = await fetch("https://crypto-media-platform.onrender.com/api/process", {
  method: "POST",
  headers: { "Authorization": `Bearer ${SECRET}`, "Content-Type": "application/json" }
});
console.log("Trigger response:", await trigger.text());
