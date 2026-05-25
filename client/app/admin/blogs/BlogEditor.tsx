'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type EditorJS from '@editorjs/editorjs';
import type { OutputData } from '@editorjs/editorjs';

interface BlogEditorProps {
  editSlug?: string;
  onSaved: (slug: string) => void;
  onCancel: () => void;
}

// Editor.js tools configuration
const getImageToolConfig = (token: string) => ({
  image: {
    class: require('@editorjs/image'),
    config: {
      uploader: {
        async uploadByFile(file: File) {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('folder', 'blog');
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/upload/`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData,
          });
          if (!res.ok) throw new Error('Upload failed');
          const data = await res.json();
          return { success: 1, file: { url: data.url } };
        },
      },
    },
  },
});

function getEditorTools() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  return {
  header: require('@editorjs/header'),
  list: require('@editorjs/list'),
  quote: require('@editorjs/quote'),
  delimiter: require('@editorjs/delimiter'),
  table: require('@editorjs/table'),
  code: require('@editorjs/code'),
  raw: require('@editorjs/raw'),
  embed: require('@editorjs/embed'),
  warning: require('@editorjs/warning'),
  checklist: require('@editorjs/checklist'),
  marker: require('@editorjs/marker'),
  inlineCode: require('@editorjs/inline-code'),
  ...getImageToolConfig(token || ''),
  };
}

import edjsHTML from 'editorjs-html';

const edjsParser = edjsHTML();

function convertToHTML(blocks: OutputData): string {
  return edjsParser.parse(blocks).join('');
}

export default function BlogEditor({ editSlug, onSaved, onCancel }: BlogEditorProps) {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!!editSlug);
  const editorRef = useRef<EditorJS | null>(null);
  const isEditorReady = useRef(false);

  // Initialize editor
  const initEditor = useCallback(() => {
    if (typeof window === 'undefined') return;

    const EditorJSClass = require('@editorjs/editorjs').default;

    const editor = new EditorJSClass({
      holder: 'editorjs',
      tools: getEditorTools(),
      placeholder: 'Nhập nội dung bài viết...',
      autofocus: false,
      data: {},
      onChange: async () => {
        // Auto-save state handling
      },
    });

    editor.isReady.then(() => {
      isEditorReady.current = true;
    }).catch((err: Error) => {
      console.error('Editor init failed', err);
    });

    editorRef.current = editor;
  }, []);

  useEffect(() => {
    if (!editSlug) {
      initEditor();
      return;
    }

    // Load existing post
    const loadPost = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/blog/${editSlug}/`,
          { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();

        setTitle(data.title || '');
        setExcerpt(data.excerpt || '');
        setCoverImage(data.cover_image || '');
        setTags((data.tags || []).join(', '));
        setSeoTitle(data.seo_title || '');
        setSeoDescription(data.seo_description || '');
        setStatus(data.status || 'DRAFT');

        // Parse HTML content back to Editor.js blocks
        // Simple approach: wrap in paragraph block if plain text
        const contentBlocks = data.content
          ? [{ type: 'paragraph', data: { text: data.content } }]
          : [];

        // Initialize editor with existing data
        if (typeof window !== 'undefined') {
          const EditorJSClass = require('@editorjs/editorjs').default;
          const editor = new EditorJSClass({
            holder: 'editorjs',
            tools: getEditorTools(),
            placeholder: 'Nhập nội dung bài viết...',
            data: { blocks: contentBlocks, time: Date.now(), version: '2.30.6' },
          });
          editor.isReady.then(() => {
            isEditorReady.current = true;
          });
          editorRef.current = editor;
        }
      } catch (e) {
        setError('Không thể tải bài viết');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [editSlug, initEditor]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'blog');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/files/upload/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setCoverImage(data.url);
    } catch (e) {
      alert('Upload ảnh bìa thất bại');
    }
  };

  const handleSave = async (publishNow = false) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Bạn cần đăng nhập lại');
      return;
    }
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Get Editor.js data
      let content = '';
      if (editorRef.current && isEditorReady.current) {
        const saved = await editorRef.current.save();
        content = convertToHTML(saved);
      }

      const payload = {
        title: title.trim(),
        content,
        excerpt: excerpt.trim(),
        cover_image: coverImage,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        status: publishNow ? 'PUBLISHED' : status,
        seo_title: seoTitle.trim() || undefined,
        seo_description: seoDescription.trim() || undefined,
        author: JSON.parse(localStorage.getItem('user') || '{}').id || 1,
      };

      let res;
      if (editSlug) {
        res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/${editSlug}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(errData));
      }

      const savedPost = await res.json();
      onSaved(savedPost.slug);
    } catch (e: any) {
      setError(e.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {editSlug ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}
        </h1>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            Hủy
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : 'Lưu nháp'}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : 'Đăng bài'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4 space-y-4">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Tiêu đề bài viết..."
          className="w-full text-2xl font-bold text-gray-900 border-none outline-none placeholder:text-gray-300"
        />

        <textarea
          value={excerpt}
          onChange={e => setExcerpt(e.target.value)}
          placeholder="Mô tả ngắn (hiển thị trên card và SEO)..."
          rows={2}
          className="w-full text-gray-600 border-none outline-none resize-none placeholder:text-gray-300 text-sm"
        />

        {/* Cover image */}
        <div>
          <label className="text-sm text-gray-500 mb-1 block">Ảnh bìa</label>
          <div className="flex items-center gap-4">
            {coverImage && (
              <img src={coverImage} alt="Cover" className="w-24 h-16 rounded-lg object-cover" />
            )}
            <input
              type="text"
              value={coverImage}
              onChange={e => setCoverImage(e.target.value)}
              placeholder="URL ảnh bìa..."
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-green-400"
            />
            <label className="px-3 py-2 bg-gray-100 text-sm rounded-lg cursor-pointer hover:bg-gray-200">
              Upload
              <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Tags */}
        <input
          type="text"
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="Tags (phân cách bằng dấu phẩy): dược phẩm, sức khỏe..."
          className="w-full text-sm text-gray-600 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-green-400"
        />
      </div>

      {/* Editor.js */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4 min-h-[400px]">
        <div id="editorjs" className="prose prose-lg max-w-none" />
      </div>

      {/* SEO Section */}
      <details className="bg-white rounded-xl border border-gray-200 p-6 mb-4 group">
        <summary className="cursor-pointer font-medium text-gray-700">SEO Settings</summary>
        <div className="mt-4 space-y-3">
          <div>
            <label className="text-sm text-gray-500 block mb-1">SEO Title (max 60 ký tự)</label>
            <input
              type="text"
              value={seoTitle}
              onChange={e => setSeoTitle(e.target.value)}
              placeholder={title || 'SEO title...'}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-green-400"
              maxLength={60}
            />
          </div>
          <div>
            <label className="text-sm text-gray-500 block mb-1">Meta Description (max 160 ký tự)</label>
            <textarea
              value={seoDescription}
              onChange={e => setSeoDescription(e.target.value)}
              placeholder={excerpt || 'Meta description...'}
              rows={2}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-green-400 resize-none"
              maxLength={160}
            />
          </div>
        </div>
      </details>
    </div>
  );
}
