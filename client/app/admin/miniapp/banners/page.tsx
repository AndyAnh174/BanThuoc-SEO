'use client';

import { useState, useEffect } from 'react';
import { BannerManager } from '@/src/features/admin/components/banner-manager';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminHeader } from '@/src/features/admin/components/admin-header';

export default function MiniAppBannersPage() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('accessToken');
    if (t) setToken(t);
    setLoading(false);
  }, []);

  if (loading) return <Skeleton className="h-96 w-full" />;
  if (!token) return null;

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Banner Mini App"
        description="Quản lý banner hiển thị trên Mini App Zalo"
      />
      <BannerManager token={token} />
    </div>
  );
}
