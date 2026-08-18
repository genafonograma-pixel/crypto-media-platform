import puter from "@heyputer/puter.js";

async function test() {
  try {
    const res = await puter.ai.chat("Hello! Reply with a JSON object { \"status\": \"ok\" }", { model: "openai/gpt-5.5" });
    console.log(res);
  } catch(e) {
    console.error("error:", e);
  }
}
test();
