import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const CDN = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/32/color';
const COIN_LOGOS: Record<string, string> = {
  bitcoin:     `${CDN}/btc.png`,
  ethereum:    `${CDN}/eth.png`,
  solana:      `${CDN}/sol.png`,
  binancecoin: `${CDN}/bnb.png`,
  ripple:      `${CDN}/xrp.png`,
  dogecoin:    `${CDN}/doge.png`,
};

const COIN_ORDER = ['bitcoin', 'ethereum', 'solana', 'binancecoin', 'ripple', 'dogecoin'];
const COIN_SYMBOLS: Record<string, string> = {
  bitcoin: 'BTC', ethereum: 'ETH', solana: 'SOL',
  binancecoin: 'BNB', ripple: 'XRP', dogecoin: 'DOGE',
};
const COIN_NAMES: Record<string, string> = {
  bitcoin: 'Bitcoin', ethereum: 'Ethereum', solana: 'Solana',
  binancecoin: 'BNB', ripple: 'Ripple', dogecoin: 'Dogecoin',
};

export default function MarketWatch() {
  const [prices, setPrices] = useState<Record<string, any>>({});
  const [ready, setReady] = useState(false);

  const fetchPrices = async () => {
    try {
      const res = await fetch('/api/prices');
      if (res.ok) setPrices(await res.json());
    } catch {}
  };

  useEffect(() => {
    fetchPrices().finally(() => setReady(true));
    const interval = setInterval(fetchPrices, 15000);
    return () => clearInterval(interval);
  }, []);

  if (!ready || Object.keys(prices).length === 0) {
    return (
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-4 animate-pulse">
        <div className="h-4 w-28 bg-[#1a1a1a] rounded mb-4" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-[#131313] last:border-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#1a1a1a]" />
              <div>
                <div className="h-3 w-10 bg-[#1a1a1a] rounded mb-1" />
                <div className="h-2 w-14 bg-[#131313] rounded" />
              </div>
            </div>
            <div className="text-right">
              <div className="h-3 w-16 bg-[#1a1a1a] rounded mb-1" />
              <div className="h-2 w-10 bg-[#131313] rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const items = COIN_ORDER.filter(id => prices[id]).map(id => {
    const data = prices[id];
    const price = data.usd;
    const change = data.usd_24h_change || 0;
    const isPositive = change >= 0;
    const formattedPrice = price >= 1
      ? price.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
      : price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4, maximumFractionDigits: 5 });
    return { id, symbol: COIN_SYMBOLS[id], name: COIN_NAMES[id], price: formattedPrice, change, isPositive };
  });

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a]">
        <h2 className="text-[10px] font-black uppercase tracking-widest text-[#888]" title="Cryptocurrency Market Watch Live Prices">Market Watch</h2>
        <span className="text-[9px] text-[#444] font-mono">Live</span>
      </div>

      {/* Coin rows */}
      <div className="divide-y divide-[#131313]">
        {items.map(item => (
          <a
            key={item.id}
            href={`https://www.coingecko.com/en/coins/${item.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-4 py-3 hover:bg-[#111] transition-colors group"
          >
            <div className="flex items-center gap-3">
              <img
                src={COIN_LOGOS[item.id]}
                alt={item.symbol}
                className="w-8 h-8 rounded-full"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <div>
                <div className="text-[12px] font-bold text-[#F0F0F0] group-hover:text-[#3B82F6] transition-colors">{item.symbol}</div>
                <div className="text-[10px] text-[#555]">{item.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[12px] font-bold text-[#E0E0E0]">{item.price}</div>
              <div className={`flex items-center justify-end gap-0.5 text-[10px] font-bold ${item.isPositive ? 'text-emerald-500' : 'text-red-400'}`}>
                {item.isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {item.isPositive ? '+' : ''}{item.change.toFixed(2)}%
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Footer link */}
      <div className="border-t border-[#1a1a1a] px-4 py-2.5 text-center">
        <a
          href="https://www.coingecko.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[9px] font-bold uppercase tracking-widest text-[#444] hover:text-[#3B82F6] transition-colors"
        >
          Powered by CoinGecko →
        </a>
      </div>
    </div>
  );
}
