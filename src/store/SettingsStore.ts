import { create } from "zustand";
import { SettingsState } from "@/interface/store/SettingsStoreInterface";

const SETTINGS_STORAGE_KEY = "devopseasy-settings";

const DEFAULT_SETTINGS = {
  autoRefreshEnabled: false,
  autoRefreshInterval: 30, // 30 seconds
  defaultView: "/",
  compactMode: false,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...DEFAULT_SETTINGS,

  setAutoRefreshEnabled: (enabled) => {
    set({ autoRefreshEnabled: enabled });
    get().saveSettings();
  },

  setAutoRefreshInterval: (interval) => {
    set({ autoRefreshInterval: interval });
    get().saveSettings();
  },

  setDefaultView: (view) => {
    set({ defaultView: view });
    get().saveSettings();
  },

  setCompactMode: (enabled) => {
    set({ compactMode: enabled });
    get().saveSettings();
  },

  loadSettings: () => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        set({
          autoRefreshEnabled: settings.autoRefreshEnabled ?? DEFAULT_SETTINGS.autoRefreshEnabled,
          autoRefreshInterval: settings.autoRefreshInterval ?? DEFAULT_SETTINGS.autoRefreshInterval,
          defaultView: settings.defaultView ?? DEFAULT_SETTINGS.defaultView,
          compactMode: settings.compactMode ?? DEFAULT_SETTINGS.compactMode,
        });
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  },

  saveSettings: () => {
    try {
      const settings = {
        autoRefreshEnabled: get().autoRefreshEnabled,
        autoRefreshInterval: get().autoRefreshInterval,
        defaultView: get().defaultView,
        compactMode: get().compactMode,
      };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  },

  resetSettings: () => {
    set(DEFAULT_SETTINGS);
    localStorage.removeItem(SETTINGS_STORAGE_KEY);
  },
}));
