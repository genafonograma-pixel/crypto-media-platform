import React from 'react';
import { BookOpen, Award, CheckCircle2, TrendingUp, ShieldCheck, Zap, Database, Globe, Layers } from 'lucide-react';
import { AUTHOR } from '../../data/author';

export default function BitcoinSeoContent() {
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
            <div className="text-[11px] text-zinc-400">{AUTHOR.title} · Fact-Checked by Editorial Board</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
          <span>Updated: Real-Time 2026</span>
          <span>•</span>
          <span>15 Min Read</span>
          <span>•</span>
          <span className="text-zinc-200 font-medium">Comprehensive Guide</span>
        </div>
      </div>

      {/* Main H2 Heading */}
      <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3">
        <BookOpen size={14} className="text-amber-500/80" />
        <span>Market Intelligence &amp; Technical Analysis</span>
      </div>

      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white mb-4 leading-tight">
        The Definitive Bitcoin Guide: Market Cycles, Spot ETFs &amp; Sovereign Monetary Economics
      </h2>

      <p className="text-base text-zinc-400 leading-relaxed mb-6 font-normal">
        An authoritative institutional analysis of Bitcoin (BTC)—from cryptographic fundamentals, stock-to-flow supply dynamics, and spot ETF liquidity to on-chain analytics, Layer-2 scaling, and macroeconomic asset allocation.
      </p>

      {/* Table of Contents */}
      <nav aria-label="Table of Contents" className="my-8 p-5 sm:p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3 flex items-center gap-2">
          <span>Table of Contents</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <a href="#btc-architecture" className="text-zinc-400 hover:text-white transition-colors py-1 flex items-center gap-2">
            <span className="text-zinc-400 font-mono text-[11px]">01.</span> What Is Bitcoin: Proof-of-Work &amp; Scarcity
          </a>
          <a href="#btc-halvings" className="text-zinc-400 hover:text-white transition-colors py-1 flex items-center gap-2">
            <span className="text-zinc-400 font-mono text-[11px]">02.</span> The 4-Year Halving Cycle &amp; Issuance
          </a>
          <a href="#btc-etf" className="text-zinc-400 hover:text-white transition-colors py-1 flex items-center gap-2">
            <span className="text-zinc-400 font-mono text-[11px]">03.</span> Spot ETFs &amp; Institutional Wall Street Inflows
          </a>
          <a href="#btc-onchain" className="text-zinc-400 hover:text-white transition-colors py-1 flex items-center gap-2">
            <span className="text-zinc-400 font-mono text-[11px]">04.</span> Crucial On-Chain Valuation Metrics
          </a>
          <a href="#btc-comparison" className="text-zinc-400 hover:text-white transition-colors py-1 flex items-center gap-2">
            <span className="text-zinc-400 font-mono text-[11px]">05.</span> Bitcoin vs. Gold vs. Fiat Currencies
          </a>
          <a href="#btc-scaling" className="text-zinc-400 hover:text-white transition-colors py-1 flex items-center gap-2">
            <span className="text-zinc-400 font-mono text-[11px]">06.</span> Scaling via Lightning &amp; Layer-2 BitVM
          </a>
          <a href="#btc-macro" className="text-zinc-400 hover:text-white transition-colors py-1 flex items-center gap-2">
            <span className="text-zinc-400 font-mono text-[11px]">07.</span> Macro Drivers: Debt, M2 &amp; Inflation Hedge
          </a>
          <a href="#btc-security" className="text-zinc-400 hover:text-white transition-colors py-1 flex items-center gap-2">
            <span className="text-zinc-400 font-mono text-[11px]">08.</span> Custody, Cold Storage &amp; Safety Guide
          </a>
        </div>
      </nav>

      {/* Section 1 */}
      <section id="btc-architecture" className="space-y-4 my-10 pt-4 border-t border-zinc-800/80">
        <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
          <span className="text-zinc-400 font-mono text-base">01.</span>
          What Is Bitcoin? The Monetary Invention of Cryptographic Scarcity
        </h3>
        <p>
          Introduced on October 31, 2008, by the pseudonymous cryptographer Satoshi Nakamoto via the foundational whitepaper <em>"Bitcoin: A Peer-to-Peer Electronic Cash System,"</em> Bitcoin solved the Byzantine Generals Problem—the long-standing computer science dilemma of achieving consensus across an adversarial, decentralized network without a centralized intermediary.
        </p>
        <p>
          Bitcoin achieves this through a consensus mechanism called <strong className="text-white">Proof-of-Work (PoW)</strong> combined with the SHA-256 cryptographic hashing algorithm. In traditional fiat systems, commercial banks and central banking cartels control ledger state, issuance, and account balances. Under Bitcoin, the ledger is distributed across tens of thousands of independent nodes running open-source software worldwide.
        </p>
        <p>
          Crucially, Bitcoin introduces absolute mathematical scarcity into a digital universe previously characterized by frictionless copy-and-paste replication. There will only ever exist <strong className="text-white">21,000,000 bitcoins</strong>. Each individual bitcoin is divisible into 100,000,000 smaller units called <em>satoshis</em> (or "sats"). This fixed supply is enforced mathematically by the network's consensus rules and cannot be arbitrarily modified by politicians, executives, or corporate boards.
        </p>
      </section>

      {/* Section 2 */}
      <section id="btc-halvings" className="space-y-4 my-10 pt-4 border-t border-zinc-800/80">
        <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
          <span className="text-zinc-400 font-mono text-base">02.</span>
          The 4-Year Halving Cycle: Stock-to-Flow Dynamics &amp; Programmatic Supply Shocks
        </h3>
        <p>
          At the core of Bitcoin's monetary architecture is the programmatic <strong className="text-white">Halving</strong>. Occurring automatically every 210,000 blocks (roughly every four calendar years), the block subsidy awarded to miners for validating transactions and securing the network is reduced by exactly 50%.
        </p>
        
        {/* Halving Comparison Table */}
        <div className="overflow-x-auto my-6">
          <table className="w-full text-left text-xs border border-zinc-800 rounded-xl overflow-hidden">
            <thead className="bg-zinc-900 text-zinc-400 uppercase font-semibold border-b border-zinc-800">
              <tr>
                <th className="p-3.5">Halving Event</th>
                <th className="p-3.5">Approx. Date</th>
                <th className="p-3.5">Block Height</th>
                <th className="p-3.5">Block Reward</th>
                <th className="p-3.5">Annualized Inflation Rate</th>
                <th className="p-3.5">Cycle Market High</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/60 text-zinc-300">
              <tr>
                <td className="p-3.5 font-semibold text-white">Genesis Block</td>
                <td className="p-3.5 text-zinc-400">Jan 3, 2009</td>
                <td className="p-3.5 font-mono">0</td>
                <td className="p-3.5 text-zinc-200 font-medium">50.0 BTC</td>
                <td className="p-3.5 text-zinc-400">Initial Issuance</td>
                <td className="p-3.5 text-zinc-400">$31 (2011)</td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-white">1st Halving</td>
                <td className="p-3.5 text-zinc-400">Nov 28, 2012</td>
                <td className="p-3.5 font-mono">210,000</td>
                <td className="p-3.5 text-zinc-200 font-medium">25.0 BTC</td>
                <td className="p-3.5">~8.4%</td>
                <td className="p-3.5 text-zinc-400">$1,163 (2013)</td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-white">2nd Halving</td>
                <td className="p-3.5 text-zinc-400">Jul 9, 2016</td>
                <td className="p-3.5 font-mono">420,000</td>
                <td className="p-3.5 text-zinc-200 font-medium">12.5 BTC</td>
                <td className="p-3.5">~3.7%</td>
                <td className="p-3.5 text-zinc-400">$19,666 (2017)</td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-white">3rd Halving</td>
                <td className="p-3.5 text-zinc-400">May 11, 2020</td>
                <td className="p-3.5 font-mono">630,000</td>
                <td className="p-3.5 text-zinc-200 font-medium">6.25 BTC</td>
                <td className="p-3.5">~1.8%</td>
                <td className="p-3.5 text-zinc-400">$69,000 (2021)</td>
              </tr>
              <tr className="bg-zinc-900/60">
                <td className="p-3.5 font-bold text-white">4th Halving</td>
                <td className="p-3.5 text-zinc-200 font-medium">April 20, 2024</td>
                <td className="p-3.5 font-mono text-zinc-200">840,000</td>
                <td className="p-3.5 text-zinc-100 font-bold">3.125 BTC</td>
                <td className="p-3.5 text-emerald-400 font-medium">&lt; 0.85% (Lower than Gold)</td>
                <td className="p-3.5 text-white font-medium">New All-Time Highs</td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-white">5th Halving (Proj.)</td>
                <td className="p-3.5 text-zinc-400">2028 Est.</td>
                <td className="p-3.5 font-mono">1,050,000</td>
                <td className="p-3.5 text-zinc-200 font-medium">1.5625 BTC</td>
                <td className="p-3.5 text-emerald-400">~0.4%</td>
                <td className="p-3.5 text-zinc-400">Projected Expansion</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Following the 4th Halving in April 2024, Bitcoin's annualized inflation rate dropped below 0.85%—officially making Bitcoin more scarce than physical gold (which expands at approximately 1.5% to 2% annually via mining extraction). With daily new supply reduced to just 450 BTC globally, even modest institutional inflows from spot ETFs create significant structural upward pressure on market prices.
        </p>
      </section>

      {/* Section 3 */}
      <section id="btc-etf" className="space-y-4 my-10 pt-4 border-t border-zinc-800/80">
        <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
          <span className="text-zinc-400 font-mono text-base">03.</span>
          Spot Bitcoin ETFs &amp; Institutional Wall Street Inflows
        </h3>
        <p>
          The launch of regulated spot Bitcoin exchange-traded funds (ETFs) in the United States marked the formal transition of Bitcoin from an alternative retail asset into an accepted asset class for institutional portfolio construction. Offerings by BlackRock (iShares Bitcoin Trust - IBIT), Fidelity (Wise Origin Bitcoin Fund - FBTC), Ark Invest, and Bitwise absorbed tens of billions of dollars in their opening months of trading.
        </p>
        <ul className="space-y-3 my-4">
          <li className="flex items-start gap-3">
            <CheckCircle2 size={16} className="text-zinc-400 shrink-0 mt-1" />
            <span><strong className="text-white">Fiduciary Access:</strong> Registered Investment Advisors (RIAs) managing over $30 trillion in wealth can now legally allocate 1% to 5% of client portfolios to physical Bitcoin through existing brokerage workflows without navigating crypto exchanges.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 size={16} className="text-zinc-400 shrink-0 mt-1" />
            <span><strong className="text-white">Corporate Treasury Strategy:</strong> Pioneers like MicroStrategy demonstrated that holding Bitcoin as a primary treasury reserve asset dramatically outperforms holding cash depreciating against inflation.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 size={16} className="text-zinc-400 shrink-0 mt-1" />
            <span><strong className="text-white">Institutional Custody &amp; Auditing:</strong> Regulated custodians like Coinbase Custody and institutional trust banks maintain cold-storage multi-signature custody, satisfying rigorous SOC 2 and institutional regulatory requirements.</span>
          </li>
        </ul>
      </section>

      {/* Section 4 */}
      <section id="btc-onchain" className="space-y-4 my-10 pt-4 border-t border-zinc-800/80">
        <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
          <span className="text-zinc-400 font-mono text-base">04.</span>
          Crucial On-Chain Valuation Metrics Every Investor Must Track
        </h3>
        <p>
          Unlike legacy equities where investors depend on backward-looking quarterly earnings reports, Bitcoin's public ledger enables real-time auditing of user behavior, accumulation trends, and network health:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800">
            <div className="text-zinc-400 font-semibold text-xs uppercase tracking-wider mb-1">Network Security</div>
            <div className="text-white font-bold text-base mb-2">Mining Hashrate &amp; Difficulty</div>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Hashrate measures the total computational power dedicated to securing Bitcoin's blockchain. Persistent all-time highs demonstrate massive institutional miner capital expenditure, hardware efficiency gains, and absolute defense against 51% reorganization attacks.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800">
            <div className="text-zinc-400 font-semibold text-xs uppercase tracking-wider mb-1">Conviction Analysis</div>
            <div className="text-white font-bold text-base mb-2">Long-Term vs. Short-Term Holders</div>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Long-Term Holders (LTH) are entities holding coins unmoved for over 155 days. When LTH supply reaches multi-year highs during market consolidations, it signals that liquid circulating supply is locked up by high-conviction accumulators.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800">
            <div className="text-zinc-400 font-semibold text-xs uppercase tracking-wider mb-1">Cycle Indicator</div>
            <div className="text-white font-bold text-base mb-2">MVRV Z-Score &amp; Realized Cap</div>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              The MVRV Z-Score normalizes the difference between market value and realized value (the aggregate price when each coin last moved on-chain). Historically, Z-scores above 7 signal overheated macro tops, while readings below 0 mark generational accumulation bottoms.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800">
            <div className="text-zinc-400 font-semibold text-xs uppercase tracking-wider mb-1">Liquidity Supply</div>
            <div className="text-white font-bold text-base mb-2">Exchange Reserve Balances</div>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Monitors the total quantity of BTC held in centralized exchange wallets (Binance, Coinbase, Kraken). Sustained outflows into cold storage reduce immediate order-book sell depth, setting the stage for acute supply crunches.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5 */}
      <section id="btc-comparison" className="space-y-4 my-10 pt-4 border-t border-zinc-800/80">
        <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
          <span className="text-zinc-400 font-mono text-base">05.</span>
          Bitcoin vs. Physical Gold vs. Fiat Currencies: Full Comparative Matrix
        </h3>
        <p>
          To understand why central banks, sovereign wealth funds, and private investors are allocating to Bitcoin, examine how Bitcoin compares against historical monetary standards across key monetary properties:
        </p>

        <div className="overflow-x-auto my-6">
          <table className="w-full text-left text-xs border border-zinc-800 rounded-xl overflow-hidden">
            <thead className="bg-zinc-900 text-zinc-400 uppercase font-semibold border-b border-zinc-800">
              <tr>
                <th className="p-3.5">Monetary Property</th>
                <th className="p-3.5">Bitcoin (BTC)</th>
                <th className="p-3.5">Physical Gold</th>
                <th className="p-3.5">Fiat Currency (USD, EUR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/60 text-zinc-300">
              <tr>
                <td className="p-3.5 font-semibold text-white">Scarcity</td>
                <td className="p-3.5 text-emerald-400 font-medium">Absolute (21 Million Cap)</td>
                <td className="p-3.5 text-zinc-400">Relative (~1.5–2% annual inflation)</td>
                <td className="p-3.5 text-rose-400 font-medium">None (Unlimited Printing)</td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-white">Portability</td>
                <td className="p-3.5 text-emerald-400 font-medium">Infinite (Sent globally in seconds)</td>
                <td className="p-3.5 text-rose-400">Very Poor (Heavy, costly transit)</td>
                <td className="p-3.5 text-zinc-400">Moderate (Wire limits, controls)</td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-white">Divisibility</td>
                <td className="p-3.5 text-emerald-400 font-medium">1 BTC = 100,000,000 Satoshis</td>
                <td className="p-3.5 text-zinc-400">Difficult (Requires melting &amp; assaying)</td>
                <td className="p-3.5 text-zinc-400">Standard (100 Cents)</td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-white">Verifiability</td>
                <td className="p-3.5 text-emerald-400 font-medium">Instant &amp; Free (Full node audit)</td>
                <td className="p-3.5 text-rose-400">Expensive (Assaying labs, counterfeit risk)</td>
                <td className="p-3.5 text-zinc-400">Moderate (Counterfeit bills exist)</td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-white">Censorship Resistance</td>
                <td className="p-3.5 text-emerald-400 font-medium">Absolute (Private keys grant access)</td>
                <td className="p-3.5 text-zinc-400">Moderate (Physical seizure risk)</td>
                <td className="p-3.5 text-rose-400">Zero (Bank freezes, sanctions)</td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-white">Track Record</td>
                <td className="p-3.5 text-zinc-200 font-medium">17+ Years Flawless Uptime</td>
                <td className="p-3.5 text-emerald-400 font-medium">5,000+ Years</td>
                <td className="p-3.5 text-rose-400">Historically devalues over time</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 6 */}
      <section id="btc-scaling" className="space-y-4 my-10 pt-4 border-t border-zinc-800/80">
        <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
          <span className="text-zinc-400 font-mono text-base">06.</span>
          Scaling the Base Layer: Lightning Network, Ordinals &amp; Layer-2 BitVM
        </h3>
        <p>
          A common early criticism of Bitcoin was its base-layer throughput of approximately 7 transactions per second (TPS). However, modern monetary systems operate in layers: gold was the settlement layer, while bank notes and credit card rails served as the transactional velocity layer.
        </p>
        <ul className="space-y-3 my-4">
          <li className="flex items-start gap-3">
            <Zap size={16} className="text-zinc-400 shrink-0 mt-1" />
            <span><strong className="text-white">The Lightning Network:</strong> A Layer-2 protocol of bidirectional payment channels enabling millions of instant, sub-cent payments per second globally. Adopted by nation-states (El Salvador) and major point-of-sale systems.</span>
          </li>
          <li className="flex items-start gap-3">
            <Database size={16} className="text-zinc-400 shrink-0 mt-1" />
            <span><strong className="text-white">Ordinals &amp; Runes:</strong> Leveraging the Taproot protocol upgrade, Ordinals enable data inscriptions directly onto individual satoshis, creating an immutable on-chain digital artifacts market and sovereign tokenization layer natively on Bitcoin.</span>
          </li>
          <li className="flex items-start gap-3">
            <Layers size={16} className="text-zinc-400 shrink-0 mt-1" />
            <span><strong className="text-white">BitVM &amp; Bitcoin Rollups:</strong> Groundbreaking cryptographic paradigms enabling Turing-complete smart contracts and zero-knowledge validity rollups to verify state transitions on Bitcoin without requiring hard-fork protocol modifications.</span>
          </li>
        </ul>
      </section>

      {/* Section 7 */}
      <section id="btc-macro" className="space-y-4 my-10 pt-4 border-t border-zinc-800/80">
        <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
          <span className="text-zinc-400 font-mono text-base">07.</span>
          Macro Drivers: Global Sovereign Debt, M2 Liquidity &amp; Currency Debasement
        </h3>
        <p>
          Global sovereign debt has surpassed $100 trillion, with major economic superpowers experiencing structural fiscal deficits that cannot be resolved through tax increases alone. The mathematical inevitability is debt monetization—central banks printing fiat currency to service sovereign obligations, resulting in long-term debasement of fiat purchasing power.
        </p>
        <p>
          In this macroeconomic environment, Bitcoin functions as the ultimate non-sovereign liquid reserve asset. When global M2 money supply expands, Bitcoin historically exhibits extraordinary sensitivity, capturing outsized liquidity inflows as investors seek uncompromised capital preservation.
        </p>
      </section>

      {/* Section 8 */}
      <section id="btc-security" className="space-y-4 my-10 pt-4 border-t border-zinc-800/80">
        <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
          <span className="text-zinc-400 font-mono text-base">08.</span>
          Custody Best Practices: Self-Custody vs. Hardware Wallets vs. ETFs
        </h3>
        <p>
          One of Bitcoin's greatest innovations is that it allows individuals to achieve true self-sovereign ownership: <em>"Not your keys, not your coins."</em> Depending on your risk profile, choose the appropriate custody method:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800">
            <div className="text-zinc-400 font-semibold text-xs uppercase tracking-wider mb-1">Maximum Sovereignty</div>
            <div className="text-white font-bold text-sm mb-2">Hardware Cold Storage</div>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Devices like Trezor, Ledger, or Coldcard store private keys in isolated secure elements disconnected from the internet. Best for long-term holders seeking zero counterparty risk.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800">
            <div className="text-zinc-400 font-semibold text-xs uppercase tracking-wider mb-1">Enterprise Security</div>
            <div className="text-white font-bold text-sm mb-2">Multi-Signature Custody</div>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Requires 2-of-3 or 3-of-5 independent keys to authorize transfers (e.g., Unchained, Casa). Eliminates single points of failure for institutions and family offices.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800">
            <div className="text-zinc-400 font-semibold text-xs uppercase tracking-wider mb-1">Traditional Convenience</div>
            <div className="text-white font-bold text-sm mb-2">Spot ETFs &amp; 401(k)s</div>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Held inside standard retirement accounts (IRA, 401k) through registered brokerages (Schwab, Fidelity). Removes key management responsibilities with full regulatory compliance.
            </p>
          </div>
        </div>
      </section>

      {/* Section 9: Quick Glossary */}
      <section className="space-y-4 my-10 pt-4 border-t border-zinc-800/80">
        <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mb-4">
          Essential Bitcoin Terminology Glossary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800/80">
            <strong className="text-zinc-100 block mb-1">Satoshi (Sat):</strong>
            The smallest unit of Bitcoin (0.00000001 BTC). 1 Bitcoin equals 100 million satoshis.
          </div>
          <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800/80">
            <strong className="text-zinc-100 block mb-1">Hashrate:</strong>
            The aggregate computational power of all miners securing the Bitcoin blockchain.
          </div>
          <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800/80">
            <strong className="text-zinc-100 block mb-1">Difficulty Adjustment:</strong>
            Algorithm adjusting mining difficulty every 2,016 blocks (~2 weeks) to maintain a steady 10-minute block time.
          </div>
          <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800/80">
            <strong className="text-zinc-100 block mb-1">UTXO (Unspent Transaction Output):</strong>
            The fundamental accounting model of Bitcoin representing spendable coin balances.
          </div>
          <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800/80">
            <strong className="text-zinc-100 block mb-1">Mempool:</strong>
            The holding area where valid transactions wait before being confirmed into a block by miners.
          </div>
          <div className="p-3.5 rounded-lg bg-zinc-900/40 border border-zinc-800/80">
            <strong className="text-zinc-100 block mb-1">Seed Phrase:</strong>
            A 12-to-24 word cryptographic sequence used to back up and restore private keys and wallet balances.
          </div>
        </div>
      </section>

      {/* Summary Footer */}
      <div className="mt-8 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
        <div>
          Published by <span className="text-zinc-200 font-semibold">Wild West Crypto Show</span> Research Desk
        </div>
        <div>
          <span>Track live Bitcoin prices and breaking ETF updates above 24/7.</span>
        </div>
      </div>
    </article>
  );
}
