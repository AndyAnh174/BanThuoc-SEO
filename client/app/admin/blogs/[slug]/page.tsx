'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import BlogEditor from '../BlogEditor';

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
