import { fetchRSSArticles } from './server';
import dotenv from "dotenv";
dotenv.config();

async function test() {
  console.log("Fetching RSS...");
  try {
    const articles = await fetchRSSArticles();
    console.log(`Fetched ${articles.length} articles.`);
    if (articles.length > 0) {
      console.log("First article title:", articles[0].title);
    }
  } catch (err: any) {
    console.error("RSS Error:", err.message);
  }
}
test();
