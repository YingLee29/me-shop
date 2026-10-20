'use client';

import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'tiptap-content',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChangeRef.current(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div style={{ minHeight: 220, border: '1px solid var(--admin-border)', borderRadius: 6, padding: 14, color: '#999' }}>
        Đang tải trình soạn thảo...
      </div>
    );
  }

  const tools = [
    { icon: Bold, label: 'Đậm', active: editor.isActive('bold'), action: () => editor.chain().focus().toggleBold().run() },
    { icon: Italic, label: 'Nghiêng', active: editor.isActive('italic'), action: () => editor.chain().focus().toggleItalic().run() },
    { icon: Strikethrough, label: 'Gạch ngang', active: editor.isActive('strike'), action: () => editor.chain().focus().toggleStrike().run() },
    { icon: Heading2, label: 'Tiêu đề 2', active: editor.isActive('heading', { level: 2 }), action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { icon: Heading3, label: 'Tiêu đề 3', active: editor.isActive('heading', { level: 3 }), action: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { icon: List, label: 'Danh sách', active: editor.isActive('bulletList'), action: () => editor.chain().focus().toggleBulletList().run() },
    { icon: ListOrdered, label: 'Danh sách số', active: editor.isActive('orderedList'), action: () => editor.chain().focus().toggleOrderedList().run() },
    { icon: Quote, label: 'Trích dẫn', active: editor.isActive('blockquote'), action: () => editor.chain().focus().toggleBlockquote().run() },
    { icon: Undo2, label: 'Hoàn tác', active: false, action: () => editor.chain().focus().undo().run() },
    { icon: Redo2, label: 'Làm lại', active: false, action: () => editor.chain().focus().redo().run() },
  ];

  return (
    <div className="tiptap-editor" style={{ border: '1px solid var(--admin-border)', borderRadius: 6, overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', padding: '7px 8px', background: 'var(--admin-bg)', borderBottom: '1px solid var(--admin-border)' }}>
        {tools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <React.Fragment key={tool.label}>
              {index === 3 || index === 5 || index === 8 ? (
                <span style={{ width: 1, height: 22, background: 'var(--admin-border)', margin: '0 3px' }} />
              ) : null}
              <button
                type="button"
                title={tool.label}
                onClick={tool.action}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 30,
                  height: 30,
                  borderRadius: 5,
                  background: tool.active ? 'var(--color-brown)' : '#FFF',
                  color: tool.active ? '#FFF' : 'var(--admin-text)',
                  border: '1px solid var(--admin-border)',
                }}
              >
                <Icon size={15} />
              </button>
            </React.Fragment>
          );
        })}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
