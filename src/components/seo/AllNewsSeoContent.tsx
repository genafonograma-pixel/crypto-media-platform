import React from 'react';
import { BookOpen, Award, CheckCircle2, TrendingUp, ShieldCheck, Newspaper, Filter, Eye, AlertTriangle } from 'lucide-react';
import { AUTHOR } from '../../data/author';

export default function AllNewsSeoContent() {
  return (
    <article className="mt-14 bg-[#0B0B0C] border border-zinc-800/80 rounded-2xl p-6 sm:p-8 md:p-12 text-zinc-300 leading-relaxed font-sans shadow-xl">
      {/* Editorial Header / E-E-A-T Signals */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-200 font-bold text-sm">
            JC
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-100">{AUTHOR.name}</div>
            <div className="text-[11px] text-zinc-400">{AUTHOR.title} · News Desk Editor</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
          <span>Updated: Real-Time Stream</span>
          <span>•</span>
          <span>12 Min Read</span>
          <span>•</span>
          <span className="text-zinc-200 font-medium">News &amp; Media Guide</span>
        </div>
      </div>

      {/* Main H2 Heading */}
      <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3">
        <BookOpen size={14} className="text-amber-500/80" />
        <span>Newsroom Playbook &amp; Verification</span>
      </div>

      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white mb-4 leading-tight">
        All Cryptocurrency News &amp; Market Intelligence: The Investor's Complete Information Playbook
      </h2>

      <p className="text-base text-zinc-400 leading-relaxed mb-6 font-normal">
        An indispensable guide to mastering the crypto information landscape—how news catalysts impact price discovery, how to identify market manipulation and speculative FUD, and how to track digital assets across real-time feeds.
      </p>

      {/* Quick Table of Contents */}
      <nav aria-label="Table of Contents" className="my-8 p-5 sm:p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3 flex items-center gap-2">
          <span>Guide Contents &amp; Quick Navigation</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <a href="#news-velocity" className="text-zinc-400 hover:text-white transition-colors py-1 flex items-center gap-2">
            <span className="text-zinc-400 font-mono text-[11px]">01.</span> Information Velocity in 24/7 Digital Asset Markets
          </a>
          <a href="#news-catalysts" className="text-zinc-400 hover:text-white transition-colors py-1 flex items-center gap-2">
            <span className="text-zinc-400 font-mono text-[11px]">02.</span> Major News Catalysts &amp; Their Market Impacts
          </a>
          <a href="#news-cycles" className="text-zinc-400 hover:text-white transition-colors py-1 flex items-center gap-2">
            <span className="text-zinc-400 font-mono text-[11px]">03.</span> Market Cycle Anatomy: Bull, Bear &amp; Accumulation
          </a>
          <a href="#news-verification" className="text-zinc-400 hover:text-white transition-colors py-1 flex items-center gap-2">
            <span className="text-zinc-400 font-mono text-[11px]">04.</span> How to Filter FUD &amp; Verify On-Chain Facts
          </a>
          <a href="#news-methodology" className="text-zinc-400 hover:text-white transition-colors py-1 flex items-center gap-2">
            <span className="text-zinc-400 font-mono text-[11px]">05.</span> Wild West Crypto Show Editorial Standards
          </a>
        </div>
      </nav>

      {/* Section 1 */}
      <section id="news-velocity" className="space-y-4 my-10 pt-4 border-t border-zinc-800/80">
        <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
          <span className="text-zinc-400 font-mono text-base">01.</span>
          Information Velocity in 24/7 Digital Asset Markets
        </h3>
        <p>
          In traditional financial markets, information flows through formalized gatekeepers—regulatory filings (SEC Edgar), central bank press conferences, and quarterly earnings calls. Trading halts and pre-market/after-hours boundaries regulate the transmission speed of financial news into asset prices.
        </p>
        <p>
          Cryptocurrency has dismantled these boundaries. Digital assets exist in a continuous state of price discovery. News propagates across decentralized developer forums, on-chain transaction mempools, decentralized governance forums, and institutional wire services concurrently. Because liquidity pools on decentralized exchanges execute autonomously according to smart contracts, price adjustments to breaking news occur in milliseconds.
        </p>
        <p>
          For digital asset market participants, maintaining an edge requires an information pipeline that balances rapid discovery with rigorous editorial verification. Rumors and unsubstantiated claims frequently trigger volatile leverage liquidations, only to reverse when on-chain facts emerge.
        </p>
      </section>

      {/* Section 2 */}
      <section id="news-catalysts" className="space-y-4 my-10 pt-4 border-t border-zinc-800/80">
        <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
          <span className="text-zinc-400 font-mono text-base">02.</span>
          Major News Catalysts &amp; Their Historical Market Impacts
        </h3>
        <p>
          Not all news carries equal market weight. Seasoned crypto analysts categorize news events into distinct tiers of structural significance:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800">
            <div className="text-zinc-400 font-semibold text-xs uppercase tracking-wider mb-1.5">Tier 1: Macro &amp; Regulatory</div>
            <div className="text-white font-bold text-base mb-2">Structural Catalysts</div>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Spot ETF approvals, central bank interest rate decisions, global fiscal stimulus, and landmark legislative acts (e.g., FIT21, MiCA). Dictates multi-month liquidity trends across the entire market cap.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800">
            <div className="text-zinc-400 font-semibold text-xs uppercase tracking-wider mb-1.5">Tier 2: Protocol Architecture</div>
            <div className="text-white font-bold text-base mb-2">Technical Upgrades</div>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Bitcoin halvings, Ethereum hard forks (Dencun, Pectra), Layer-1 consensus updates, and major bridge deployments. Affects token issuance, gas efficiency, and staking yields.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800">
            <div className="text-zinc-400 font-semibold text-xs uppercase tracking-wider mb-1.5">Tier 3: Ecosystem &amp; Market</div>
            <div className="text-white font-bold text-base mb-2">Tactical Catalysts</div>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              DEX listing announcements, venture capital rounds, token unlock schedules, exploit alerts, and partnership announcements. Generates high short-term volatility in specific tokens.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section id="news-cycles" className="space-y-4 my-10 pt-4 border-t border-zinc-800/80">
        <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
          <span className="text-zinc-400 font-mono text-base">03.</span>
          The Anatomy of Cryptocurrency Market Cycles
        </h3>
        <p>
          Understanding how news sentiment interacts with underlying market liquidity requires analyzing historical cycle phases:
        </p>

        <div className="overflow-x-auto my-6">
          <table className="w-full text-left text-xs border border-zinc-800 rounded-xl overflow-hidden">
            <thead className="bg-zinc-900 text-zinc-400 uppercase font-semibold border-b border-zinc-800">
              <tr>
                <th className="p-3.5">Cycle Phase</th>
                <th className="p-3.5">Typical Sentiment</th>
                <th className="p-3.5">News Dynamics</th>
                <th className="p-3.5">Volume &amp; Volatility</th>
                <th className="p-3.5">Investor Behavior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/60 text-zinc-300">
              <tr>
                <td className="p-3.5 font-semibold text-white">Accumulation</td>
                <td className="p-3.5 text-zinc-400">Apathy &amp; Disbelief</td>
                <td className="p-3.5 text-zinc-400">Positive fundamentals ignored by mainstream media</td>
                <td className="p-3.5">Low volatility, quiet volume</td>
                <td className="p-3.5 text-emerald-400 font-medium">Smart Money &amp; Whales Accumulate</td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-white">Expansion (Bull Run)</td>
                <td className="p-3.5 text-emerald-400 font-medium">Optimism &amp; Excitement</td>
                <td className="p-3.5">Rapid flow of institutional partnerships &amp; ETF records</td>
                <td className="p-3.5 text-zinc-100 font-medium">Surging spot &amp; derivatives volume</td>
                <td className="p-3.5">Broad market participation expands</td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-white">Euphoria (Cycle Top)</td>
                <td className="p-3.5 text-rose-400 font-medium">Greed &amp; Complacency</td>
                <td className="p-3.5">Mainstream hype, unrealistic price targets, frenzy</td>
                <td className="p-3.5 text-rose-400">Extreme volatility, liquidation cascades</td>
                <td className="p-3.5 text-zinc-400">Retail peak buying; early accumulators distribute</td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-white">Capitulation (Bear Market)</td>
                <td className="p-3.5 text-zinc-400">Fear, Panic &amp; Despair</td>
                <td className="p-3.5 text-zinc-400">Sensationalist "crypto is dead" mainstream headlines</td>
                <td className="p-3.5">Declining liquidity, sharp downward wicks</td>
                <td className="p-3.5">Leveraged participants forced into liquidation</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4 */}
      <section id="news-verification" className="space-y-4 my-10 pt-4 border-t border-zinc-800/80">
        <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
          <span className="text-zinc-400 font-mono text-base">04.</span>
          How to Filter FUD &amp; Verify On-Chain Facts
        </h3>
        <p>
          "FUD" (Fear, Uncertainty, and Doubt) is an endemic hazard in crypto reporting. Sensationalized headlines and falsified rumors frequently circulate to trigger leveraged stop losses. Follow this 4-step verification framework before reacting to news:
        </p>

        <div className="space-y-3 my-4">
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
            <div>
              <strong className="text-white block text-sm mb-1">Verify On-Chain Transaction Hashes:</strong>
              <p className="text-xs text-zinc-400 font-normal">If a news report claims a whale moved $500M or a protocol suffered an exploit, look for verified on-chain transaction hashes on block explorers (Etherscan, Mempool, Solscan). The blockchain never lies.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
            <div>
              <strong className="text-white block text-sm mb-1">Cross-Reference Regulatory Primary Sources:</strong>
              <p className="text-xs text-zinc-400 font-normal">Verify regulatory claims directly against official government registries (SEC EDGAR filings, Federal Reserve press releases, European Parliament gazettes) rather than second-hand social media threads.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
            <div>
              <strong className="text-white block text-sm mb-1">Inspect Official Protocol Repositories:</strong>
              <p className="text-xs text-zinc-400 font-normal">Confirm technical announcements by checking open-source GitHub commit activity, official governance proposals (Snapshot, Commonwealth), and verified protocol documentation.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 flex items-start gap-3">
            <span className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-300 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">4</span>
            <div>
              <strong className="text-white block text-sm mb-1">Monitor Reputable News Platforms:</strong>
              <p className="text-xs text-zinc-400 font-normal">Rely on dedicated platforms like Wild West Crypto Show where editorial verification and algorithmic validation filter out malicious rumors before publishing.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5 */}
      <section id="news-methodology" className="space-y-4 my-10 pt-4 border-t border-zinc-800/80">
        <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
          <span className="text-zinc-400 font-mono text-base">05.</span>
          Wild West Crypto Show Editorial Standards &amp; Reader Guarantee
        </h3>
        <p>
          Our mission is to provide an uncompromised, objective, and transparent window into the decentralized economy. Every article published on our All News feed is evaluated for:
        </p>
        <ul className="space-y-2 text-xs sm:text-sm my-3">
          <li className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-zinc-400 shrink-0" />
            <span><strong className="text-white font-medium">Factual Accuracy:</strong> Checked against primary sources, audited smart contracts, and official filings.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-zinc-400 shrink-0" />
            <span><strong className="text-white font-medium">Zero Paid Editorial Bias:</strong> Editorial articles are never sold to coin promoters or sponsored PR campaigns.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-zinc-400 shrink-0" />
            <span><strong className="text-white font-medium">Concise Market Context:</strong> We cut through noise with structured Market Briefs explaining why the story matters.</span>
          </li>
        </ul>
      </section>

      {/* Summary Footer */}
      <div className="mt-8 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
        <div>
          Published by <span className="text-zinc-200 font-semibold">Wild West Crypto Show</span> Newsroom
        </div>
        <div>
          <span>Updated every 15 minutes with verified cryptocurrency headlines.</span>
        </div>
      </div>
    </article>
  );
}
