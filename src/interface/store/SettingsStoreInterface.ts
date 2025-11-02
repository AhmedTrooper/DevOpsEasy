export interface SettingsState {
  // Auto-refresh settings
  autoRefreshEnabled: boolean;
  autoRefreshInterval: number; // in seconds
  
  // UI preferences
  defaultView: string;
  compactMode: boolean;
  
  // Actions
  setAutoRefreshEnabled: (enabled: boolean) => void;
  setAutoRefreshInterval: (interval: number) => void;
  setDefaultView: (view: string) => void;
  setCompactMode: (enabled: boolean) => void;
  
  // Load and save to localStorage
  loadSettings: () => void;
  saveSettings: () => void;
  resetSettings: () => void;
}
