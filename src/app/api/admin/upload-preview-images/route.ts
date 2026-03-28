import { NextResponse } from "next/server";

import { createSupabaseAdmin } from "@/lib/supabase/admin";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];

function sanitizeFileName(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "png";
  const baseName = fileName.replace(/\.[^/.]+$/, "");

  const safeBaseName = baseName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${safeBaseName || "preview"}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${extension}`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData
      .getAll("files")
      .filter((item): item is File => item instanceof File);

    if (files.length === 0) {
      return NextResponse.json(
        { error: "업로드할 이미지가 없어요." },
        { status: 400 },
      );
    }

    const invalidTypeFile = files.find(
      (file) => !ALLOWED_IMAGE_TYPES.includes(file.type),
    );

    if (invalidTypeFile) {
      return NextResponse.json(
        { error: "PNG, JPG, WEBP, GIF 파일만 업로드할 수 있어요." },
        { status: 400 },
      );
    }

    const oversizedFile = files.find((file) => file.size > MAX_FILE_SIZE);

    if (oversizedFile) {
      return NextResponse.json(
        { error: "미리보기 이미지는 각 파일당 5MB 이하만 업로드할 수 있어요." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();

    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const fileName = sanitizeFileName(file.name);
        const filePath = `themes/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("theme-previews")
          .upload(filePath, file, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          throw new Error("미리보기 이미지 업로드에 실패했어요.");
        }

        const { data } = supabase.storage
          .from("theme-previews")
          .getPublicUrl(filePath);

        return {
          fileName: file.name,
          filePath,
          publicUrl: data.publicUrl,
        };
      }),
    );

    return NextResponse.json({
      files: uploadedFiles,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했어요.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
