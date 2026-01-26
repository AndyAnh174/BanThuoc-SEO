'use client';

import { useState, useEffect } from 'react';
import { BannerManager } from '@/src/features/admin/components/banner-manager';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

export default function BannersAdminPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get token from localStorage
    const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('access_token');
    if (!accessToken) {
      router.push('/auth/login');
      return;
    }
    setToken(accessToken);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return <BannerManager token={token} />;
}


