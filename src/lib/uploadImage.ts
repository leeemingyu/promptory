import { supabase } from "./supabase";

export const uploadImage = async (file: File) => {
  const fileName = `${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from("prompt-images")
    .upload(fileName, file);

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("prompt-images").getPublicUrl(fileName);

  return publicUrl;
};
