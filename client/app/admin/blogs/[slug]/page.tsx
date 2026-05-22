'use client';

import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const BlogEditor = dynamic(() => import('../BlogEditor'), { ssr: false });

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  return (
    <div>
      <BlogEditor
        editSlug={slug}
        onSaved={(newSlug) => {
          router.push('/admin/blogs');
        }}
        onCancel={() => router.push('/admin/blogs')}
      />
    </div>
  );
}
