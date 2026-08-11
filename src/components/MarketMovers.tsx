import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface FearGreedData {
  value: string;
  value_classification: string;
}

// Real crypto logos from the open-source cryptocurrency-icons library (jsDelivr CDN)
const CDN = 'https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@master/32/color';
const COIN_LOGOS: Record<string, string> = {
  bitcoin:     `${CDN}/btc.png`,
  ethereum:    `${CDN}/eth.png`,
  solana:      `${CDN}/sol.png`,
  binancecoin: `${CDN}/bnb.png`,
  ripple:      `${CDN}/xrp.png`,
  dogecoin:    `${CDN}/doge.png`,
};

function getFearGreedColor(value: number) {
  if (value <= 25) return '#ef4444';
  if (value <= 45) return '#f97316';
  if (value <= 55) return '#eab308';
  if (value <= 75) return '#84cc16';
  return '#22c55e';
}

function FearGreedWidget({ data }: { data: FearGreedData }) {
  const value = parseInt(data.value, 10);
  const color = getFearGreedColor(value);
  const filledDash = (value / 100) * 66;

  return (
    <div className="flex items-center gap-2.5 px-4 border-r border-[#1e1e1e] shrink-0">
      <div className="relative w-9 h-9">
        <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
          <circle cx="20" cy="20" r="14" fill="none" stroke="#222" strokeWidth="4" strokeDasharray="66 88" strokeLinecap="round"/>
          <circle cx="20" cy="20" r="14" fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={`${filledDash} 88`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[9px] font-black" style={{ color }}>{value}</span>
        </div>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-[9px] font-bold uppercase tracking-widest text-[#444] mb-0.5">Fear & Greed</span>
        <span className="text-[11px] font-bold" style={{ color }}>{data.value_classification}</span>
      </div>
    </div>
  );
}

export default function MarketMovers() {
  const [prices, setPrices] = useState<Record<string, any>>({});
  const [fearGreed, setFearGreed] = useState<FearGreedData | null>(null);
  const [ready, setReady] = useState(false);

  const fetchPrices = async () => {
    try {
      const res = await fetch('/api/prices');
      if (res.ok) setPrices(await res.json());
    } catch {}
  };

  const fetchFearGreed = async () => {
    try {
      const res = await fetch('/api/fear-greed');
      if (res.ok) setFearGreed(await res.json());
    } catch {}
  };

  useEffect(() => {
    Promise.all([fetchPrices(), fetchFearGreed()]).finally(() => setReady(true));

    // Prices: refresh every 15 seconds (CoinGecko free allows ~30 req/min)
    const priceInterval = setInterval(fetchPrices, 15000);
    // Fear & Greed: refresh every hour (only updates once a day anyway)
    const fgInterval = setInterval(fetchFearGreed, 60 * 60 * 1000);

    return () => {
      clearInterval(priceInterval);
      clearInterval(fgInterval);
    };
  }, []);

  if (!ready || Object.keys(prices).length === 0) return null;

  const COIN_ORDER = ['bitcoin', 'ethereum', 'solana', 'binancecoin', 'ripple', 'dogecoin'];
  const COIN_SYMBOLS: Record<string, string> = {
    bitcoin: 'BTC', ethereum: 'ETH', solana: 'SOL',
    binancecoin: 'BNB', ripple: 'XRP', dogecoin: 'DOGE',
  };

  const priceItems = COIN_ORDER
    .filter(id => prices[id])
    .map(id => {
      const data = prices[id];
      const price = data.usd;
      const change = data.usd_24h_change || 0;
      const isPositive = change >= 0;
      const formattedPrice = price >= 1
        ? price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 4, maximumFractionDigits: 5 });

      return { id, symbol: COIN_SYMBOLS[id], price: formattedPrice, change, isPositive };
    });

  return (
    <div className="w-full bg-[#080808] border-b border-[#1a1a1a]">
      <div className="max-w-[1280px] mx-auto flex items-stretch h-10">

        {fearGreed && <FearGreedWidget data={fearGreed} />}

        {/* Scrolling ticker */}
        <div className="flex-1 overflow-hidden flex items-center">
          <motion.div
            className="flex gap-8 items-center min-w-max pr-8"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 35, ease: 'linear', repeat: Infinity }}
          >
            {[...priceItems, ...priceItems].map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex items-center gap-2 shrink-0">
                {COIN_LOGOS[item.id] && (
                  <img
                    src={COIN_LOGOS[item.id]}
                    alt={item.symbol}
                    className="w-4 h-4 rounded-full"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <span className="text-[11px] font-bold text-[#CCC]">{item.symbol}</span>
                <span className="text-[11px] text-[#999]">{item.price}</span>
                <span className={`text-[10px] font-bold font-mono ${item.isPositive ? 'text-green-500' : 'text-red-400'}`}>
                  {item.isPositive ? '▲' : '▼'} {Math.abs(item.change).toFixed(2)}%
                </span>
              </div>
            ))}
          </motion.div>
        </div>

      </div>
    </div>
  );
}
