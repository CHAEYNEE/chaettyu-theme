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

  return `${safeBaseName || "thumbnail"}-${Date.now()}.${extension}`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "업로드할 파일이 없어요." },
        { status: 400 },
      );
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "PNG, JPG, WEBP, GIF 파일만 업로드할 수 있어요." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "썸네일은 5MB 이하만 업로드할 수 있어요." },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdmin();
    const fileName = sanitizeFileName(file.name);
    const filePath = `themes/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("theme-thumbnails")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: "썸네일 업로드에 실패했어요." },
        { status: 500 },
      );
    }

    const { data } = supabase.storage
      .from("theme-thumbnails")
      .getPublicUrl(filePath);

    return NextResponse.json({
      filePath,
      publicUrl: data.publicUrl,
      fileName: file.name,
    });
  } catch {
    return NextResponse.json(
      { error: "알 수 없는 오류가 발생했어요." },
      { status: 500 },
    );
  }
}
