import React from 'react';
import BitcoinSeoContent from './seo/BitcoinSeoContent';
import HomeSeoContent from './seo/HomeSeoContent';
import AllNewsSeoContent from './seo/AllNewsSeoContent';
import AltcoinsSeoContent from './seo/AltcoinsSeoContent';
import DefiSeoContent from './seo/DefiSeoContent';
import Web3SeoContent from './seo/Web3SeoContent';
import MarketsSeoContent from './seo/MarketsSeoContent';
import TechSeoContent from './seo/TechSeoContent';

interface SeoEditorialBlogProps {
  category?: string | null;
}

export default function SeoEditorialBlog({ category }: SeoEditorialBlogProps) {
  const normCategory = (category || 'home').toLowerCase().trim();

  switch (normCategory) {
    case 'bitcoin':
      return <BitcoinSeoContent />;
    case 'altcoins':
      return <AltcoinsSeoContent />;
    case 'defi':
      return <DefiSeoContent />;
    case 'web3':
      return <Web3SeoContent />;
    case 'markets':
      return <MarketsSeoContent />;
    case 'tech':
      return <TechSeoContent />;
    case 'news':
    case 'all':
      return <AllNewsSeoContent />;
    case 'home':
    default:
      return <HomeSeoContent />;
  }
}
