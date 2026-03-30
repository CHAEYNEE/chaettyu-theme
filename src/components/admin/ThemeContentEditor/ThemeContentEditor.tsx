"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";

type ThemeContentEditorProps = {
  initialHtml?: string;
  onChange: (payload: {
    detailHtml: string;
    detailJson: Record<string, unknown> | null;
  }) => void;
};

export default function ThemeContentEditor({
  initialHtml = "",
  onChange,
}: ThemeContentEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: false,
      }),
    ],
    content: initialHtml || "<p></p>",
    immediatelyRender: false,
    onCreate: ({ editor }) => {
      onChange({
        detailHtml: editor.getHTML(),
        detailJson: editor.getJSON() as Record<string, unknown>,
      });
    },
    onUpdate: ({ editor }) => {
      onChange({
        detailHtml: editor.getHTML(),
        detailJson: editor.getJSON() as Record<string, unknown>,
      });
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div>
      <div
        style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}
      >
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          List
        </button>
        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .setImage({
                src: "https://placehold.co/600x400/png",
                alt: "test image",
                title: "test image",
              })
              .run()
          }
        >
          테스트 이미지
        </button>
      </div>

      <div
        style={{
          minHeight: 320,
          padding: 16,
          border: "1px solid #d8cfc4",
          borderRadius: 12,
          background: "#fffdf8",
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
