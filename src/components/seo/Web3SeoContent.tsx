import React from 'react';
import { BookOpen, Award, CheckCircle2, TrendingUp, ShieldCheck, Cpu, Globe, Gamepad2, Layers } from 'lucide-react';
import { AUTHOR } from '../../data/author';

export default function Web3SeoContent() {
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
            <div className="text-[11px] text-zinc-400">{AUTHOR.title} · Web3 &amp; Digital Assets Desk</div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
          <span>Updated: Real-Time 2026</span>
          <span>•</span>
          <span>11 Min Read</span>
          <span>•</span>
          <span className="text-zinc-200 font-medium">Web3 Architecture</span>
        </div>
      </div>

      {/* Main H2 Heading */}
      <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3">
        <BookOpen size={14} className="text-amber-500/80" />
        <span>Digital Ownership &amp; Web3 Infrastructure</span>
      </div>

      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white mb-4 leading-tight">
        The Web3 &amp; NFT Master Guide: Digital Property Rights, Metaverse Infrastructure &amp; Blockchain Gaming
      </h2>

      <p className="text-base text-zinc-400 leading-relaxed mb-6 font-normal">
        An exhaustive exploration of Web3—the sovereign internet where users own their data, identity, digital collectibles, and compute through cryptographic public ledgers.
      </p>

      {/* Table of Contents */}
      <nav aria-label="Table of Contents" className="my-8 p-5 sm:p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
        <div className="text-xs font-bold uppercase tracking-wider text-zinc-300 mb-3 flex items-center gap-2">
          <span>Web3 Guide Table of Contents</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <a href="#web3-evolution" className="text-zinc-400 hover:text-white transition-colors py-1 flex items-center gap-2">
            <span className="text-zinc-400 font-mono text-[11px]">01.</span> Web 1.0 vs. Web 2.0 vs. Web3 Paradigm
          </a>
          <a href="#web3-nfts" className="text-zinc-400 hover:text-white transition-colors py-1 flex items-center gap-2">
            <span className="text-zinc-400 font-mono text-[11px]">02.</span> Non-Fungible Tokens (NFTs): Digital Property Rights
          </a>
          <a href="#web3-gaming" className="text-zinc-400 hover:text-white transition-colors py-1 flex items-center gap-2">
            <span className="text-zinc-400 font-mono text-[11px]">03.</span> Blockchain Gaming &amp; True In-Game Ownership
          </a>
          <a href="#web3-identity" className="text-zinc-400 hover:text-white transition-colors py-1 flex items-center gap-2">
            <span className="text-zinc-400 font-mono text-[11px]">04.</span> Decentralized Identity (DID) &amp; Social Graphs
          </a>
        </div>
      </nav>

      {/* Section 1 */}
      <section id="web3-evolution" className="space-y-4 my-10 pt-4 border-t border-zinc-800/80">
        <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
          <span className="text-zinc-400 font-mono text-base">01.</span>
          The Evolution of the Internet: From Read-Only to Sovereign Ownership
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5">
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
            <div className="text-zinc-400 font-semibold text-xs uppercase mb-1">Web 1.0 (1990–2004)</div>
            <div className="text-white font-bold text-sm mb-1">"Read-Only"</div>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">Static open-protocol HTML web pages. Users consumed information hosted on independent servers without interactive participation.</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
            <div className="text-zinc-400 font-semibold text-xs uppercase mb-1">Web 2.0 (2004–2020)</div>
            <div className="text-white font-bold text-sm mb-1">"Read-Write"</div>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">Interactive social platforms (Google, Meta, Amazon). Centralized tech gatekeepers monetized user attention, data, and social graphs.</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
            <div className="text-zinc-400 font-semibold text-xs uppercase mb-1">Web3 (2020–Present)</div>
            <div className="text-white font-bold text-sm mb-1">"Read-Write-Own"</div>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">Decentralized, cryptographic internet powered by blockchains. Users own their data, identity, and digital capital through private keys.</p>
          </div>
        </div>
      </section>

      {/* Section 2 */}
      <section id="web3-nfts" className="space-y-4 my-10 pt-4 border-t border-zinc-800/80">
        <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
          <span className="text-zinc-400 font-mono text-base">02.</span>
          Non-Fungible Tokens (NFTs): Digital Property Rights &amp; Provenance
        </h3>
        <p>
          While fungible tokens (such as Bitcoin and Ethereum) are mutually interchangeable, Non-Fungible Tokens (NFTs) represent unique, verifiable digital ownership records anchored immutably to a blockchain:
        </p>
        <ul className="space-y-2.5 text-xs sm:text-sm my-4">
          <li className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-zinc-400 shrink-0 mt-0.5" />
            <span><strong className="text-white">Cryptographic Provenance:</strong> A tamper-proof history of creation, previous owners, and historical transaction prices publicly auditable on-chain.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-zinc-400 shrink-0 mt-0.5" />
            <span><strong className="text-white">Token-Gated Utility &amp; Access:</strong> Granting exclusive software licensing, VIP conference access, private investor groups, or membership perks automatically verified by a cryptographic signature.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-zinc-400 shrink-0 mt-0.5" />
            <span><strong className="text-white">Programmable Royalties:</strong> Smart contracts can enforce perpetual creator royalties on secondary market sales, ensuring fair ongoing compensation for creators.</span>
          </li>
        </ul>
      </section>

      {/* Section 3 */}
      <section id="web3-gaming" className="space-y-4 my-10 pt-4 border-t border-zinc-800/80">
        <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
          <span className="text-zinc-400 font-mono text-base">03.</span>
          Blockchain Gaming: The Shift to True In-Game Economies
        </h3>
        <p>
          In traditional Web2 video games, players spend billions on cosmetic skins and in-game assets that remain the legal property of the game publisher. Web3 gaming converts in-game items, land, and characters into open on-chain assets that players can trade on open secondary marketplaces, use across interoperable game worlds, or collateralize in DeFi protocols.
        </p>
      </section>

      {/* Section 4 */}
      <section id="web3-identity" className="space-y-4 my-10 pt-4 border-t border-zinc-800/80">
        <h3 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white flex items-center gap-2.5">
          <span className="text-zinc-400 font-mono text-base">04.</span>
          Decentralized Identity (DID) &amp; Censorship-Resistant Social Graphs
        </h3>
        <p>
          In Web2, users rent their digital identities through centralized logins that can be revoked at any time. Web3 introduces Decentralized Identifiers (DIDs) such as the Ethereum Name Service (.eth) and Solana Name Service (.sol), alongside decentralized social protocols (Farcaster, Lens) that decouple user profiles and followers from any single centralized interface.
        </p>
      </section>

      {/* Summary Footer */}
      <div className="mt-8 pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
        <div>
          Published by <span className="text-zinc-200 font-semibold">Wild West Crypto Show</span> Web3 Intelligence Desk
        </div>
        <div>
          <span>Explore live Web3, NFT, and metaverse gaming news above 24/7.</span>
        </div>
      </div>
    </article>
  );
}
