import React from 'react';

interface AdPlacementProps {
  format: 'billboard' | 'native' | 'sticky-bottom' | 'in-article' | 'skyscraper';
  className?: string;
}

export default function AdPlacement({ format, className = '' }: AdPlacementProps) {
  // Placeholder is hidden until real ad network integration
  return null;
}
