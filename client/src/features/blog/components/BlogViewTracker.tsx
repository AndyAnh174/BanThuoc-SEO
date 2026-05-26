'use client';

import { useEffect } from 'react';

interface BlogViewTrackerProps {
  slug: string;
}

export function BlogViewTracker({ slug }: BlogViewTrackerProps) {
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://banthuocsi.vn/api';

    fetch(`${apiUrl}/blog/${slug}/view/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => {
      // Silently fail — view counting is non-critical
    });
  }, [slug]);

  return null;
}
