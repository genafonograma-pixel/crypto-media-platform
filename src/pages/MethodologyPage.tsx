import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

export default function MethodologyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#F5F5F5] font-sans">
      <SEO title="AI Methodology | Crypton" description="How Crypton produces AI-powered crypto news and market analysis." />
      <Header />
      <main className="flex-1 max-w-[800px] w-full mx-auto px-4 py-12">
        <h1 className="text-4xl font-black mb-8 text-white">How Crypton AI News Works</h1>
        <div className="prose prose-invert max-w-none">
          <p>Crypton uses a hybrid intelligence system to track, normalize, and analyze the cryptocurrency market. Our platform combines real-time data ingestion with advanced AI models to synthesize events without human editorial bottlenecks.</p>
          
          <h3>1. Source Ingestion & Aggregation</h3>
          <p>We monitor top cryptocurrency news outlets, regulatory announcements, and financial publications via RSS and API feeds. Articles are fetched every 5 minutes to ensure up-to-date coverage.</p>

          <h3>2. Event Clustering (Duplicate Detection)</h3>
          <p>When multiple publications report on the same event (e.g., a Bitcoin ETF approval), our system uses similarity algorithms to detect the duplication. Instead of spamming our feed with ten identical stories, we cluster them into a single "Event" and cite all relevant sources.</p>

          <h3>3. AI Analysis & Summarization</h3>
          <p>Our Large Language Models process the clustered news stories alongside live market data (like price and trading volume). The AI is strictly instructed to:</p>
          <ul>
            <li>Extract only verified facts.</li>
            <li>Maintain neutrality and avoid financial advice.</li>
            <li>Identify "Why it matters" for market participants.</li>
            <li>Avoid hallucinations by refusing to generate analysis when data is insufficient.</li>
          </ul>

          <h3>4. Continuous Updates</h3>
          <p>Pages like our Bitcoin News Hub are updated automatically throughout the day as significant new information arrives or major price movements occur.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
