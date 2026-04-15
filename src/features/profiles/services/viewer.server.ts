import "server-only";

import { cache } from "react";
import { getCurrentUserId } from "@/features/prompts/services/prompts.server";

export const getViewerUserId = cache(async (): Promise<string | null> => {
  return getCurrentUserId();
});

