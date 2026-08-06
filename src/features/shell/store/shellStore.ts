import { create } from "zustand";

export interface Project {
  id: string;
  name: string;
  path: string;
}

export type GradientPreset = "aurora" | "cyberpunk" | "deepvoid" | "neonmesh";
export type ThemePreset = "y2k" | "cyber";

export interface ShellState {
  // Theme & Background Customization
  activeTheme: ThemePreset;
  activeGradient: GradientPreset;

  // Navigation & Scope
  activeProject: Project | null;
  projects: Project[];
  activeScopePath: string;
  activeCloudProfile: string;
  cloudProfiles: string[];
  activeGlobalTool: "git" | "cloud" | "settings";
  
  // Workspace Tabs
  activeTab: "overview" | "cloud" | "containers" | "git";

  // Terminal & Logs
  terminalCwd: string;
  isTerminalOpen: boolean;
  terminalLogs: string[];

  // Actions
  setActiveTheme: (theme: ThemePreset) => void;
  setActiveGradient: (gradient: GradientPreset) => void;
  setActiveProject: (project: Project) => void;
  setActiveScopePath: (path: string) => void;
  setActiveCloudProfile: (profile: string) => void;
  setActiveGlobalTool: (tool: "git" | "cloud" | "settings") => void;
  setActiveTab: (tab: "overview" | "cloud" | "containers" | "git") => void;
  setTerminalCwd: (cwd: string) => void;
  toggleTerminal: () => void;
  addLog: (log: string) => void;
  clearLogs: () => void;
}

const DEFAULT_PROJECTS: Project[] = [
  { id: "p1", name: "Portside Core", path: "/home/ahmedtrooper/ProgrammingFiles/Professional/DevOpsEasy" },
  { id: "p2", name: "Microservices Suite", path: "/home/ahmedtrooper/Projects/microservices" },
];

export const useShellStore = create<ShellState>((set, get) => ({
  activeTheme: "y2k",
  activeGradient: "aurora",

  activeProject: DEFAULT_PROJECTS[0],
  projects: DEFAULT_PROJECTS,
  activeScopePath: "/services/api",
  activeCloudProfile: "AWS (us-east-1)",
  cloudProfiles: ["AWS (us-east-1)", "GCP (asia-east1)", "Azure (eastus)"],
  activeGlobalTool: "git",
  activeTab: "containers",

  terminalCwd: DEFAULT_PROJECTS[0].path + "/services/api",
  isTerminalOpen: true,
  terminalLogs: [
    "[SYSTEM] Shell initialized with Gradient Backgrounds & Custom Theme support",
    "[AUTO-CD] Working directory synced to /services/api",
    "[DOCKER] Daemon connected via local Unix socket",
  ],

  setActiveTheme: (theme) => {
    set({ activeTheme: theme });
    get().addLog(`[THEME] Switched Astryx theme to ${theme}`);
  },

  setActiveGradient: (gradient) => {
    set({ activeGradient: gradient });
    get().addLog(`[THEME] Applied background gradient preset: ${gradient}`);
  },

  setActiveProject: (project) => {
    set({
      activeProject: project,
      terminalCwd: project.path,
    });
    get().addLog(`[PROJECT] Switched active project to ${project.name}`);
  },

  setActiveScopePath: (path) => {
    const activeProject = get().activeProject;
    const fullPath = (activeProject ? activeProject.path : "") + path;
    set({
      activeScopePath: path,
      terminalCwd: fullPath,
    });
    get().addLog(`[AUTO-CD] Changed execution scope to ${path}`);
  },

  setActiveCloudProfile: (profile) => {
    set({ activeCloudProfile: profile });
    get().addLog(`[CLOUD] Active profile switched to ${profile}`);
  },

  setActiveGlobalTool: (tool) => set({ activeGlobalTool: tool }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setTerminalCwd: (cwd) => set({ terminalCwd: cwd }),
  toggleTerminal: () => set((state) => ({ isTerminalOpen: !state.isTerminalOpen })),

  addLog: (log) =>
    set((state) => ({
      terminalLogs: [...state.terminalLogs.slice(-200), `[${new Date().toLocaleTimeString()}] ${log}`],
    })),
  clearLogs: () => set({ terminalLogs: [] }),
}));
