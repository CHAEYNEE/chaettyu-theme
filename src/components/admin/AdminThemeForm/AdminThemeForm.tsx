"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

import CustomDropdown, {
  type DropdownOption,
} from "@/components/common/CustomDropdown/CustomDropdown";
import type {
  PurchaseMode,
  ThemePlatform,
  ThemeType,
  ThemeVersion,
} from "@/types/theme";

import styles from "./AdminThemeForm.module.css";

type AdminDownloadFileInput = {
  platform: ThemePlatform;
  purchaseMode: PurchaseMode;
  versionValue?: string;
  fileName: string;
  storageBucket: string;
  storagePath: string;
};

export type AdminThemeFormMode = "create" | "edit";

export type AdminThemeFormInitialValues = {
  id: string;
  title: string;
  type: ThemeType;
  price: number;
  setPrice?: number | null;
  thumbnail: string;
  previewImages: string[];
  tags: string[];
  badge?: string | null;
  detailHtml: string;
  platforms: ThemePlatform[];
  isPublished: boolean;
  versions: ThemeVersion[];
  downloadFiles: AdminDownloadFileInput[];
};

type AdminThemeFormProps = {
  mode?: AdminThemeFormMode;
  initialValues?: AdminThemeFormInitialValues;
};

type VersionFormItem = ThemeVersion & {
  formId: string;
};

type DownloadFileFormItem = AdminDownloadFileInput & {
  formId: string;
};

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
  versions: VersionFormItem[];
  downloadFiles: DownloadFileFormItem[];
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

