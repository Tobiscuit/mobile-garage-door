'use client';

import React from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  onSend?: () => void;
  disabled?: boolean;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  const buttonClass = (isActive: boolean) => twMerge(
    "p-2 rounded text-sm transition-colors",
    isActive 
      ? "bg-[#f1c40f] text-[#2c3e50] font-bold" 
      : "text-gray-500 dark:text-[#7f8c8d] hover:bg-gray-100 dark:hover:bg-[#ffffff10] hover:text-gray-900 dark:hover:text-white"
  );

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 dark:border-[#ffffff10] bg-gray-50 dark:bg-[#ffffff02]">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={buttonClass(editor.isActive('bold'))}
        title="Bold (Ctrl+B)"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" /></svg>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={buttonClass(editor.isActive('italic'))}
        title="Italic (Ctrl+I)"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l8 8M6 16l14 14" /></svg>
      </button>
      <button
         onClick={() => editor.chain().focus().toggleStrike().run()}
         disabled={!editor.can().chain().focus().toggleStrike().run()}
         className={buttonClass(editor.isActive('strike'))}
         title="Strike"
      >
         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16" /></svg>
      </button>
      
      <div className="w-[1px] h-6 bg-gray-200 dark:bg-[#ffffff10] mx-1 my-auto"></div>

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={buttonClass(editor.isActive('bulletList'))}
        title="Bullet List"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={buttonClass(editor.isActive('orderedList'))}
        title="Ordered List"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h12M7 12h12M7 17h12M3 7h.01M3 12h.01M3 17h.01" /></svg>
      </button>
      
      <div className="w-[1px] h-6 bg-gray-200 dark:bg-[#ffffff10] mx-1 my-auto"></div>

      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={buttonClass(editor.isActive('blockquote'))}
        title="Quote"
      >
         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
      </button>
    </div>
  )
}

export const RichTextEditor = ({ content, onChange, onSend, disabled }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: 'Write a reply... (/ for commands)',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
        attributes: {
            class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[150px] p-4 text-sm custom-scrollbar text-gray-800 dark:text-white',
        },
        handleKeyDown: (view, event) => {
            if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                if (onSend) {
                  onSend();
                  return true;
                }
            }
            return false;
        }
    },
    editable: !disabled,
  });

  // Sync content if props change externally (e.g. clear after send)
  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
        // Only update if significantly different to avoid cursor jumps
        if (content === '' || content === '<p></p>') {
            editor.commands.setContent(content);
        }
    }
  }, [content, editor]);

  return (
    <div className={clsx(
        "rounded-xl border border-gray-200 dark:border-[#ffffff10] bg-white dark:bg-[#ffffff05] overflow-hidden transition-all",
        editor?.isFocused && "border-yellow-400 dark:border-[#f1c40f]/50 ring-1 ring-yellow-400/20 dark:ring-[#f1c40f]/20",
        disabled && "opacity-50 cursor-not-allowed"
    )}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};
