"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useMemo, useRef, useState } from "react";

import CustomDropdown, {
  type DropdownOption,
} from "@/components/common/CustomDropdown/CustomDropdown";
import type { ThemePlatform, ThemeType } from "@/types/theme";

import styles from "./AdminThemeForm.module.css";

type FormState = {
  id: string;
  title: string;
  type: ThemeType;
  price: string;
  setPrice: string;
  thumbnail: string;
  previewImages: string;
  tags: string;
  badge: string;
  detailHtml: string;
  platforms: ThemePlatform[];
  isPublished: boolean;
};

const initialFormState: FormState = {
  id: "",
  title: "",
  type: "free",
  price: "0",
  setPrice: "",
  thumbnail: "",
  previewImages: "",
  tags: "",
  badge: "",
  detailHtml: "",
  platforms: ["ios"],
  isPublished: true,
};

const themeTypeOptions: DropdownOption[] = [
  { label: "무료", value: "free" },
  { label: "유료", value: "signature" },
];

const publishStatusOptions: DropdownOption[] = [
  { label: "공개", value: "published" },
  { label: "비공개", value: "private" },
];

const platformOptions: { label: string; value: ThemePlatform }[] = [
  { label: "iOS", value: "ios" },
  { label: "Android", value: "android" },
];

function normalizeId(value: string) {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function splitByLine(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitByComma(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function AdminThemeForm() {
  const router = useRouter();
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const previewInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(initialFormState);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isUploadingPreviewImages, setIsUploadingPreviewImages] =
    useState(false);

  const previewImageList = useMemo(
    () => splitByLine(form.previewImages),
    [form.previewImages],
  );

  function handleChange<K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function handlePlatformToggle(platform: ThemePlatform) {
    setForm((prev) => {
      const alreadyChecked = prev.platforms.includes(platform);

      if (alreadyChecked) {
        return {
          ...prev,
          platforms: prev.platforms.filter((item) => item !== platform),
        };
      }

      return {
        ...prev,
        platforms: [...prev.platforms, platform],
      };
    });
  }

  function resetError() {
    if (errorMessage) {
      setErrorMessage("");
    }
  }

  async function handleThumbnailUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    resetError();
    setIsUploadingThumbnail(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/upload-thumbnail", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as {
        publicUrl?: string;
        error?: string;
      };

      if (!response.ok || !result.publicUrl) {
        throw new Error(result.error || "썸네일 업로드에 실패했어요.");
      }

      handleChange("thumbnail", result.publicUrl);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "썸네일 업로드 중 문제가 생겼어요.";

      setErrorMessage(message);
    } finally {
      setIsUploadingThumbnail(false);

      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = "";
      }
    }
  }

  async function handlePreviewImagesUpload(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    resetError();
    setIsUploadingPreviewImages(true);

    try {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/admin/upload-preview-images", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as {
        files?: { publicUrl: string }[];
        error?: string;
      };

      if (!response.ok || !result.files) {
        throw new Error(result.error || "미리보기 이미지 업로드에 실패했어요.");
      }

      const uploadedUrls = result.files.map((file) => file.publicUrl);

      setForm((prev) => {
        const existingUrls = splitByLine(prev.previewImages);
        const mergedUrls = [...existingUrls, ...uploadedUrls];

        return {
          ...prev,
          previewImages: mergedUrls.join("\n"),
        };
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "미리보기 이미지 업로드 중 문제가 생겼어요.";

      setErrorMessage(message);
    } finally {
      setIsUploadingPreviewImages(false);

      if (previewInputRef.current) {
        previewInputRef.current.value = "";
      }
    }
  }

  function buildRequestBody() {
    return {
      id: normalizeId(form.id),
      title: form.title.trim(),
      type: form.type,
      price: Number(form.price || 0),
      setPrice: form.setPrice.trim() ? Number(form.setPrice) : undefined,
      setBonusCount: undefined,
      thumbnail: form.thumbnail.trim(),
      previewImages: splitByLine(form.previewImages),
      tags: splitByComma(form.tags),
      isPublished: form.isPublished,
      downloadFileName: undefined,
      platforms: form.platforms,
      detailHtml: form.detailHtml.trim(),
      badge: form.badge.trim() || undefined,
    };
  }

  function validateForm() {
    const normalizedId = normalizeId(form.id);

    if (!normalizedId) {
      return "테마 ID를 입력해 주세요.";
    }

    if (!form.title.trim()) {
      return "테마명을 입력해 주세요.";
    }

    if (!form.thumbnail.trim()) {
      return "썸네일을 업로드하거나 경로를 입력해 주세요.";
    }

    if (form.platforms.length === 0) {
      return "최소 1개의 플랫폼을 선택해 주세요.";
    }

    if (form.type === "signature" && !form.price.trim()) {
      return "유료 테마는 가격을 입력해 주세요.";
    }

    return "";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetError();

    const validationMessage = validateForm();

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/themes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildRequestBody()),
      });

      const result = (await response.json()) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error || "테마 등록에 실패했어요.");
      }

      window.alert(result.message || "새 테마가 등록되었어요!");
      router.replace("/admin/themes");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "테마 등록 중 문제가 생겼어요.";

      setErrorMessage(message);
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>BASIC INFO</p>
          <h3 className={styles.sectionTitle}>기본 정보</h3>
        </div>

        <div className={styles.grid}>
          <label className={styles.field}>
            <span className={styles.label}>테마 ID</span>
            <input
              className={styles.input}
              type="text"
              value={form.id}
              onChange={(event) => {
                resetError();
                handleChange("id", normalizeId(event.target.value));
              }}
              placeholder="milk-heart"
            />
            <span className={styles.hint}>
              영문 소문자, 숫자, 하이픈(-)만 사용
            </span>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>테마명</span>
            <input
              className={styles.input}
              type="text"
              value={form.title}
              onChange={(event) => {
                resetError();
                handleChange("title", event.target.value);
              }}
              placeholder="밀크 하트"
            />
          </label>

          <div className={styles.field}>
            <span className={styles.label}>테마 종류</span>
            <CustomDropdown
              value={form.type}
              options={themeTypeOptions}
              placeholder="테마 종류 선택"
              variant="form"
              onChange={(value) => {
                resetError();
                const nextType = value as ThemeType;

                setForm((prev) => ({
                  ...prev,
                  type: nextType,
                  price: nextType === "free" ? "0" : prev.price,
                  setPrice: nextType === "free" ? "" : prev.setPrice,
                }));
              }}
            />
          </div>

          <label className={styles.field}>
            <span className={styles.label}>배지 문구</span>
            <input
              className={styles.input}
              type="text"
              value={form.badge}
              onChange={(event) => {
                resetError();
                handleChange("badge", event.target.value);
              }}
              placeholder="BEST"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>가격</span>
            <input
              className={styles.input}
              type="number"
              min="0"
              value={form.price}
              disabled={form.type === "free"}
              onChange={(event) => {
                resetError();
                handleChange("price", event.target.value);
              }}
              placeholder="2900"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>세트 가격</span>
            <input
              className={styles.input}
              type="number"
              min="0"
              value={form.setPrice}
              disabled={form.type === "free"}
              onChange={(event) => {
                resetError();
                handleChange("setPrice", event.target.value);
              }}
              placeholder="7500"
            />
          </label>

          <div className={styles.field}>
            <span className={styles.label}>플랫폼</span>

            <div
              className={styles.toggleRow}
              role="group"
              aria-label="플랫폼 선택"
            >
              {platformOptions.map((platform) => {
                const isActive = form.platforms.includes(platform.value);

                return (
                  <button
                    key={platform.value}
                    type="button"
                    className={`${styles.toggleButton} ${
                      isActive ? styles.toggleButtonActive : ""
                    }`}
                    aria-pressed={isActive}
                    onClick={() => {
                      resetError();
                      handlePlatformToggle(platform.value);
                    }}
                  >
                    {platform.label}
                  </button>
                );
              })}
            </div>

            <span className={styles.hint}>하나 이상 선택해 주세요.</span>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>공개 상태</span>
            <CustomDropdown
              value={form.isPublished ? "published" : "private"}
              options={publishStatusOptions}
              placeholder="공개 상태 선택"
              variant="form"
              onChange={(value) => {
                resetError();
                handleChange("isPublished", value === "published");
              }}
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>DISPLAY</p>
          <h3 className={styles.sectionTitle}>노출 정보</h3>
        </div>

        <div className={styles.column}>
          <div className={styles.field}>
            <span className={styles.label}>썸네일</span>

            <div className={styles.thumbnailUploadRow}>
              <input
                ref={thumbnailInputRef}
                className={styles.hiddenFileInput}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleThumbnailUpload}
              />

              <button
                type="button"
                className={styles.uploadButton}
                onClick={() => thumbnailInputRef.current?.click()}
                disabled={isUploadingThumbnail}
              >
                {isUploadingThumbnail ? "업로드 중..." : "이미지 업로드"}
              </button>
            </div>

            <input
              className={styles.input}
              type="text"
              value={form.thumbnail}
              onChange={(event) => {
                resetError();
                handleChange("thumbnail", event.target.value);
              }}
              placeholder="업로드 후 URL이 자동 입력돼요."
            />

            {form.thumbnail ? (
              <div className={styles.thumbnailPreviewBox}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.thumbnail}
                  alt="썸네일 미리보기"
                  className={styles.thumbnailPreview}
                />
              </div>
            ) : null}

            <span className={styles.hint}>PNG, JPG, WEBP, GIF / 5MB 이하</span>
          </div>

          <div className={styles.field}>
            <span className={styles.label}>미리보기 이미지</span>

            <div className={styles.thumbnailUploadRow}>
              <input
                ref={previewInputRef}
                className={styles.hiddenFileInput}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handlePreviewImagesUpload}
              />

              <button
                type="button"
                className={styles.uploadButton}
                onClick={() => previewInputRef.current?.click()}
                disabled={isUploadingPreviewImages}
              >
                {isUploadingPreviewImages
                  ? "업로드 중..."
                  : "미리보기 이미지 추가"}
              </button>
            </div>

            <textarea
              className={styles.textarea}
              value={form.previewImages}
              onChange={(event) => {
                resetError();
                handleChange("previewImages", event.target.value);
              }}
              placeholder={`/images/themes/sample-theme/preview-1.png\n/images/themes/sample-theme/preview-2.png`}
            />

            {previewImageList.length > 0 ? (
              <div className={styles.previewGrid}>
                {previewImageList.map((imageUrl, index) => (
                  <div
                    key={`${imageUrl}-${index}`}
                    className={styles.previewCard}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={`미리보기 이미지 ${index + 1}`}
                      className={styles.previewImage}
                    />
                  </div>
                ))}
              </div>
            ) : null}

            <span className={styles.hint}>
              여러 장 선택 가능 / 한 줄에 하나씩 저장돼요.
            </span>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>태그</span>
            <input
              className={styles.input}
              type="text"
              value={form.tags}
              onChange={(event) => {
                resetError();
                handleChange("tags", event.target.value);
              }}
              placeholder="핑크, 리본, 러블리"
            />
            <span className={styles.hint}>쉼표(,)로 구분</span>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>상세 HTML</span>
            <textarea
              className={`${styles.textarea} ${styles.largeTextarea}`}
              value={form.detailHtml}
              onChange={(event) => {
                resetError();
                handleChange("detailHtml", event.target.value);
              }}
              placeholder="<p>테마 소개를 입력해 주세요.</p>"
            />
          </label>
        </div>
      </section>

      {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}

      <div className={styles.actions}>
        <Link href="/admin/themes" className={styles.secondaryButton}>
          목록으로
        </Link>

        <button
          type="submit"
          className={styles.primaryButton}
          disabled={
            isSubmitting || isUploadingThumbnail || isUploadingPreviewImages
          }
        >
          {isSubmitting ? "등록 중..." : "테마 등록"}
        </button>
      </div>
    </form>
  );
}
