import { supabase } from "./supabase";

export const uploadImage = async (file: File) => {
  const fileExt = file.name.split(".").pop(); // jpg, png
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
