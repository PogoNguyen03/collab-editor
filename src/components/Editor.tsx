"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { useEffect, useMemo, useState } from 'react';

export default function CollaborativeEditor({ roomId }: { roomId: string }) {
  const [isClient, setIsClient] = useState(false);

  // Đảm bảo code chỉ chạy ở client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const ydoc = useMemo(() => new Y.Doc(), []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ history: false } as any),
      Collaboration.configure({
        document: ydoc,
      }),
      CollaborationCursor.configure({
        provider: null,
        user: {
          name: `Phong Dev ${Math.floor(Math.random() * 100)}`,
          color: '#' + Math.floor(Math.random() * 16777215).toString(16),
        },
      }),
    ],
    // QUAN TRỌNG: Khắc phục lỗi SSR
    immediatelyRender: false, 
  });

  useEffect(() => {
    if (!isClient) return;

    const provider = new HocuspocusProvider({
      url: 'ws://127.0.0.1:1234',
      name: roomId,
      document: ydoc,
    });

    if (editor && !editor.isDestroyed) {
      const cursorExtension = editor.extensionManager.extensions.find(
        (ext) => ext.name === 'collaborationCursor'
      );
      if (cursorExtension) {
        cursorExtension.options.provider = provider;
      }
    }

    return () => provider.destroy();
  }, [ydoc, roomId, editor, isClient]);

  // Nếu chưa phải client-side, trả về null để tránh lỗi Hydration
  if (!isClient || !editor) {
    return <div className="h-[400px] bg-gray-50 animate-pulse rounded-xl border-2" />;
  }

  return (
    <div className="border-2 border-slate-200 rounded-xl bg-white shadow-lg overflow-hidden transition-all hover:border-blue-300">
      <EditorContent editor={editor} className="p-6 min-h-[400px] focus:outline-none" />
    </div>
  );
}