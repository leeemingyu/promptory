"use client";

import { useEffect, useState } from "react";
import { authApiClient } from "@/lib/api.client";
import PromptActions from "@/app/prompts/[id]/PromptActions";

interface PromptActionsGateProps {
  promptId: string;
  owner: string;
}

export default function PromptActionsGate({
  promptId,
  owner,
}: PromptActionsGateProps) {
  const [canEdit, setCanEdit] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadAuth = async () => {
      try {
        const data = await authApiClient.me();
        const currentUsername =
          typeof data.user?.user_metadata?.username === "string"
            ? data.user.user_metadata.username
            : null;

        if (!isMounted) return;
        setCanEdit(Boolean(currentUsername && currentUsername === owner));
      } catch {
        if (!isMounted) return;
        setCanEdit(false);
      } finally {
        if (isMounted) setIsReady(true);
      }
    };

    void loadAuth();
    return () => {
      isMounted = false;
    };
  }, [owner]);

  if (!isReady || !canEdit) return null;

  return <PromptActions promptId={promptId} canEdit />;
}
