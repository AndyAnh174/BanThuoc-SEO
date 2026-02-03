'use client';

import React from 'react';
import { Slider } from '@/components/ui/slider';
import { PriceRange } from './filter.types';

interface PriceFilterProps {
  priceRange: PriceRange;
  maxPrice: number;
  onPriceChange: (range: PriceRange) => void;
}

export function PriceFilter({ priceRange, maxPrice, onPriceChange }: PriceFilterProps) {
  const formatPrice = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}tr`;
    }
    return `${(value / 1000).toFixed(0)}k`;
  };

  const handleChange = (value: number[]) => {
    onPriceChange({ min: value[0], max: value[1] });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between w-full py-2 border-b">
        <h3 className="font-medium text-sm text-gray-900">Khoảng giá</h3>
      </div>
      <div className="pt-4 px-1">
        <Slider
          value={[priceRange.min, priceRange.max]}
          onValueChange={handleChange}
          min={0}
          max={maxPrice}
          step={10000}
          className="mb-4"
        />
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{formatPrice(priceRange.min)}</span>
          <span className="text-gray-600">{formatPrice(priceRange.max)}</span>
        </div>
      </div>
    </div>
  );
}

export default PriceFilter;
