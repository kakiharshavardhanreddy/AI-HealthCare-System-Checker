"use client";

import { create } from "zustand";

type UiState = {
  sidebarOpen: boolean;
  emergency: { condition: string; message: string } | null;
  setSidebarOpen: (open: boolean) => void;
  showEmergency: (condition: string, message: string) => void;
  clearEmergency: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  emergency: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  showEmergency: (condition, message) => set({ emergency: { condition, message } }),
  clearEmergency: () => set({ emergency: null })
}));
