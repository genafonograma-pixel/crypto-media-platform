import React, { memo } from 'react';

function BitcoinPriceChart() {
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden h-[400px] w-full mb-6 relative">
      <div className="p-4 border-b border-[#1a1a1a] flex justify-between items-center bg-[#0a0a0a]">
        <h2 className="text-sm font-black uppercase tracking-widest text-[#E0E0E0]">Bitcoin Price</h2>
      </div>
      <iframe
        title="Bitcoin Price Chart"
        src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_btc&symbol=INDEX%3ABTCUSD&interval=60&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=0a0a0a&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en"
        style={{ width: '100%', height: 'calc(100% - 53px)', border: 'none' }}
        allowTransparency={true}
        scrolling="no"
      />
    </div>
  );
}

export default memo(BitcoinPriceChart);
