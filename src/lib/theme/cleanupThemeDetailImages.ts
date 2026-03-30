import { createSupabaseAdmin } from "@/lib/supabase/admin";

const DETAIL_IMAGE_BUCKET = "theme-detail-images";
const PUBLIC_URL_PATH_SEGMENT = `/storage/v1/object/public/${DETAIL_IMAGE_BUCKET}/`;

function extractReferencedStoragePaths(params: {
  themeId: string;
  detailHtml: string;
}) {
  const themeFolder = `themes/${params.themeId}/`;
  const paths = new Set<string>();

  const imageSrcRegex = /<img\b[^>]*?\bsrc=["']([^"']+)["'][^>]*>/gi;

  for (const match of params.detailHtml.matchAll(imageSrcRegex)) {
    const src = match[1];

    if (!src) {
      continue;
    }

    try {
      const url = new URL(src);
      const decodedPathname = decodeURIComponent(url.pathname);
      const segmentIndex = decodedPathname.indexOf(PUBLIC_URL_PATH_SEGMENT);

      if (segmentIndex < 0) {
        continue;
      }

      const storagePath = decodedPathname.slice(
        segmentIndex + PUBLIC_URL_PATH_SEGMENT.length,
      );

      if (!storagePath.startsWith(themeFolder)) {
        continue;
      }

      paths.add(storagePath);
    } catch {
      // public URL 형식이 아니면 무시
    }
  }

  return paths;
}

async function listAllThemeImagePaths(themeId: string) {
  const supabase = createSupabaseAdmin();
  const folder = `themes/${themeId}`;
  const paths: string[] = [];
  const limit = 100;

  for (let offset = 0; ; offset += limit) {
    const { data, error } = await supabase.storage
      .from(DETAIL_IMAGE_BUCKET)
      .list(folder, {
        limit,
        offset,
        sortBy: { column: "name", order: "asc" },
      });

    if (error) {
      throw new Error(error.message || "상세 이미지 목록 조회에 실패했어요.");
    }

    if (!data || data.length === 0) {
      break;
    }

    for (const item of data) {
      if (!item.name) {
        continue;
      }

      paths.push(`${folder}/${item.name}`);
    }

    if (data.length < limit) {
      break;
    }
  }

  return paths;
}

export async function cleanupThemeDetailImages(params: {
  themeId: string;
  detailHtml: string;
}) {
  const supabase = createSupabaseAdmin();

  const referencedPaths = extractReferencedStoragePaths(params);
  const listedPaths = await listAllThemeImagePaths(params.themeId);

  const stalePaths = listedPaths.filter((path) => !referencedPaths.has(path));

  if (stalePaths.length === 0) {
    return {
      deletedCount: 0,
      deletedPaths: [] as string[],
    };
  }

  const { error } = await supabase.storage
    .from(DETAIL_IMAGE_BUCKET)
    .remove(stalePaths);

  if (error) {
    throw new Error(
      error.message || "사용하지 않는 상세 이미지 삭제에 실패했어요.",
    );
  }

  return {
    deletedCount: stalePaths.length,
    deletedPaths: stalePaths,
  };
}
