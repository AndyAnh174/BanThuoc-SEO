'use client';

import { useRouter } from 'next/navigation';
import BlogEditor from '../BlogEditor';

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
