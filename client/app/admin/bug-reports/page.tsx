'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Bug, Send, Loader2 } from 'lucide-react';
import { http } from '@/lib/http';

export default function BugReportPage() {
  const [title, setTitle] = useState('');
  const [pageUrl, setPageUrl] = useState('');
  const [sending, setSending] = useState(false);
  const editorRef = useRef<any>(null);
  const holderRef = useRef<HTMLDivElement>(null);
  const [editorReady, setEditorReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initEditor = async () => {
      const EditorJS = (await import('@editorjs/editorjs')).default;
      const Header = (await import('@editorjs/header')).default;
      const List = (await import('@editorjs/list')).default;
      const ImageTool = (await import('@editorjs/image')).default;
      const Quote = (await import('@editorjs/quote')).default;
      const CodeTool = (await import('@editorjs/code')).default;
      const Delimiter = (await import('@editorjs/delimiter')).default;
      const Table = (await import('@editorjs/table')).default;

      if (!mounted || !holderRef.current) return;

      const getAccessToken = () => {
        if (typeof window !== 'undefined') {
          return localStorage.getItem('accessToken') || '';
        }
        return '';
      };

      const editor = new EditorJS({
        holder: holderRef.current,
        placeholder: 'Mô tả lỗi, các bước tái hiện, ảnh chụp màn hình... (paste ảnh trực tiếp Ctrl+V)',
        tools: {
          header: {
            class: Header,
            config: { placeholder: 'Tiêu đề...', levels: [2, 3, 4], defaultLevel: 2 },
          },
          list: { class: List as any, inlineToolbar: true },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  const formData = new FormData();
                  formData.append('image', file);
                  const token = getAccessToken();
                  const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || ''}/admin/bug-reports/upload-image/`,
                    { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData }
                  );
                  const data = await res.json();
                  if (data.success === 1) {
                    return { success: 1, file: { url: data.file.url } };
                  }
                  return { success: 0, message: 'Upload failed' };
                },
                async uploadByUrl(url: string) {
                  return { success: 1, file: { url } };
                },
              },
            },
          },
          quote: { class: Quote, inlineToolbar: true },
          code: { class: CodeTool },
          delimiter: { class: Delimiter },
          table: { class: Table as any, inlineToolbar: true },
        },
      });

      editorRef.current = editor;
      if (mounted) setEditorReady(true);
    };

    initEditor().catch(console.error);

    return () => {
      mounted = false;
      if (editorRef.current) {
        editorRef.current.destroy?.();
        editorRef.current = null;
      }
    };
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề báo cáo');
      return;
    }

    if (!editorRef.current) {
      toast.error('Trình soạn thảo chưa sẵn sàng');
      return;
    }

    setSending(true);
    try {
      const description = await editorRef.current.save();
      const blocks = (description as any).blocks || [];

      if (blocks.length === 0) {
        toast.error('Vui lòng nhập mô tả lỗi');
        setSending(false);
        return;
      }

      const payload: any = { title: title.trim(), description: JSON.stringify(description) };
      if (pageUrl.trim()) payload.page_url = pageUrl.trim();

      await http.post('/admin/bug-reports/submit/', payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      toast.success('Báo cáo lỗi đã được gửi thành công!');
      setTitle('');
      setPageUrl('');
      editorRef.current.clear?.();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Không thể gửi báo cáo, vui lòng thử lại';
      toast.error(msg);
    } finally {
      setSending(false);
    }
  }, [title, pageUrl]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <Bug className="h-6 w-6 text-red-500" />
          Báo Cáo Lỗi
        </h2>
        <p className="text-gray-500 mt-1">
          Gửi báo cáo lỗi hệ thống cho đội ngũ kỹ thuật. Vui lòng mô tả chi tiết lỗi và các bước tái hiện.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gửi báo cáo mới</CardTitle>
          <CardDescription>Mọi báo cáo sẽ được gửi qua email cho kỹ thuật viên.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Tiêu đề lỗi *</label>
            <Input
              placeholder="VD: Lỗi 500 khi thêm sản phẩm mới"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Trang xảy ra lỗi</label>
            <Input
              placeholder="VD: /admin/products hoặc để trống nếu không rõ"
              value={pageUrl}
              onChange={(e) => setPageUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Mô tả chi tiết *</label>
            <div className="border rounded-md p-4 min-h-[300px] bg-white">
              <div ref={holderRef} className="prose prose-sm max-w-none" />
            </div>
            {!editorReady && (
              <p className="text-xs text-muted-foreground mt-1">Đang tải trình soạn thảo...</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Mẹo: Paste ảnh trực tiếp (Ctrl+V) vào vùng soạn thảo để đính kèm ảnh chụp màn hình.
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={sending || !editorReady}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Gửi báo cáo
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
