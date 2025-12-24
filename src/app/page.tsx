"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { useEffect, useMemo, useState } from 'react';

export default function CollaborativeEditor({ roomId }: { roomId: string }) {
  const [status, setStatus] = useState("connecting");

  // 1. Khởi tạo Yjs Document duy nhất
  const ydoc = useMemo(() => new Y.Doc(), []);

  // 2. Khởi tạo Provider ngay lập tức để tránh bị 'null'
  const provider = useMemo(() => {
    if (typeof window === "undefined") return null;
    
    return new HocuspocusProvider({
      url: 'ws://127.0.0.1:1234',
      name: roomId,
      document: ydoc,
      onStatus: (event) => setStatus(event.status),
    });
  }, [roomId, ydoc]);

  // 3. Khởi tạo Editor với provider đã có sẵn
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: false } as any),
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider: provider, // Đã có giá trị, không còn là null
        user: {
          name: `Phong Dev ${Math.floor(Math.random() * 100)}`,
          color: '#' + Math.floor(Math.random() * 16777215).toString(16),
        },
      }),
    ],
    immediatelyRender: false,
  });

  // Dọn dẹp kết nối khi component bị hủy
  useEffect(() => {
    return () => {
      provider?.destroy();
    };
  }, [provider]);

  if (!editor) return null;

  return (
    <div className="flex flex-col gap-2">
      {/* Hiển thị trạng thái kết nối */}
      <div className="flex items-center gap-2 px-2">
        <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500' : 'bg-orange-500'}`} />
        <span className="text-xs font-mono text-gray-500 uppercase">{status}</span>
      </div>

      <div className="border-2 border-slate-200 rounded-xl bg-white shadow-lg overflow-hidden transition-all hover:border-blue-300">
        <EditorContent editor={editor} className="p-6 min-h-[400px] focus:outline-none prose max-w-none" />
      </div>
    </div>
  );
}