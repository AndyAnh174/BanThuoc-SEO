'use client';

import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExportButtonProps {
  onExportXLSX: () => void;
  onExportCSV: () => void;
  disabled?: boolean;
}

export function ExportButton({ onExportXLSX, onExportCSV, disabled }: ExportButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="border-green-600 text-green-700 hover:bg-green-50"
        >
          <Download className="mr-2 h-4 w-4" /> Xuất file
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Chọn định dạng</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onExportXLSX} className="cursor-pointer">
          <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
          Xuất Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onExportCSV} className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4 text-blue-600" />
          Xuất CSV (.csv)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
