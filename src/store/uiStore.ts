import { create } from 'zustand';

export type DockPosition = "top" | "right" | "bottom";

interface UIState {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  dockPos: DockPosition;
  cycleDockPos: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarCollapsed: true,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  dockPos: "top",
  cycleDockPos: () => set((state) => ({
    dockPos: state.dockPos === "top" ? "right" : state.dockPos === "right" ? "bottom" : "top"
  }))
}));