const purchaseModeOptions: DropdownOption[] = [
  { label: "개별", value: "single" },
  { label: "세트", value: "set" },
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

function createFormId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createVersionFormItem(
  version?: Partial<ThemeVersion>,
): VersionFormItem {
  return {
    formId: createFormId("version"),
    label: version?.label ?? "",
    value: version?.value ?? "",
  };
}

function createDownloadFileFormItem(
  downloadFile?: Partial<AdminDownloadFileInput>,
): DownloadFileFormItem {
  return {
    formId: createFormId("download"),
    platform: downloadFile?.platform ?? "ios",
    purchaseMode: downloadFile?.purchaseMode ?? "single",
    versionValue: downloadFile?.versionValue ?? "",
    fileName: downloadFile?.fileName ?? "",
    storageBucket: downloadFile?.storageBucket ?? "",
    storagePath: downloadFile?.storagePath ?? "",
  };
}

function getSanitizedVersions(versions: VersionFormItem[]): ThemeVersion[] {
  return versions
    .map((version) => ({
      label: version.label.trim(),
      value: version.value.trim(),
    }))
    .filter((version) => version.label || version.value);
}

function hasDuplicateVersionValues(versions: ThemeVersion[]) {
  const values = versions.map((version) => version.value).filter(Boolean);

  return new Set(values).size !== values.length;
}

function getSanitizedDownloadFiles(
  downloadFiles: DownloadFileFormItem[],
): AdminDownloadFileInput[] {
  return downloadFiles
    .map((downloadFile) => ({
      platform: downloadFile.platform,
      purchaseMode: downloadFile.purchaseMode,
      versionValue:
        downloadFile.purchaseMode === "single"
          ? downloadFile.versionValue?.trim()
          : undefined,
      fileName: downloadFile.fileName.trim(),
      storageBucket: downloadFile.storageBucket.trim(),
      storagePath: downloadFile.storagePath.trim(),
    }))
    .filter(
      (downloadFile) =>
        downloadFile.fileName ||
        downloadFile.storageBucket ||
        downloadFile.storagePath ||
        downloadFile.versionValue,
    );
}

function hasDuplicateDownloadFileKeys(downloadFiles: AdminDownloadFileInput[]) {
  const keys = downloadFiles.map((downloadFile) =>
    downloadFile.purchaseMode === "single"
      ? `${downloadFile.platform}:${downloadFile.purchaseMode}:${downloadFile.versionValue ?? ""}`
      : `${downloadFile.platform}:${downloadFile.purchaseMode}`,
  );

  return new Set(keys).size !== keys.length;
}

function createEmptyFormState(): FormState {
  return {
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
    versions: [],
    downloadFiles: [],
  };
}

function createInitialFormState(
  initialValues?: AdminThemeFormInitialValues,
): FormState {
  if (!initialValues) {
    return createEmptyFormState();
  }

  return {
    id: initialValues.id,
    title: initialValues.title,
    type: initialValues.type,
    price: String(
      initialValues.type === "free" ? 0 : (initialValues.price ?? 0),
    ),
    setPrice:
      typeof initialValues.setPrice === "number"
        ? String(initialValues.setPrice)
        : "",
    thumbnail: initialValues.thumbnail ?? "",
    previewImages: (initialValues.previewImages ?? []).join("\n"),
    tags: (initialValues.tags ?? []).join(", "),
    badge: initialValues.badge ?? "",
    detailHtml: initialValues.detailHtml ?? "",
    platforms:
      initialValues.platforms.length > 0 ? initialValues.platforms : ["ios"],
    isPublished: initialValues.isPublished,
    versions: (initialValues.versions ?? []).map((version) =>
      createVersionFormItem(version),
    ),
    downloadFiles: (initialValues.downloadFiles ?? []).map((downloadFile) =>
      createDownloadFileFormItem(downloadFile),
    ),
  };
}

export default function AdminThemeForm({
  mode = "create",
  initialValues,
}: AdminThemeFormProps) {
  const router = useRouter();
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const previewInputRef = useRef<HTMLInputElement>(null);
  const downloadFileInputRefs = useRef<Record<string, HTMLInputElement | null>>(
    {},
  );

  const isEditMode = mode === "edit";

  const [form, setForm] = useState<FormState>(() =>
    createInitialFormState(initialValues),
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isUploadingPreviewImages, setIsUploadingPreviewImages] =
    useState(false);
  const [uploadingDownloadFileId, setUploadingDownloadFileId] = useState<
    string | null
  >(null);

  useEffect(() => {
    setForm(createInitialFormState(initialValues));
  }, [initialValues]);

  const previewImageList = useMemo(
    () => splitByLine(form.previewImages),
    [form.previewImages],
  );

  const versionDropdownOptions = useMemo<DropdownOption[]>(
    () =>
      getSanitizedVersions(form.versions)
        .filter((version) => version.value)
        .map((version) => ({
          label: version.label || version.value,
          value: version.value,
        })),
    [form.versions],
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

  function handleVersionChange(
    formId: string,
    key: keyof ThemeVersion,
    value: string,
  ) {
    setForm((prev) => ({
      ...prev,
      versions: prev.versions.map((version) =>
        version.formId === formId ? { ...version, [key]: value } : version,
      ),
    }));
  }

  function handleAddVersion() {
    setForm((prev) => ({
      ...prev,
      versions: [...prev.versions, createVersionFormItem()],
    }));
  }

  function handleRemoveVersion(formId: string) {
    setForm((prev) => ({
      ...prev,
      versions: prev.versions.filter((version) => version.formId !== formId),
      downloadFiles: prev.downloadFiles.map((downloadFile) => {
        const removedVersion = prev.versions.find(
          (version) => version.formId === formId,
        );

        if (
          removedVersion &&
          downloadFile.purchaseMode === "single" &&
          downloadFile.versionValue === removedVersion.value
        ) {
          return {
            ...downloadFile,
            versionValue: "",
          };
        }

        return downloadFile;
      }),
    }));
  }

  function handleAddDownloadFile() {
    setForm((prev) => ({
      ...prev,
      downloadFiles: [...prev.downloadFiles, createDownloadFileFormItem()],
    }));
  }

  function handleRemoveDownloadFile(formId: string) {
    setForm((prev) => ({
      ...prev,
      downloadFiles: prev.downloadFiles.filter(
        (downloadFile) => downloadFile.formId !== formId,
      ),
    }));

    delete downloadFileInputRefs.current[formId];
  }

  function handleDownloadFileChange<K extends keyof AdminDownloadFileInput>(
    formId: string,
    key: K,
    value: AdminDownloadFileInput[K],
  ) {
    setForm((prev) => ({
      ...prev,
      downloadFiles: prev.downloadFiles.map((downloadFile) =>
        downloadFile.formId === formId
          ? { ...downloadFile, [key]: value }
          : downloadFile,
      ),
    }));
  }

  function handleDownloadFilePurchaseModeChange(
    formId: string,
    purchaseMode: PurchaseMode,
  ) {
    setForm((prev) => ({
      ...prev,
      downloadFiles: prev.downloadFiles.map((downloadFile) =>
        downloadFile.formId === formId
          ? {
              ...downloadFile,
              purchaseMode,
              versionValue: purchaseMode === "single" ? "" : "",
            }
          : downloadFile,
      ),
    }));
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

  async function handleDownloadFileUpload(
    formId: string,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    resetError();

    const normalizedThemeId = normalizeId(form.id);

    if (!normalizedThemeId) {
      setErrorMessage(
        "다운로드 파일 업로드 전에 테마 ID를 먼저 입력해 주세요.",
      );
      event.target.value = "";
      return;
    }

    const targetDownloadFile = form.downloadFiles.find(
      (downloadFile) => downloadFile.formId === formId,
    );

    if (!targetDownloadFile) {
      event.target.value = "";
      return;
    }

    if (
      targetDownloadFile.purchaseMode === "single" &&
      !targetDownloadFile.versionValue?.trim()
    ) {
      setErrorMessage("개별 파일은 연결할 버전을 먼저 선택해 주세요.");
      event.target.value = "";
      return;
    }

    setUploadingDownloadFileId(formId);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("themeId", normalizedThemeId);
      formData.append("platform", targetDownloadFile.platform);
      formData.append("purchaseMode", targetDownloadFile.purchaseMode);

      if (
        targetDownloadFile.purchaseMode === "single" &&
        targetDownloadFile.versionValue
      ) {
        formData.append("versionValue", targetDownloadFile.versionValue);
      }

      const response = await fetch("/api/admin/upload-download-file", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as {
        fileName?: string;
        storageBucket?: string;
        storagePath?: string;
        error?: string;
      };

      if (
        !response.ok ||
        !result.fileName ||
        !result.storageBucket ||
        !result.storagePath
      ) {
        throw new Error(result.error || "다운로드 파일 업로드에 실패했어요.");
      }

      setForm((prev) => ({
        ...prev,
        downloadFiles: prev.downloadFiles.map((downloadFile) =>
          downloadFile.formId === formId
            ? {
                ...downloadFile,
                fileName: result.fileName ?? "",
                storageBucket: result.storageBucket ?? "",
                storagePath: result.storagePath ?? "",
              }
            : downloadFile,
        ),
      }));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "다운로드 파일 업로드 중 문제가 생겼어요.";

      setErrorMessage(message);
    } finally {
      setUploadingDownloadFileId(null);

      if (downloadFileInputRefs.current[formId]) {
        downloadFileInputRefs.current[formId]!.value = "";
      }
    }
  }

  function buildRequestBody() {
    const normalizedId = normalizeId(form.id);

    return {
      id: normalizedId,
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
      versions: getSanitizedVersions(form.versions),
      downloadFiles: getSanitizedDownloadFiles(form.downloadFiles),
    };
  }

  function validateForm() {
    const normalizedId = normalizeId(form.id);
    const sanitizedVersions = getSanitizedVersions(form.versions);
    const sanitizedDownloadFiles = getSanitizedDownloadFiles(
      form.downloadFiles,
    );
    const versionValueSet = new Set(
      sanitizedVersions.map((version) => version.value),
    );

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

    if (
      sanitizedVersions.some(
        (version) => !version.label.trim() || !version.value.trim(),
      )
    ) {
      return "버전명과 버전 값은 함께 입력해 주세요.";
    }

    if (hasDuplicateVersionValues(sanitizedVersions)) {
      return "버전 값은 중복될 수 없어요.";
    }

    if (
      sanitizedDownloadFiles.some(
        (downloadFile) =>
          !downloadFile.fileName ||
          !downloadFile.storageBucket ||
          !downloadFile.storagePath,
      )
    ) {
      return "다운로드 파일은 업로드까지 완료해 주세요.";
    }

    if (
      sanitizedDownloadFiles.some(
        (downloadFile) =>
          downloadFile.purchaseMode === "single" && !downloadFile.versionValue,
      )
    ) {
      return "개별 다운로드 파일은 연결할 버전을 선택해 주세요.";
    }

    if (
      sanitizedDownloadFiles.some(
        (downloadFile) =>
          downloadFile.purchaseMode === "single" &&
          downloadFile.versionValue &&
          !versionValueSet.has(downloadFile.versionValue),
      )
    ) {
      return "등록된 버전 값만 다운로드 파일에 연결할 수 있어요.";
    }

    if (hasDuplicateDownloadFileKeys(sanitizedDownloadFiles)) {
      return "같은 플랫폼/구매 방식 조합의 다운로드 파일이 중복되었어요.";
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

    const requestBody = buildRequestBody();
    const endpoint = isEditMode
      ? `/api/admin/themes/${requestBody.id}`
      : "/api/admin/themes";
    const method = isEditMode ? "PATCH" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const result = (await response.json()) as {
        message?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          result.error ||
            (isEditMode
              ? "테마 수정에 실패했어요."
              : "테마 등록에 실패했어요."),
        );
      }

      window.alert(
        result.message ||
          (isEditMode ? "테마가 수정되었어요!" : "새 테마가 등록되었어요!"),
      );

      router.replace("/admin/themes");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : isEditMode
            ? "테마 수정 중 문제가 생겼어요."
            : "테마 등록 중 문제가 생겼어요.";

      setErrorMessage(message);
      setIsSubmitting(false);
    }
  }

  const submitText = isSubmitting
    ? isEditMode
      ? "수정 중..."
      : "등록 중..."
    : isEditMode
      ? "수정 저장"
      : "테마 등록";

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
              disabled={isEditMode}
              onChange={(event) => {
                resetError();
                handleChange("id", normalizeId(event.target.value));
              }}
              placeholder="milk-heart"
            />
            <span className={styles.hint}>
              {isEditMode
                ? "수정 화면에서는 ID를 변경할 수 없어요."
                : "영문 소문자, 숫자, 하이픈(-)만 사용"}
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
                  price: nextType === "free" ? "0" : prev.price || "0",
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
          <p className={styles.sectionEyebrow}>VERSIONS</p>
          <h3 className={styles.sectionTitle}>버전 정보</h3>
        </div>

        <div className={styles.column}>
          <div className={styles.versionHeaderRow}>
            <div>
              <span className={styles.label}>버전 목록</span>
            </div>

            <button
              type="button"
              className={styles.uploadButton}
              onClick={() => {
                resetError();
                handleAddVersion();
              }}
            >
              + 버전 추가
            </button>
          </div>

          {form.versions.length === 0 ? (
            <p className={styles.hint}>
              아직 등록된 버전이 없어요. 필요할 때만 추가해 주세요.
            </p>
          ) : (
            <div className={styles.versionList}>
              {form.versions.map((version) => (
                <div key={version.formId} className={styles.versionCard}>
                  <div className={styles.versionRowGrid}>
                    <label className={styles.field}>
                      <span className={styles.label}>버전명</span>
                      <input
                        className={styles.input}
                        type="text"
                        value={version.label}
                        onChange={(event) => {
                          resetError();
                          handleVersionChange(
                            version.formId,
                            "label",
                            event.target.value,
                          );
                        }}
                        placeholder="기본 버전"
                      />
                    </label>

                    <label className={styles.field}>
                      <span className={styles.label}>버전 값</span>
                      <input
                        className={styles.input}
                        type="text"
                        value={version.value}
                        onChange={(event) => {
                          resetError();
                          handleVersionChange(
                            version.formId,
                            "value",
                            event.target.value,
                          );
                        }}
                        placeholder="basic"
                      />
                    </label>
                  </div>

                  <div className={styles.versionActions}>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => {
                        resetError();
                        handleRemoveVersion(version.formId);
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>DOWNLOAD FILES</p>
          <h3 className={styles.sectionTitle}>다운로드 파일</h3>
        </div>

        <div className={styles.column}>
          <div className={styles.versionHeaderRow}>
            <div>
              <span className={styles.label}>파일 목록</span>
            </div>

            <button
              type="button"
              className={styles.uploadButton}
              onClick={() => {
                resetError();
                handleAddDownloadFile();
              }}
            >
              + 파일 추가
            </button>
          </div>

          {form.downloadFiles.length === 0 ? (
            <p className={styles.hint}>
              아직 등록된 다운로드 파일이 없어요. 배포할 파일을 추가해 주세요.
            </p>
          ) : (
            <div className={styles.downloadFileList}>
              {form.downloadFiles.map((downloadFile) => {
                const isSingle = downloadFile.purchaseMode === "single";
                const isUploading =
                  uploadingDownloadFileId === downloadFile.formId;

                return (
                  <div
                    key={downloadFile.formId}
                    className={styles.downloadFileCard}
                  >
                    <div className={styles.downloadFileGrid}>
                      <div className={styles.field}>
                        <span className={styles.label}>플랫폼</span>
                        <CustomDropdown
                          value={downloadFile.platform}
                          options={platformOptions.map((option) => ({
                            label: option.label,
                            value: option.value,
                          }))}
                          placeholder="플랫폼 선택"
                          variant="form"
                          onChange={(value) => {
                            resetError();
                            handleDownloadFileChange(
                              downloadFile.formId,
                              "platform",
                              value as ThemePlatform,
                            );
                          }}
                        />
                      </div>

                      <div className={styles.field}>
                        <span className={styles.label}>구매 방식</span>
                        <CustomDropdown
                          value={downloadFile.purchaseMode}
                          options={purchaseModeOptions}
                          placeholder="구매 방식 선택"
                          variant="form"
                          onChange={(value) => {
                            resetError();
                            handleDownloadFilePurchaseModeChange(
                              downloadFile.formId,
                              value as PurchaseMode,
                            );
                          }}
                        />
                      </div>

                      <div className={styles.field}>
                        <span className={styles.label}>연결 버전</span>

                        {isSingle ? (
                          <CustomDropdown
                            value={downloadFile.versionValue ?? ""}
                            options={versionDropdownOptions}
                            placeholder={
                              versionDropdownOptions.length > 0
                                ? "버전 선택"
                                : "먼저 버전을 추가해 주세요"
                            }
                            variant="form"
                            onChange={(value) => {
                              resetError();
                              handleDownloadFileChange(
                                downloadFile.formId,
                                "versionValue",
                                value,
                              );
                            }}
                          />
                        ) : (
                          <input
                            className={styles.input}
                            type="text"
                            value="세트 파일은 버전 연결이 필요 없어요"
                            disabled
                          />
                        )}
                      </div>

                      <div className={styles.field}>
                        <span className={styles.label}>파일 업로드</span>

                        <div className={styles.thumbnailUploadRow}>
                          <input
                            ref={(node) => {
                              downloadFileInputRefs.current[
                                downloadFile.formId
                              ] = node;
                            }}
                            className={styles.hiddenFileInput}
                            type="file"
                            onChange={(event) =>
                              handleDownloadFileUpload(
                                downloadFile.formId,
                                event,
                              )
                            }
                          />

                          <button
                            type="button"
                            className={styles.uploadButton}
                            disabled={isUploading}
                            onClick={() =>
                              downloadFileInputRefs.current[
                                downloadFile.formId
                              ]?.click()
                            }
                          >
                            {isUploading ? "업로드 중..." : "파일 업로드"}
                          </button>
                        </div>
                      </div>

                      <div
                        className={`${styles.field} ${styles.downloadFileFull}`}
                      >
                        <span className={styles.label}>저장 정보</span>

                        <div className={styles.fileInfoBox}>
                          <p className={styles.fileInfoText}>
                            파일명: {downloadFile.fileName || "-"}
                          </p>
                          <p className={styles.fileInfoText}>
                            버킷: {downloadFile.storageBucket || "-"}
                          </p>
                          <p className={styles.fileInfoText}>
                            경로: {downloadFile.storagePath || "-"}
                          </p>
                        </div>

                        <span className={styles.hint}>
                          개별 파일은 버전을 고른 뒤 업로드해 주세요.
                        </span>
                      </div>
                    </div>

                    <div className={styles.versionActions}>
                      <button
                        type="button"
                        className={styles.secondaryButton}
                        onClick={() => {
                          resetError();
                          handleRemoveDownloadFile(downloadFile.formId);
                        }}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
            isSubmitting ||
            isUploadingThumbnail ||
            isUploadingPreviewImages ||
            Boolean(uploadingDownloadFileId)
          }
        >
          {submitText}
        </button>
      </div>
    </form>
  );
}
