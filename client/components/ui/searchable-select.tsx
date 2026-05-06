'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchableItem {
  id: string;
  name: string;
}

interface SearchableSelectProps {
  value?: string;
  onChange: (value: string) => void;
  items: SearchableItem[];
  placeholder?: string;
  emptyText?: string;
  error?: string;
  className?: string;
}

export function SearchableSelect({
  value,
  onChange,
  items,
  placeholder = 'Chọn...',
  emptyText = 'Không tìm thấy',
  error,
  className,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    if (!searchTerm) return items;
    return items.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  const selected = items.find((item) => item.id === value);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between font-normal text-left',
            !value && 'text-muted-foreground',
            error && 'border-red-500',
            className
          )}
        >
          {selected ? (
            <span className="truncate">{selected.name}</span>
          ) : (
            <span className="truncate">{placeholder}</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] p-0"
        align="start"
      >
        <div className="p-2 border-b sticky top-0 bg-popover z-10">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Tìm ${placeholder.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>
        <div className="max-h-60 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {emptyText}
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'relative flex select-none items-center rounded-sm px-2 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer',
                  value === item.id && 'bg-accent text-accent-foreground'
                )}
                onClick={() => {
                  onChange(item.id);
                  setOpen(false);
                }}
              >
                <span
                  className={cn(
                    'font-medium',
                    value === item.id && 'text-primary'
                  )}
                >
                  {item.name}
                </span>
                {value === item.id && (
                  <Check className="ml-auto h-4 w-4 text-primary" />
                )}
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
