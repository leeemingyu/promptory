import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const uploadImage = async (file: File) => {
  const fileExt = file.name.split(".").pop()?.toLowerCase();
  if (!fileExt) {
    throw new Error("유효한 파일 확장자가 없습니다.");
  }
  const fileName = `${crypto.randomUUID()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("prompt-images")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("prompt-images").getPublicUrl(fileName);

  return publicUrl;
};
