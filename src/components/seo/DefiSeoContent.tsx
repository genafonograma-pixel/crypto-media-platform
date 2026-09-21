import React from 'react';
import { BookOpen, Award, CheckCircle2, TrendingUp, ShieldCheck, DollarSign, Lock, Repeat } from 'lucide-react';
import { AUTHOR } from '../../data/author';

export default function DefiSeoContent() {
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
            <div className="text-[11px] text-zinc-400">{AUTHOR.title} · DeFi Intelligence Specialist</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
          <span>Updated: Real-Time 2026</span>
          <span>•</span>
          <span>13 Min Read</span>
          <span>•</span>
          <span className="text-zinc-200 font-medium">DeFi Masterclass</span>
        </div>
      </div>

      {/* Main H2 Heading */}
      <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3">
        <BookOpen size={14} className="text-amber-500/80" />
        <span>Decentralized Finance &amp; Liquidity Systems</span>
      </div>

      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white mb-4 leading-tight">
        The Definitive Guide to Decentralized Finance (DeFi): AMMs, Lending Protocols &amp; Tokenized Real-World Assets
      </h2>

      <p className="text-base text-zinc-400 leading-relaxed mb-6 font-normal">
        An in-depth institutional breakdown of Decentralized Finance (DeFi)—how automated market makers operate, money market lending yields, liquid staking derivatives, tokenized sovereign debt (RWAs), and advanced smart contract risk management.
      </p>

      {/* Quick Table of Contents */}
      <nav aria-label="Table of Contents" className="my-8 p-5 sm:p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3 flex items-center gap-2">
          <span>DeFi Guide Table of Contents</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <a href="#defi-philosophy" className="text-zinc-400 hover:text-white transition-colors py-1 flex items-center gap-2">
            <span className="text-zinc-400 font-mono text-[11px]">01.</span> Philosophy of Permissionless Financial Systems
          </a>
          <a href="#defi-primitives" className="text-zinc-400 hover:text-white transition-colors py-1 flex items-center gap-2">
            <span className="text-zinc-400 font-mono text-[11px]">02.</span> Core Primitives: AMMs, Lending &amp; Liquid Staking
          </a>
          <a href="#defi-protocols" className="text-zinc-400 hover:text-white transition-colors py-1 flex items-center gap-2">
            <span className="text-zinc-400 font-mono text-[11px]">03.</span> Flagship Protocols: Uniswap, Aave &amp; Maker
          </a>
          <a href="#defi-rwa" className="text-zinc-400 hover:text-white transition-colors py-1 flex items-center gap-2">
            <span className="text-zinc-400 font-mono text-[11px]">04.</span> Real-World Assets (RWA) &amp; Institutional Yield
          </a>
          <a href="#defi-risks" className="text-zinc-400 hover:text-white transition-colors py-1 flex items-center gap-2">
            <span className="text-zinc-400 font-mono text-[11px]">05.</span> Impermanent Loss &amp; Flash Loan Security
          </a>
          <a href="#defi-safety" className="text-zinc-400 hover:text-white transition-colors py-1 flex items-center gap-2">
            <span className="text-zinc-400 font-mono text-[11px]">06.</span> DeFi Safety: Approvals, RPCs &amp; Cold Wallets
          </a>
        </div>
      </nav>

      {/* Section 1 */}
      <section id="defi-philosophy" className="space-y-4 my-10 pt-4 border-t border-zinc-800/80">
        <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
          <span className="text-zinc-400 font-mono text-base">01.</span>
          The Philosophy of Decentralized Finance: Autonomous, Permissionless Banking
        </h3>
        <p>
          Traditional banking systems rely on centralized gatekeepers—commercial banks, clearinghouses, credit bureaus, and payment processors—that introduce high fees, multi-day settlement delays, geographic discrimination, and opaque fractional reserve practices.
        </p>
        <p>
          <strong className="text-white">Decentralized Finance (DeFi)</strong> reimagines the complete banking stack using self-executing, permissionless smart contracts deployed on public blockchains.
        </p>
        <ul className="space-y-2 text-xs sm:text-sm my-3">
          <li className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-zinc-400 shrink-0" />
            <span><strong className="text-white">Non-Custodial:</strong> Users maintain direct cryptographic control of their private keys and deposited collateral at all times.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-zinc-400 shrink-0" />
            <span><strong className="text-white">Permissionless:</strong> Anyone with an internet connection and an on-chain wallet can lend, borrow, and trade without identity verification or credit score barriers.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-zinc-400 shrink-0" />
            <span><strong className="text-white">Composable ("Money Legos"):</strong> Smart contracts interact seamlessly. A token minted on one protocol can be collateralized on another and traded on a third in a single atomic transaction.</span>
          </li>
        </ul>
      </section>

      {/* Section 2 */}
      <section id="defi-primitives" className="space-y-4 my-10 pt-4 border-t border-zinc-800/80">
        <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
          <span className="text-zinc-400 font-mono text-base">02.</span>
          Core DeFi Primitives: The Essential Building Blocks
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800">
            <div className="text-zinc-300 font-bold text-xs uppercase mb-1 flex items-center gap-1.5">
              <Repeat size={14} className="text-zinc-400" /> Automated Market Makers (AMMs)
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Replace centralized limit order books with deterministic mathematical formulas (e.g., <em>x * y = k</em>). Liquidity providers deposit token pairs, earning transaction fees from traders who swap assets against the pool.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800">
            <div className="text-zinc-300 font-bold text-xs uppercase mb-1 flex items-center gap-1.5">
              <DollarSign size={14} className="text-zinc-400" /> Overcollateralized Money Markets
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Enable instant borrowing without credit underwriting. Borrowers deposit collateral (e.g., 150% in ETH) to borrow stablecoins (USDC), protecting lenders via automated algorithmic liquidation bots if collateral values decline.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800">
            <div className="text-zinc-300 font-bold text-xs uppercase mb-1 flex items-center gap-1.5">
              <Lock size={14} className="text-zinc-400" /> Liquid Staking &amp; Restaking
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Protocols like Lido and EigenLayer issue liquid receipt tokens (stETH, eETH) for staked PoS assets, allowing depositors to earn consensus validation yields while simultaneously deploying liquidity into DeFi lending and trading.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800">
            <div className="text-zinc-300 font-bold text-xs uppercase mb-1 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-zinc-400" /> Decentralized Stablecoins
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Censorship-resistant dollar-pegged assets minted against diversified crypto collateral or delta-neutral synthetic hedging strategies, providing a safe transactional store of value independent of traditional banking freezes.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section id="defi-protocols" className="space-y-4 my-10 pt-4 border-t border-zinc-800/80">
        <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
          <span className="text-zinc-400 font-mono text-base">03.</span>
          Flagship DeFi Protocols: Comparative Architecture
        </h3>

        <div className="overflow-x-auto my-6">
          <table className="w-full text-left text-xs border border-zinc-800 rounded-xl overflow-hidden">
            <thead className="bg-zinc-900 text-zinc-400 uppercase font-semibold border-b border-zinc-800">
              <tr>
                <th className="p-3.5">Protocol</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Key Innovation</th>
                <th className="p-3.5">Primary Collateral</th>
                <th className="p-3.5">Governance Token</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/60 text-zinc-300">
              <tr>
                <td className="p-3.5 font-semibold text-white">Uniswap (v3/v4)</td>
                <td className="p-3.5 text-zinc-400">Decentralized Exchange (AMM)</td>
                <td className="p-3.5 text-zinc-200 font-medium">Concentrated Liquidity &amp; Custom Hooks</td>
                <td className="p-3.5 text-zinc-300">Any ERC-20 Pair</td>
                <td className="p-3.5 text-zinc-200 font-semibold">UNI</td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-white">Aave (v3)</td>
                <td className="p-3.5 text-zinc-400">Lending &amp; Borrowing</td>
                <td className="p-3.5 text-zinc-200 font-medium">Cross-Chain Portals &amp; Flash Loans</td>
                <td className="p-3.5 text-zinc-300">ETH, BTC, Stablecoins</td>
                <td className="p-3.5 text-zinc-200 font-semibold">AAVE</td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-white">MakerDAO / Sky</td>
                <td className="p-3.5 text-zinc-400">CDP Stablecoin Engine</td>
                <td className="p-3.5 text-zinc-200 font-medium">Decentralized USDS / DAI Minting &amp; RWAs</td>
                <td className="p-3.5 text-zinc-300">Crypto + Tokenized U.S. T-Bills</td>
                <td className="p-3.5 text-zinc-200 font-semibold">MKR / SKY</td>
              </tr>
              <tr>
                <td className="p-3.5 font-semibold text-white">Curve Finance</td>
                <td className="p-3.5 text-zinc-400">StableSwap DEX</td>
                <td className="p-3.5 text-zinc-200 font-medium">Stableswap Invariant with Near-Zero Slippage</td>
                <td className="p-3.5 text-zinc-300">Pegged Assets (USDC/USDT, stETH/ETH)</td>
                <td className="p-3.5 text-zinc-200 font-semibold">CRV</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4 */}
      <section id="defi-rwa" className="space-y-4 my-10 pt-4 border-t border-zinc-800/80">
        <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
          <span className="text-zinc-400 font-mono text-base">04.</span>
          Real-World Assets (RWA): The Institutional Onboarding Wave
        </h3>
        <p>
          The most transformative narrative in modern decentralized finance is the tokenization of Real-World Assets (RWAs). Traditionally, DeFi yields were generated purely within the crypto ecosystem through speculative trading fees and token incentives.
        </p>
        <p>
          With major asset managers like BlackRock (launching the BUIDL tokenized liquidity fund on Ethereum) and Franklin Templeton, real-world yields (such as U.S. Treasury bills yielding 4% to 5%) are now tokenized natively on-chain. This structural convergence allows decentralized protocols to back stablecoins with sovereign debt, creating sustainable, risk-adjusted yields that bridge trillions in institutional capital into DeFi rails.
        </p>
      </section>

      {/* Section 5 */}
      <section id="defi-risks" className="space-y-4 my-10 pt-4 border-t border-zinc-800/80">
        <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
          <span className="text-zinc-400 font-mono text-base">05.</span>
          DeFi Risk Management: Impermanent Loss &amp; Smart Contract Exploits
        </h3>
        <div className="space-y-3 my-4">
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
            <strong className="text-zinc-100 block text-sm mb-1">Impermanent Loss (IL):</strong>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">Occurs when providing liquidity to an AMM pool whose tokens diverge in market price. While fee rewards offset modest divergence, sharp parabolic runs in one asset can cause net returns to lag behind simple buy-and-hold strategies.</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
            <strong className="text-rose-400 block text-sm mb-1">Smart Contract Vulnerabilities &amp; Oracle Manipulation:</strong>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">Bugs in smart contract logic or economic manipulation of low-liquidity price oracles via uncollateralized flash loans can lead to pool draining. Always verify that a protocol uses decentralized Chainlink oracles and has completed multi-firm security audits.</p>
          </div>
        </div>
      </section>

      {/* Section 6 */}
      <section id="defi-safety" className="space-y-4 my-10 pt-4 border-t border-zinc-800/80">
        <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
          <span className="text-zinc-400 font-mono text-base">06.</span>
          DeFi Security Hygiene: Essential Best Practices
        </h3>
        <ul className="space-y-2.5 my-3 text-xs sm:text-sm">
          <li className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-zinc-400 shrink-0 mt-0.5" />
            <span><strong className="text-white">Regularly Revoke Unlimited Token Allowances:</strong> Use tools like Revoke.cash to cancel unlimited spending permissions granted to smart contracts you are no longer actively using.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-zinc-400 shrink-0 mt-0.5" />
            <span><strong className="text-white">Separate Hot &amp; Cold Wallets:</strong> Keep your primary long-term savings on a hardware device (Ledger, Trezor) that never signs experimental decentralized contracts. Use disposable burner wallets for new protocols.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-zinc-400 shrink-0 mt-0.5" />
            <span><strong className="text-white">Verify Smart Contract Addresses:</strong> Always cross-reference contract addresses against official protocol documentation or CoinGecko rather than clicking unverified links in social media replies.</span>
          </li>
        </ul>
      </section>

      {/* Summary Footer */}
      <div className="mt-8 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
        <div>
          Published by <span className="text-zinc-200 font-semibold">Wild West Crypto Show</span> DeFi Intelligence Unit
        </div>
        <div>
          <span>Track live decentralized finance yields and protocol news above 24/7.</span>
        </div>
      </div>
    </article>
  );
}
