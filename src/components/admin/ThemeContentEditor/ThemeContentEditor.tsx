"use client";

import { ChangeEvent, useRef, useState } from "react";

import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";

import { useToast } from "@/components/common/Toast/ToastProvider";

import styles from "./ThemeContentEditor.module.css";

type ThemeContentEditorProps = {
  themeId?: string;
  initialHtml?: string;
  onChange: (payload: {
    detailHtml: string;
    detailJson: Record<string, unknown> | null;
  }) => void;
};

function normalizeThemeId(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function ThemeContentEditor({
  themeId = "",
  initialHtml = "",
  onChange,
}: ThemeContentEditorProps) {
  const { showToast } = useToast();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Image.configure({
        inline: false,
      }),
      Placeholder.configure({
        placeholder: "테마 상세 내용을 입력해 주세요.",
        emptyEditorClass: "is-editor-empty",
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

  async function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const normalizedThemeId = normalizeThemeId(themeId);

    if (!normalizedThemeId) {
      showToast("이미지 업로드 전에 테마 ID를 먼저 입력해 주세요.", {
        type: "error",
      });
      event.target.value = "";
      return;
    }

    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("themeId", normalizedThemeId);

      const response = await fetch("/api/admin/upload-detail-image", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as {
        publicUrl?: string;
        error?: string;
      };

      if (!response.ok || !result.publicUrl) {
        throw new Error(result.error || "상세 이미지 업로드에 실패했어요.");
      }

      if (!editor) {
        return;
      }

      editor
        .chain()
        .focus()
        .setImage({
          src: result.publicUrl,
          alt: file.name,
          title: file.name,
        })
        .run();

      showToast("상세 이미지 업로드가 완료되었어요!", {
        type: "success",
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "상세 이미지 업로드 중 문제가 생겼어요.";

      showToast(message, { type: "error" });
    } finally {
      setIsUploadingImage(false);

      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  }

  if (!editor) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={`${styles.toolButton} ${
            editor.isActive("bold") ? styles.toolButtonActive : ""
          }`}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          굵게
        </button>

        <button
          type="button"
          className={`${styles.toolButton} ${
            editor.isActive("italic") ? styles.toolButtonActive : ""
          }`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          기울임
        </button>

        <button
          type="button"
          className={`${styles.toolButton} ${
            editor.isActive("heading", { level: 2 })
              ? styles.toolButtonActive
              : ""
          }`}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          제목 2
        </button>

        <button
          type="button"
          className={`${styles.toolButton} ${
            editor.isActive("heading", { level: 3 })
              ? styles.toolButtonActive
              : ""
          }`}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          제목 3
        </button>

        <button
          type="button"
          className={`${styles.toolButton} ${
            editor.isActive("bulletList") ? styles.toolButtonActive : ""
          }`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          리스트
        </button>

        <input
          ref={imageInputRef}
          className={styles.hiddenFileInput}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handleImageUpload}
        />

        <button
          type="button"
          className={styles.toolButton}
          disabled={isUploadingImage}
          onClick={() => imageInputRef.current?.click()}
        >
          {isUploadingImage ? "업로드 중..." : "이미지"}
        </button>
      </div>

      <div className={styles.editorShell}>
        <div className={styles.editor}>
          <EditorContent editor={editor} />
        </div>
      </div>

      <p className={styles.helpText}>
        제목, 리스트, 이미지를 자유롭게 넣을 수 있어요.
      </p>
    </div>
  );
}
