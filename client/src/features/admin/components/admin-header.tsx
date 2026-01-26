import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AdminHeaderProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
    showBack?: boolean;
    backUrl?: string;
}

export const AdminHeader = ({ title, description, action, showBack, backUrl }: AdminHeaderProps) => {
    return (
        <div className="flex items-center justify-between pb-6">
            <div className="space-y-1">
                {showBack && backUrl && (
                    <Link href={backUrl} className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-2 transition-colors">
                        <ArrowLeft className="mr-1 h-4 w-4" /> Quay lại
                    </Link>
                )}
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
};
