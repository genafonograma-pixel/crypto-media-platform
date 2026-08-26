import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface BTCData {
  price: number;
  change24h: number;
  high24h?: number;
  low24h?: number;
  volume?: number;
  marketCap?: number;
  dominance?: number;
}

interface FearGreed {
  value: string;
  value_classification: string;
}

function formatCurrency(val?: number) {
  if (val === undefined || val === null) return '—';
  if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
  if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
  return val.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function formatPrice(val?: number) {
  if (val === undefined || val === null) return '—';
  return val.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatPct(val?: number) {
  if (val === undefined || val === null) return '—';
  return `${val.toFixed(2)}%`;
}

function fearGreedColor(classification: string) {
  const cls = classification?.toLowerCase() ?? '';
  if (cls.includes('extreme greed')) return 'text-emerald-400';
  if (cls.includes('greed')) return 'text-green-400';
  if (cls.includes('extreme fear')) return 'text-red-500';
  if (cls.includes('fear')) return 'text-red-400';
  return 'text-amber-400';
}

export default function BitcoinMarketSnapshot() {
  const [data, setData] = useState<BTCData | null>(null);
  const [fearGreed, setFearGreed] = useState<FearGreed | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [ready, setReady] = useState(false);

  const fetchAll = async () => {
    try {
      const [priceRes, extRes, fgRes] = await Promise.all([
        fetch('/api/prices'),
        fetch('/api/btc-extended'),
        fetch('/api/fear-greed'),
      ]);

      let price = 0, change = 0;
      if (priceRes.ok) {
        const pd = await priceRes.json();
        if (pd.bitcoin) { price = pd.bitcoin.usd; change = pd.bitcoin.usd_24h_change; }
      }

      let ext: any = {};
      if (extRes.ok) ext = await extRes.json();

      if (fgRes.ok) {
        const fg = await fgRes.json();
        if (fg.value) setFearGreed(fg);
      }

      setData({
        price,
        change24h: change,
        high24h: ext.high_24h,
        low24h: ext.low_24h,
        volume: ext.total_volume,
        marketCap: ext.market_cap,
        dominance: ext.dominance,
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Market snapshot fetch error', err);
    } finally {
      setReady(true);
    }
  };

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, 2 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  if (!ready || !data) {
    return (
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-6 mb-4 animate-pulse">
        <div className="h-4 w-36 bg-[#1a1a1a] rounded mb-4" />
        <div className="h-12 w-52 bg-[#131313] rounded mb-6" />
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}><div className="h-3 w-14 bg-[#1a1a1a] rounded mb-2" /><div className="h-4 w-20 bg-[#131313] rounded" /></div>
          ))}
        </div>
      </div>
    );
  }

  const isUp = data.change24h >= 0;
  const minutesAgo = lastUpdated
    ? Math.floor((Date.now() - lastUpdated.getTime()) / 60000)
    : null;

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-5 md:p-6 mb-4">
      {/* Price row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#666] mb-1.5 flex items-center gap-2">
            Bitcoin Price
            <span className="bg-[#3B82F6]/15 text-[#3B82F6] text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded animate-pulse">LIVE</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl md:text-5xl font-black text-white tabular-nums">{formatPrice(data.price)}</span>
            <div className={`flex items-center gap-1 text-base font-bold ${isUp ? 'text-emerald-500' : 'text-red-400'}`}>
              {isUp ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              {isUp ? '+' : ''}{formatPct(data.change24h)}
              <span className="text-[10px] font-normal text-[#555] ml-1">24h</span>
            </div>
          </div>
        </div>
        {lastUpdated && (
          <div className="text-[10px] text-[#444] font-mono">
            Market data updated {minutesAgo === 0 ? 'just now' : `${minutesAgo}m ago`}
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4 pt-4 border-t border-[#1a1a1a]">
        {[
          { label: 'Market Cap', value: formatCurrency(data.marketCap) },
          { label: '24h Volume', value: formatCurrency(data.volume) },
          { label: '24h High', value: formatPrice(data.high24h) },
          { label: '24h Low', value: formatPrice(data.low24h) },
          { label: 'Dominance', value: data.dominance ? formatPct(data.dominance) : '—' },
          {
            label: 'Fear & Greed',
            value: fearGreed ? `${fearGreed.value}` : '—',
            sub: fearGreed?.value_classification,
            color: fearGreed ? fearGreedColor(fearGreed.value_classification) : undefined,
          },
        ].map(({ label, value, sub, color }) => (
          <div key={label}>
            <div className="text-[9px] font-bold uppercase tracking-widest text-[#555] mb-1">{label}</div>
            <div className={`text-sm font-bold ${color ?? 'text-[#DDD]'} tabular-nums`}>{value}</div>
            {sub && <div className="text-[9px] text-[#444] mt-0.5">{sub}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
