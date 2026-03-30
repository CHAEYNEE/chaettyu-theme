"use client";

import { ChangeEvent, useRef, useState } from "react";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";

import { useToast } from "@/components/common/Toast/ToastProvider";

import styles from "./ThemeContentEditor.module.css";

type ThemeContentEditorProps = {
  themeId?: string;
  initialHtml?: string;
  initialJson?: Record<string, unknown> | null;
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

function normalizeHref(rawValue: string) {
  const value = rawValue.trim();

  if (!value) {
    return "";
  }

  if (/^mailto:/i.test(value) || /^tel:/i.test(value)) {
    return value;
  }

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return `mailto:${value}`;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `https://${value}`;
}

function isValidHref(value: string) {
  if (!value) {
    return false;
  }

  if (/^mailto:/i.test(value) || /^tel:/i.test(value)) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function ThemeContentEditor({
  themeId = "",
  initialHtml = "",
  initialJson = null,
  onChange,
}: ThemeContentEditorProps) {
  const { showToast } = useToast();

  const imageInputRef = useRef<HTMLInputElement>(null);

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isLinkBoxOpen, setIsLinkBoxOpen] = useState(false);
  const [linkInputValue, setLinkInputValue] = useState("");

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
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        defaultProtocol: "https",
        protocols: [
          "mailto",
          {
            scheme: "tel",
            optionalSlashes: true,
          },
        ],
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Placeholder.configure({
        placeholder: "테마 상세 내용을 입력해 주세요.",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: (initialJson ?? initialHtml) || "<p></p>",
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

  function handleOpenLinkBox() {
    if (!editor) {
      return;
    }

    const previousHref = editor.getAttributes("link").href as
      | string
      | undefined;

    setLinkInputValue(previousHref ?? "");
    setIsLinkBoxOpen(true);
  }

  function handleApplyLink() {
    if (!editor) {
      return;
    }

    const normalizedHref = normalizeHref(linkInputValue);

    if (!normalizedHref) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setIsLinkBoxOpen(false);
      setLinkInputValue("");
      return;
    }

    if (!isValidHref(normalizedHref)) {
      showToast("올바른 링크 주소를 입력해 주세요.", {
        type: "error",
      });
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: normalizedHref })
      .run();

    setIsLinkBoxOpen(false);
    setLinkInputValue("");
  }

  function handleRemoveLink() {
    if (!editor) {
      return;
    }

    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setIsLinkBoxOpen(false);
    setLinkInputValue("");
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

        <button
          type="button"
          className={`${styles.toolButton} ${
            editor.isActive("link") ? styles.toolButtonActive : ""
          }`}
          onClick={handleOpenLinkBox}
        >
          링크
        </button>

        <button
          type="button"
          className={styles.toolButton}
          onClick={handleRemoveLink}
        >
          링크 해제
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

      {isLinkBoxOpen && (
        <div className={styles.linkBox}>
          <input
            type="text"
            value={linkInputValue}
            onChange={(event) => setLinkInputValue(event.target.value)}
            placeholder="https://example.com"
            className={styles.linkInput}
          />

          <div className={styles.linkActions}>
            <button
              type="button"
              className={styles.linkActionButton}
              onClick={handleApplyLink}
            >
              적용
            </button>

            <button
              type="button"
              className={styles.linkActionButton}
              onClick={() => {
                setIsLinkBoxOpen(false);
                setLinkInputValue("");
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}

      <div className={styles.editorShell}>
        <div className={styles.editor}>
          <EditorContent editor={editor} />
        </div>
      </div>

      <p className={styles.helpText}>
        제목, 리스트, 링크, 이미지를 자유롭게 넣을 수 있어요.
      </p>
    </div>
  );
}
