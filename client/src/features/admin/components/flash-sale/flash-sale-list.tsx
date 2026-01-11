'use client';

import { useFlashSaleStore } from '../../stores/flash-sale.store';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Calendar, Clock, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { FlashSaleSession } from '../../types/flash-sale.types';

interface FlashSaleListProps {
    onEdit: (session: FlashSaleSession) => void;
    onManage: (session: FlashSaleSession) => void;
}

export const FlashSaleList = ({ onEdit, onManage }: FlashSaleListProps) => {
    const { sessions, deleteSession, isLoading } = useFlashSaleStore();

    if (isLoading && sessions.length === 0) return <div>Đang tải...</div>;

    const getStatusColor = (status: string, isActive: boolean) => {
        if (!isActive) return 'bg-gray-500';
        switch (status) {
            case 'ACTIVE': return 'bg-green-500';
            case 'SCHEDULED': return 'bg-blue-500';
            case 'ENDED': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'Đang diễn ra';
            case 'SCHEDULED': return 'Sắp diễn ra';
            case 'ENDED': return 'Đã kết thúc';
            default: return status;
        }
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Tên đợt mở bán</TableHead>
                        <TableHead>Thời gian</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Sản phẩm</TableHead>
                        <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sessions.map((session) => (
                        <TableRow key={session.id}>
                            <TableCell className="font-medium">
                                <div>{session.name}</div>
                                {session.description && <div className="text-sm text-muted-foreground truncate max-w-xs">{session.description}</div>}
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col text-sm">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> 
                                        {format(new Date(session.start_time), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                    </span>
                                    <span className="flex items-center gap-1 text-muted-foreground mt-1">
                                        <Clock className="h-3 w-3" />
                                        Đến: {format(new Date(session.end_time), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge className={getStatusColor(session.status, session.is_active)}>
                                    {getStatusLabel(session.status)}
                                </Badge>
                                {!session.is_active && <span className="ml-2 text-xs text-red-500">(Tạm ẩn)</span>}
                            </TableCell>
                            <TableCell>
                                <Button variant="link" onClick={() => onManage(session)}>
                                    {/* @ts-ignore */}
                                    {session.items_count || session.total_items || 0} sản phẩm
                                </Button>
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => onEdit(session)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteSession(session.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {sessions.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24">Chưa có đợt Flash Sale nào.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};
