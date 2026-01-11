'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

interface OtherFiltersProps {
  onSaleOnly: boolean;
  inStockOnly: boolean;
  requiresPrescription?: boolean;
  onSaleOnlyChange: (checked: boolean) => void;
  onInStockOnlyChange: (checked: boolean) => void;
  onPrescriptionChange: (checked: boolean | undefined) => void;
}

export function OtherFilters({
  onSaleOnly,
  inStockOnly,
  requiresPrescription,
  onSaleOnlyChange,
  onInStockOnlyChange,
  onPrescriptionChange,
}: OtherFiltersProps) {
  return (
    <Collapsible defaultOpen className="space-y-2">
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 border-b">
        <h3 className="font-medium text-sm text-gray-900">Khác</h3>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 pt-2">
        {/* On sale only */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="on-sale"
            checked={onSaleOnly}
            onCheckedChange={(checked) => onSaleOnlyChange(checked === true)}
          />
          <Label htmlFor="on-sale" className="text-sm font-normal cursor-pointer">
            Đang giảm giá
          </Label>
        </div>

        {/* In stock only */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="in-stock"
            checked={inStockOnly}
            onCheckedChange={(checked) => onInStockOnlyChange(checked === true)}
          />
          <Label htmlFor="in-stock" className="text-sm font-normal cursor-pointer">
            Còn hàng
          </Label>
        </div>

        {/* Prescription */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="prescription"
            checked={requiresPrescription === false}
            onCheckedChange={(checked) =>
              onPrescriptionChange(checked ? false : undefined)
            }
          />
          <Label htmlFor="prescription" className="text-sm font-normal cursor-pointer">
            Không cần kê đơn
          </Label>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default OtherFilters;
