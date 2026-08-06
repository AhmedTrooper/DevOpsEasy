import { useShellStore, GradientPreset, ThemePreset } from "../store/shellStore";
import { SideNav } from "@astryxdesign/core/SideNav";
import { SideNavSection } from "@astryxdesign/core/SideNav";
import { SideNavItem } from "@astryxdesign/core/SideNav";
import { SideNavHeading } from "@astryxdesign/core/SideNav";
import { StatusDot } from "@astryxdesign/core/StatusDot";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  Folder,
  FolderOpen,
  Cloud,
  Settings,
  GitBranch,
  ChevronDown,
  Layers,
  Palette,
  Sparkles,
  X,
  Minus,
  Maximize2,
} from "lucide-react";

const SAMPLE_DIR_TREE = [
  { name: "/ (Root)", path: "/" },
  { name: "/services/api", path: "/services/api" },
  { name: "/services/web", path: "/services/web" },
  { name: "/infra/terraform", path: "/infra/terraform" },
  { name: "/infra/k8s", path: "/infra/k8s" },
];

export function LeftSidebar() {
  const activeProject = useShellStore((state) => state.activeProject);
  const projects = useShellStore((state) => state.projects);
  const setActiveProject = useShellStore((state) => state.setActiveProject);

  const activeScopePath = useShellStore((state) => state.activeScopePath);
  const setActiveScopePath = useShellStore((state) => state.setActiveScopePath);

  const activeGlobalTool = useShellStore((state) => state.activeGlobalTool);
  const setActiveGlobalTool = useShellStore((state) => state.setActiveGlobalTool);

  const activeCloudProfile = useShellStore((state) => state.activeCloudProfile);

  const activeTheme = useShellStore((state) => state.activeTheme);
  const setActiveTheme = useShellStore((state) => state.setActiveTheme);
  const activeGradient = useShellStore((state) => state.activeGradient);
  const setActiveGradient = useShellStore((state) => state.setActiveGradient);

  // Tauri Window Control Actions
  const handleWindowClose = async () => {
    try {
      await getCurrentWindow().close();
    } catch (e) {
      console.log(e);
    }
  };

  const handleMinimize = async () => {
    try {
      await getCurrentWindow().minimize();
    } catch (e) {
      console.log(e);
    }
  };

  const handleMaximize = async () => {
    try {
      const isFull = await getCurrentWindow().isFullscreen();
      await getCurrentWindow().setFullscreen(!isFull);
    } catch (e) {
      console.log(e);
    }
  };

  const handleStartDragging = async () => {
    try {
      await getCurrentWindow().startDragging();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <SideNav
      resizable={{ defaultWidth: 260, minWidth: 220, maxWidth: 360, autoSaveId: "portside-sidenav" }}
      header={
        <div className="border-b border-zinc-200 dark:border-zinc-800">
          {/* Integrated Window Titlebar Window Controls & Drag Bar */}
          <div
            onMouseDown={handleStartDragging}
            className="px-3 py-2 bg-zinc-950/80 flex items-center justify-between cursor-grab active:cursor-grabbing border-b border-zinc-800/80 select-none"
          >
            <div className="flex items-center gap-2">
              <button
                onClick={handleWindowClose}
                className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-600 transition-colors flex items-center justify-center group"
                title="Close"
              >
                <X className="w-2 h-2 text-rose-950 opacity-0 group-hover:opacity-100" />
              </button>
              <button
                onClick={handleMinimize}
                className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-600 transition-colors flex items-center justify-center group"
                title="Minimize"
              >
                <Minus className="w-2 h-2 text-amber-950 opacity-0 group-hover:opacity-100" />
              </button>
              <button
                onClick={handleMaximize}
                className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-600 transition-colors flex items-center justify-center group"
                title="Maximize"
              >
                <Maximize2 className="w-2 h-2 text-emerald-950 opacity-0 group-hover:opacity-100" />
              </button>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 tracking-wider uppercase font-semibold">
              PORTSIDE IDE
            </span>
          </div>

          {/* Product Heading & Core Project Scope Shifter */}
          <div className="p-3">
            <SideNavHeading
              heading="PORTSIDE"
              superheading="DEVELOPER CONTROL PLANE"
              icon={<Layers className="w-5 h-5 text-indigo-500" />}
            />
            {/* Top Section: Project Switcher */}
            <div className="mt-3">
              <label className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase block mb-1">
                Active Project Scope Shifter
              </label>
              <div className="relative">
                <select
                  value={activeProject?.id || ""}
                  onChange={(e) => {
                    const proj = projects.find((p) => p.id === e.target.value);
                    if (proj) setActiveProject(proj);
                  }}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs rounded p-2 pr-7 font-mono appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      }
      footer={
        /* Bottom Section: Global Tools Tabs */
        <div className="p-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase px-2 py-1">
            Global Utilities
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => setActiveGlobalTool("git")}
              className={`p-2 rounded text-xs flex flex-col items-center gap-1 transition-colors ${
                activeGlobalTool === "git"
                  ? "bg-indigo-600 text-white font-semibold"
                  : "hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <GitBranch className="w-4 h-4" />
              <span>Git</span>
            </button>
            <button
              onClick={() => setActiveGlobalTool("cloud")}
              className={`p-2 rounded text-xs flex flex-col items-center gap-1 transition-colors ${
                activeGlobalTool === "cloud"
                  ? "bg-indigo-600 text-white font-semibold"
                  : "hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <Cloud className="w-4 h-4" />
              <span>Cloud</span>
            </button>
            <button
              onClick={() => setActiveGlobalTool("settings")}
              className={`p-2 rounded text-xs flex flex-col items-center gap-1 transition-colors ${
                activeGlobalTool === "settings"
                  ? "bg-indigo-600 text-white font-semibold"
                  : "hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Config</span>
            </button>
          </div>
        </div>
      }
    >
      {/* Middle Section: Directory Tree Explorer */}
      <SideNavSection title="Directory Scopes">
        {SAMPLE_DIR_TREE.map((node) => {
          const isSelected = activeScopePath === node.path;
          return (
            <SideNavItem
              key={node.path}
              label={node.name}
              icon={isSelected ? <FolderOpen className="w-4 h-4 text-amber-500" /> : <Folder className="w-4 h-4 text-zinc-400" />}
              isSelected={isSelected}
              onClick={() => setActiveScopePath(node.path)}
            />
          );
        })}
      </SideNavSection>

      <SideNavSection title="Global Tool Context">
        {activeGlobalTool === "git" && (
          <div className="p-3 text-xs space-y-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-md mx-2">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Branch:</span>
              <span className="font-mono text-indigo-400">main</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Status:</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <StatusDot label="Clean" variant="success" /> Clean
              </span>
            </div>
          </div>
        )}
        {activeGlobalTool === "cloud" && (
          <div className="p-3 text-xs space-y-2 bg-zinc-100 dark:bg-zinc-800/50 rounded-md mx-2">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Active Profile:</span>
              <span className="font-mono text-amber-400">{activeCloudProfile}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">K8s Cluster:</span>
              <span className="font-mono text-cyan-400">prod-us-east</span>
            </div>
          </div>
        )}
        {activeGlobalTool === "settings" && (
          <div className="p-3 text-xs space-y-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-md mx-2">
            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1 mb-1">
                <Palette className="w-3 h-3 text-indigo-400" /> Custom Astryx Theme
              </label>
              <select
                value={activeTheme}
                onChange={(e) => setActiveTheme(e.target.value as ThemePreset)}
                className="w-full bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs rounded p-1 font-mono focus:outline-none"
              >
                <option value="y2k">Y2K Retro Theme</option>
                <option value="cyber">Cyberpunk High-Density</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1 mb-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Gradient Background
              </label>
              <select
                value={activeGradient}
                onChange={(e) => setActiveGradient(e.target.value as GradientPreset)}
                className="w-full bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs rounded p-1 font-mono focus:outline-none"
              >
                <option value="aurora">Midnight Aurora</option>
                <option value="cyberpunk">Cyberpunk Glow</option>
                <option value="deepvoid">Deep Cosmic Void</option>
                <option value="neonmesh">Neon Mesh Wave</option>
              </select>
            </div>
          </div>
        )}
      </SideNavSection>
    </SideNav>
  );
}
