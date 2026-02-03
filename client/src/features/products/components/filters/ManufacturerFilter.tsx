'use client';

import React, { useState, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ChevronDown, Search } from 'lucide-react';
import { Manufacturer } from './filter.types';

interface ManufacturerFilterProps {
  manufacturers: Manufacturer[];
  selectedManufacturers: string[];
  onToggleManufacturer: (manufacturerId: string) => void;
}

export function ManufacturerFilter({
  manufacturers,
  selectedManufacturers,
  onToggleManufacturer,
}: ManufacturerFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredManufacturers = useMemo(() => {
    if (!searchTerm.trim()) return manufacturers;
    const search = searchTerm.toLowerCase();
    return manufacturers.filter((m) => m.name.toLowerCase().includes(search));
  }, [manufacturers, searchTerm]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between w-full py-2 border-b">
        <h3 className="font-medium text-sm text-gray-900">Thương hiệu</h3>
      </div>
      <div className="space-y-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Tìm thương hiệu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>

        {/* Manufacturer list */}
        <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
          {filteredManufacturers.map((manufacturer) => (
            <div key={manufacturer.id} className="flex items-center gap-2 py-1">
              <Checkbox
                id={`mfr-${manufacturer.id}`}
                checked={selectedManufacturers.includes(manufacturer.id)}
                onCheckedChange={() => onToggleManufacturer(manufacturer.id)}
              />
              <Label
                htmlFor={`mfr-${manufacturer.id}`}
                className="text-sm font-normal cursor-pointer truncate flex-1"
              >
                {manufacturer.name}
              </Label>
              {manufacturer.count !== undefined && (
                <span className="text-xs text-gray-400">({manufacturer.count})</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ManufacturerFilter;
