'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type EditorJS from '@editorjs/editorjs';
import type { OutputData } from '@editorjs/editorjs';
import edjsHTML from 'editorjs-html';
import { ImageIcon, Loader2, Eye, Search, Tag, X, Clock, Globe, Save, Send, ArrowLeft, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const edjsParser = edjsHTML();

function convertToHTML(blocks: OutputData): string {
  return edjsParser.parse(blocks).join('');
}

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]+>/g, '');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200)); // 200 words per minute
}

// ─── Editor.js tools ───────────────────────────────────────────
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

// ─── Props ──────────────────────────────────────────────────────
interface BlogEditorProps {
  editSlug?: string;
  onSaved: (slug: string) => void;
  onCancel: () => void;
}

// ─── Tag Input Component ────────────────────────────────────────
function TagInput({ value, onChange }: { value: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState('');

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput('');
  };

  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };

  return (
    <div className="flex flex-wrap gap-1.5 items-center p-2 min-h-[42px] border border-gray-200 rounded-lg bg-white focus-within:border-green-400 focus-within:ring-1 focus-within:ring-green-100 transition-all">
      {value.map(tag => (
        <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
          {tag}
          <button onClick={() => removeTag(tag)} className="hover:text-red-500">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(input); }
          if (e.key === 'Backspace' && !input && value.length > 0) { removeTag(value[value.length - 1]); }
        }}
        onBlur={() => { if (input.trim()) addTag(input); }}
        placeholder={value.length === 0 ? 'Thêm tag...' : ''}
        className="flex-1 min-w-[120px] outline-none text-sm bg-transparent"
      />
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────
export default function BlogEditor({ editSlug, onSaved, onCancel }: BlogEditorProps) {
  // Form state
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!!editSlug);
  const [formReady, setFormReady] = useState(!editSlug);
  const [showPreview, setShowPreview] = useState(false);
  const [isLegacyPost, setIsLegacyPost] = useState(false); // old post without content_json

  // Live preview HTML
  const [liveContent, setLiveContent] = useState('');

  const editorRef = useRef<EditorJS | null>(null);
  const isEditorReady = useRef(false);
  const pendingBlocksRef = useRef<{ blocks: any[]; time: number; version: string } | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const previewTimerRef = useRef<NodeJS.Timeout | null>(null);
  const legacyContentRef = useRef(''); // preserve legacy HTML content

  // ─── Load existing post ───────────────────────────────────────
  useEffect(() => {
    if (!editSlug) return;
    const loadPost = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) { setLoading(false); return; }
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
        setTags(data.tags || []);
        setSeoTitle(data.seo_title || '');
        setSeoDescription(data.seo_description || '');
        setStatus(data.status || 'DRAFT');
        setLiveContent(data.content || '');

        // Load raw Editor.js blocks if available (content_json), otherwise start fresh
        const hasBlockData = data.content_json?.blocks?.length > 0;
        if (!hasBlockData && data.content) {
          // Legacy post: has HTML content but no Editor.js blocks
          setIsLegacyPost(true);
          legacyContentRef.current = data.content;
        }
        pendingBlocksRef.current = hasBlockData
          ? { blocks: data.content_json.blocks, time: Date.now(), version: '2.30.6' }
          : { blocks: [], time: Date.now(), version: '2.30.6' };
      } catch {
        setError('Không thể tải bài viết');
      } finally {
        setLoading(false);
        setFormReady(true);
      }
    };
    loadPost();
  }, [editSlug]);

  // ─── Init Editor.js ───────────────────────────────────────────
  useEffect(() => {
    if (!formReady) return;
    if (typeof window === 'undefined') return;
    if (editorRef.current) return;

    const timer = setTimeout(() => {
      const holder = document.getElementById('editorjs');
      if (!holder) return;

      try {
        const EditorJSClass = require('@editorjs/editorjs').default;
        const editorData = pendingBlocksRef.current || { blocks: [], time: Date.now(), version: '2.30.6' };

        const editor = new EditorJSClass({
          holder: 'editorjs',
          tools: getEditorTools(),
          placeholder: 'Bắt đầu viết nội dung...',
          autofocus: false,
          data: editorData,
          onChange: () => {
            // Debounced live preview update
            if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
            previewTimerRef.current = setTimeout(async () => {
              if (editorRef.current && isEditorReady.current) {
                try {
                  const saved = await editorRef.current.save();
                  setLiveContent(convertToHTML(saved));
                } catch {}
              }
            }, 500);
          },
        });

        editor.isReady.then(() => {
          isEditorReady.current = true;
        }).catch((err: Error) => {
          console.error('Editor init failed', err);
        });

        editorRef.current = editor;
      } catch (e) {
        console.error('Editor creation failed', e);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [formReady]);

  // ─── Cleanup ──────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
      if (editorRef.current) {
        try { editorRef.current.destroy(); } catch {}
        editorRef.current = null;
      }
    };
  }, []);

  // ─── Handlers ─────────────────────────────────────────────────
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
    } catch {
      setError('Upload ảnh bìa thất bại');
    }
  };

  const handleSave = async (publishNow = false) => {
    const token = localStorage.getItem('accessToken');
    if (!token) { setError('Bạn cần đăng nhập lại'); return; }
    if (!title.trim()) { setError('Vui lòng nhập tiêu đề'); return; }

    setSaving(true);
    setError('');

    try {
      let content = '';
      let contentJson = {};
      if (editorRef.current && isEditorReady.current) {
        const saved = await editorRef.current.save();
        content = convertToHTML(saved);
        contentJson = saved; // raw Editor.js blocks for future editing
      }

      // Preserve legacy content if editor is empty (old post without content_json)
      if (!content && legacyContentRef.current) {
        content = legacyContentRef.current;
      }

      const payload = {
        title: title.trim(),
        content,
        content_json: contentJson,
        excerpt: excerpt.trim(),
        cover_image: coverImage,
        tags,
        status: publishNow ? 'PUBLISHED' : status,
        seo_title: seoTitle.trim() || undefined,
        seo_description: seoDescription.trim() || undefined,
        author: JSON.parse(localStorage.getItem('user') || '{}').id || 1,
      };

      let res;
      if (editSlug) {
        res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/${editSlug}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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

  // ─── Computed values ──────────────────────────────────────────
  const readingTime = useMemo(() => estimateReadingTime(liveContent), [liveContent]);
  const wordCount = useMemo(() => {
    const text = liveContent.replace(/<[^>]+>/g, '');
    return text.trim().split(/\s+/).filter(Boolean).length;
  }, [liveContent]);

  const displaySeoTitle = seoTitle || title;
  const displaySeoDesc = seoDescription || excerpt;

  // ─── Loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  // ─── Publishing Sidebar ───────────────────────────────────────
  const sidebar = (
    <div className="space-y-5">
      {/* Publish Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="h-4 w-4 text-green-600" />
          Đăng bài
        </h3>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Trạng thái</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:border-green-400 focus:ring-1 focus:ring-green-100 outline-none"
            >
              <option value="DRAFT">Nháp</option>
              <option value="PUBLISHED">Công khai</option>
              <option value="ARCHIVED">Lưu trữ</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-3.5 w-3.5" />
            <span>{readingTime} phút đọc</span>
            <span className="text-gray-300">|</span>
            <span>{wordCount} từ</span>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {saving ? 'Đang lưu...' : 'Đăng bài'}
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="w-full px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              <Save className="h-4 w-4" />
              Lưu nháp
            </button>
          </div>
        </div>
      </div>

      {/* SEO Preview Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-sm">
          <Search className="h-4 w-4 text-blue-600" />
          Google SERP Preview
        </h3>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              SEO Title
              <span className={cn("ml-1", displaySeoTitle.length > 60 ? "text-red-500" : "text-gray-400")}>
                ({displaySeoTitle.length}/60)
              </span>
            </label>
            <input
              type="text"
              value={seoTitle}
              onChange={e => setSeoTitle(e.target.value)}
              placeholder={title || 'SEO title...'}
              maxLength={70}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              Meta Description
              <span className={cn("ml-1", displaySeoDesc.length > 160 ? "text-red-500" : "text-gray-400")}>
                ({displaySeoDesc.length}/160)
              </span>
            </label>
            <textarea
              value={seoDescription}
              onChange={e => setSeoDescription(e.target.value)}
              placeholder={excerpt || 'Meta description...'}
              rows={2}
              maxLength={180}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-blue-400 resize-none"
            />
          </div>

          {/* SERP Mockup */}
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 text-xs">
            <div className="text-blue-700 text-base leading-tight truncate font-medium font-sans">
              {displaySeoTitle || 'Tiêu đề bài viết'}
            </div>
            <div className="text-green-700 text-xs leading-normal">
              banthuocsi.vn › blog › {editSlug || 'tieu-de'}
            </div>
            <div className="text-gray-600 leading-normal mt-0.5 line-clamp-2">
              {displaySeoDesc || 'Mô tả bài viết sẽ hiển thị ở đây...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── Main Render ──────────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors border",
              showPreview
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            )}
          >
            <Eye className="h-4 w-4" />
            Xem trước
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm flex items-center gap-2 shrink-0">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Left: Editor */}
        <div className="flex-1 min-w-0 overflow-y-auto pr-2 space-y-5">
          {/* Title */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
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
              placeholder="Mô tả ngắn — hiển thị trên thẻ blog và kết quả tìm kiếm..."
              rows={2}
              className="w-full text-gray-500 border-none outline-none resize-none placeholder:text-gray-300 text-sm mt-2"
            />

            {/* Cover Image */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <label className="text-xs font-medium text-gray-500 mb-2 block">Ảnh bìa</label>
              {coverImage ? (
                <div className="relative group rounded-lg overflow-hidden bg-gray-100 w-full aspect-[21/9] max-h-[220px]">
                  <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button
                        onClick={() => coverInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-100"
                      >
                        Đổi ảnh
                      </button>
                      <button
                        onClick={() => setCoverImage('')}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => coverInputRef.current?.click()}
                  className="w-full aspect-[21/9] max-h-[220px] border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-green-300 hover:text-green-600 hover:bg-green-50/50 transition-all"
                >
                  <ImageIcon className="h-10 w-10" />
                  <span className="text-sm font-medium">Thêm ảnh bìa</span>
                  <span className="text-xs">Kéo thả hoặc nhấn để upload</span>
                </button>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
              {coverImage && (
                <input
                  type="text"
                  value={coverImage}
                  onChange={e => setCoverImage(e.target.value)}
                  placeholder="Hoặc dán URL ảnh..."
                  className="w-full text-xs text-gray-400 border border-gray-100 rounded-lg px-3 py-1.5 mt-2 outline-none focus:border-green-300"
                />
              )}
            </div>

            {/* Tags */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <label className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1">
                <Tag className="h-3 w-3" /> Tags
              </label>
              <TagInput value={tags} onChange={setTags} />
            </div>
          </div>

          {/* Legacy post warning */}
          {isLegacyPost && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800 text-sm">Bài viết được tạo từ phiên bản cũ</p>
                <p className="text-amber-600 text-sm mt-0.5">
                  Nội dung cũ vẫn hiển thị bên dưới (chế độ xem trước), nhưng cần được nhập lại trong trình soạn thảo mới để có thể chỉnh sửa.
                  Khi lưu mà chưa nhập nội dung mới, nội dung cũ sẽ được giữ nguyên.
                </p>
              </div>
            </div>
          )}

          {/* Editor.js */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-2.5 border-b border-gray-100 bg-gray-50/50 rounded-t-xl flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1"><span className="font-bold text-gray-500">B</span> Bold</span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1"><span className="font-bold text-gray-500 italic">I</span> Italic</span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1"><span className="font-bold text-gray-500">H</span> Heading</span>
              <span className="text-gray-300">|</span>
              <span>Nhấn Tab để mở menu khối</span>
            </div>
            <div id="editorjs" className="prose prose-lg max-w-none p-5 min-h-[400px]" />
          </div>

          <div className="h-4" />
        </div>

        {/* Right: Sidebar */}
        <div className="w-[340px] shrink-0 space-y-5 overflow-y-auto hidden lg:block">
          {sidebar}

          {/* Live Preview */}
          {showPreview && liveContent && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2 text-sm text-gray-600">
                <Eye className="h-4 w-4" />
                Xem trước bài viết
              </div>
              <div
                className="p-4 prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-img:rounded-lg prose-img:w-full"
                dangerouslySetInnerHTML={{ __html: liveContent }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile-only bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-2 z-50 shadow-lg">
        <button
          onClick={() => handleSave(false)}
          disabled={saving}
          className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-medium disabled:opacity-50"
        >
          Lưu nháp
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={saving}
          className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-semibold disabled:opacity-50"
        >
          {saving ? 'Đang lưu...' : 'Đăng bài'}
        </button>
      </div>
    </div>
  );
}
