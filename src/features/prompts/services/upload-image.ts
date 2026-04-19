import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const uploadImage = async (file: File) => {
  const rawExt = file.name.split(".").pop()?.toLowerCase();
  const ext =
    rawExt ||
    (file.type === "image/png"
      ? "png"
      : file.type === "image/jpeg"
        ? "jpg"
        : file.type === "image/webp"
          ? "webp"
          : "");

  if (!ext) {
    throw new Error("유효한 이미지 파일 확장자를 확인할 수 없어요.");
  }

  // crop 단계에서 이미 uuid.webp 같은 파일명으로 만들어주기 때문에 기본은 그걸 유지합니다.
  const fileName =
    file.name && file.name.includes(".")
      ? file.name
      : `${crypto.randomUUID()}.${ext}`;

  const filePath = `private/${fileName}`;

  const { error } = await supabase.storage
    .from("prompt-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  // DB에는 전체 URL이 아니라 파일 키(예: uuid.webp)만 저장합니다.
  return fileName;
};

