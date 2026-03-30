"use client";

import { ChangeEvent, useRef, useState } from "react";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { FontSize, TextStyle } from "@tiptap/extension-text-style";
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

const FONT_SIZE_OPTIONS = [
  { label: "기본", value: "" },
  { label: "12", value: "12px" },
  { label: "14", value: "14px" },
  { label: "16", value: "16px" },
  { label: "18", value: "18px" },
  { label: "20", value: "20px" },
  { label: "24", value: "24px" },
  { label: "28", value: "28px" },
  { label: "32", value: "32px" },
];

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
  const [linkOpenInNewTab, setLinkOpenInNewTab] = useState(true);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      TextStyle,
      FontSize,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right"],
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

  function closeLinkBox() {
    setIsLinkBoxOpen(false);
    setLinkInputValue("");
    setLinkOpenInNewTab(true);
  }

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

    const attributes = editor.getAttributes("link") as {
      href?: string;
      target?: string | null;
    };

    setLinkInputValue(attributes.href ?? "");
    setLinkOpenInNewTab(attributes.target !== null);
    setIsLinkBoxOpen(true);
  }

  function handleApplyLink() {
    if (!editor) {
      return;
    }

    const normalizedHref = normalizeHref(linkInputValue);

    if (!normalizedHref) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      closeLinkBox();
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
      .setLink({
        href: normalizedHref,
        target: linkOpenInNewTab ? "_blank" : null,
        rel: linkOpenInNewTab ? "noopener noreferrer" : null,
      })
      .run();

    closeLinkBox();
  }

  function handleRemoveLink() {
    if (!editor) {
      return;
    }

    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    closeLinkBox();
  }

  function handleUndo() {
    if (!editor) {
      return;
    }

    editor.chain().focus().undo().run();
  }

  function handleRedo() {
    if (!editor) {
      return;
    }

    editor.chain().focus().redo().run();
  }

  if (!editor) {
    return null;
  }

  const canUndo = editor.can().chain().focus().undo().run();
  const canRedo = editor.can().chain().focus().redo().run();
  const currentFontSize =
    (editor.getAttributes("textStyle").fontSize as string | undefined) ?? "";

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            className={styles.toolButton}
            onClick={handleUndo}
            disabled={!canUndo}
          >
            되돌리기
          </button>

          <button
            type="button"
            className={styles.toolButton}
            onClick={handleRedo}
            disabled={!canRedo}
          >
            다시하기
          </button>

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
        </div>

        <div className={styles.toolbarGroup}>
          <select
            className={styles.toolSelect}
            value={currentFontSize}
            onChange={(event) => {
              const value = event.target.value;

              if (!value) {
                editor.chain().focus().unsetFontSize().run();
                return;
              }

              editor.chain().focus().setFontSize(value).run();
            }}
          >
            {FONT_SIZE_OPTIONS.map((option) => (
              <option key={option.label} value={option.value}>
                글자 {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            className={`${styles.toolButton} ${
              editor.isActive({ textAlign: "left" })
                ? styles.toolButtonActive
                : ""
            }`}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          >
            좌측
          </button>

          <button
            type="button"
            className={`${styles.toolButton} ${
              editor.isActive({ textAlign: "center" })
                ? styles.toolButtonActive
                : ""
            }`}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          >
            가운데
          </button>

          <button
            type="button"
            className={`${styles.toolButton} ${
              editor.isActive({ textAlign: "right" })
                ? styles.toolButtonActive
                : ""
            }`}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          >
            우측
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

          <label className={styles.linkCheckboxLabel}>
            <input
              type="checkbox"
              className={styles.linkCheckbox}
              checked={linkOpenInNewTab}
              onChange={(event) => setLinkOpenInNewTab(event.target.checked)}
            />
            새 탭에서 열기
          </label>

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
              onClick={handleRemoveLink}
            >
              링크 제거
            </button>

            <button
              type="button"
              className={styles.linkActionButton}
              onClick={closeLinkBox}
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
        제목, 글자 크기, 정렬, 리스트, 링크, 이미지를 자유롭게 넣을 수 있어요.
      </p>
    </div>
  );
}
