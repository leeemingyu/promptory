export type ProfileRow = {
  id: string;
  email: string | null;
  nickname: string | null;
  profile_image_url: string | null;
  last_nickname_updated_at?: string | null;
};
