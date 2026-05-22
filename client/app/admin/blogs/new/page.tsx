'use client';

import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const BlogEditor = dynamic(() => import('../BlogEditor'), { ssr: false });

export default function NewBlogPage() {
  const router = useRouter();

  return (
    <div>
      <BlogEditor
        onSaved={(slug) => {
          router.push('/admin/blogs');
        }}
        onCancel={() => router.push('/admin/blogs')}
      />
    </div>
  );
}
