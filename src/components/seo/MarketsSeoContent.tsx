import React from 'react';
import { BookOpen, Award, CheckCircle2, TrendingUp, ShieldCheck, BarChart3, Activity, Zap } from 'lucide-react';
import { AUTHOR } from '../../data/author';

export default function MarketsSeoContent() {
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
            <div className="text-[11px] text-zinc-400">{AUTHOR.title} · Market Analytics Desk</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
          <span>Real-Time Market Feeds</span>
          <span>•</span>
          <span>11 Min Read</span>
          <span>•</span>
          <span className="text-zinc-200 font-medium">Derivatives &amp; Macro</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3">
        <BookOpen size={14} className="text-amber-500/80" />
        <span>Quantitative Analytics &amp; Order Books</span>
      </div>

      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white mb-4 leading-tight">
        Crypto Market Intelligence: Technical Analysis, Liquidity Heatmaps &amp; Derivatives
      </h2>

      <p className="text-base text-zinc-400 leading-relaxed mb-6 font-normal">
        Master digital asset market structure—how order book liquidity, perpetual futures funding rates, liquidation cascades, and macroeconomic indicators drive crypto price volatility.
      </p>

      <div className="space-y-8 text-sm sm:text-base leading-relaxed text-zinc-300">
        <section>
          <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mb-3">
            1. The Architecture of Crypto Market Liquidity
          </h3>
          <p className="mb-4">
            Unlike equity markets with designated market makers and centralized exchanges, crypto liquidity is fragmented across centralized order book exchanges (Binance, Coinbase, Bybit) and on-chain automated market maker pools (Uniswap, Curve).
          </p>
          <p>
            Understanding depth of market (DOM), cumulative volume delta (CVD), and bid-ask spreads allows traders to identify aggressive institutional block buying and hidden algorithmic iceberg orders before price breakouts occur.
          </p>
        </section>

        <section>
          <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mb-3">
            2. The Perpetual Futures Market &amp; Funding Rate Mechanics
          </h3>
          <p className="mb-4">
            The perpetual futures contract ("perp") is the highest-volume derivative instrument in crypto. Because perps do not expire, a periodic funding rate mechanism (settled every 8 hours) anchors the derivative price to the underlying spot index:
          </p>
          <ul className="space-y-2 text-xs sm:text-sm my-3">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-zinc-400 shrink-0 mt-0.5" />
              <span><strong className="text-white">Positive Funding:</strong> Perpetual price exceeds spot. Long traders pay short traders. Signals bullish leverage crowding; extreme positive rates often trigger long-squeeze flash crashes.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-zinc-400 shrink-0 mt-0.5" />
              <span><strong className="text-white">Negative Funding:</strong> Perpetual price trades below spot. Short traders pay long traders. Signals aggressive bearish positioning; historically sets up rapid short-squeeze rallies.</span>
            </li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white mb-3">
            3. Liquidation Cascades: How Leveraged Stop Losses Magnetize Price
          </h3>
          <p>
            When traders utilize high leverage, positions have tight liquidation thresholds. As price moves against these positions, exchange risk engines forcibly execute market orders to cover balances. This triggers cascading chain reactions—liquidations causing further price movements, triggering additional liquidations. Liquidity heatmaps identify where leverage is heavily clustered, predicting rapid price sweeps.
          </p>
        </section>
      </div>

      <div className="mt-8 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
        <div>
          Published by <span className="text-zinc-200 font-semibold">Wild West Crypto Show</span> Quantitative Markets Desk
        </div>
        <div>
          <span>Monitor live market movers and Fear &amp; Greed index updates above.</span>
        </div>
      </div>
    </article>
  );
}
