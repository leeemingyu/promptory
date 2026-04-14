import { createClient } from "@/lib/supabase/server";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://prompt-ory.vercel.app";
  const supabase = await createClient();

  const { data: prompts } = await supabase
    .from("prompts")
    .select("id, updated_at");

  const promptRoutes = (prompts || []).map((prompt) => ({
    url: `${baseUrl}/prompts/${prompt.id}`,
    lastModified: prompt.updated_at ? new Date(prompt.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const { data: users } = await supabase
    .from("profiles")
    .select("id, created_at");

  const userRoutes = (users || []).map((user) => ({
    url: `${baseUrl}/profiles/${user.id}`,
    lastModified: new Date(user.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.4,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/prompts`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/rankings`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    ...promptRoutes,
    ...userRoutes,
  ];
}
