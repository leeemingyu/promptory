"use client";

import { create } from "zustand";

type PromptsNavigationSkeletonState = {
  isNavigating: boolean;
  start: () => void;
  stop: () => void;
};

export const usePromptsNavigationSkeleton = create<PromptsNavigationSkeletonState>(
  (set) => ({
    isNavigating: false,
    start: () => set({ isNavigating: true }),
    stop: () => set({ isNavigating: false }),
  }),
);

